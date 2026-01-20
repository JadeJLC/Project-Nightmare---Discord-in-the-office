const localThemeKey = "pn-theme";
const rootElement = document.documentElement;

export function setTheme(theme) {
  const themeSwitchBtn = document.getElementById("theme-selector");
  rootElement.setAttribute("data-theme", theme);

  localStorage.setItem(localThemeKey, theme);

  if (themeSwitchBtn) {
    themeSwitchBtn.checked = theme === "light";
  }
}

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
/*
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTheme);
} else {
  initTheme();
}

// Fonction pour déplacer les boutons "Afficher sous forme de catégories / feed" au scroll"
window.addEventListener("scroll", () => {
  const button = document.querySelector(".front-page-buttons");
  const scrollValue = window.scrollY;

  const scrollDuration = 500;
  let progress = Math.min(scrollValue / scrollDuration, 1);

  const distanceToEdge = window.innerWidth / 2 - button.offsetWidth / 2;

  const xMove = progress * (distanceToEdge + 10) * -1;

  button.style.transform = `translateX(${xMove}px)`;

  button.style.opacity = 0.8 + progress * 0.2;
  button.style.scale = 1 - progress * 0.1;
});
}*/
