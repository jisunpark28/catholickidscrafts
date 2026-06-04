import { PhotoBoothFrameEditor } from "@/components/admin/PhotoBoothFrameEditor";
import Link from "next/link";

export default function NewPhotoBoothFramePage() {
  return (
    <div>
      <Link
        href="/admin/photo-booth-frames"
        className="text-sm font-semibold text-[var(--color-link)]"
      >
        ← Photo booth frames
      </Link>
      <h1 className="mt-4 text-2xl font-bold">New frame</h1>
      <div className="mt-6">
        <PhotoBoothFrameEditor />
      </div>
    </div>
  );
}
