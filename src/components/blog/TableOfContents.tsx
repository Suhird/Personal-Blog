import { useState, useEffect } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TableOfContents as TOCIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Parse the markdown content to extract headings
    const extractHeadings = (markdownContent: string): TocItem[] => {
      const headingRegex = /^(#{1,3})\s+(.+)$/gm;
      const items: TocItem[] = [];

      let match;
      while ((match = headingRegex.exec(markdownContent)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        // Create an ID from the heading text (slug-like format)
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-");

        items.push({ id, text, level });
      }

      return items;
    };

    if (content) {
      setHeadings(extractHeadings(content));
    }
  }, [content]);

  // Observer for headings to highlight active section
  useEffect(() => {
    if (typeof document === "undefined" || headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -80% 0px" }
    );

    // Observe all heading elements in the document
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="mb-6 border border-terminal-comment/20 rounded-md"
    >
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-terminal-comment/10 transition-colors">
        <div className="flex items-center gap-2">
          <TOCIcon className="w-4 h-4 text-terminal-accent" />
          <span className="text-sm font-medium">Table of Contents</span>
        </div>
        <span className="text-xs text-terminal-comment">
          {isOpen ? "Hide" : "Show"}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <nav className="p-3">
          <ul className="space-y-1 text-sm">
            {headings.map((heading) => (
              <li
                key={heading.id}
                style={{
                  paddingLeft: `${(heading.level - 1) * 12}px`,
                }}
              >
                <a
                  href={`#${heading.id}`}
                  className={cn(
                    "hover:text-terminal-accent transition-colors block py-1",
                    activeId === heading.id
                      ? "text-terminal-accent"
                      : "text-terminal-foreground/80"
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(heading.id)?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TableOfContents;
