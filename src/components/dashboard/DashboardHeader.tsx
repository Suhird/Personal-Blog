import { useState, useEffect } from "react";
import { Shield, Wifi } from "lucide-react";

const DashboardHeader = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-terminal-card border border-terminal-comment/30 rounded-lg p-6 mb-6 relative overflow-hidden group">
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-terminal-comment/30 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-3 w-3 rounded-full bg-terminal-green animate-pulse"></span>
              <span className="text-terminal-green text-sm font-mono">SYSTEM ONLINE</span>
            </div>
            <h1 className="text-3xl font-bold text-terminal-foreground">
              <span className="text-terminal-accent">{">"}</span> Welcome, User
            </h1>
          </div>
          
          <div className="mt-4 md:mt-0 text-right font-mono text-sm text-terminal-comment">
            <div className="flex items-center justify-end gap-2">
              <Shield size={14} />
              <span>SECURE CONNECTION</span>
            </div>
            <div className="text-terminal-foreground mt-1">
              {currentTime.toLocaleDateString()} {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="space-y-2 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-terminal-purple">$ whoami</span>
          </div>
          <div className="pl-4 text-terminal-foreground">
            {">"} Suhird Singh
            <br />
            {">"} Senior Software Engineer & Technical Writer
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <span className="text-terminal-purple">$ cat mission.txt</span>
          </div>
          <div className="pl-4 text-terminal-comment italic">
            "Building scalable systems and writing about it."
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
