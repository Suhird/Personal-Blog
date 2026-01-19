import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // Import the plugin
import CodeBlock from "./CodeBlock";

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]} // Add the plugin here
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
          // Handle className like "language-typescript:filename.ts" or "language-typescript"
          let language = "";
          let filename;

          if (className) {
            // Check if there's a filename in the className (language-typescript:filename.ts)
            const filenameMatch = className.match(/language-([^:\s]+):(.+)/);
            if (filenameMatch) {
              language = filenameMatch[1];
              filename = filenameMatch[2];
            } else {
              // Just extract language normally (language-typescript)
              const match = /language-([^:\s]+)/.exec(className);
              language = match ? match[1] : "";
            }
          }

          // Also check meta attribute for filename
          if (node?.data?.meta && !filename) {
            const metaMatch = node.data.meta.match(/^([^:]+):(.+)$/);
            if (metaMatch) {
              filename = metaMatch[2];
              // If language wasn't found in className, try meta
              if (!language) {
                language = metaMatch[1];
              }
            }
          }

          // Fix: Remap toml to ini because Prism's toml support can be buggy with brackets
          if (language === "toml") {
            language = "ini";
          }

          return !props.inline && language ? (
            <CodeBlock language={language} filename={filename}>
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
        img: ({ node, ...props }) => (
          <img
            {...props}
            className="max-h-[500px] w-auto max-w-full object-contain mx-auto rounded-lg border border-terminal-comment/30 my-4"
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
