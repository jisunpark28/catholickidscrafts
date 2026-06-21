"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Separate recording per reading tab (e.g. date + reading kind). */
  storageKey: string;
};

type Phase = "idle" | "recording" | "paused" | "ready";

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

  const urlsRef = useRef<Map<string, string>>(new Map());
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const activeKeyRef = useRef(storageKey);
  const discardOnStopRef = useRef(false);

  activeKeyRef.current = storageKey;

  const revokeUrl = useCallback((url: string | null) => {
    if (url) URL.revokeObjectURL(url);
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
      recorder.requestData();
    } catch {
      /* ignore */
    }

    try {
      recorder.stop();
    } catch {
      /* ignore */
    }
  }, []);

  const saveRecording = useCallback(
    (key: string, mimeType: string) => {
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
    chunksRef.current = [];
    setPlaybackUrl(urlsRef.current.get(storageKey) ?? null);
    setPhase(urlsRef.current.has(storageKey) ? "ready" : "idle");
    setMicError("");
  }, [storageKey, stopActiveRecorder]);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      stopStream();
      for (const url of urls.values()) {
        revokeUrl(url);
      }
      urls.clear();
    };
  }, [revokeUrl, stopStream]);

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
    stopStream();

    const previous = urlsRef.current.get(storageKey);
    if (previous) {
      revokeUrl(previous);
      urlsRef.current.delete(storageKey);
    }
    setPlaybackUrl(null);
    setPhase("idle");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

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
        stopStream();
        mediaRecorderRef.current = null;

        if (discardOnStopRef.current) {
          chunksRef.current = [];
          return;
        }

        // MediaRecorder may deliver the final chunk after the stop event.
        window.setTimeout(() => {
          saveRecording(keyForRecording, recorderMime);
        }, 250);
      });

      recorder.start(200);
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

  const isCapturing = phase === "recording" || phase === "paused";

  const statusHint = isCapturing
    ? "Recording… tap Stop when finished"
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
