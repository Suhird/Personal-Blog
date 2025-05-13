import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      components={{
        // Add IDs to headings
        h1: ({ node, children, ...props }) => {
          const id = children
            ? children
                .toString()
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
            : "";
          return (
            <h1 id={id} {...props}>
              {children}
            </h1>
          );
        },
        h2: ({ node, children, ...props }) => {
          const id = children
            ? children
                .toString()
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
            : "";
          return (
            <h2 id={id} {...props}>
              {children}
            </h2>
          );
        },
        h3: ({ node, children, ...props }) => {
          const id = children
            ? children
                .toString()
                .toLowerCase()
                .replace(/[^\w\s-]/g, "")
                .replace(/\s+/g, "-")
            : "";
          return (
            <h3 id={id} {...props}>
              {children}
            </h3>
          );
        },
        // Code block handling
        code({ node, className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          return !props.inline && match ? (
            <CodeBlock language={match[1]}>
              {String(children).replace(/\n$/, "")}
            </CodeBlock>
          ) : (
            <code
              className="bg-terminal-background/70 text-terminal-yellow px-1 py-0.5 rounded"
              {...props}
            >
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
