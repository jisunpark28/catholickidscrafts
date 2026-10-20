"use client";

import { textFromCopy, useSiteCopy } from "@/components/SiteCopyProvider";
import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Separate recording per reading tab (e.g. date + reading kind). */
  storageKey: string;
};

type Phase = "idle" | "starting" | "recording" | "paused" | "finalizing" | "ready";

type Notice =
  | ""
  | "denied"
  | "no_mic"
  | "unsupported"
  | "silent"
  | "failed";

/** One recording attempt. Each session owns its stream, chunks, and recorder. */
type Session = {
  key: string;
  stream: MediaStream;
  recorder: MediaRecorder;
  chunks: Blob[];
  mimeType: string;
  /** Set when the recording must be thrown away (tab/date change, unmount, new recording). */
  discard: boolean;
  meter: Meter | null;
};

type Meter = {
  context: AudioContext;
  analyser: AnalyserNode;
  buffer: Uint8Array;
  rafId: number;
  peak: number;
  /** True once the AudioContext was seen running (iOS can leave it suspended). */
  ran: boolean;
};

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

/** Silence threshold for the peak deviation from 128 in time-domain bytes. */
const MIN_PEAK = 8;
const MIN_DURATION_S = 0.2;

function pickMimeType(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type;
    } catch {
      /* older engines can throw */
    }
  }
  return "";
}

function readMicPeak(analyser: AnalyserNode, buffer: Uint8Array): number {
  analyser.getByteTimeDomainData(buffer as Uint8Array<ArrayBuffer>);
  let peak = 0;
  for (let i = 0; i < buffer.length; i++) {
    const deviation = Math.abs(buffer[i]! - 128);
    if (deviation > peak) peak = deviation;
  }
  return peak;
}

async function probeAudioDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = document.createElement("audio");
    let done = false;
    const finish = (duration: number) => {
      if (done) return;
      done = true;
      audio.removeAttribute("src");
      audio.load();
      resolve(duration);
    };
    audio.preload = "metadata";
    audio.onloadedmetadata = () => finish(audio.duration);
    audio.onerror = () => finish(0);
    window.setTimeout(() => finish(audio.duration || 0), 2000);
    audio.src = url;
  });
}

function stopTracks(stream: MediaStream) {
  stream.getTracks().forEach((track) => track.stop());
}

function closeMeter(meter: Meter | null) {
  if (!meter) return;
  window.cancelAnimationFrame(meter.rafId);
  void meter.context.close().catch(() => undefined);
}

function getAudioContextCtor(): typeof AudioContext | undefined {
  return (
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

function noticeFromError(error: unknown): Notice {
  const name = error instanceof DOMException || error instanceof Error ? error.name : "";
  if (name === "NotAllowedError" || name === "PermissionDeniedError" || name === "SecurityError") return "denied";
  if (name === "NotFoundError" || name === "DevicesNotFoundError" || name === "OverconstrainedError") return "no_mic";
  if (name === "NotReadableError" || name === "TrackStartError") return "no_mic";
  return "failed";
}

function MicIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" fill={active ? "#c45c26" : "currentColor"} />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke={active ? "#c45c26" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  );
}

function ResumeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
    </svg>
  );
}

function ListenIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5 6 9H3v6h3l5 4V5Z"
        stroke={active ? "#c45c26" : "currentColor"}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"
        stroke={active ? "#c45c26" : "currentColor"}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GospelReadingRecorder({ storageKey }: Props) {
  const copy = useSiteCopy();
  const t = (key: string, fallback: string) => textFromCopy(copy, key, fallback);

  const [phase, setPhase] = useState<Phase>("idle");
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [notice, setNotice] = useState<Notice>("");

  /** Finished recordings (object URLs) per storage key. */
  const urlsRef = useRef<Map<string, string>>(new Map());
  const sessionRef = useRef<Session | null>(null);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const activeKeyRef = useRef(storageKey);
  const mountedRef = useRef(true);

  activeKeyRef.current = storageKey;

  const stopPlayback = useCallback(() => {
    const audio = playbackAudioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      playbackAudioRef.current = null;
    }
    if (mountedRef.current) setIsPlaying(false);
  }, []);

  const syncRecordingState = useCallback((key: string) => {
    if (!mountedRef.current) return;
    const has = urlsRef.current.has(key);
    setHasRecording(has);
    setPhase(has ? "ready" : "idle");
  }, []);

  /** Stop the current session's recorder. With `discard`, its audio is thrown away. */
  const endSession = useCallback((discard: boolean) => {
    const session = sessionRef.current;
    if (!session) return;
    if (discard) session.discard = true;
    // Mic off right away (the recorder still flushes its last chunk).
    stopTracks(session.stream);
    closeMeter(session.meter);
    session.meter = null;
    if (session.recorder.state !== "inactive") {
      try {
        session.recorder.stop();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const finalizeSession = useCallback(
    async (session: Session, peak: number, meterTrusted: boolean) => {
      const blob = new Blob(session.chunks, { type: session.mimeType || "audio/webm" });
      session.chunks = [];

      if (session.discard || blob.size === 0) {
        if (!session.discard && mountedRef.current && session.key === activeKeyRef.current) setNotice("silent");
        return;
      }

      const url = URL.createObjectURL(blob);
      const duration = await probeAudioDuration(url);
      // MediaRecorder WebM often reports Infinity until fully scanned; a non-empty blob is playable.
      const longEnough = duration === Infinity || (Number.isFinite(duration) && duration >= MIN_DURATION_S);
      const heardVoice = !meterTrusted || peak >= MIN_PEAK;

      if (!mountedRef.current || session.discard) {
        URL.revokeObjectURL(url);
        return;
      }
      if (!longEnough || !heardVoice) {
        URL.revokeObjectURL(url);
        if (session.key === activeKeyRef.current) setNotice("silent");
        return;
      }

      const previous = urlsRef.current.get(session.key);
      if (previous) URL.revokeObjectURL(previous);
      urlsRef.current.set(session.key, url);
    },
    [],
  );

  // Reading tab / date change: stop and discard an in-progress recording.
  useEffect(() => {
    stopPlayback();
    endSession(true);
    setNotice("");
    syncRecordingState(storageKey);
  }, [storageKey, endSession, stopPlayback, syncRecordingState]);

  // Unmount / route change.
  useEffect(() => {
    mountedRef.current = true;
    const urls = urlsRef.current;
    return () => {
      mountedRef.current = false;
      stopPlayback();
      endSession(true);
      for (const url of urls.values()) URL.revokeObjectURL(url);
      urls.clear();
    };
  }, [endSession, stopPlayback]);

  const startRecord = async () => {
    if (
      typeof window === "undefined" ||
      !window.isSecureContext ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setNotice("unsupported");
      return;
    }

    stopPlayback();
    endSession(true);
    setNotice("");
    setPhase("starting");

    // Create/resume the meter's AudioContext inside the click gesture (iOS Safari
    // otherwise leaves it suspended and the silence check would read zero).
    const AudioCtx = getAudioContextCtor();
    let context: AudioContext | null = null;
    if (AudioCtx) {
      try {
        context = new AudioCtx();
        void context.resume().catch(() => undefined);
      } catch {
        context = null;
      }
    }

    const key = storageKey;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONSTRAINTS });
    } catch (error) {
      void context?.close().catch(() => undefined);
      if (!mountedRef.current) return;
      setNotice(noticeFromError(error));
      syncRecordingState(activeKeyRef.current);
      return;
    }

    if (!mountedRef.current || key !== activeKeyRef.current) {
      stopTracks(stream);
      void context?.close().catch(() => undefined);
      return;
    }

    if (stream.getAudioTracks().length === 0) {
      stopTracks(stream);
      void context?.close().catch(() => undefined);
      setNotice("no_mic");
      syncRecordingState(key);
      return;
    }

    let recorder: MediaRecorder;
    const mimeType = pickMimeType();
    try {
      recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    } catch {
      stopTracks(stream);
      void context?.close().catch(() => undefined);
      setNotice("failed");
      syncRecordingState(key);
      return;
    }

    let meter: Meter | null = null;
    if (context) {
      try {
        const analyser = context.createAnalyser();
        analyser.fftSize = 512;
        context.createMediaStreamSource(stream).connect(analyser);
        const buffer = new Uint8Array(analyser.fftSize);
        const m: Meter = { context, analyser, buffer, rafId: 0, peak: 0, ran: false };
        const tick = () => {
          if (context.state === "running") {
            m.ran = true;
            m.peak = Math.max(m.peak, readMicPeak(analyser, buffer));
          }
          m.rafId = window.requestAnimationFrame(tick);
        };
        m.rafId = window.requestAnimationFrame(tick);
        meter = m;
      } catch {
        void context.close().catch(() => undefined);
      }
    }

    const session: Session = {
      key,
      stream,
      recorder,
      chunks: [],
      mimeType: recorder.mimeType || mimeType || "audio/webm",
      discard: false,
      meter,
    };
    sessionRef.current = session;

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) session.chunks.push(event.data);
    });

    recorder.addEventListener("error", () => {
      session.discard = true;
      if (mountedRef.current && session.key === activeKeyRef.current) setNotice("failed");
    });

    recorder.addEventListener("stop", () => {
      // Skip the silence check when the meter never ran (e.g. suspended AudioContext on iOS).
      const peak = meter?.peak ?? 0;
      const meterTrusted = Boolean(meter?.ran);
      stopTracks(session.stream);
      closeMeter(session.meter);
      session.meter = null;

      void finalizeSession(session, peak, meterTrusted).finally(() => {
        if (sessionRef.current === session) {
          sessionRef.current = null;
          if (session.key === activeKeyRef.current) syncRecordingState(session.key);
        }
      });
    });

    try {
      recorder.start();
    } catch {
      sessionRef.current = null;
      stopTracks(stream);
      closeMeter(meter);
      setNotice("failed");
      syncRecordingState(key);
      return;
    }
    setHasRecording(false);
    setPhase("recording");
  };

  const stopRecord = () => {
    if (!sessionRef.current) return;
    setPhase("finalizing");
    endSession(false);
  };

  const canPause =
    typeof MediaRecorder !== "undefined" && typeof MediaRecorder.prototype?.pause === "function";

  const togglePause = () => {
    const recorder = sessionRef.current?.recorder;
    if (!recorder) return;
    try {
      if (recorder.state === "recording") {
        recorder.pause();
        setPhase("paused");
      } else if (recorder.state === "paused") {
        recorder.resume();
        setPhase("recording");
      }
    } catch {
      setNotice("failed");
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      stopPlayback();
      return;
    }
    const url = urlsRef.current.get(storageKey);
    if (!url) return;

    stopPlayback();
    const audio = new Audio(url);
    audio.setAttribute("playsinline", "true");
    playbackAudioRef.current = audio;
    audio.onended = () => stopPlayback();
    audio.onerror = () => {
      stopPlayback();
      setNotice("failed");
    };
    try {
      await audio.play();
      if (playbackAudioRef.current === audio) setIsPlaying(true);
    } catch {
      stopPlayback();
    }
  };

  const isCapturing = phase === "recording" || phase === "paused";
  const busy = isCapturing || phase === "starting" || phase === "finalizing";
  const canListen = hasRecording && !busy;

  const noticeText: Record<Exclude<Notice, "">, string> = {
    denied: t("gospel.recorder.error.denied", "Microphone access was blocked. Allow the microphone in your browser settings and try again."),
    no_mic: t("gospel.recorder.error.no_mic", "No microphone was found. Connect one and try again."),
    unsupported: t("gospel.recorder.error.unsupported", "Recording isn't supported in this browser."),
    silent: t("gospel.recorder.error.silent", "No sound was recorded. Try again?"),
    failed: t("gospel.recorder.error.failed", "Something went wrong with the recording. Try again."),
  };
  const statusText =
    phase === "recording"
      ? t("gospel.recorder.status.recording", "Recording…")
      : phase === "paused"
        ? t("gospel.recorder.status.paused", "Paused")
        : phase === "finalizing"
          ? t("gospel.recorder.status.saving", "Saving…")
          : isPlaying
            ? t("gospel.recorder.status.playing", "Playing…")
            : "";

  const iconButtonClass = (disabled: boolean, active?: boolean) =>
    `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
      disabled
        ? "cursor-not-allowed border-[#e8e0d6] bg-white text-[var(--color-muted)] opacity-40"
        : active
          ? "border-[#dfc9b0] bg-[#f5d4b8] text-[var(--color-ink)] shadow-sm"
          : "border-[#e8e0d6] bg-white text-[var(--color-ink)] hover:border-[#d9cfc3]"
    }`;

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className="flex shrink-0 items-center gap-1.5"
        role="toolbar"
        aria-label={t("gospel.recorder.toolbar", "Record and listen to your reading")}
      >
        <button
          type="button"
          className={iconButtonClass(busy, phase === "recording")}
          aria-label={t("gospel.recorder.record", "Record")}
          disabled={busy}
          onClick={() => void startRecord()}
        >
          <MicIcon active={phase === "recording"} />
        </button>
        <button
          type="button"
          className={iconButtonClass(!isCapturing || !canPause, phase === "paused")}
          aria-label={
            phase === "paused"
              ? t("gospel.recorder.resume", "Resume recording")
              : t("gospel.recorder.pause", "Pause recording")
          }
          disabled={!isCapturing || !canPause}
          onClick={togglePause}
        >
          {phase === "paused" ? <ResumeIcon /> : <PauseIcon />}
        </button>
        <button
          type="button"
          className={iconButtonClass(!isCapturing)}
          aria-label={t("gospel.recorder.stop", "Stop recording")}
          disabled={!isCapturing}
          onClick={stopRecord}
        >
          <StopIcon />
        </button>
        <button
          type="button"
          className={iconButtonClass(!canListen, isPlaying)}
          aria-label={
            isPlaying
              ? t("gospel.recorder.stop_listening", "Stop playback")
              : t("gospel.recorder.listen", "Listen to recording")
          }
          aria-pressed={isPlaying}
          disabled={!canListen}
          onClick={() => void togglePlayback()}
        >
          {isPlaying ? <StopIcon /> : <ListenIcon />}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite" data-recorder-status>
        {statusText}
      </p>
      <p
        className="max-w-[16rem] text-right text-[11px] leading-tight text-[#b45309]"
        role="alert"
        aria-live="assertive"
        data-recorder-notice
      >
        {notice ? noticeText[notice] : ""}
      </p>
    </div>
  );
}
