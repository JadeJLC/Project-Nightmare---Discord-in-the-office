// Fonctions pour afficher la liste des utilisateurs en ligne et permettre de leur envoyer des messages
import { SessionData } from "../variables.js";
import { ws } from "./connect.js";
import { loadConversationsList } from "../page-creation/chat.js";

let currentDMUserId = null;
let lastSenderId = null;

export function handleIncomingDM(msg) {
  // 1. Si la conversation est ouverte → afficher le message
  if (
    currentDMUserId === msg.sender_id ||
    currentDMUserId === msg.receiver_id
  ) {
    displayDM(msg);
  }

  // 2. Mettre à jour la liste des conversations
  updateConversationPreview(msg);

  // 3. Ajouter une notification si la conversation n’est pas ouverte
  if (currentDMUserId !== msg.sender_id) {
    // addDMNotification(msg.sender_id);
  }
}

export function updateConversationPreview(msg) {
  const userId =
    msg.sender_id === SessionData.userID ? msg.receiver_id : msg.sender_id;

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

  div.innerHTML = `
  <input id="dm-input-text" type="text" placeholder="Écrire un message...">
  <button id="dm-send-btn"><img src="/assets/images/send.svg"/><span>Envoyer</span></button>
`;

  const input = div.querySelector("#dm-input-text");
  const sendBtn = div.querySelector("#dm-send-btn");

  sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (!text) return;

    // Envoi WebSocket
    ws.send(
      JSON.stringify({
        type: "private_message",
        to: currentDMUserId,
        content: text,
      }),
    );

    input.value = "";
  });

  // Envoi avec Entrée
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendBtn.click();
  });

  msgContainer.appendChild(div);
}

export function displayDM(msg) {
  const container = document.getElementById("dm-messages");

  const div = document.createElement("div");
  div.classList.add("dm-message");

  const senderId = msg.sender_id;
  const username = msg.sender_username;
  const isMine = senderId === SessionData.userID;

  div.classList.add(isMine ? "mine" : "theirs");

  // Déterminer si on doit afficher le header (nom + avatar)
  const showHeader = lastSenderId !== senderId;

  div.innerHTML = `
    ${
      showHeader
        ? `
      <div class="dm-header">
        <div class="reduced-avatar">
              <img src="assets/images-avatar/${msg.sender_image}.png">
            </div>
        <div class="dm-author">${username}</div>
      </div>
    `
        : ""
    }
    
    <span class="dm-time">${new Date(msg.created_at).toLocaleTimeString()}</span>
    <div class="dm-content">${msg.content}</div>
    
  `;

  // Mettre à jour le dernier sender
  lastSenderId = senderId;

  // Insérer avant la barre d’input
  const inputBar = document.querySelector(".dm-input");
  if (inputBar) {
    container.insertBefore(div, inputBar);
  } else {
    container.appendChild(div);
  }

  container.scrollTop = container.scrollHeight;
}
