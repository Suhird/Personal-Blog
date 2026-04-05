import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  // Map pathname to display name
  const getDisplayPath = (pathname: string) => {
    if (pathname === "/") return "Home";
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
      <div className="terminal-container max-w-7xl mx-auto w-full px-4 py-4">
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

export default Layout;
