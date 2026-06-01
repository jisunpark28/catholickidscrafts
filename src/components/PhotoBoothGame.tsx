"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BgId = "cream" | "sky" | "rose" | "lavender" | "gold" | "stained" | "mint" | "cloud";

const BACKGROUNDS: { id: BgId; label: string }[] = [
  { id: "cream", label: "Cream" },
  { id: "sky", label: "Sky" },
  { id: "rose", label: "Rose" },
  { id: "lavender", label: "Lavender" },
  { id: "gold", label: "Gold" },
  { id: "stained", label: "Stained glass" },
  { id: "mint", label: "Mint" },
  { id: "cloud", label: "Cloud" },
];

const BG_CSS: Record<BgId, string> = {
  cream: "linear-gradient(160deg,#fff8f0,#fdebd0)",
  sky: "linear-gradient(160deg,#e3f2fd,#90caf9)",
  rose: "linear-gradient(160deg,#fce4ec,#f8bbd9)",
  lavender: "linear-gradient(160deg,#ede7f6,#b39ddb)",
  gold: "linear-gradient(160deg,#fffde7,#ffe082)",
  stained: "linear-gradient(135deg,#5c6bc0 0%,#ec407a 50%,#ffb74d 100%)",
  mint: "linear-gradient(160deg,#e8f5e9,#a5d6a7)",
  cloud: "linear-gradient(180deg,#ffffff 0%,#e1f5fe 100%)",
};

const STICKERS = ["✝️", "❤️", "🕊️", "⭐", "🌈", "🌟", "👼", "🙏", "⛪", "🌸", "☘️", "📿", "💛", "🎀", "✨", "🤍"];

type PlacedSticker = {
  id: number;
  char: string;
  x: number;
  y: number;
  size: number;
};

const CANVAS_W = 360;
const CANVAS_H = 480;
const STRIP_GAP = 10;

function fillBackground(ctx: CanvasRenderingContext2D, bgId: BgId, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  if (bgId === "stained") {
    g.addColorStop(0, "#5c6bc0");
    g.addColorStop(0.5, "#ec407a");
    g.addColorStop(1, "#ffb74d");
  } else if (bgId === "sky") {
    g.addColorStop(0, "#e3f2fd");
    g.addColorStop(1, "#90caf9");
  } else if (bgId === "rose") {
    g.addColorStop(0, "#fce4ec");
    g.addColorStop(1, "#f8bbd9");
  } else if (bgId === "lavender") {
    g.addColorStop(0, "#ede7f6");
    g.addColorStop(1, "#b39ddb");
  } else if (bgId === "gold") {
    g.addColorStop(0, "#fffde7");
    g.addColorStop(1, "#ffe082");
  } else if (bgId === "mint") {
    g.addColorStop(0, "#e8f5e9");
    g.addColorStop(1, "#a5d6a7");
  } else if (bgId === "cloud") {
    g.addColorStop(0, "#ffffff");
    g.addColorStop(1, "#e1f5fe");
  } else {
    g.addColorStop(0, "#fff8f0");
    g.addColorStop(1, "#fdebd0");
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
}

export function PhotoBoothGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  const [bg, setBg] = useState<BgId>("cream");
  const [photo, setPhoto] = useState<string | null>(null);
  const [stripPhotos, setStripPhotos] = useState<(string | null)[]>([null, null, null, null]);
  const [stripIndex, setStripIndex] = useState(0);
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [mode, setMode] = useState<"single" | "strip">("single");
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [dragId, setDragId] = useState<number | null>(null);
  const [paintTick, setPaintTick] = useState(0);
  const stickerIdRef = useRef(0);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const v = videoRef.current;
    if (v) {
      v.srcObject = null;
    }
    setCameraOn(false);
    setCameraError("");
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  /** Attach stream after <video> is mounted (cameraOn === true). */
  useEffect(() => {
    if (!cameraOn) return;

    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) return;

    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;

    const startPlayback = () => {
      void video.play().catch(() => {
        setCameraError("Could not start camera preview. Tap Capture to try anyway.");
      });
    };

    if (video.readyState >= 2) {
      startPlayback();
    } else {
      video.onloadedmetadata = () => startPlayback();
    }

    return () => {
      video.onloadedmetadata = null;
    };
  }, [cameraOn]);

  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    const cached = imagesRef.current.get(src);
    if (cached?.complete) return Promise.resolve(cached);
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        imagesRef.current.set(src, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = src;
    });
  }, []);

  const paint = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    if (mode === "strip") {
      const cellH = (CANVAS_H - STRIP_GAP * 3) / 4;
      for (let i = 0; i < 4; i++) {
        const y = i * (cellH + STRIP_GAP);
        fillBackground(ctx, bg, CANVAS_W, cellH);
        ctx.save();
        ctx.translate(0, y);
        const src = stripPhotos[i];
        if (src) {
          try {
            const img = await loadImage(src);
            drawCoverImage(ctx, img, 0, 0, CANVAS_W, cellH);
          } catch {
            /* skip */
          }
        }
        ctx.restore();
      }
    } else {
      fillBackground(ctx, bg, CANVAS_W, CANVAS_H);
      if (photo) {
        try {
          const img = await loadImage(photo);
          drawCoverImage(ctx, img, 0, 0, CANVAS_W, CANVAS_H);
        } catch {
          /* skip */
        }
      }
    }

    for (const s of stickers) {
      ctx.font = `${s.size}px system-ui, emoji`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(s.char, s.x, s.y);
    }
  }, [bg, photo, stripPhotos, stickers, mode, loadImage]);

  useEffect(() => {
    void paint();
  }, [paint, paintTick]);

  const bumpPaint = () => setPaintTick((t) => t + 1);

  function loadPhoto(dataUrl: string) {
    if (mode === "strip") {
      setStripPhotos((prev) => {
        const next = [...prev];
        next[stripIndex] = dataUrl;
        return next;
      });
      setStripIndex((i) => Math.min(i + 1, 3));
    } else {
      setPhoto(dataUrl);
    }
    stopCamera();
    bumpPaint();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => loadPhoto(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function startCamera() {
    stopCamera();
    setCameraError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      alert("Camera is not supported in this browser. Try uploading a photo instead.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOn(true);
    } catch {
      setCameraError("");
      alert("Could not open the camera. Check permissions or try uploading a photo.");
    }
  }

  function captureFromCamera() {
    const video = videoRef.current;
    if (!video?.videoWidth) {
      alert("Camera is not ready yet. Wait for the preview to appear.");
      return;
    }
    const c = document.createElement("canvas");
    c.width = video.videoWidth;
    c.height = video.videoHeight;
    const ctx = c.getContext("2d")!;
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    loadPhoto(c.toDataURL("image/jpeg", 0.92));
  }

  function addSticker(char: string) {
    stickerIdRef.current += 1;
    setStickers((prev) => [
      ...prev,
      {
        id: stickerIdRef.current,
        char,
        x: CANVAS_W / 2 + (Math.random() - 0.5) * 80,
        y: CANVAS_H / 2 + (Math.random() - 0.5) * 80,
        size: 36 + Math.floor(Math.random() * 12),
      },
    ]);
    bumpPaint();
  }

  function canvasPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  function onCanvasDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const { x, y } = canvasPoint(e);
    const hit = [...stickers].reverse().find((s) => {
      const dx = x - s.x;
      const dy = y - s.y;
      return Math.hypot(dx, dy) < s.size * 0.6;
    });
    if (hit) {
      setDragId(hit.id);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function onCanvasMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (dragId === null) return;
    const { x, y } = canvasPoint(e);
    setStickers((prev) => prev.map((s) => (s.id === dragId ? { ...s, x, y } : s)));
  }

  function onCanvasUp() {
    setDragId(null);
    bumpPaint();
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = mode === "strip" ? "my-4-cut-photos.png" : "my-photo-booth.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  }

  function resetAll() {
    setPhoto(null);
    setStripPhotos([null, null, null, null]);
    setStripIndex(0);
    setStickers([]);
    stopCamera();
    bumpPaint();
  }

  return (
    <div className="border border-[var(--color-border)] bg-white">
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <button
          type="button"
          onClick={() => {
            setMode("single");
            resetAll();
          }}
          className={`px-3 py-1.5 text-sm font-bold ${
            mode === "single" ? "bg-white ring-1 ring-[var(--color-accent)]" : ""
          }`}
        >
          Single photo
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("strip");
            resetAll();
          }}
          className={`px-3 py-1.5 text-sm font-bold ${
            mode === "strip" ? "bg-white ring-1 ring-[var(--color-accent)]" : ""
          }`}
        >
          4-cut strip
        </button>
      </div>

      <div className="grid gap-6 p-4 lg:grid-cols-[1fr_280px]">
        <div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-white"
            >
              Upload photo
            </button>
            <button
              type="button"
              onClick={cameraOn ? captureFromCamera : startCamera}
              className="border border-[var(--color-border)] px-4 py-2 text-sm font-bold"
            >
              {cameraOn ? "Capture" : "Use camera"}
            </button>
            {cameraOn && (
              <button
                type="button"
                onClick={stopCamera}
                className="text-sm font-semibold text-[var(--color-muted)]"
              >
                Stop camera
              </button>
            )}
            <button
              type="button"
              onClick={download}
              className="border border-[var(--color-border)] px-4 py-2 text-sm font-bold"
            >
              Save image
            </button>
            <button type="button" onClick={resetAll} className="text-sm text-[var(--color-muted)]">
              Reset
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />

          {mode === "strip" && (
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Photo {Math.min(stripIndex + 1, 4)} of 4 — capture or upload each slot for your strip.
            </p>
          )}

          {cameraOn && (
            <div className="mx-auto mt-4 w-full max-w-[360px]">
              <p className="mb-2 text-center text-sm font-semibold text-[var(--color-ink)]">
                Camera preview
              </p>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="mx-auto block aspect-[3/4] w-full rounded-lg border-2 border-[var(--color-accent)] bg-black object-cover [transform:scaleX(-1)]"
              />
              {cameraError && (
                <p className="mt-2 text-center text-xs text-red-600">{cameraError}</p>
              )}
            </div>
          )}

          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className={`mx-auto block w-full max-w-[360px] cursor-grab touch-none border border-[var(--color-border)] shadow-md active:cursor-grabbing ${
              cameraOn ? "mt-4" : "mt-4"
            }`}
            onPointerDown={onCanvasDown}
            onPointerMove={onCanvasMove}
            onPointerUp={onCanvasUp}
            onPointerLeave={onCanvasUp}
          />
          <p className="mt-2 text-center text-xs text-[var(--color-muted)]">
            {cameraOn
              ? "When you see yourself above, tap Capture. Then add stickers on the canvas below."
              : "Tap a sticker, then drag it on your photo. Processing stays in your browser."}
          </p>
        </div>

        <aside className="space-y-4">
          <div>
            <p className="text-sm font-bold text-[var(--color-ink)]">Background</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  title={b.label}
                  onClick={() => {
                    setBg(b.id);
                    bumpPaint();
                  }}
                  className={`h-10 rounded border-2 ${bg === b.id ? "border-[var(--color-accent)]" : "border-transparent"}`}
                  style={{ background: BG_CSS[b.id] }}
                />
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-bold text-[var(--color-ink)]">Stickers</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {STICKERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSticker(s)}
                  className="flex h-10 w-10 items-center justify-center rounded border border-[var(--color-border)] text-xl hover:bg-[var(--color-surface)]"
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setStickers([]);
                bumpPaint();
              }}
              className="mt-2 text-xs font-semibold text-[var(--color-link)]"
            >
              Clear stickers
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
