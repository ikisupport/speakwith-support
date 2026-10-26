import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

export type ThemeChoice = 'system' | 'light' | 'dark';

const KEY = 'speakwith-theme';
const LEGACY_KEY = 'lifebond-theme';
const LIGHT_QUERY = '(prefers-color-scheme: light)';

/**
 * System-aware light/dark theming with a manual override. Port of the Angular
 * site's `ThemeService`.
 *
 * - `system` follows the OS `prefers-color-scheme` and updates live.
 * - `light` / `dark` pin the theme regardless of the OS.
 *
 * The resolved theme is written to `<html data-theme="...">`; the pre-paint
 * script lifted from index.html applies the same logic before first paint to
 * avoid a flash.
 *
 * Why the server snapshot is `'system'` with `prefersLight: false` — i.e. dark:
 * Angular read `localStorage` synchronously in a constructor and could render
 * the right value immediately. React cannot, because the prerendered HTML is
 * produced with no browser at all. So the static HTML and React's FIRST client
 * render must agree on one value or hydration silently keeps the wrong DOM,
 * and the value they agree on is what the prerender emits: dark. The real
 * choice is applied in an effect one frame later. That is a deliberate single
 * frame of dark on a light system, and it is the same trade the pre-paint
 * script already hides for the page background.
 */
interface ThemeContextValue {
  themeChoice: ThemeChoice;
  setTheme: (choice: ThemeChoice) => void;
  /** True when the page is rendering light: explicit light, or system while the OS is light. */
  siteIsLight: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeChoice: 'system',
  setTheme: () => {},
  siteIsLight: false,
});

function normalize(raw: string | null): ThemeChoice {
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

function migrateThemeKeyIfNeeded(): void {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy != null && localStorage.getItem(KEY) == null) {
      localStorage.setItem(KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    /* private window, or site data blocked */
  }
}

/** Subscribe to the OS preference. Server snapshot is false, i.e. dark. */
function subscribePrefersLight(onChange: () => void) {
  const media = window.matchMedia(LIGHT_QUERY);
  media.addEventListener('change', onChange);
  return () => media.removeEventListener('change', onChange);
}

function usePrefersLight(): boolean {
  return useSyncExternalStore(
    subscribePrefersLight,
    () => window.matchMedia(LIGHT_QUERY).matches,
    () => false,
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Starts at the prerendered value on purpose; the effect below reconciles it
  // with localStorage after hydration.
  const [themeChoice, setChoice] = useState<ThemeChoice>('system');
  const prefersLight = usePrefersLight();

  useEffect(() => {
    migrateThemeKeyIfNeeded();
    try {
      setChoice(normalize(localStorage.getItem(KEY)));
    } catch {
      /* leave the default */
    }
  }, []);

  const setTheme = useCallback((choice: ThemeChoice) => {
    setChoice(choice);
    try {
      localStorage.setItem(KEY, choice);
    } catch {
      /* nothing to persist to; the in-memory choice still applies */
    }
  }, []);

  const siteIsLight = themeChoice === 'light' || (themeChoice === 'system' && prefersLight);

  // Mirror onto <html> exactly as the pre-paint script does, so the attribute
  // the script set is kept in step once React owns the page.
  useEffect(() => {
    const resolved = siteIsLight ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', resolved);
    document
      .getElementById('meta-theme-color')
      ?.setAttribute('content', resolved === 'light' ? '#faf7f0' : '#131418');
  }, [siteIsLight]);

  const value = useMemo(
    () => ({ themeChoice, setTheme, siteIsLight }),
    [themeChoice, setTheme, siteIsLight],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
