import { displayHome } from "./page-creation/home-display.js";
import { initTheme } from "./theme-switch.js";
import { initAuth } from "./page-creation/login-signup.js";
import { checkLoginStatus } from "./session/check-login.js";
import { displayProfile } from "./page-creation/profile.js";
import { displayMailbox } from "./page-creation/chat.js";
import { connectWebSocket } from "./websockets/connect.js";
import { pageData } from "./variables/page-data.js";

async function main() {
  await checkLoginStatus();
  initTheme();
  displayHome();
  initAuth();
  setEventListeners();
  connectWebSocket();
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
  });
}
