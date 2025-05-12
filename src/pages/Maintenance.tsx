import { Link } from "react-router-dom";
import { Construction, Clock } from "lucide-react";
import Layout from "@/components/Layout";

const Maintenance = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="terminal-maintenance p-6 border border-terminal-comment/40 rounded-md max-w-2xl mx-auto bg-terminal-background/70">
          <div className="flex items-center justify-center mb-4 text-terminal-yellow">
            <Construction className="mr-2" size={28} />
            <h1 className="text-2xl md:text-3xl font-bold">
              System Maintenance
            </h1>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center text-terminal-comment">
              <Clock className="mr-2" />
              <p className="text-sm">
                Estimated completion:{" "}
                <span className="text-terminal-cyan">4 hours</span>
              </p>
            </div>

            <div className="text-terminal-foreground">
              <p className="mb-4 terminal-prompt">
                We're performing scheduled system maintenance.
              </p>
              <p className="text-terminal-comment mb-4">
                # The system is currently being upgraded to improve performance
                and security
              </p>
              <div className="bg-terminal-comment/10 p-4 rounded text-left mb-6">
                <pre className="font-mono text-sm">
                  <span className="text-terminal-green">$</span>{" "}
                  <span className="text-terminal-purple">systemctl</span> status
                  blog-service
                  <br />
                  <span className="text-terminal-comment">
                    ● blog-service.service - Technical Blog API
                  </span>
                  <br />
                  <span className="text-terminal-comment">
                    {" "}
                    Loaded: loaded (/etc/systemd/system/blog.service; enabled;
                    vendor preset: enabled)
                  </span>
                  <br />
                  <span className="text-terminal-comment">
                    {" "}
                    Active:{" "}
                    <span className="text-terminal-yellow">
                      maintenance
                    </span>{" "}
                    (since Mon 2025-05-12 16:30:24 UTC; 1h 23m ago)
                  </span>
                </pre>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="bg-terminal-background border border-terminal-green text-terminal-green hover:bg-terminal-green/10 font-mono py-2 px-6 rounded"
            >
              ./refresh.sh
            </Link>
            {/* <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noreferrer"
              className="bg-terminal-background border border-terminal-purple text-terminal-purple hover:bg-terminal-purple/10 font-mono py-2 px-6 rounded"
            >
              ./status_updates.sh
            </a> */}
          </div>

          <div className="mt-8 pt-4 border-t border-terminal-comment/30">
            <p className="text-sm text-terminal-comment">
              For urgent matters, please contact{" "}
              <span className="text-terminal-cyan">support@yoursite.com</span>
            </p>
          </div>
        </div>

        <div className="mt-6 text-terminal-comment text-sm animate-pulse">
          <p>Attempting to reconnect every 60 seconds...</p>
        </div>
      </div>
    </Layout>
  );
};

export default Maintenance;
