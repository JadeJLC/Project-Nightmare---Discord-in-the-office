import { displayHome } from "./page-creation/home-display.js";
import { initTheme } from "./theme-switch.js";
import { initAuth } from "./page-creation/register-login.js";
import { checkLoginStatus } from "./helpers/check-log-status.js";
import { displayProfile } from "./page-creation/profile.js";
import { connectWebSocket } from "./websockets/connect.js";
import { displayMailbox } from "./page-creation/chat.js";
import { SessionData, pageData } from "./variables.js";

/**
 * Mise en place des fonctionnalités de la page
 */
async function main() {
  await checkLoginStatus();
  initTheme();
  displayHome();
  initAuth();
  setHeaderListeners();
  connectWebSocket();
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

    const mailBox = event.target.closest("#display-mailbox");
    if (mailBox) {
      displayMailbox();
    }
  });

  const onlineMembersBtn = document.getElementById("online-members-btn");
  const panel = document.getElementById("members-list");
  onlineMembersBtn.addEventListener("click", () => {
    panel.classList.toggle("isHidden");
    document.body.classList.toggle("members-list-visible");
    if (pageData.ShowingOnlineMembers == true) {
      onlineMembersBtn.innerHTML = "<";
      pageData.ShowingOnlineMembers = false;
    } else {
      onlineMembersBtn.innerHTML = ">";
      pageData.ShowingOnlineMembers = true;
    }
  });
}
