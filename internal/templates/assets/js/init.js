import { displayHome } from "./page-creation/home-display.js";
import { initTheme } from "./theme-switch.js";
import { initAuth } from "./page-creation/register-login.js";
import { checkLoginStatus } from "./helpers/check-log-status.js";
import { displayProfile } from "./page-creation/profile.js";
<<<<<<< HEAD
import { SessionData } from "./variables.js";
=======
import { displayMailbox } from "./page-creation/chat.js";
import { connectWebSocket } from "./websockets/connect.js";
import { pageData } from "./variables/page-data.js";
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396

/**
 * Mise en place des fonctionnalités de la page
 */
async function main() {
  await checkLoginStatus();
  initTheme();
  displayHome();
  initAuth();
<<<<<<< HEAD
  setHeaderListeners();
=======
  setEventListeners();
  connectWebSocket();
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396
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

<<<<<<< HEAD
  header.addEventListener("click", (event) => {
    const homeBtn = event.target.closest("#go-home");
    if (homeBtn) displayHome();

    const profileBtn = event.target.closest("#display-profile");
    if (profileBtn) displayProfile(SessionData.username);
=======
  const homeBtn = document.getElementById("go-home");
  homeBtn.addEventListener("click", displayHome);

  const dmBtn = document.getElementById("display-mailbox");
  dmBtn.addEventListener("click", displayMailbox);

  const onlineMembersBtn = document.getElementById("online-members-btn");
  const panel = document.getElementById("members-list");
  onlineMembersBtn.addEventListener("click", () => {
    console.log("Bouton membres activé");
    panel.classList.toggle("isHidden");
    document.body.classList.toggle("members-list-visible");
    if (pageData.ShowingOnlineMembers == true) {
      onlineMembersBtn.innerHTML = "<";
      pageData.ShowingOnlineMembers = false;
    } else {
      onlineMembersBtn.innerHTML = ">";
      pageData.ShowingOnlineMembers = true;
    }
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396
  });
}
