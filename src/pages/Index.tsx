import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import StatsGrid from "@/components/dashboard/StatsGrid";
import TechStackPanel from "@/components/dashboard/TechStackPanel";

import TerminalLogs from "@/components/dashboard/TerminalLogs";

const Index = () => {
  return (
    <Layout>
      <Helmet>
        <title>Suhird Singh | Technical Blog & Portfolio</title>
        <meta name="description" content="Welcome to Suhird Singh's technical blog. Expert content on gRPC, GraphQL, Python, Go, Rust, microservices, and cloud architecture." />
        <meta name="keywords" content="Suhird Singh, technical blog, software engineer, gRPC, GraphQL, Python, Go, Rust" />
        <meta property="og:title" content="Suhird Singh | Technical Blog & Portfolio" />
        <meta property="og:description" content="Expert content on gRPC, GraphQL, Python, Go, Rust, microservices, and cloud architecture." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://suhird.me" />
        <link rel="canonical" href="https://suhird.me" />
      </Helmet>
      <div className="py-6 animate-in fade-in duration-500">
        <DashboardHeader />
        <StatsGrid />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Main Content Area - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Expanded Terminal Logs */}
            <div className="h-[600px]">
              <TerminalLogs />
            </div>
            
            {/* Row 3: Contact */}
             <section className="bg-terminal-background border border-terminal-comment/30 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-terminal-yellow font-mono mb-2">
                  $ ./contact.sh
                </h2>
                <p className="text-terminal-comment font-mono text-sm">
                  # Ready to collaborate?
                </p>
              </div>
              
              <Link
                to="/contact"
                className="whitespace-nowrap bg-terminal-background border border-terminal-green text-terminal-green hover:bg-terminal-green/10 font-mono py-2 px-6 rounded transition-colors text-center"
              >
                ./send_message.sh
              </Link>
            </section>
          </div>
          
          {/* Sidebar Area - 1/3 width */}
          <div className="space-y-6">
            <TechStackPanel />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
