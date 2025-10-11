(() => {
  const THEME_STORAGE_KEY = "hakunote-theme";
  const root = document.documentElement;
  const body = document.body;
  const toggleButton = document.getElementById("theme-toggle");
  const toggleIcon = document.getElementById("theme-toggle-icon");

  if (!toggleButton || !toggleIcon) {
    return;
  }

  const prefersDarkScheme = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  const sunPath =
    "M12 4.5V3m0 18v-1.5M5.636 5.636 4.5 4.5m14.999 14.999-1.136-1.136M4.5 19.5l1.136-1.136M19.5 4.5l-1.136 1.136M21 12h-1.5M4.5 12H3m9 5.25A5.25 5.25 0 1 0 12 6.75a5.25 5.25 0 0 0 0 10.5Z";
  const moonPath =
    "M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79Z";

  const setTheme = (mode, persist = true) => {
    const isDarkMode = mode === "dark";
    root.classList.toggle("dark", isDarkMode);
    body.dataset.theme = mode;
    toggleButton.setAttribute("aria-pressed", String(isDarkMode));
    toggleButton.setAttribute(
      "title",
      isDarkMode ? "밝은 모드로 전환" : "다크 모드로 전환"
    );

    toggleIcon.setAttribute("fill", "none");
    toggleIcon.setAttribute("stroke", "currentColor");
    toggleIcon.setAttribute("stroke-width", "1.8");
    toggleIcon.setAttribute("stroke-linecap", "round");
    toggleIcon.setAttribute("stroke-linejoin", "round");
    toggleIcon.innerHTML = `<path d="${
      isDarkMode ? sunPath : moonPath
    }" />`;

    if (persist) {
      localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
  };

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = storedTheme
    ? storedTheme
    : prefersDarkScheme.matches
    ? "dark"
    : "light";

  setTheme(initialTheme, Boolean(storedTheme));

  toggleButton.addEventListener("click", () => {
    const nextTheme = root.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme);
  });

  prefersDarkScheme.addEventListener("change", (event) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      setTheme(event.matches ? "dark" : "light", false);
    }
  });
})();
