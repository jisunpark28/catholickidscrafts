import {
  createGallerySubmission,
  GalleryRateLimitError,
} from "@/lib/craft-gallery";
import { getGallerySubmitterContext } from "@/lib/craft-gallery-auth";
import {
  normalizeGalleryAuthorName,
  normalizeGalleryCaption,
  validateCraftGalleryImage,
} from "@/lib/craft-gallery-upload";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile, UploadConfigurationError } from "@/lib/upload";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const submitter = await getGallerySubmitterContext();
  if (!submitter) {
    return NextResponse.json(
      {
        error:
          "Sign in with a family account or Access ID to share a craft photo.",
      },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a photo to upload." }, { status: 400 });
  }

  const validation = validateCraftGalleryImage(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const authorName = normalizeGalleryAuthorName(formData.get("authorName"));
  if (!authorName) {
    return NextResponse.json(
      { error: "Author name is required (max 40 characters)." },
      { status: 400 },
    );
  }

  const caption = normalizeGalleryCaption(formData.get("caption"));
  const resourceSlug = String(formData.get("resourceSlug") ?? "").trim() || null;

  let resourceId: string | null = null;
  if (resourceSlug) {
    const resource = await prisma.resource.findFirst({
      where: { slug: resourceSlug, published: true },
      select: { id: true },
    });
    if (!resource) {
      return NextResponse.json({ error: "Resource not found." }, { status: 400 });
    }
    resourceId = resource.id;
  }

  try {
    const saved = await saveUploadedFile(file, {
      keyPrefix: `craft-gallery/${submitter.familyAccountId}/`,
    });

    const submission = await createGallerySubmission({
      imageUrl: saved.url,
      authorName,
      caption,
      familyAccountId: submitter.familyAccountId,
      resourceId,
    });

    return NextResponse.json({
      ok: true,
      id: submission.id,
      message:
        "Thank you! Your photo is pending review and will appear in the gallery after approval.",
    });
  } catch (e) {
    if (e instanceof GalleryRateLimitError) {
      return NextResponse.json({ error: e.message }, { status: 429 });
    }
    if (e instanceof UploadConfigurationError) {
      return NextResponse.json({ error: e.message }, { status: 503 });
    }
    console.error("gallery submit", e);
    return NextResponse.json({ error: "Could not submit photo." }, { status: 500 });
  }
}
