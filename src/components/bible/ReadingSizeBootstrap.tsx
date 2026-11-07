import { READING_SIZE_BOOTSTRAP } from "@/lib/bible/reading-size";

/** Blocking inline script so a saved passage size applies before verse text paints. */
export function ReadingSizeBootstrap() {
  return <script dangerouslySetInnerHTML={{ __html: READING_SIZE_BOOTSTRAP }} />;
}
