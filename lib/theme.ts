export type Theme = "dark" | "light"
export const THEME_QUERY = "(prefers-color-scheme: dark)"
export const THEME_COLORS = { dark: "#000000", light: "#fcf9f8" } as const

// Apply before paint and observe OS changes even on pages without diagrams.
// Previously saved manual choices are deliberately ignored.
export const themeInitScript = `(() => {
  const preference = window.matchMedia(${JSON.stringify(THEME_QUERY)});
  const update = () => {
    const theme = preference.matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", preference.matches);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", ${JSON.stringify(THEME_COLORS)}[theme]);
  };
  update();
  preference.addEventListener("change", update);
})();`
