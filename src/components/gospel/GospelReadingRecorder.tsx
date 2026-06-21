"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Separate recording per reading tab (e.g. date + reading kind). */
  storageKey: string;
};

type Phase = "idle" | "recording" | "paused" | "ready";

function pickRecorderMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
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
  const [micError, setMicError] = useState("");

  const recordingsRef = useRef<Map<string, Blob>>(new Map());
  const mimeTypeRef = useRef("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playUrlRef = useRef<string | null>(null);
  const discardOnStopRef = useRef(false);
  const storageKeyRef = useRef(storageKey);

  storageKeyRef.current = storageKey;

  const syncRecordingState = useCallback((key: string) => {
    const has = recordingsRef.current.has(key);
    setHasRecording(has);
    setPhase(has ? "ready" : "idle");
  }, []);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (playUrlRef.current) {
      URL.revokeObjectURL(playUrlRef.current);
      playUrlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const finalizeRecording = useCallback(
    (key: string, discard: boolean) => {
      if (!discard) {
        const mimeType = mimeTypeRef.current || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          recordingsRef.current.set(key, blob);
        } else {
          recordingsRef.current.delete(key);
        }
      }
      chunksRef.current = [];
      stopStream();
      mediaRecorderRef.current = null;
      if (key === storageKeyRef.current) {
        syncRecordingState(key);
      }
    },
    [stopStream, syncRecordingState],
  );

  const stopActiveRecorder = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (!rec) return;
    if (rec.state === "inactive") return;

    if (rec.state === "paused") {
      try {
        rec.resume();
      } catch {
        /* ignore */
      }
    }

    try {
      if (typeof rec.requestData === "function") {
        rec.requestData();
      }
    } catch {
      /* ignore */
    }

    try {
      rec.stop();
    } catch {
      finalizeRecording(storageKeyRef.current, discardOnStopRef.current);
    }
  }, [finalizeRecording]);

  useEffect(() => {
    stopPlayback();
    discardOnStopRef.current = true;
    stopActiveRecorder();
    discardOnStopRef.current = false;
    chunksRef.current = [];
    syncRecordingState(storageKey);
    setMicError("");
  }, [storageKey, stopActiveRecorder, stopPlayback, syncRecordingState]);

  useEffect(() => {
    const recordings = recordingsRef.current;
    return () => {
      stopPlayback();
      stopStream();
      recordings.clear();
    };
  }, [stopPlayback, stopStream]);

  const iconButtonClass = (disabled: boolean, active?: boolean) =>
    `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition ${
      disabled
        ? "cursor-not-allowed border-[#e8e0d6] bg-white text-[var(--color-muted)] opacity-40"
        : active
          ? "border-[#dfc9b0] bg-[#f5d4b8] text-[var(--color-ink)] shadow-sm"
          : "border-[#e8e0d6] bg-white text-[var(--color-ink)] hover:border-[#d9cfc3]"
    }`;

  const startRecord = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError("Recording is not supported in this browser.");
      return;
    }

    setMicError("");
    stopPlayback();

    recordingsRef.current.delete(storageKey);
    syncRecordingState(storageKey);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickRecorderMimeType();
      mimeTypeRef.current = mimeType || "audio/webm";

      const keyForRecording = storageKey;
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        finalizeRecording(keyForRecording, discardOnStopRef.current);
      });

      recorder.start(250);
      setPhase("recording");
      setHasRecording(false);
    } catch {
      setMicError("Allow microphone access to record.");
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
    const blob = recordingsRef.current.get(storageKey);
    if (!blob || blob.size === 0) {
      setMicError("No recording yet. Tap Stop after you record.");
      syncRecordingState(storageKey);
      return;
    }

    setMicError("");
    stopPlayback();

    const url = URL.createObjectURL(blob);
    playUrlRef.current = url;

    const audio = new Audio();
    audio.src = url;
    audio.volume = 1;
    audio.setAttribute("playsinline", "true");
    audioRef.current = audio;

    audio.onended = () => stopPlayback();
    audio.onerror = () => {
      setMicError("Could not play this recording in your browser.");
      stopPlayback();
    };

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setMicError("Tap Listen again to play your recording.");
      stopPlayback();
    }
  };

  const isCapturing = phase === "recording" || phase === "paused";
  const canListen = hasRecording && !isCapturing;

  return (
    <div className="flex shrink-0 flex-col items-end">
      <div
        className="flex items-center gap-1.5"
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
      {micError ? (
        <p className="mt-1 max-w-[12rem] text-right text-[10px] leading-tight text-red-600">
          {micError}
        </p>
      ) : null}
    </div>
  );
}
