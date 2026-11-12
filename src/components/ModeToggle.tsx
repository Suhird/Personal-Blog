import { BookOpen, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeMode } from "./theme-mode-provider";

interface ModeToggleProps {
  className?: string;
}

const ModeToggle = ({ className }: ModeToggleProps) => {
  const { isReader, toggleMode } = useThemeMode();

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-pressed={isReader}
      aria-label={
        isReader
          ? "Switch to the terminal theme"
          : "Switch to the reading theme"
      }
      title={isReader ? "Back to terminal" : "Reading mode"}
      className={cn(
        "mode-toggle",
        isReader ? "mode-toggle--reader" : "mode-toggle--terminal",
        className,
      )}
    >
      {isReader ? (
        <Terminal size={15} strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <BookOpen size={15} strokeWidth={1.8} aria-hidden="true" />
      )}
      <span className="mode-toggle__label">
        {isReader ? "Terminal" : "Reading"}
      </span>
    </button>
  );
};

export default ModeToggle;
