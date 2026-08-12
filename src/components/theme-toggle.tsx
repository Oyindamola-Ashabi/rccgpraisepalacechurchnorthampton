import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "pp-theme";

/** Inline script kept in the document head so the theme is applied before first paint. */
export const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var s=localStorage.getItem(k);var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var e=document.documentElement;e.classList.toggle('dark',d);e.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Compact Light/Dark switch. Preference is stored in localStorage only. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    const el = document.documentElement;
    el.classList.toggle("dark", next === "dark");
    el.style.colorScheme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — the choice simply won't persist */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-foreground/70 transition hover:border-[#E13495] hover:text-[#E13495] ${className}`}
    >
      {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
