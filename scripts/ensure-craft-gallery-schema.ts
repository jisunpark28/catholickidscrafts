import { ensureCraftGallerySchema } from "../src/lib/craft-gallery-schema";

async function main(): Promise<void> {
  await ensureCraftGallerySchema();
  console.log("Craft gallery schema ready");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
