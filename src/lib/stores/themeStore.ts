import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'system' | 'illini';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void; // toggles between light/dark (explicit override)
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      // Default to system preference
      theme: 'system',
      setTheme: (theme: Theme) => {
        set({ theme });
        updateTheme(theme);
      },
      toggleTheme: () => {
        const current = get().theme;
        // When in system mode, first toggle explicitly to light
        const newTheme = current === 'dark' ? 'light' : 'dark';
        set({ theme: newTheme });
        updateTheme(newTheme);
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => { },
          removeItem: () => { },
        };
      }),
    }
  )
);

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'illini') {
    return 'light';
  }
  if (theme === 'system') {
    return getSystemPrefersDark() ? 'dark' : 'light';
  }
  return theme;
}

export function resolveDataTheme(theme: Theme): 'light' | 'dark' | 'illini' {
  if (theme === 'illini') {
    return 'illini';
  }
  return resolveTheme(theme);
}

function updateTheme(theme: Theme) {
  const effective = resolveTheme(theme);
  const dataTheme = resolveDataTheme(theme);
  // Update DOM
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(effective);
  root.setAttribute('data-theme', dataTheme);
}
