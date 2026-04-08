import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  language: string;
  children: string;
  filename?: string;
}

const catppuccinMocha = {
  'pre[class*="language-"]': {
    color: "#CDD6F4",
    background: "#1E1E2E",
    fontFamily: "Hack, DejaVu Sans Mono, Monaco, Consolas, Ubuntu Mono, monospace",
    fontSize: "0.95rem",
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal" as const,
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.5",
    tabSize: 4,
    hyphens: "none" as const,
    margin: 0,
    padding: "20px",
    overflow: "auto",
  },
  'code[class*="language-"]': {
    color: "#CDD6F4",
    background: "#1E1E2E",
    fontFamily: "Hack, DejaVu Sans Mono, Monaco, Consolas, Ubuntu Mono, monospace",
    fontSize: "0.95rem",
    textAlign: "left" as const,
    whiteSpace: "pre" as const,
    wordSpacing: "normal" as const,
    wordBreak: "normal" as const,
    wordWrap: "normal" as const,
    lineHeight: "1.5",
    tabSize: 4,
    hyphens: "none" as const,
  },
  comment: {
    color: "#6C7086",
    fontStyle: "italic" as const,
  },
  prolog: {
    color: "#6C7086",
  },
  doctype: {
    color: "#6C7086",
  },
  cdata: {
    color: "#6C7086",
  },
  punctuation: {
    color: "#9399B2",
  },
  property: {
    color: "#89B4FA",
  },
  tag: {
    color: "#89B4FA",
  },
  boolean: {
    color: "#FAB387",
  },
  number: {
    color: "#FAB387",
  },
  constant: {
    color: "#FAB387",
  },
  symbol: {
    color: "#FAB387",
  },
  deleted: {
    color: "#F38BA8",
  },
  selector: {
    color: "#A6E3A1",
  },
  "attr-name": {
    color: "#A6E3A1",
  },
  string: {
    color: "#A6E3A1",
  },
  char: {
    color: "#A6E3A1",
  },
  builtin: {
    color: "#89B4FA",
  },
  inserted: {
    color: "#A6E3A1",
  },
  operator: {
    color: "#94E2D5",
  },
  entity: {
    color: "#F9E2AF",
    cursor: "help" as const,
  },
  url: {
    color: "#89DCEB",
  },
  variable: {
    color: "#CDD6F4",
  },
  atrule: {
    color: "#CBA6F7",
  },
  "attr-value": {
    color: "#A6E3A1",
  },
  function: {
    color: "#89B4FA",
  },
  "class-name": {
    color: "#F9E2AF",
  },
  keyword: {
    color: "#CBA6F7",
    fontStyle: "italic" as const,
  },
  regex: {
    color: "#F9E2AF",
  },
  important: {
    color: "#CBA6F7",
    fontWeight: "bold" as const,
  },
  bold: {
    fontWeight: "bold" as const,
  },
  italic: {
    fontStyle: "italic" as const,
  },
};

const languageMap: Record<string, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  tsx: "TypeScript React",
  jsx: "JavaScript React",
  py: "Python",
  rb: "Ruby",
  rs: "Rust",
  go: "Go",
  java: "Java",
  cpp: "C++",
  c: "C",
  cs: "C#",
  swift: "Swift",
  kt: "Kotlin",
  scala: "Scala",
  php: "PHP",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sql: "SQL",
  sh: "Shell",
  bash: "Bash",
  zsh: "Zsh",
  yaml: "YAML",
  yml: "YAML",
  json: "JSON",
  toml: "TOML",
  xml: "XML",
  md: "Markdown",
  mdx: "MDX",
  dockerfile: "Dockerfile",
  docker: "Docker",
  rust: "Rust",
};

const toDisplayLanguage = (lang: string): string => {
  return languageMap[lang.toLowerCase()] || lang.charAt(0).toUpperCase() + lang.slice(1);
};

const CodeBlock = ({ language, children, filename }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(children)
      .then(() => {
        setCopied(true);
        toast({
          title: "Copied!",
          description: "Code copied to clipboard",
          duration: 2000,
        });

        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy code",
        });
      });
  };

  const content = String(children).replace(/\n$/, "");

  return (
    <div className="mb-6 relative group border border-[var(--terminal-comment)]">
      {(filename || language) && (
        <div className="px-4 py-2 flex items-center justify-between bg-[var(--terminal-background)] rounded-t-md opacity-80">
          <div className="flex items-center gap-3">
            <div className="terminal-dots">
              <span className="terminal-dot-red"></span>
              <span className="terminal-dot-yellow"></span>
              <span className="terminal-dot-green"></span>
            </div>
            {filename && (
              <span className="text-xs text-[var(--terminal-foreground)] font-medium">
                {filename}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {language && (
              <span className="text-xs text-[var(--terminal-comment)]">
                {toDisplayLanguage(language)}
              </span>
            )}
            <Button
              onClick={copyToClipboard}
              size="sm"
              variant="ghost"
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 h-7 w-7 p-0 text-[var(--terminal-foreground)] hover:text-[var(--terminal-accent)] hover:bg-[var(--terminal-comment)]"
              aria-label="Copy code to clipboard"
            >
              {copied ? (
                <Check className="h-4 w-4 text-[var(--terminal-green)]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
      <div className={filename || language ? "rounded-none" : "rounded-md"}>
        <SyntaxHighlighter
          style={catppuccinMocha}
          language={language}
          PreTag="div"
          className={filename || language ? "!rounded-none !mt-0" : "!rounded-md !mt-0"}
          showLineNumbers={true}
          wrapLines={false}
          wrapLongLines={false}
          customStyle={{
            lineHeight: "1.5",
            whiteSpace: "pre",
            wordBreak: "keep-all",
            wordWrap: "normal",
            overflowX: "auto",
            overflowWrap: "normal",
            textWrap: "nowrap",
            background: "var(--terminal-background)",
            margin: 0,
            padding: "20px",
          }}
          codeTagProps={{
            style: {
              fontFamily: "Hack, DejaVu Sans Mono, Monaco, Consolas, Ubuntu Mono, monospace",
              whiteSpace: "pre",
              wordBreak: "keep-all",
              overflowWrap: "normal",
              display: "inline",
            },
          }}
          lineNumberStyle={{
            color: "var(--terminal-comment)",
            paddingRight: "1.5em",
            userSelect: "none",
            minWidth: "2.5em",
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
      {filename || language ? (
        <div className="h-[2px] bg-[var(--terminal-comment)] opacity-30"></div>
      ) : null}
    </div>
  );
};

export default CodeBlock;