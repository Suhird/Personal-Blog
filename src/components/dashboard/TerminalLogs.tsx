import { useEffect, useState, useRef } from "react";

const TerminalLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const possibleLogs = [
    // Developer Jokes & Memes
    "git push --force (living on the edge)...",
    "sudo rm -rf / (just kidding)...",
    "Consulting Stack Overflow...",
    "Copying code from Stack Overflow...",
    "Pasting code to main.tsx...",
    "Why does this work? (I have no idea)...",
    "It works on my machine ¯\\_(ツ)_/¯...",
    "3 billion devices run Java, unfortunately...",
    "CSS is awesome (overflow: hidden)...",
    "Waiting for compilation (time to get coffee)...",
    "npm install (downloading half the internet)...",
    "Console.log('here')...",
    "Console.log('here2')...",
    "Console.log('why is this not working')...",
    "Removing console.logs (never)...",
    "Debugging with print statements...",
    "Checking if user is awake...",
    "Downloading more RAM...",
    "Deleting production database (oops)...",
    "Asking GPT-4 for help...",
    "Closing 50 Chrome tabs...",
    "Turning it off and on again...",
    "Writing documentation (hah, good one)...",
    "Converting coffee into code...",
    "Finding the missing semicolon...",
    "Resolving merge conflicts (crying)...",
    "Replacing AI with IF statements...",
    "Changing stuff until it works...",
    "Deploying on Friday (bad idea)...",
    "Reticulating splines...",
    "Refactoring technical debt into spiritual debt...",
    "Deleting tests to fix build...",
    "git commit -m 'fixed stuff'...",
    "Trying to exit vim (send help)...",
    "Updating dependencies (breaking everything)...",
    "Moving div by 1px...",
    "Compiling... (10 years later)...",
    "Running unit tests (0 passed)...",
    "Ignoring linter warnings...",
    "Commenting out broken code...",
    "Blaming the intern...",
    "Googling 'how to center a div'...",
    "Downloading node_modules (black hole)...",
    "Writing spaghetti code...",
    "Optimizing premature optimizations...",
    "Rebooting universe...",
    "Installing Gentoo...",
    "Mining crypto on localhost...",
    "Checking logs for 'undefined' is not a function...",
    "Detecting memory leak... ignoring it...",
  ];

  useEffect(() => {
    // Add initial logs
    setLogs(["System initialized.", "Loading dashboard jokes...", "Mounting sense of humor..."]);

    const interval = setInterval(() => {
      const randomLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' });
      const newLog = `[${timestamp}] ${randomLog}`;

      setLogs(prev => {
        const newLogs = [...prev, newLog];
        if (newLogs.length > 15) return newLogs.slice(1); // Increased retention for expanded view
        return newLogs;
      });
    }, 1500); // Slightly faster updates

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-terminal-background border border-terminal-comment/30 rounded-lg p-4 h-full flex flex-col font-mono text-sm">
      <div className="pb-2 mb-2 border-b border-terminal-comment/30 text-terminal-comment text-xs uppercase tracking-wider">
        System Logs
      </div>
      <div className="flex-1 overflow-hidden relative" ref={logsContainerRef}>
        <div className="absolute bottom-0 left-0 w-full space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="truncate text-terminal-comment/70 animate-in slide-in-from-bottom-2 fade-in duration-300">
              <span className="text-terminal-green mr-2">{">"}</span>
              {log}
            </div>
          ))}
          <div className="animate-cursor-blink h-4 w-2 bg-terminal-cyan inline-block mt-1"></div>
        </div>
      </div>
    </div>
  );
};

export default TerminalLogs;
