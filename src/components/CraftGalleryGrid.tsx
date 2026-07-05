type GalleryItem = {
  id: string;
  imageUrl: string;
  authorName: string;
  caption?: string | null;
};

type Props = {
  items: GalleryItem[];
};

/** Lightweight CSS-columns masonry (no JS library). */
export function CraftGalleryGrid({ items }: Props) {
  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-[var(--color-muted)]">
        No community crafts yet. Check back after families share their work.
      </p>
    );
  }

  return (
    <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
      {items.map((item) => (
        <figure key={item.id} className="break-inside-avoid">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt={item.caption?.trim() || `Craft by ${item.authorName}`}
            className="w-full rounded-2xl object-cover"
            loading="lazy"
          />
          <figcaption className="mt-2 text-center text-sm font-medium text-[var(--color-muted)]">
            Made by {item.authorName}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
