import { displayHome } from "./page-creation/home-display.js";
import { initTheme } from "./theme-switch.js";
import { initAuth } from "./page-creation/register-login.js";
import { checkLoginStatus } from "./helpers/check-log-status.js";
import { displayProfile } from "./page-creation/profile.js";
import { SessionData } from "./variables.js";

/**
 * Mise en place des fonctionnalités de la page
 */
async function main() {
  await checkLoginStatus();
  initTheme();
  displayHome();
  initAuth();
  setHeaderListeners();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}

/**
 * Installe les eventlisteners dans le header
 */
function setHeaderListeners() {
  const header = document.getElementById("nav-header");

  header.addEventListener("click", (event) => {
    const homeBtn = event.target.closest("#go-home");
    if (homeBtn) displayHome();

    const profileBtn = event.target.closest("#display-profile");
    if (profileBtn) displayProfile(SessionData.username);
  });
}
