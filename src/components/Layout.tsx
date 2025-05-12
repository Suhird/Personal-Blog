import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-terminal-background text-terminal-foreground font-mono">
      <div className="terminal-container max-w-5xl mx-auto w-full px-4 py-4">
        <div className="terminal-window">
          <div className="terminal-header flex items-center p-2">
            <div className="terminal-dots">
              <span className="terminal-dot-red"></span>
              <span className="terminal-dot-yellow"></span>
              <span className="terminal-dot-green"></span>
            </div>
            <div className="mx-auto text-sm text-terminal-comment">
              suhird@127.0.0.1 ~ /blog
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
