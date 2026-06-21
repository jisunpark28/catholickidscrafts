"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Separate recording per reading tab (e.g. date + reading kind). */
  storageKey: string;
};

type Phase = "idle" | "recording" | "paused" | "ready";

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

function ListenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M11 5 6 9H3v6h3l5 4V5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function GospelReadingRecorder({ storageKey }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [hasRecording, setHasRecording] = useState(false);
  const [micError, setMicError] = useState("");

  const recordingsRef = useRef<Map<string, string>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const discardOnStopRef = useRef(false);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const stopActiveRecorder = useCallback(() => {
    const rec = mediaRecorderRef.current;
    if (rec && (rec.state === "recording" || rec.state === "paused")) {
      rec.stop();
    }
  }, []);

  useEffect(() => {
    stopPlayback();
    discardOnStopRef.current = true;
    stopActiveRecorder();
    discardOnStopRef.current = false;
    stopStream();
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setPhase(recordingsRef.current.has(storageKey) ? "ready" : "idle");
    setHasRecording(recordingsRef.current.has(storageKey));
    setMicError("");
  }, [storageKey, stopActiveRecorder, stopPlayback, stopStream]);

  useEffect(() => {
    const urls = recordingsRef.current;
    return () => {
      stopPlayback();
      stopStream();
      for (const url of urls.values()) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
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

    const existing = recordingsRef.current.get(storageKey);
    if (existing) {
      URL.revokeObjectURL(existing);
      recordingsRef.current.delete(storageKey);
      setHasRecording(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      const keyForRecording = storageKey;
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const discard = discardOnStopRef.current;
        if (!discard) {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          if (blob.size > 0) {
            const url = URL.createObjectURL(blob);
            recordingsRef.current.set(keyForRecording, url);
            if (keyForRecording === storageKey) {
              setHasRecording(true);
              setPhase("ready");
            }
          } else if (keyForRecording === storageKey) {
            setPhase("idle");
            setHasRecording(false);
          }
        } else if (keyForRecording === storageKey) {
          setPhase(recordingsRef.current.has(storageKey) ? "ready" : "idle");
          setHasRecording(recordingsRef.current.has(storageKey));
        }
        stopStream();
        mediaRecorderRef.current = null;
        chunksRef.current = [];
      };

      recorder.start();
      setPhase("recording");
    } catch {
      setMicError("Allow microphone access to record.");
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

  const stopRecord = () => {
    stopActiveRecorder();
  };

  const playRecording = () => {
    const url = recordingsRef.current.get(storageKey);
    if (!url) return;
    stopPlayback();
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => {
      audioRef.current = null;
    };
    void audio.play().catch(() => {
      setMicError("Could not play recording.");
    });
  };

  const isCapturing = phase === "recording" || phase === "paused";

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
          onClick={stopRecord}
        >
          <StopIcon />
        </button>
        <button
          type="button"
          className={iconButtonClass(!hasRecording || isCapturing, false)}
          aria-label="Listen to recording"
          disabled={!hasRecording || isCapturing}
          onClick={playRecording}
        >
          <ListenIcon />
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
