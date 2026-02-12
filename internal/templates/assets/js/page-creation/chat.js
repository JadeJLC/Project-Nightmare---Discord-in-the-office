// Fonctions pour la création de la page "messages privés" avec un utilisateur

import { pageData, SessionData } from "../variables.js";
import { clearPages } from "../helpers/clear-pages.js";
import {
  openConversation,
  closeConversation,
} from "../websockets/private-message.js";
import { isUserLoggedIn } from "../helpers/check-log-status.js";
import { selectPage } from "../helpers/call-page.js";

export function displayMailbox() {
  return new Promise((resolve) => {
    if (!isUserLoggedIn()) return;
    pageData.previousPage = pageData.currentPage;
    pageData.currentPage = "dm";
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
  <button class="go-back" id="go-back" style="margin:0px 20px">
  <img src="/assets/images/arrow-left.svg"/><span>Revenir en arrière</span></button>
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
    setDMLinks(dmPage);
  });
}

function setDMLinks(dmPage) {
  dmPage.addEventListener("click", (event) => {
    const goBack = event.target.closest("#go-back");
    if (goBack) {
      selectPage("back");
    }

    const convBtn = event.target.closest(".dm-conversation-item");
    if (convBtn) {
      const mpID = convBtn.dataset.userId;
      if (pageData.ConversationWith === `${mpID}`) {
        convBtn.classList.remove("active");
        const arrow = convBtn.querySelector(".dm-arrow");
        arrow.textContent = "↓";
        closeConversation();
      } else {
        convBtn.classList.add("active");
        const arrow = convBtn.querySelector(".dm-arrow");
        arrow.textContent = "↑";
        openConversation(mpID);
      }
    }
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

    container.appendChild(div);
  });
}
