import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type SiteMode = "terminal" | "reader";

const STORAGE_KEY = "site-mode";
const DEFAULT_MODE: SiteMode = "terminal";
const TERMINAL_THEME_COLOR = "#0b0b13";
const READER_THEME_COLOR = "#f8f2e6";

interface ThemeModeContextValue {
  mode: SiteMode;
  isReader: boolean;
  setMode: (mode: SiteMode) => void;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

const readInitialMode = (): SiteMode => {
  if (typeof document === "undefined") return DEFAULT_MODE;
  return document.documentElement.dataset.mode === "reader"
    ? "reader"
    : DEFAULT_MODE;
};

const applyMode = (mode: SiteMode) => {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  root.dataset.mode = mode;
  root.style.colorScheme = mode === "reader" ? "light" : "dark";

  const themeColor = document.querySelector<HTMLMetaElement>(
    'meta[name="theme-color"]',
  );
  if (themeColor) {
    themeColor.content =
      mode === "reader" ? READER_THEME_COLOR : TERMINAL_THEME_COLOR;
  }
};

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<SiteMode>(readInitialMode);

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      if (event.newValue === "reader" || event.newValue === "terminal") {
        setModeState(event.newValue);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setMode = useCallback((next: SiteMode) => {
    setModeState(next);
    applyMode(next);

    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be unavailable in private modes; the in-memory mode still works.
    }

    // A shareable ?skin= override should not stick after an explicit choice.
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("skin")) {
        url.searchParams.delete("skin");
        window.history.replaceState({}, "", url);
      }
    } catch {
      // Ignore browsers that restrict history updates.
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(mode === "reader" ? "terminal" : "reader");
  }, [mode, setMode]);

  return (
    <ThemeModeContext.Provider
      value={{ mode, isReader: mode === "reader", setMode, toggleMode }}
    >
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode(): ThemeModeContextValue {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return context;
}

