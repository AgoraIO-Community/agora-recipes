export type Theme = "dark" | "light"

export const THEME_STORAGE_KEY = "recipes:theme"
export const THEME_CHANGE_EVENT = "recipes:theme-change"
export const THEME_COLORS = { dark: "#000000", light: "#f8f9fb" } as const

export function applyTheme(theme: Theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.classList.toggle("dark", theme === "dark")
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme])
}

// Run before paint so a saved light preference also applies to static recipe pages.
export const themeInitScript = `(() => {
  let theme = "dark";
  try { if (localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) === "light") theme = "light"; } catch {}
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", ${JSON.stringify(THEME_COLORS)}[theme]);
})();`
