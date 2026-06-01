import { isHtmlContent } from "@/lib/content-html";
import { resolveAssetUrl } from "@/lib/asset-url";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  contentFormat?: string;
  className?: string;
};

const markdownImgClass =
  "my-8 block w-full max-w-2xl rounded-lg border border-[var(--color-border)] bg-white shadow-sm";

export function ContentBody({ content, contentFormat, className = "" }: Props) {
  if (isHtmlContent(content, contentFormat)) {
    const safe = sanitizeRichHtml(content);
    return (
      <div
        className={`prose-catechism rich-content ${className}`}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    );
  }

  return (
    <div className={`prose-catechism ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveAssetUrl(typeof src === "string" ? src : undefined)}
              alt={alt ?? ""}
              className={markdownImgClass}
              loading="lazy"
              decoding="async"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
