// Fonctions pour la création de la page "messages privés" avec un utilisateur

import { SessionData } from "../variables/session-data.js";
import { clearPages } from "./clear-pages.js";
import { openConversation } from "../websockets/private-message.js";

export function displayMailbox() {
  const usernameHeader = document.getElementById("header-username");
  const homeBtn = document.getElementById("go-home");

  if (SessionData.isLogged) {
    usernameHeader.innerHTML = `Messagerie de ${SessionData.username}`;
  }

  homeBtn.style.display = "block";

  // Efface toutes les autres pages
  clearPages("dm");

  // Crée la page DM comme une nouvelle div
  const dmPage = document.createElement("div");
  dmPage.id = "dm-page";
  dmPage.classList.add("dm-container");

  // Injecte le HTML de la messagerie
  dmPage.innerHTML = `
      <div id="dm-sidebar" class="dm-sidebar">
          <h3>Messages privés</h3>
          <div id="dm-conversations"></div>
      </div>

      <div id="dm-content" class="dm-content">
          <div id="dm-header" class="dm-header"></div>

          <div id="dm-messages" class="dm-messages">
          </div>
      </div>
  `;

  // Ajoute la page DM à la fin du body
  document.body.appendChild(dmPage);

  // Charge la liste des conversations
  loadConversationsList();
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
    div.dataset.userId = conv.otherUser.id;

    div.innerHTML = `
            <div class="reduced-avatar">
              <img src="assets/images-avatar/${conv.otherUser.image}.png">
            </div>
            <span>${conv.otherUser.username}</span>
        `;

    div.addEventListener("click", () => {
      openConversation(conv.otherUser.id);
    });
    container.appendChild(div);
  });
}
