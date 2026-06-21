"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  /** Separate recording per reading tab (e.g. date + reading kind). */
  storageKey: string;
};

type Phase = "idle" | "recording" | "paused" | "ready";

const RECORDER_MIME_CANDIDATES = [
  "audio/mp4",
  "audio/mp4;codecs=mp4a",
  "audio/aac",
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
] as const;

function isAppleBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (/Safari/i.test(ua) && !/Chrome|Chromium|CriOS|Edg/i.test(ua));
}

function canPlayMimeType(mime: string): boolean {
  if (typeof document === "undefined") return true;
  const audio = document.createElement("audio");
  const base = mime.split(";")[0]?.trim() ?? mime;
  return (audio.canPlayType(mime) || audio.canPlayType(base)) !== "";
}

function pickRecorderMimeType(): string {
  for (const type of RECORDER_MIME_CANDIDATES) {
    if (!MediaRecorder.isTypeSupported(type)) continue;
    if (canPlayMimeType(type)) return type;
  }
  for (const type of RECORDER_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

function blobMimeType(chunks: Blob[], fallback: string): string {
  const fromChunk = chunks.find((c) => c.size > 0 && c.type)?.type;
  if (fromChunk) return fromChunk;
  if (fallback) return fallback;
  return "audio/webm";
}

function createMediaRecorder(stream: MediaStream, preferredMime: string): MediaRecorder {
  const attempts = preferredMime
    ? [preferredMime, ...RECORDER_MIME_CANDIDATES.filter((t) => t !== preferredMime), ""]
    : [...RECORDER_MIME_CANDIDATES, ""];

  for (const mime of attempts) {
    try {
      return mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
    } catch {
      continue;
    }
  }
  return new MediaRecorder(stream);
}

function waitForRecorderChunks(recorder: MediaRecorder, hasChunks: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    if (hasChunks()) {
      resolve();
      return;
    }

    const onData = (event: BlobEvent) => {
      if (event.data.size > 0) {
        recorder.removeEventListener("dataavailable", onData);
        resolve();
      }
    };

    recorder.addEventListener("dataavailable", onData);
    window.setTimeout(() => {
      recorder.removeEventListener("dataavailable", onData);
      resolve();
    }, 300);
  });
}

function waitForAudioReady(audio: HTMLAudioElement, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    if (audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      resolve(true);
      return;
    }

    const done = (ok: boolean) => {
      audio.removeEventListener("loadeddata", onReady);
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("error", onFail);
      window.clearTimeout(timer);
      resolve(ok);
    };

    const onReady = () => done(true);
    const onFail = () => done(false);
    const timer = window.setTimeout(() => done(audio.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA), timeoutMs);

    audio.addEventListener("loadeddata", onReady, { once: true });
    audio.addEventListener("canplaythrough", onReady, { once: true });
    audio.addEventListener("error", onFail, { once: true });
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
  const [micError, setMicError] = useState("");

  const recordingsRef = useRef<Map<string, Blob>>(new Map());
  const mimeTypeRef = useRef("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const playUrlRef = useRef<string | null>(null);
  const webAudioRef = useRef<{
    context: AudioContext;
    source: AudioBufferSourceNode;
  } | null>(null);
  const discardOnStopRef = useRef(false);
  const storageKeyRef = useRef(storageKey);
  const stopPlaybackRef = useRef<() => void>(() => {});
  const stopActiveRecorderRef = useRef<() => void>(() => {});
  const syncRecordingStateRef = useRef<(key: string) => void>(() => {});

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

  const detachAudioElement = useCallback((audio: HTMLAudioElement) => {
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    while (audio.firstChild) {
      audio.removeChild(audio.firstChild);
    }
    audio.removeAttribute("src");
  }, []);

  const stopWebAudio = useCallback(() => {
    const active = webAudioRef.current;
    if (!active) return;
    try {
      active.source.stop();
    } catch {
      /* already stopped */
    }
    void active.context.close();
    webAudioRef.current = null;
  }, []);

  const stopPlayback = useCallback(() => {
    stopWebAudio();
    const audio = audioElRef.current;
    if (audio) {
      detachAudioElement(audio);
    }
    if (playUrlRef.current) {
      URL.revokeObjectURL(playUrlRef.current);
      playUrlRef.current = null;
    }
    setIsPlaying(false);
  }, [detachAudioElement, stopWebAudio]);

  stopPlaybackRef.current = stopPlayback;
  syncRecordingStateRef.current = syncRecordingState;

  const finalizeRecording = useCallback(
    (key: string, discard: boolean, recorderMime = "") => {
      if (!discard) {
        const mimeType = blobMimeType(chunksRef.current, recorderMime || mimeTypeRef.current);
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
        if (!discard && !recordingsRef.current.has(key)) {
          setMicError("Recording was empty. Try again and tap Stop when finished.");
        }
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

    const useTimeslice = !isAppleBrowser();
    if (useTimeslice) {
      try {
        if (typeof rec.requestData === "function") {
          rec.requestData();
        }
      } catch {
        /* ignore */
      }
    }

    try {
      rec.stop();
    } catch {
      void waitForRecorderChunks(rec, () => chunksRef.current.length > 0).then(() => {
        finalizeRecording(storageKeyRef.current, discardOnStopRef.current, rec.mimeType);
      });
    }
  }, [finalizeRecording]);

  stopActiveRecorderRef.current = stopActiveRecorder;

  useEffect(() => {
    stopPlaybackRef.current();
    discardOnStopRef.current = true;
    stopActiveRecorderRef.current();
    discardOnStopRef.current = false;
    chunksRef.current = [];
    syncRecordingStateRef.current(storageKey);
    setMicError("");
  }, [storageKey]);

  useEffect(() => {
    const recordings = recordingsRef.current;
    return () => {
      stopPlaybackRef.current();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      recordings.clear();
    };
  }, []);

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
    if (typeof MediaRecorder === "undefined") {
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

      const preferredMime = pickRecorderMimeType();
      const recorder = createMediaRecorder(stream, preferredMime);
      mediaRecorderRef.current = recorder;
      mimeTypeRef.current = recorder.mimeType || preferredMime || "audio/webm";

      const keyForRecording = storageKey;

      recorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      });

      recorder.addEventListener("stop", () => {
        void waitForRecorderChunks(recorder, () => chunksRef.current.length > 0).then(() => {
          finalizeRecording(
            keyForRecording,
            discardOnStopRef.current,
            recorder.mimeType || mimeTypeRef.current,
          );
        });
      });

      if (isAppleBrowser()) {
        recorder.start();
      } else {
        recorder.start(250);
      }
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

  const playWithWebAudio = useCallback(
    async (blob: Blob): Promise<boolean> => {
      const AudioCtx =
        typeof window !== "undefined"
          ? window.AudioContext ||
            (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
          : undefined;
      if (!AudioCtx) return false;

      stopWebAudio();
      const context = new AudioCtx();
      try {
        const buffer = await context.decodeAudioData(await blob.arrayBuffer());
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = () => {
          stopWebAudio();
          setIsPlaying(false);
        };
        webAudioRef.current = { context, source };
        if (context.state === "suspended") {
          await context.resume();
        }
        source.start(0);
        setIsPlaying(true);
        return true;
      } catch {
        await context.close();
        return false;
      }
    },
    [stopWebAudio],
  );

  const playWithAudioElement = useCallback(
    async (blob: Blob): Promise<boolean> => {
      const audio = audioElRef.current;
      if (!audio) return false;

      const url = URL.createObjectURL(blob);
      playUrlRef.current = url;

      detachAudioElement(audio);
      audio.src = url;
      audio.volume = 1;
      audio.setAttribute("playsinline", "true");
      audio.load();

      const loaded = await waitForAudioReady(audio);
      if (!loaded) return false;

      audio.onended = () => stopPlayback();

      try {
        await audio.play();
        setIsPlaying(true);
        return true;
      } catch {
        return false;
      }
    },
    [detachAudioElement, stopPlayback],
  );

  const playRecording = async () => {
    const blob = recordingsRef.current.get(storageKey);
    if (!blob || blob.size === 0) {
      setMicError("No recording yet. Tap Stop after you record.");
      syncRecordingState(storageKey);
      return;
    }

    setMicError("");
    stopPlayback();

    const played =
      (await playWithAudioElement(blob)) || (await playWithWebAudio(blob));

    if (!played) {
      setMicError("Could not play this recording in your browser.");
      stopPlayback();
    }
  };

  const isCapturing = phase === "recording" || phase === "paused";
  const canListen = hasRecording && !isCapturing;

  const statusHint =
    phase === "recording"
      ? "Recording… tap Stop when done"
      : phase === "paused"
        ? "Paused — tap Resume or Stop"
        : hasRecording
          ? "Tap Listen to hear your reading"
          : "";

  return (
    <div className="flex shrink-0 flex-col items-end">
      <audio ref={audioElRef} className="hidden" preload="auto" playsInline />
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
      ) : statusHint ? (
        <p className="mt-1 max-w-[12rem] text-right text-[10px] leading-tight text-[var(--color-muted)]">
          {statusHint}
        </p>
      ) : null}
    </div>
  );
}
