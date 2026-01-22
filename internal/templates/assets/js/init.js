import { displayHome } from "./page-creation/home-display.js";
import { initTheme } from "./theme-switch.js";
import { initAuth } from "./page-creation/login-signup.js";
import { checkLoginStatus } from "./session/check-login.js";

async function main() {
  await checkLoginStatus();
  initTheme();
  displayHome();
  initAuth();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
