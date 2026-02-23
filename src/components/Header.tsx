import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  title: string;
  href: string;
}

const navItems: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Blog", href: "/blog" },
  { title: "Projects", href: "/projects" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

const Header = () => {
  const pathname = window.location.pathname;

  return (
    <header className="py-6 border-b border-terminal-comment/30">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl text-terminal-purple terminal-prompt terminal-cursor">
              Echo My Thoughts 🤔 ...
            </span>
          </Link>
        </div>
        <nav className="flex flex-wrap items-center gap-4 sm:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "text-sm transition-colors hover:text-terminal-green",
                pathname === item.href
                  ? "text-terminal-cyan"
                  : "text-terminal-foreground/80"
              )}
            >
              {item.title}
            </Link>
          ))}
          <div className="flex items-center ml-2 border-l border-terminal-comment/30 pl-4 sm:pl-6">
            <ThemeToggle />
          </div>
        </nav>
      </div>
      <div className="flex justify-end mt-4 text-terminal-comment text-sm">
        <a
          href="https://github.com/suhird"
          target="_blank"
          rel="noreferrer"
          className="ml-4 hover:text-terminal-cyan"
        >
          <span>github</span>
        </a>
        <a
          href="https://linkedin.com/in/suhird-singh/"
          target="_blank"
          rel="noreferrer"
          className="ml-4 hover:text-terminal-cyan"
        >
          <span>linkedin</span>
        </a>
      </div>
    </header>
  );
};

export default Header;
