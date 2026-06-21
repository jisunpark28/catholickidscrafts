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
  const [phase, setPhase] = useState<Phase>("idle");
  const [hasRecording, setHasRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const urlsRef = useRef<Map<string, string>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const activeKeyRef = useRef(storageKey);
  const discardOnStopRef = useRef(false);
  const peakRef = useRef(0);
  const playbackAudioRef = useRef<HTMLAudioElement | null>(null);
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
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const stopPlayback = useCallback(() => {
    const audio = playbackAudioRef.current;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.src = "";
      playbackAudioRef.current = null;
    }
    setIsPlaying(false);
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

  const startMeter = useCallback(
    (stream: MediaStream) => {
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
        meterRef.current!.rafId = window.requestAnimationFrame(tick);
      };

      meterRef.current = { context, analyser, buffer, rafId: window.requestAnimationFrame(tick) };
    },
    [stopMeter],
  );

  const syncRecordingState = useCallback((key: string) => {
    const has = urlsRef.current.has(key);
    setHasRecording(has);
    setPhase(has ? "ready" : "idle");
  }, []);

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
          syncRecordingState(key);
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
          syncRecordingState(key);
        }
        return;
      }

      urlsRef.current.set(key, url);
      if (key === activeKeyRef.current) {
        syncRecordingState(key);
      }
    },
    [revokeUrl, syncRecordingState],
  );

  useEffect(() => {
    stopPlayback();
    discardOnStopRef.current = true;
    stopActiveRecorder();
    discardOnStopRef.current = false;
    stopMeter();
    chunksRef.current = [];
    syncRecordingState(storageKey);
  }, [storageKey, stopActiveRecorder, stopMeter, stopPlayback, syncRecordingState]);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      stopPlayback();
      stopMeter();
      stopStream();
      for (const url of urls.values()) {
        revokeUrl(url);
      }
      urls.clear();
    };
  }, [revokeUrl, stopMeter, stopPlayback, stopStream]);

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
      return;
    }

    stopPlayback();
    stopActiveRecorder();
    stopMeter();
    stopStream();

    const previous = urlsRef.current.get(storageKey);
    if (previous) {
      revokeUrl(previous);
      urlsRef.current.delete(storageKey);
    }
    syncRecordingState(storageKey);

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

      recorder.start();
      setPhase("recording");
      setHasRecording(false);
    } catch {
      stopMeter();
      stopStream();
      setPhase("idle");
      setHasRecording(false);
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

  const playRecording = async () => {
    const url = urlsRef.current.get(storageKey);
    if (!url) return;

    stopPlayback();

    const audio = new Audio(url);
    audio.setAttribute("playsinline", "true");
    playbackAudioRef.current = audio;
    audio.onended = () => stopPlayback();
    audio.onerror = () => stopPlayback();

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      stopPlayback();
    }
  };

  const isCapturing = phase === "recording" || phase === "paused";
  const canListen = hasRecording && !isCapturing;

  return (
    <div
      className="flex shrink-0 items-center gap-1.5"
      role="toolbar"
      aria-label="Record and listen to your reading"
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
      <button
        type="button"
        className={iconButtonClass(!canListen, isPlaying)}
        aria-label="Listen to recording"
        disabled={!canListen}
        onClick={() => void playRecording()}
      >
        <ListenIcon active={isPlaying} />
      </button>
    </div>
  );
}
