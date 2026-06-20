import Image from "next/image";

const STICKER_SRC = "/images/gospel/praise-sticker.png";

type Props = {
  completed: boolean;
  size?: "sm" | "md";
  className?: string;
};

/** Praise sticker — faded until the day's Gospel typing is complete. */
export function GospelPraiseSticker({ completed, size = "md", className = "" }: Props) {
  const px = size === "sm" ? 36 : 52;

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-500 ${
        completed
          ? "scale-100 opacity-100 drop-shadow-md"
          : "scale-95 opacity-[0.22] grayscale-[0.15]"
      } ${className}`}
      aria-hidden={!completed}
    >
      <Image
        src={STICKER_SRC}
        alt=""
        width={px}
        height={px}
        className={`h-auto w-auto object-contain ${completed ? "rotate-[-2deg]" : ""}`}
        style={{ width: px, height: "auto" }}
      />
      {completed && (
        <span
          className="pointer-events-none absolute -inset-0.5 rounded-lg border border-[#dfc9b0]/40"
          aria-hidden
        />
      )}
    </div>
  );
}
