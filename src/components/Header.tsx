import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Github, Linkedin, ChevronDown } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  children?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  { title: "Home", href: "/" },
  {
    title: "Blog",
    href: "/tech-blog/",
    children: [
      { title: "Tech Blog", href: "/tech-blog/" },
      { title: "Beyond Code", href: "/beyond-code/" },
    ],
  },
  { title: "Series", href: "/series/" },
  { title: "Projects", href: "/projects/" },
  { title: "About", href: "/about/" },
  { title: "Contact", href: "/contact/" },
];

const Header = () => {
  const pathname = window.location.pathname;
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/\/$/, "");
    const cleanHref = href.replace(/\/$/, "");
    return cleanPath === cleanHref;
  };

  const isChildActive = (children?: { title: string; href: string }[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.href));
  };

  return (
    <header className="py-6 border-b border-terminal-comment/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-terminal-purple terminal-prompt terminal-cursor">
              Echo My Thoughts 🤔 ...
            </span>
          </Link>
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-md border border-terminal-cyan/30 bg-terminal-cyan/5 shadow-[0_0_8px_rgba(6,182,212,0.1)]">
            <a
              href="https://github.com/suhird"
              target="_blank"
              rel="noreferrer"
              className="text-terminal-comment hover:text-terminal-cyan transition-colors flex items-center gap-1.5 text-xs font-medium"
              aria-label="GitHub Profile"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
            <span className="text-terminal-comment/30">|</span>
            <a
              href="https://linkedin.com/in/suhird-singh/"
              target="_blank"
              rel="noreferrer"
              className="text-terminal-comment hover:text-terminal-cyan transition-colors flex items-center gap-1.5 text-xs font-medium"
              aria-label="LinkedIn Profile"
            >
              <Linkedin size={14} />
              <span>LinkedIn</span>
            </a>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-4 sm:gap-6">
          {navItems.map((item) => {
            const active = isActive(item.href) || isChildActive(item.children);

            if (item.children) {
              return (
                <div
                  key={item.title}
                  className="relative group"
                  onMouseEnter={() => setOpenDropdown(item.title)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    to={item.href}
                    className={cn(
                      "text-sm transition-colors hover:text-terminal-green flex items-center gap-1",
                      active ? "text-terminal-cyan" : "text-terminal-foreground/80"
                    )}
                  >
                    {item.title}
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </Link>
                  <div
                    className={cn(
                      "absolute top-full left-0 mt-1 min-w-[140px] bg-terminal-background border border-terminal-comment/30 rounded-lg shadow-lg overflow-hidden z-50",
                      "opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200"
                    )}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={cn(
                          "block px-4 py-2 text-sm transition-colors hover:bg-terminal-comment/10",
                          isActive(child.href)
                            ? "text-terminal-cyan bg-terminal-cyan/10"
                            : "text-terminal-foreground/80"
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "text-sm transition-colors hover:text-terminal-green",
                  active ? "text-terminal-cyan" : "text-terminal-foreground/80"
                )}
              >
                {item.title}
              </Link>
            );
          })}
          <div className="flex items-center ml-2 border-l border-terminal-comment/30 pl-4 sm:pl-6">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
