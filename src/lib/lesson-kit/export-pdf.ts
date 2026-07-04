import chromium from "@sparticuz/chromium";
import fs from "node:fs";
import type { Page } from "puppeteer-core";
import puppeteer from "puppeteer-core";

const LOCAL_CHROME_CANDIDATES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  "/usr/local/bin/google-chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
].filter((value): value is string => Boolean(value?.trim()));

async function resolveChromiumExecutable(): Promise<string> {
  const fromEnv = process.env.PUPPETEER_EXECUTABLE_PATH?.trim();
  if (fromEnv && fs.existsSync(fromEnv)) {
    return fromEnv;
  }

  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    return chromium.executablePath();
  }

  for (const candidate of LOCAL_CHROME_CANDIDATES) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(
    "Chromium not found for PDF export. Set PUPPETEER_EXECUTABLE_PATH to your Chrome/Chromium binary.",
  );
}

async function waitForImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const images = Array.from(document.images);
    await Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        });
      }),
    );
  });
}

export async function generateLessonKitPdf(html: string): Promise<Buffer> {
  const executablePath = await resolveChromiumExecutable();
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 816, height: 1056 },
    executablePath,
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 45_000 });
    await waitForImages(page);

    const pdf = await page.pdf({
      format: "letter",
      printBackground: true,
      margin: {
        top: "0.6in",
        right: "0.75in",
        bottom: "0.6in",
        left: "0.75in",
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
