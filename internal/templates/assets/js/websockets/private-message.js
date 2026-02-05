// Fonctions pour afficher la liste des utilisateurs en ligne et permettre de leur envoyer des messages
import { SessionData } from "../variables/session-data.js";

let currentDMUserId = null;

export function handleIncomingDM(msg) {
  // 1. Si la conversation est ouverte → afficher le message
  if (currentDMUserId === msg.from || currentDMUserId === msg.to) {
    displayDM(msg);
  }

  // 2. Mettre à jour la liste des conversations
  updateConversationPreview(msg);

  // 3. Ajouter une notification si la conversation n’est pas ouverte
  if (currentDMUserId !== msg.from) {
    addDMNotification(msg.from);
  }
}

export function updateConversationPreview(msg) {
  const userId = msg.from === SessionData.userID ? msg.to : msg.from;

  const item = document.querySelector(
    `.dm-conversation-item[data-user-id="${userId}"]`,
  );

  if (item) {
    // Déplacer en haut de la liste
    const container = document.getElementById("dm-conversations");
    container.prepend(item);
  } else {
    // Si la conversation n’existe pas encore → la créer
    loadConversationsList();
  }
}

export async function openConversation(otherUserId) {
  currentDMUserId = otherUserId;

  const res = await fetch(`/api/dm?user=${otherUserId}&limit=20`);
  const messages = await res.json();

  const msgContainer = document.getElementById("dm-messages");
  msgContainer.innerHTML = "";

  if (messages.length === 0) {
    document.getElementById("dm-empty").style.display = "block";
    return;
  }

  messages.reverse().forEach(displayDM);

  const div = document.createElement("div");
  div.classList.add("dm-input");
  div.innerHTML = `<input id="dm-input-text" type="text" placeholder="Écrire un message...">
              <button id="dm-send-btn">Envoyer</button>`;
  msgContainer.appendChild(div);
}

export function displayDM(msg) {
  console.log("message =", msg);

  const container = document.getElementById("dm-messages");

  const div = document.createElement("div");
  div.classList.add("dm-message");

  const isMine = msg.sender_id === SessionData.userID;
  div.classList.add(isMine ? "mine" : "theirs");

  div.innerHTML = `
        <p class="dm-author">${msg.from_username}</p>
        <p class="dm-content">${msg.content}</p>
        <span class="dm-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
    `;

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}
