import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface CodeBlockProps {
  language: string;
  children: string;
}

const CodeBlock = ({ language, children }: CodeBlockProps) => {
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

        // Reset the copied state after 2 seconds
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

  return (
    <div className="terminal-code-block mb-6 overflow-hidden rounded-md relative group">
      <div className="terminal-code-header px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <div className="terminal-dots">
            <span className="terminal-dot-red"></span>
            <span className="terminal-dot-yellow"></span>
            <span className="terminal-dot-green"></span>
          </div>
          <div className="ml-2 text-xs text-terminal-comment">{language}</div>
        </div>
        <Button
          onClick={copyToClipboard}
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100 h-8 w-8 p-0"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-gray-400 hover:text-white" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        style={dracula}
        language={language}
        PreTag="div"
        className="rounded-b-md !m-0 !bg-[#282a36] !p-4"
        showLineNumbers={true}
        wrapLines={true}
      >
        {String(children).replace(/\n$/, "")}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
