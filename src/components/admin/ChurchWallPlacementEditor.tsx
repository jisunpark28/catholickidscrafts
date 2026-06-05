"use client";

import {
  CHURCH_WALL_SLOTS,
  getChurchWallSlot,
  type ChurchWallSlot,
} from "@/lib/church-wall-slots";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SlotOccupancy = {
  sortOrder: number;
  title: string;
  id?: string;
};

type PlacementValue = {
  sortOrder: number;
  posX: number;
  posY: number;
  posZ: number;
  width: number;
  height: number;
  rotationY: number;
};

type Props = {
  imageUrl: string;
  value: PlacementValue;
  onChange: (next: PlacementValue) => void;
  occupied: SlotOccupancy[];
  currentId?: string;
};

function applySlot(slot: ChurchWallSlot, width: number, height: number): PlacementValue {
  return {
    sortOrder: slot.sortOrder,
    posX: slot.x,
    posY: slot.y,
    posZ: slot.z,
    width,
    height,
    rotationY: slot.rotationY,
  };
}

export function ChurchWallPlacementEditor({
  imageUrl,
  value,
  onChange,
  occupied,
  currentId,
}: Props) {
  const dragRef = useRef<{ slot: number; startX: number; startY: number; startW: number; startH: number } | null>(
    null,
  );
  const [resizeSlot, setResizeSlot] = useState<number | null>(null);

  const selectedSlot = getChurchWallSlot(value.sortOrder);
  const onStandardSlot = selectedSlot !== undefined;

  const occupancyBySlot = useMemo(() => {
    const map = new Map<number, SlotOccupancy>();
    for (const o of occupied) {
      if (o.id && o.id === currentId) continue;
      map.set(o.sortOrder, o);
    }
    return map;
  }, [occupied, currentId]);

  const selectSlot = useCallback(
    (slot: ChurchWallSlot) => {
      onChange(applySlot(slot, value.width || slot.width, value.height || slot.height));
    },
    [onChange, value.width, value.height],
  );

  useEffect(() => {
    if (!imageUrl || onStandardSlot) return;
    const empty = CHURCH_WALL_SLOTS.find((s) => !occupancyBySlot.has(s.sortOrder));
    if (empty) selectSlot(empty);
  }, [imageUrl, onStandardSlot, occupancyBySlot, selectSlot]);

  function handleResizePointerDown(e: React.PointerEvent, slot: ChurchWallSlot) {
    if (!imageUrl) return;
    e.preventDefault();
    e.stopPropagation();
    setResizeSlot(slot.sortOrder);
    dragRef.current = {
      slot: slot.sortOrder,
      startX: e.clientX,
      startY: e.clientY,
      startW: value.width,
      startH: value.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handleResizePointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag || drag.slot !== resizeSlot) return;
    const slot = getChurchWallSlot(drag.slot);
    if (!slot) return;
    const dw = (e.clientX - drag.startX) * 0.008;
    const dh = (drag.startY - e.clientY) * 0.008;
    const width = Math.min(2.4, Math.max(0.5, drag.startW + dw));
    const height = Math.min(3.2, Math.max(0.6, drag.startH + dh));
    onChange(applySlot(slot, width, height));
  }

  function handleResizePointerUp() {
    dragRef.current = null;
    setResizeSlot(null);
  }

  function renderSlotButton(slot: ChurchWallSlot) {
    const active = value.sortOrder === slot.sortOrder;
    const taken = occupancyBySlot.get(slot.sortOrder);
    const showImage = active && imageUrl.length > 0;

    return (
      <button
        key={slot.sortOrder}
        type="button"
        title={taken ? `${slot.label} — occupied by “${taken.title}”` : slot.label}
        onClick={() => selectSlot(slot)}
        className={`group relative flex aspect-[3/4] w-full flex-col overflow-hidden border-2 bg-[#3d3428] transition ${
          active
            ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/40"
            : taken
              ? "border-amber-700/80 opacity-90"
              : "border-[#6b5a45] hover:border-[var(--color-accent)]"
        }`}
      >
        <span className="absolute left-0 right-0 top-0 z-10 bg-black/55 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
          {slot.side === "left" ? "L" : "R"}
          {slot.row + 1}
        </span>
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="h-full w-full object-contain p-1" />
        ) : (
          <span className="flex flex-1 items-center justify-center px-1 text-center text-[10px] text-[#c4b59a]">
            {taken ? `“${taken.title}”` : "Empty"}
          </span>
        )}
        {active && showImage && (
          <span
            role="presentation"
            onPointerDown={(e) => handleResizePointerDown(e, slot)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
            onPointerCancel={handleResizePointerUp}
            className="absolute bottom-0.5 right-0.5 z-20 h-4 w-4 cursor-se-resize rounded-sm border border-white bg-[var(--color-accent)] shadow"
            title="Drag to resize on wall"
          />
        )}
      </button>
    );
  }

  const leftSlots = CHURCH_WALL_SLOTS.filter((s) => s.side === "left");
  const rightSlots = CHURCH_WALL_SLOTS.filter((s) => s.side === "right");

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--color-muted)]">
        This matches the{" "}
        <strong className="font-medium text-[var(--color-ink)]">Tiny Priest church interior</strong>:
        left and right walls each have seven picture frames. Click a frame to place your image, then
        drag the <strong className="font-medium text-[var(--color-ink)]">orange corner</strong> to
        resize. Test in{" "}
        <a
          href="/play/church"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[var(--color-link)]"
        >
          Play → Church
        </a>
        .
      </p>

      <div className="overflow-x-auto rounded border border-[var(--color-border)] bg-gradient-to-b from-[#1a1612] to-[#2a241c] p-4">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-[#e8dcc8]">
          Sanctuary · altar &amp; cross
        </p>
        <div className="mx-auto grid max-w-3xl grid-cols-[1fr_auto_1fr] gap-3">
          <div>
            <p className="mb-2 text-center text-[10px] font-bold uppercase text-[#c4b59a]">
              Left wall
            </p>
            <div className="grid grid-cols-1 gap-2">{leftSlots.map(renderSlotButton)}</div>
          </div>
          <div className="flex min-w-[72px] flex-col items-center justify-center px-1">
            <div className="h-full min-h-[120px] w-2 rounded-full bg-[#4a3f32]" />
            <p className="mt-2 text-center text-[10px] text-[#c4b59a]">Nave</p>
          </div>
          <div>
            <p className="mb-2 text-center text-[10px] font-bold uppercase text-[#c4b59a]">
              Right wall
            </p>
            <div className="grid grid-cols-1 gap-2">{rightSlots.map(renderSlotButton)}</div>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-[#a89880]">
          Front of church (doors) at top of each column · altar end at bottom
        </p>
      </div>

      {selectedSlot && (
        <p className="text-sm text-[var(--color-ink)]">
          Selected: <strong>{selectedSlot.label}</strong>
          {occupancyBySlot.has(selectedSlot.sortOrder) && (
            <span className="text-amber-800"> — another decoration uses this frame; saving will move yours here.</span>
          )}
        </p>
      )}

      {imageUrl && selectedSlot && (
        <div className="flex flex-wrap items-end gap-4 border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          <label className="text-sm font-semibold">
            Width on wall
            <input
              type="range"
              min={0.5}
              max={2.4}
              step={0.02}
              value={value.width}
              onChange={(e) =>
                onChange(applySlot(selectedSlot, Number(e.target.value), value.height))
              }
              className="mt-1 block w-40"
            />
            <span className="text-xs text-[var(--color-muted)]">{value.width.toFixed(2)}</span>
          </label>
          <label className="text-sm font-semibold">
            Height on wall
            <input
              type="range"
              min={0.6}
              max={3.2}
              step={0.02}
              value={value.height}
              onChange={(e) =>
                onChange(applySlot(selectedSlot, value.width, Number(e.target.value)))
              }
              className="mt-1 block w-40"
            />
            <span className="text-xs text-[var(--color-muted)]">{value.height.toFixed(2)}</span>
          </label>
          <button
            type="button"
            className="text-xs font-semibold text-[var(--color-link)]"
            onClick={() => onChange(applySlot(selectedSlot, selectedSlot.width, selectedSlot.height))}
          >
            Reset to default size
          </button>
        </div>
      )}

      {!imageUrl && (
        <p className="text-sm text-amber-800">Upload an image above to preview it on the wall.</p>
      )}
    </div>
  );
}
