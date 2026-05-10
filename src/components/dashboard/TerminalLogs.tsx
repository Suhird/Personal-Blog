import { useEffect, useState, useRef } from "react";

const TerminalLogs = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const logsContainerRef = useRef<HTMLDivElement>(null);

  const possibleLogs = [
    // Developer Jokes & Memes
    "git push --force (living on the edge)...",
    "sudo rm -rf / (just kidding)...",
    "Consulting Stack Overflow in 2026...",
    "Pasting code to main.tsx...",
    "Why does this work? (I have no idea)...",
    "It works on my machine ¯\\_(ツ)_/¯...",
    "3 billion devices run Java, unfortunately...",
    "CSS is awesome (overflow: hidden)...",
    "Waiting for compilation (time to get coffee)...",
    "npm install (downloading half the internet)...",
    "Console.log('why is this not working')...",
    "Removing console.logs (never)...",
    "Downloading more RAM...",
    "Deleting production database (oops)...",
    "Asking GPT-4 for help...",
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
    "Recruiting on LinkedIn (we're hiring!)...",
    "Fixing one bug, creating seventeen...",
    "Running chmod 777 on feelings...",
    "Rewriting everything in Rust (just because)...",
    "YOLO deploying to production...",
    "git commit -m 'asdf' --no-verify...",
    "Accidentally dropping the users table...",
    "Importing left-pad (1.5MB of wisdom)...",
    "Checking if it's a caching issue (it's always DNS)...",
    "Writing regex, now I have 2 problems...",
    "Refactoring legacy code (it's all legacy)...",
    "Estimating 2 hours (will take 2 weeks)...",
    "npm audit fix --force (nuclear option)...",
    "Hiding errors in try/catch (shhh)...",
    "Connecting to WiFi (please enter 26-digit password)...",
    "Upgrading to Python 4 (time travel required)...",
    "Installing Adobe Reader to fix printer...",
    "Compiling C++ (grabbing lunch, dinner, and breakfast)...",
    "Running Java (hello GC pauses)...",
    "Measuring velocity in story points (fiction)...",
    "Writing tests after deployment (best practice)...",
    "Checking Slack... still no messages...",
    "Rolling back to the Stone Age...",
    "Reverting to jQuery (we've come full circle)...",
    "Enabling dark mode (it's always dark mode)...",
    "Adjusting z-index to 999999...",
    "Waiting for designer to pick a color...",
    "Adding !important to everything...",
    "Browsing Hacker News instead of working...",
    "Merging without review (living dangerously)...",
    "Blaming caching (it's never caching)...",
    "Starting a new side project (abandoning old one)...",
    "Learning Vim (still stuck)...",
    "Installing Arch Linux (btw)...",
    "Running Docker (it works on my container)...",
    "Kubernetes orchestrating my anxiety...",
    "Spinning up another microservice (monolith in disguise)...",
    "Waiting for CI/CD (watching paint dry)...",
    "Reading man pages (man page not found)...",
    "sudo make me a sandwich...",
    "Hugging a teddy bear after code review...",
    "Explaining to mom what I do for a living...",
    "Agilefall methodology in action...",
    "Tech lead said 'it's a quick fix'...",
    "Attending standup (sitting down)...",
    "Pointing at screen during Zoom call...",
    "Replying 'per my last email'...",
    "Adding TODO comments (never to be seen again)...",
    "Working from home (pants optional)...",
    "git stash pop (praying)...",
    "Fixing bug in production (hoping no one notices)...",
    "Converting tabs to spaces (starting war)...",
    "Using var in 2026 (chaos)...",
    "Reading release notes (skipping to breaking changes)...",
    "Running legacy IE tests (crying)...",
    "Trying to understand regex from 3 years ago...",
    "Reviewing my own PR (looks good to me)...",
    "Waiting for terraform apply (contemplating life)...",
    "Configuring nginx (trial and error)...",
    "Watching YouTube tutorials at 2x speed...",
    "Copy-pasting from GitHub Copilot (AI pair programming)...",
    "Wondering why array starts at 0 (philosophy)...",
    "Realizing null is not false (existential crisis)...",
    "Fixing typos in variable names (shame)...",
    "Documenting API (lying about responses)...",
    "Claiming to know Kubernetes (lying)...",
    "Writing bash scripts ( duct tape of systems)...",
    "chmod -R 777 / ( embracing chaos)...",
    "Committing .env file (rip)...",
    "Running database migration on prod ( sweating)...",
    "Turning monitors off and on (IT support)...",
    "Printing 'hello world' on brain...",
    "My code doesn't work, I don't know why. My code works, I don't know why.",
    "404: Motivation not found...",
    "500: Internal Server Error (also my mood)...",
    "418: I'm a teapot (RFC 2324 compliance)...",
    "Writing Java (FactoryFactoryBeanBuilder)...",
    "Parsing HTML with regex (summoning Cthulhu)...",
    "Using blockchain for todo list (startup idea)...",
    "Training AI on Stack Overflow (what could go wrong)...",
    "Waiting for Windows update (see you next year)...",
    "Using Electron for calculator app (200MB)...",
    "npm install (left-pad apocalypse survivor)...",
    "Typing 'how to exit vim' into vim...",
    "Realizing prod was dev all along...",
    "Coding on a plane (no internet, pure skill)...",
    "Rubber duck debugging (duck is concerned)...",
    "git blame --reverse (accepting responsibility)...",
    "Writing comments in Latin (in case aliens read it)...",
    "Implementing dark patterns (ethically, of course)...",
    "Charging my mechanical keyboard (it's electric)...",
    "Downloading more CPU cores...",
    "Checking if user is a robot (beep boop)...",
    "Optimizing for Chrome (sorry Firefox)...",
    "Running queries in production ( SELECT * FROM disaster )...",
    "git reset --hard (goodbye dreams)...",
    "Forking repo (hoping original author doesn't notice)...",
    "Writing YAML (indentation nightmare)...",
    "Deploying serverless (there are still servers)...",
    "Installing dependencies (npm_modules black hole expanding)...",
  ];

  useEffect(() => {
    // Add initial logs
    setLogs([
      "System initialized...", 
      "Loading dashboard jokes...", 
      "Mounting sense of humor...",
      "Establishing connection to main server...",
      "Allocating memory for bad puns...",
      "Checking tea/coffee levels...",
      "Compiling sarcasm module...",
      "Running 'make magic'...",
      "Reading user mind (failed, permission denied)...",
      "Syncing with the cloud (it's actually just another computer)..."
    ]);

    const interval = setInterval(() => {
      const randomLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
      const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' });
      const newLog = `[${timestamp}] ${randomLog}`;

      setLogs(prev => {
        const newLogs = [...prev, newLog];
        if (newLogs.length > 28) return newLogs.slice(1); // Increased retention for expanded view
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
