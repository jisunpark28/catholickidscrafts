import { isHtmlContent } from "@/lib/content-html";
import { sanitizeRichHtml } from "@/lib/sanitize-html";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Props = {
  content: string;
  contentFormat?: string;
  className?: string;
};

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
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
