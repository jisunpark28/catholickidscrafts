"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Separate recording per reading tab (e.g. date + reading kind). */
  storageKey: string;
};

type Phase = "idle" | "recording" | "paused" | "ready";

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

function pickMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
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
    const finish = (duration: number) => {
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

function MicIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
        fill={active ? "#c45c26" : "currentColor"}
      />
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

export function GospelReadingRecorder({ storageKey }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState("");
  const [micLevel, setMicLevel] = useState(0);

  const urlsRef = useRef<Map<string, string>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const activeKeyRef = useRef(storageKey);
  const discardOnStopRef = useRef(false);
  const peakRef = useRef(0);
  const meterRef = useRef<{
    context: AudioContext;
    analyser: AnalyserNode;
    buffer: Uint8Array;
    rafId: number;
  } | null>(null);

  activeKeyRef.current = storageKey;

  const revokeUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
  }, []);

  const stopMeter = useCallback(() => {
    const meter = meterRef.current;
    if (!meter) return;
    window.cancelAnimationFrame(meter.rafId);
    void meter.context.close();
    meterRef.current = null;
    setMicLevel(0);
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopActiveRecorder = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") return;

    if (recorder.state === "paused") {
      try {
        recorder.resume();
      } catch {
        /* ignore */
      }
    }

    try {
      recorder.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const startMeter = useCallback((stream: MediaStream) => {
    stopMeter();
    peakRef.current = 0;

    const AudioCtx =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    const source = context.createMediaStreamSource(stream);
    source.connect(analyser);

    const buffer = new Uint8Array(analyser.fftSize);

    const tick = () => {
      const peak = readMicPeak(analyser, buffer);
      peakRef.current = Math.max(peakRef.current, peak);
      setMicLevel(peak);
      meterRef.current!.rafId = window.requestAnimationFrame(tick);
    };

    meterRef.current = { context, analyser, buffer, rafId: window.requestAnimationFrame(tick) };
  }, [stopMeter]);

  const saveRecording = useCallback(
    async (key: string, mimeType: string) => {
      const blob = new Blob(chunksRef.current, {
        type: mimeType || "audio/webm",
      });
      chunksRef.current = [];

      const previous = urlsRef.current.get(key);
      if (previous) revokeUrl(previous);

      if (blob.size === 0) {
        urlsRef.current.delete(key);
        if (key === activeKeyRef.current) {
          setPlaybackUrl(null);
          setPhase("idle");
          setMicError("Recording was empty. Speak for a second, then tap Stop.");
        }
        return;
      }

      const url = URL.createObjectURL(blob);
      const duration = await probeAudioDuration(url);
      const heardVoice = peakRef.current >= 8;
      const hasPlayableAudio = duration >= 0.2 && Number.isFinite(duration);

      if (!heardVoice || !hasPlayableAudio) {
        revokeUrl(url);
        urlsRef.current.delete(key);
        if (key === activeKeyRef.current) {
          setPlaybackUrl(null);
          setPhase("idle");
          setMicError(
            heardVoice
              ? "Recording saved but is too short. Speak longer, then tap Stop."
              : "No voice detected. Check Windows mic settings and Chrome mic permission.",
          );
        }
        return;
      }

      urlsRef.current.set(key, url);
      if (key === activeKeyRef.current) {
        setPlaybackUrl(url);
        setPhase("ready");
        setMicError("");
      }
    },
    [revokeUrl],
  );

  useEffect(() => {
    discardOnStopRef.current = true;
    stopActiveRecorder();
    discardOnStopRef.current = false;
    stopMeter();
    chunksRef.current = [];
    setPlaybackUrl(urlsRef.current.get(storageKey) ?? null);
    setPhase(urlsRef.current.has(storageKey) ? "ready" : "idle");
    setMicError("");
  }, [storageKey, stopActiveRecorder, stopMeter]);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      stopMeter();
      stopStream();
      for (const url of urls.values()) {
        revokeUrl(url);
      }
      urls.clear();
    };
  }, [revokeUrl, stopMeter, stopStream]);

  const iconButtonClass = (disabled: boolean, active?: boolean) =>
    `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
      disabled
        ? "cursor-not-allowed border-[#e8e0d6] bg-white text-[var(--color-muted)] opacity-40"
        : active
          ? "border-[#dfc9b0] bg-[#f5d4b8] text-[var(--color-ink)] shadow-sm"
          : "border-[#e8e0d6] bg-white text-[var(--color-ink)] hover:border-[#d9cfc3]"
    }`;

  const startRecord = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setMicError("Recording is not supported in this browser.");
      return;
    }

    setMicError("");
    stopActiveRecorder();
    stopMeter();
    stopStream();

    const previous = urlsRef.current.get(storageKey);
    if (previous) {
      revokeUrl(previous);
      urlsRef.current.delete(storageKey);
    }
    setPlaybackUrl(null);
    setPhase("idle");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: AUDIO_CONSTRAINTS,
      });
      streamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];
      if (!audioTrack) {
        throw new Error("No microphone track");
      }
      audioTrack.enabled = true;

      if (audioTrack.muted) {
        setMicError("Your microphone is muted in Windows or the browser.");
      }

      chunksRef.current = [];
      startMeter(stream);

      const mimeType = pickMimeType();
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      const keyForRecording = storageKey;
      const recorderMime = recorder.mimeType || mimeType || "audio/webm";

      mediaRecorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        mediaRecorderRef.current = null;
        stopMeter();

        if (discardOnStopRef.current) {
          chunksRef.current = [];
          stopStream();
          return;
        }

        window.setTimeout(() => {
          void saveRecording(keyForRecording, recorderMime).finally(() => {
            stopStream();
          });
        }, 100);
      });

      // One complete file on stop — most reliable on Windows Chrome (no silent chunk joins).
      recorder.start();
      setPhase("recording");
    } catch {
      setMicError("Allow microphone access to record.");
      stopMeter();
      stopStream();
      setPhase("idle");
    }
  };

  const togglePause = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    if (recorder.state === "recording") {
      recorder.pause();
      setPhase("paused");
    } else if (recorder.state === "paused") {
      recorder.resume();
      setPhase("recording");
    }
  };

  const isCapturing = phase === "recording" || phase === "paused";
  const levelPercent = Math.min(100, Math.round((micLevel / 48) * 100));

  const statusHint = isCapturing
    ? levelPercent > 8
      ? "Voice detected — tap Stop when finished"
      : "Speak now — watch the orange bar move"
    : playbackUrl
      ? "Press play below to hear your reading"
      : "Tap Record, read aloud, then Stop";

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <div
        className="flex items-center gap-1.5"
        role="toolbar"
        aria-label="Record your reading"
      >
        <button
          type="button"
          className={iconButtonClass(isCapturing, phase === "recording")}
          aria-label="Record"
          disabled={isCapturing}
          onClick={() => void startRecord()}
        >
          <MicIcon active={phase === "recording"} />
        </button>
        <button
          type="button"
          className={iconButtonClass(!isCapturing, phase === "paused")}
          aria-label={phase === "paused" ? "Resume recording" : "Pause recording"}
          disabled={!isCapturing}
          onClick={togglePause}
        >
          {phase === "paused" ? <ResumeIcon /> : <PauseIcon />}
        </button>
        <button
          type="button"
          className={iconButtonClass(!isCapturing)}
          aria-label="Stop recording"
          disabled={!isCapturing}
          onClick={stopActiveRecorder}
        >
          <StopIcon />
        </button>
      </div>

      {isCapturing ? (
        <div
          className="h-1.5 w-44 max-w-[11rem] overflow-hidden rounded-full bg-[#e8e0d6]"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-[#c45c26] transition-[width] duration-75"
            style={{ width: `${Math.max(levelPercent, isCapturing ? 4 : 0)}%` }}
          />
        </div>
      ) : null}

      {playbackUrl ? (
        <audio
          key={playbackUrl}
          src={playbackUrl}
          controls
          preload="auto"
          playsInline
          className="h-8 w-44 max-w-[11rem]"
          aria-label="Play your recording"
        />
      ) : null}

      {micError ? (
        <p className="max-w-[11rem] text-right text-[10px] leading-tight text-red-600">{micError}</p>
      ) : (
        <p className="max-w-[11rem] text-right text-[10px] leading-tight text-[var(--color-muted)]">
          {statusHint}
        </p>
      )}
    </div>
  );
}
