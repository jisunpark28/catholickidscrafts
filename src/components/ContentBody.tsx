import { isHtmlContent } from "@/lib/content-html";
import { resolveAssetUrl } from "@/lib/asset-url";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

type Props = {
  content: string;
  contentFormat?: string;
  className?: string;
  /** When true, links never use the download attribute (Kids Resources). */
  noDownloadLinks?: boolean;
};

const markdownImgClass =
  "my-8 block w-full max-w-2xl rounded-lg border border-[var(--color-border)] bg-white shadow-sm";

function markdownComponents(noDownloadLinks: boolean): Components {
  return {
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
    a: ({ href, children, ...rest }) => {
      const url = resolveAssetUrl(typeof href === "string" ? href : undefined);
      const isExternal = url.startsWith("http");
      const { download: _omitDownload, target, rel, ...linkRest } = rest;
      return (
        <a
          href={url}
          {...linkRest}
          target={isExternal ? "_blank" : target}
          rel={isExternal ? "noopener noreferrer" : rel}
        >
          {children}
        </a>
      );
    },
  };
}

export function ContentBody({
  content,
  contentFormat,
  className = "",
  noDownloadLinks = false,
}: Props) {
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
        components={markdownComponents(noDownloadLinks)}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
