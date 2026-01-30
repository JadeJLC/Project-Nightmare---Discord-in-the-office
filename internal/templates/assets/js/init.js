import { displayHome } from "./page-creation/home-display.js";
import { initTheme } from "./theme-switch.js";
import { initAuth } from "./page-creation/login-signup.js";
import { checkLoginStatus } from "./session/check-login.js";
import { displayProfile } from "./page-creation/profile.js";
import { displayMailbox } from "./page-creation/chat.js";

async function main() {
  await checkLoginStatus();
  initTheme();
  displayHome();
  initAuth();
  setEventListeners();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}

function setEventListeners() {
  const profileBtn = document.getElementById("display-profile");
  profileBtn.addEventListener("click", displayProfile);

  const homeBtn = document.getElementById("go-home");
  homeBtn.addEventListener("click", displayHome);

  const dmBtn = document.getElementById("display-mailbox");
  dmBtn.addEventListener("click", displayMailbox);
}
