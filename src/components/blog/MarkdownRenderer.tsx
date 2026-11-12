import ReactMarkdown from "react-markdown";
import { isValidElement, type ComponentProps, type ComponentType } from "react";
import type { ExtraProps } from "react-markdown";
import remarkGfm from "remark-gfm"; // Import the plugin
import CodeBlock from "./CodeBlock";
import { useThemeMode } from "@/components/theme-mode-provider";

interface MarkdownRendererProps {
  content: string;
  /** Optional custom renderers keyed by a fenced-code language. */
  diagrams?: Record<string, ComponentType>;
}

const MarkdownRenderer = ({ content, diagrams }: MarkdownRendererProps) => {
  const { isReader } = useThemeMode();

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
        // A custom diagram is a block-level component, not a code block.
        // ReactMarkdown wraps a fenced block in <pre>; unwrap it so the
        // diagram is not rendered with preformatted whitespace.
        pre: ({ node: _node, children, ...props }) => {
          const first = Array.isArray(children) ? children[0] : children;
          if (
            isValidElement(first) &&
            (first.props as { "data-diagram-block"?: string })[
              "data-diagram-block"
            ] === "true"
          ) {
            return <>{children}</>;
          }
          return <pre {...props}>{children}</pre>;
        },
        // Code block handling
        code({
          node,
          className,
          children,
          ...props
        }: ComponentProps<"code"> & ExtraProps & { inline?: boolean }) {
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

          const Diagram = language ? diagrams?.[language] : undefined;
          if (!props.inline && Diagram) {
            return (
              <div data-diagram-block="true">
                <Diagram />
              </div>
            );
          }

          return !props.inline && language ? (
            <CodeBlock language={language} filename={filename}>
              {String(children).replace(/\n$/, "")}
            </CodeBlock>
          ) : isReader ? (
            <code {...props}>{children}</code>
          ) : (
            <code
              className="font-mono text-[0.95em]"
              {...props}
            >
              {children}
            </code>
          );
        },
        img: ({ node, src, alt, ...props }) => {
          const isDiagram = typeof src === "string" && src.endsWith(".svg");

          if (isReader) {
            return (
              <span
                className={
                  isDiagram
                    ? "reader-image reader-image--diagram"
                    : "reader-image"
                }
              >
                <a href={src} target="_blank" rel="noreferrer" title="Open full image">
                  <img
                    {...props}
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className={isDiagram ? "blog-diagram" : undefined}
                  />
                </a>
              </span>
            );
          }

          if (isDiagram) {
            return (
              <span className="my-4 block overflow-x-auto rounded-lg border border-terminal-comment/30">
                <a href={src} target="_blank" rel="noreferrer">
                  <img
                    {...props}
                    src={src}
                    alt={alt}
                    loading="lazy"
                    className="blog-diagram"
                  />
                </a>
              </span>
            );
          }

          return (
            <a href={src} target="_blank" rel="noreferrer" title="Open full image">
              <img
                {...props}
                src={src}
                alt={alt}
                className="max-h-[500px] w-auto max-w-full object-contain mx-auto rounded-lg border border-terminal-comment/30 my-4"
              />
            </a>
          );
        },
        a: ({ node, href, children, ...props }) =>
          isReader ? (
            <a href={href} {...props}>
              {children}
            </a>
          ) : (
            <a
              href={href}
              className="hover:underline"
              {...props}
            >
              {children}
            </a>
          ),
        p: ({ node, children, ...props }) =>
          isReader ? (
            <p {...props}>{children}</p>
          ) : (
            <p className="mb-5" {...props}>
              {children}
            </p>
          ),
        ul: ({ node, children, ...props }) =>
          isReader ? (
            <ul {...props}>{children}</ul>
          ) : (
            <ul className="list-none mb-5" {...props}>
              {children}
            </ul>
          ),
        ol: ({ node, children, ...props }) =>
          isReader ? (
            <ol {...props}>{children}</ol>
          ) : (
            <ol className="mb-5 list-decimal list-inside" {...props}>
              {children}
            </ol>
          ),
        li: ({ node, children, ...props }) =>
          isReader ? (
            <li {...props}>{children}</li>
          ) : (
            <li className="mb-2" {...props}>
              {children}
            </li>
          ),
        blockquote: ({ node, children, ...props }) =>
          isReader ? (
            <blockquote {...props}>{children}</blockquote>
          ) : (
            <blockquote className="blog-blockquote" {...props}>
              {children}
            </blockquote>
          ),
        table: ({ node, children, ...props }) => (
          <div className={isReader ? "overflow-x-auto" : "overflow-x-auto mb-5"}>
            <table {...props}>
              {children}
            </table>
          </div>
        ),
        th: ({ node, children, ...props }) =>
          isReader ? (
            <th {...props}>{children}</th>
          ) : (
            <th className="text-[var(--accent)]" {...props}>
              {children}
            </th>
          ),
        td: ({ node, children, ...props }) => (
          <td {...props}>
            {children}
          </td>
        ),
        hr: ({ node, ...props }) =>
          isReader ? (
            <hr {...props} />
          ) : (
            <hr className="my-8 border-[var(--border-color)]" {...props} />
          ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
