import { pageData, SessionData } from "../variables.js";
import { ws } from "./connect.js";
import { loadConversationsList } from "../page-creation/chat.js";
import { formatDMTime, decodeHTML } from "../helpers/text-formating.js";

const DMstate = {
  loggedUserID: null,
  lastSenderID: null,
  lastGroup: null,
  lastDMTime: null,
};

/**
 * Ajoute un message en direct à la conversation ou envoie une notification
 * @param {object} msg Les informations du message reçu
 */
export function handleIncomingDM(msg) {
  if (
    DMstate.loggedUserID === msg.sender_id ||
    DMstate.loggedUserID === msg.receiver_id
  ) {
    displayDM(msg);
  }

  updateConversationPreview(msg);

  if (DMstate.loggedUserID !== msg.sender_id) {
    // addDMNotification(msg.sender_id);
  }
}

/**
 * Ajoute un nouveau message à la conversation ouverte
 * @param {object} msg Les données du message
 */
export function updateConversationPreview(msg) {
  const userId =
    msg.sender_id === SessionData.userID ? msg.receiver_id : msg.sender_id;

  const item = document.querySelector(
    `.dm-conversation-item[data-user-id="${userId}"]`,
  );

  if (item) {
    const container = document.getElementById("dm-conversations");
    container.prepend(item);
  } else {
    loadConversationsList();
  }
}

/**
 * Ouvre une conversation en cliquant sur un utilisateur dans la boîte à MP
 * @param {string} otherUserId ID de l'utilisateur avec qui la conversation est en cours
 */
export async function openConversation(otherUserId) {
  DMstate.lastSenderID = null;
  DMstate.lastGroup = null;
  DMstate.lastDMTime = null;
  DMstate.loggedUserID = otherUserId;

  const res = await fetch(`/api/dm?user=${otherUserId}&limit=10`);
  const messages = await res.json();

  const msgContainer = document.getElementById("dm-messages");
  msgContainer.innerHTML = "";

  const existingInput = document.querySelector(".dm-input");
  if (existingInput) existingInput.remove();

  if (messages.length === 0) {
    document.getElementById("dm-empty").style.display = "block";
  }

  if (messages && messages.length > 0) {
    messages.reverse().forEach(displayDM);
  }

  const div = document.createElement("div");
  div.classList.add("dm-input");

  div.innerHTML = `
  <input id="dm-input-text" type="text" placeholder="Écrire un message...">
  <button id="dm-send-btn"><img src="/assets/images/send.svg"/><span>Envoyer</span></button>
`;

  const input = div.querySelector("#dm-input-text");
  const sendBtn = div.querySelector("#dm-send-btn");

  const sendMessage = () => {
    const text = input.value.trim();
    if (!text) return;

    ws.send(
      JSON.stringify({
        type: "private_message",
        to: DMstate.loggedUserID,
        content: text,
      }),
    );

    input.value = "";
  };

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  const DMcontainer = document.getElementById("dm-content");

  DMcontainer.appendChild(div);
  pageData.ConversationWith = `${otherUserId}`;

  msgContainer.scrollTop = msgContainer.scrollHeight;
}

/**
 * Ferme la conversation en cliquant sur l'icône correspondant
 */
export function closeConversation() {
  const container = document.getElementById("dm-messages");
  container.innerHTML = "";
  pageData.ConversationWith = "none";

  DMstate.lastSenderID = null;
  DMstate.lastGroup = null;
  DMstate.lastDMTime = null;

  const existingInput = document.querySelector(".dm-input");
  if (existingInput) existingInput.remove();
}

/**
 * Affiche un message. Si les messages ont été envoyés à moins de 5 minutes d'intervalle, ils sont regroupés dans le même bloc.
 * Sinon, on crée un bloc séparé pour bien les différencier
 * @param {object} msg Le message à afficher
 */
export function displayDM(msg) {
  const container = document.getElementById("dm-messages");

  const senderId = msg.sender_id;
  const username = msg.sender_username;
  const isMine = username === SessionData.username;

  const msgDateObj = new Date(msg.created_at);
  const timeDiffInGroup = 10 * 60 * 1000;

  const isSameSender = DMstate.lastSenderID === senderId;
  const isWithinTime =
    DMstate.lastDMTime && msgDateObj - DMstate.lastDMTime < timeDiffInGroup;
  const shouldGroup = isSameSender && isWithinTime;

  if (shouldGroup && DMstate.lastGroup) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("dm-content");
    messageDiv.textContent = msg.content;

    DMstate.lastGroup.appendChild(messageDiv);
  } else {
    DMstate.lastGroup = document.createElement("div");
    DMstate.lastGroup.classList.add("dm-group");
    DMstate.lastGroup.classList.add(isMine ? "mine" : "theirs");

    const timeStr = formatDMTime(msg.created_at);

    DMstate.lastGroup.innerHTML = `
      <div class="dm-header">
        <div class="reduced-avatar">
          <img src="assets/images-avatar/${msg.sender_image}.png">
        </div>
        <div><div class="dm-author">${username}</div>
        <span class="dm-time">${timeStr}</span></div>
      </div>
      
      <div class="dm-content">${decodeHTML(msg.content)}</div>
    `;

    container.appendChild(DMstate.lastGroup);
  }

  DMstate.lastSenderID = senderId;
  DMstate.lastDMTime = msgDateObj;

  container.scrollTop = container.scrollHeight;
}
