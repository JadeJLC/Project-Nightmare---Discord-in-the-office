// Remove the problematic import for a moment to test this directly
const localThemeKey = "pn-theme";
const rootElement = document.documentElement;

function setTheme(theme) {
  const themeSwitchBtn = document.getElementById("theme-selector");

  // Apply theme attribute to <html>
  rootElement.setAttribute("data-theme", theme);

  // Save preference
  localStorage.setItem(localThemeKey, theme);

  // Safely update checkbox state if it exists
  if (themeSwitchBtn) {
    themeSwitchBtn.checked = theme === "light";
  }
}

function initTheme() {
  const themeSwitchBtn = document.getElementById("theme-selector");
  const savedTheme = localStorage.getItem(localThemeKey) || "dark";

  // Initial application
  setTheme(savedTheme);

  // Add event listener only if the button exists in the DOM
  if (themeSwitchBtn) {
    themeSwitchBtn.addEventListener("change", () => {
      const newTheme = themeSwitchBtn.checked ? "light" : "dark";
      setTheme(newTheme);
    });
  } else {
    console.error("Theme switch button (#theme-selector) not found in DOM.");
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTheme);
} else {
  initTheme();
}
