// Fonctions pour la création de la page "messages privés" avec un utilisateur

import { pageData, SessionData } from "../variables.js";
import { clearPages } from "../helpers/clear-pages.js";
import {
  openConversation,
  closeConversation,
} from "../websockets/private-message.js";
import { isUserLoggedIn } from "../helpers/check-log-status.js";

export function displayMailbox() {
  return new Promise((resolve) => {
    if (!isUserLoggedIn()) return;
    pageData.previousPage = pageData.currentPage;
    pageData.currentPage == "dm";
    clearPages("dm");

    const usernameHeader = document.getElementById("header-username");
    usernameHeader.innerHTML = `Messagerie de ${SessionData.username}`;

    let dmPage = document.getElementById("dm-page");

    if (!dmPage) {
      dmPage = document.createElement("div");
      dmPage.id = "dm-page";
      dmPage.classList.add("dm-container");
    }

    dmPage.innerHTML = `
      <div id="dm-sidebar" class="dm-sidebar">
          <h3>Messages privés</h3>
          <div id="dm-conversations"></div>
      </div>

      <div id="dm-content" class="dm-content">
          <div id="dm-header" class="dm-header"></div>
          <div id="dm-messages" class="dm-messages"></div>
      </div>
    `;

    document.body.appendChild(dmPage);

    loadConversationsList().then(resolve);
  });
}

export async function loadConversationsList() {
  const res = await fetch("/api/conversations");
  const conversations = await res.json();

  const container = document.getElementById("dm-conversations");
  container.innerHTML = "";

  if (!conversations) {
    document.getElementById("dm-messages").innerHTML =
      `<p id="dm-empty" class="dm-empty">Aucun message échangé</p>`;
  }
  conversations.forEach((conv) => {
    const div = document.createElement("div");
    div.classList.add("dm-conversation-item");
    div.classList.add("user-card");
    div.dataset.userId = conv.otherUser.id;

    div.innerHTML = `
        <div class="reduced-avatar">
            <img src="assets/images-avatar/${conv.otherUser.image}.png" alt="Image de profil - ${conv.otherUser.image}" />
        </div>
        <div class="info">
            <span class="username">${conv.otherUser.username}</span> <span class="dm-arrow">↓</span>
        </div>
        `;

    div.addEventListener("click", () => {
      if (pageData.ConversationWith === `${conv.otherUser.id}`) {
        div.classList.remove("active");
        const arrow = div.querySelector(".dm-arrow");
        arrow.textContent = "↓";
        closeConversation();
      } else {
        div.classList.add("active");
        const arrow = div.querySelector(".dm-arrow");
        arrow.textContent = "↑";
        openConversation(conv.otherUser.id);
      }
    });

    container.appendChild(div);
  });
}
