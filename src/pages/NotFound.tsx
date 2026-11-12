import { Link, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import Layout from "@/components/Layout";
import { useThemeMode } from "@/components/theme-mode-provider";

const NotFound = () => {
  const location = useLocation();
  const { isReader } = useThemeMode();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      {isReader ? (
        <div className="reader-container reader-page reader-notfound">
          <p className="reader-eyebrow">404</p>
          <h1 className="reader-title">Page not found.</h1>
          <p className="reader-lede">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="mt-8 flex flex-wrap gap-6">
            <Link to="/" className="reader-link">
              Home
            </Link>
            <Link to="/tech-blog/" className="reader-link">
              Writing
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="max-w-md px-4">
            <div className="text-terminal-red flex items-center justify-center mb-6">
              <AlertTriangle size={48} />
            </div>

            <h1 className="text-4xl font-bold mb-4 text-terminal-yellow terminal-prompt">
              Error 404
            </h1>

            <div className="bg-terminal-comment/10 p-4 rounded text-left mb-6">
              <pre className="font-mono text-sm">
                <span className="text-terminal-green">$</span>{" "}
                <span className="text-terminal-purple">find</span>{" "}
                {location.pathname}
                <br />
                <span className="text-terminal-red">
                  find: '{location.pathname}': No such file or directory
                </span>
              </pre>
            </div>

            <p className="text-terminal-comment mb-6">
              # The page you're looking for doesn't exist or has been moved
            </p>

            <div className="flex justify-center">
              <Link
                to="/"
                className="bg-terminal-background border border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan/10 font-mono py-2 px-6 rounded"
              >
                cd ~/home
              </Link>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default NotFound;
