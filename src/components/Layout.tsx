import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import ReaderHeader from "./layout/ReaderHeader";
import ReaderFooter from "./layout/ReaderFooter";
import { useThemeMode } from "./theme-mode-provider";

interface LayoutProps {
  children: ReactNode;
}

const TerminalShell = ({ children }: LayoutProps) => {
  const location = useLocation();

  // Map pathname to display name
  const getDisplayPath = (pathname: string) => {
    if (pathname === "/") return "Home";
    if (pathname.startsWith("/tech-blog")) return "TechBlog";
    if (pathname.startsWith("/beyond-code")) return "BeyondCode";
    if (pathname.startsWith("/blog")) return "Blog";
    if (pathname.startsWith("/series")) return "Series";
    if (pathname === "/projects") return "Projects";
    if (pathname === "/about") return "About";
    if (pathname === "/contact") return "Contact";
    return "Home";
  };

  const displayPath = getDisplayPath(location.pathname);

  return (
    <div className="flex min-h-screen flex-col bg-terminal-background text-terminal-foreground font-mono">
      <div className="terminal-container max-w-7xl mx-auto w-full px-4 py-4 border border-terminal-comment rounded-lg">
        <div className="terminal-window">
          <div className="terminal-header flex items-center p-2">
            <div className="terminal-dots">
              <span className="terminal-dot-red"></span>
              <span className="terminal-dot-yellow"></span>
              <span className="terminal-dot-green"></span>
            </div>
            <div className="mx-auto text-sm text-terminal-comment">
              suhird@127.0.0.1 {displayPath}
            </div>
          </div>
          <div className="terminal-body">
            <Header />
            <main className="flex-1 py-4">{children}</main>
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

const ReaderShell = ({ children }: LayoutProps) => (
  <div className="reader-shell">
    <a href="#reader-main" className="reader-skip">
      Skip to content
    </a>
    <ReaderHeader />
    <main id="reader-main" className="reader-main">
      {children}
    </main>
    <ReaderFooter />
  </div>
);

const Layout = ({ children }: LayoutProps) => {
  const { isReader } = useThemeMode();

  if (isReader) {
    return <ReaderShell>{children}</ReaderShell>;
  }

  return <TerminalShell>{children}</TerminalShell>;
};

export default Layout;
