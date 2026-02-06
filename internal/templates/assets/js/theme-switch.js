const localThemeKey = "pn-theme";
const rootElement = document.documentElement;

/**
 * Enregistre le thème choisi dans le navigateur
 *
 * @param {string} theme Le nom du thème, soit light soit dark, renvoyé par le bouton
 */
export function setTheme(theme) {
  const themeSwitchBtn = document.getElementById("theme-selector");
  rootElement.setAttribute("data-theme", theme);

  localStorage.setItem(localThemeKey, theme);

  if (themeSwitchBtn) {
    themeSwitchBtn.checked = theme === "light";
  }
}

/**
 * Détermine le thème à utiliser en récupérant la donnée dans le navigateur
 * Si aucun thème n'a encore été choisi, affiche par défaut le thème sombre
 */
export function initTheme() {
  const themeSwitchBtn = document.getElementById("theme-selector");
  const savedTheme = localStorage.getItem(localThemeKey) || "dark";

  setTheme(savedTheme);

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
/**
 * Déplace le bouton "Afficher sous forme de catégories/feed" au scroll
 * Le bouton se déplace en haut à gauche pour rester toujours accessible
 */
function buttonMove() {
  window.addEventListener("scroll", () => {
    const button = document.getElementById("front-page-buttons");
    if (!button) return;
    const scrollValue = window.scrollY;

    const scrollDuration = 500;
    let progress = Math.min(scrollValue / scrollDuration, 1);

    const distanceToEdge = window.innerWidth / 2 - button.offsetWidth / 2;

    const xMove = progress * (distanceToEdge + 10) * -1;

    button.style.transform = `translateX(${xMove}px)`;

    button.style.opacity = 0.8 + progress * 0.2;
    button.style.scale = 1 - progress * 0.1;
  });
}

export { buttonMove };
