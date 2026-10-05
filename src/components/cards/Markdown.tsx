import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { safeWebUrl } from "../../lib/url";

// Raw HTML stays disabled. Remote images do not load behind the user's back.
export default function Markdown({ children }: { children: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[[rehypeHighlight, { detect: false, ignoreMissing: true }]]}
    components={{
      a: ({ href, children }) => {
        const safe = href ? safeWebUrl(href) : undefined;
        return safe ? <a href={safe} target="_blank" rel="noopener noreferrer">{children}</a> : <span>{children}</span>;
      },
      img: ({ alt }) => <span>[Image: {alt || "image"}]</span>,
    }}>{children}</ReactMarkdown>;
}
