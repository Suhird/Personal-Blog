import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useThemeMode } from "@/components/theme-mode-provider";
import { catppuccinMocha, paperCodeTheme } from "@/lib/syntaxThemes";

interface CodeBlockProps {
  language: string;
  children: string;
  filename?: string;
}

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
  const { isReader } = useThemeMode();

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

  if (isReader) {
    return (
      <div className="reader-code">
        <div className="reader-code__header">
          <div className="reader-code__meta">
            {filename && <span>{filename}</span>}
            {language && <span>{toDisplayLanguage(language)}</span>}
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            className="reader-code__copy"
            aria-label="Copy code to clipboard"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <SyntaxHighlighter
          style={paperCodeTheme}
          language={language}
          PreTag="div"
          showLineNumbers={false}
          wrapLines={false}
          wrapLongLines={false}
          customStyle={{
            background: "transparent",
            margin: 0,
            padding: "16px 18px",
            fontSize: "0.84rem",
            lineHeight: 1.6,
            overflowX: "auto",
          }}
          codeTagProps={{
            style: {
              padding: 0,
              background: "transparent",
              border: 0,
              fontFamily:
                "var(--reader-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontSize: "inherit",
              whiteSpace: "pre",
              wordBreak: "keep-all",
              overflowWrap: "normal",
              display: "inline",
            },
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    );
  }

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
              fontFamily: "'JetBrains Mono', 'SFMono-Regular', Consolas, Menlo, monospace",
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
