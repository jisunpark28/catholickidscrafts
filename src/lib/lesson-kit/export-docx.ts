import {
  lessonBlockPrintContentLines,
  lessonStepHeaderLines,
  type PrintContentLine,
} from "@/lib/lesson-kit/print-content";
import { lessonPrintMetaRows } from "@/lib/lesson-kit/print-block";
import type { LessonKitDto } from "@/lib/lesson-kit/types";
import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
} from "docx";

const LETTER_WIDTH = 12240;
const LETTER_HEIGHT = 15840;
const MARGIN_TOP = 864;
const MARGIN_BOTTOM = 864;
const MARGIN_LEFT = 1080;
const MARGIN_RIGHT = 1080;

function lineToParagraph(line: PrintContentLine): Paragraph {
  switch (line.kind) {
    case "heading":
      return new Paragraph({
        heading: line.level === 2 ? HeadingLevel.HEADING_2 : HeadingLevel.HEADING_3,
        children: [new TextRun({ text: line.text, bold: line.level === 2 })],
        spacing: { before: line.level === 2 ? 280 : 160, after: 120 },
      });
    case "paragraph":
      return new Paragraph({
        children: [new TextRun({ text: line.text })],
        spacing: { after: 120 },
      });
    case "bullet":
      return new Paragraph({
        text: line.text,
        bullet: { level: 0 },
        spacing: { after: 80 },
      });
    case "hint":
      return new Paragraph({
        children: [
          new TextRun({
            text: line.text,
            italics: true,
            color: "666666",
            size: 20,
          }),
        ],
        spacing: { after: 100 },
      });
    case "blank-line":
      return new Paragraph({
        children: [
          new TextRun({
            text: " ",
            underline: { type: UnderlineType.SINGLE },
          }),
        ],
        spacing: { after: 200 },
      });
    default:
      return new Paragraph({ children: [new TextRun({ text: "" })] });
  }
}

export async function generateLessonKitDocx(kit: LessonKitDto): Promise<Buffer> {
  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Catholic Kids Crafts · Class lesson plan",
          size: 18,
          color: "666666",
          allCaps: true,
        }),
      ],
      spacing: { after: 120 },
    }),
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: kit.title, bold: true })],
      spacing: { after: 120 },
    }),
  );

  if (kit.description?.trim()) {
    children.push(
      new Paragraph({
        children: [new TextRun({ text: kit.description.trim() })],
        spacing: { after: 160 },
      }),
    );
  }

  for (const row of lessonPrintMetaRows(kit)) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${row.label}: `, bold: true, size: 20 }),
          new TextRun({ text: row.value, size: 20 }),
        ],
        spacing: { after: 60 },
      }),
    );
  }

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Classroom: ", bold: true, size: 18 }),
        new TextRun({ text: `/lesson/${kit.shareSlug}`, size: 18 }),
        new TextRun({ text: " · At home: ", bold: true, size: 18 }),
        new TextRun({ text: `/lesson/${kit.shareSlug}/family`, size: 18 }),
      ],
      spacing: { before: 120, after: 280 },
    }),
  );

  kit.blocks.forEach((block, index) => {
    const stepNumber = index + 1;
    for (const line of lessonStepHeaderLines(block, stepNumber)) {
      children.push(lineToParagraph(line));
    }
    for (const line of lessonBlockPrintContentLines(block)) {
      children.push(lineToParagraph(line));
    }
    children.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: { after: 200 },
      }),
    );
  });

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Printed from Catholic Kids Crafts · ${kit.title}`,
          italics: true,
          size: 16,
          color: "888888",
        }),
      ],
      spacing: { before: 240 },
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: LETTER_WIDTH, height: LETTER_HEIGHT },
            margin: {
              top: MARGIN_TOP,
              right: MARGIN_RIGHT,
              bottom: MARGIN_BOTTOM,
              left: MARGIN_LEFT,
            },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
