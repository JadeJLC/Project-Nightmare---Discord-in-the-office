import { pageData, SessionData } from "../variables.js";
import { ws } from "./connect.js";
import { loadConversationsList } from "../page-creation/chat.js";
import { formatDMTime, decodeHTML } from "../helpers/text-formating.js";

/**
 * Parse une date provenant de Go/SQLite de façon robuste.
 * SQLite renvoie souvent "2024-01-01 12:00:01.000000+00:00" sans le T,
 * ce qui est invalide pour new Date() sur certains navigateurs et cause
 * un tri à la minute près au lieu de la seconde.
 * @param {string} dateStr
 * @returns {Date}
 */
function parseDate(dateStr) {
  return new Date(dateStr.replace(" ", "T"));
}

const DMstate = {
  loggedUserID: null,

  // Tracking pour les messages ajoutés en bas (temps réel + chargement initial)
  lastSenderID: null,
  lastGroup: null,
  lastDMTime: null,

  // Tracking pour les messages insérés en haut (scroll vers le passé)
  firstSenderID: null,
  firstGroup: null,
  firstDMTime: null,

  offset: 0,
  limit: 20,
  hasMore: true,
  isLoading: false,
  _observer: null,
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
 * Met à jour l'aperçu de la conversation dans la sidebar
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
  // Reset complet de l'état
  DMstate.loggedUserID = otherUserId;
  DMstate.lastSenderID = null;
  DMstate.lastGroup = null;
  DMstate.lastDMTime = null;
  DMstate.firstSenderID = null;
  DMstate.firstGroup = null;
  DMstate.firstDMTime = null;
  DMstate.offset = 0;
  DMstate.hasMore = true;
  DMstate.isLoading = false;

  if (DMstate._observer) {
    DMstate._observer.disconnect();
    DMstate._observer = null;
  }

  const msgContainer = document.getElementById("dm-messages");
  msgContainer.innerHTML = "";

  // Sentinelle tout en haut : quand elle devient visible, on charge les messages plus anciens
  const sentinel = document.createElement("div");
  sentinel.id = "dm-scroll-sentinel";
  msgContainer.prepend(sentinel);

  const existingInput = document.querySelector(".dm-input");
  if (existingInput) existingInput.remove();

  // Chargement initial : récupère les messages les plus récents et les affiche en bas
  await loadInitialMessages();

  // Scroll tout en bas pour afficher les messages les plus récents
  msgContainer.scrollTop = msgContainer.scrollHeight;

  // Attache l'observer seulement après le premier rendu pour éviter un double déclenchement
  attachScrollObserver(msgContainer);

  // Création de l'input
  const div = document.createElement("div");
  div.classList.add("dm-input");

  div.innerHTML = `${
    SessionData.role != 4
      ? `<input id="dm-input-text" type="text" placeholder="Écrire un message...">
  <button id="dm-send-btn"><img src="/assets/images/send.svg"/><span>Envoyer</span></button>`
      : `<div id="dm-input-text">Les utilisateurs bannis ne peuvent pas envoyer de message privé.</div>`
  }`;

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

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);
  if (input) {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  const DMcontainer = document.getElementById("dm-content");
  DMcontainer.appendChild(div);
  pageData.ConversationWith = `${otherUserId}`;
}

/**
 * Chargement initial : affiche les messages récents en bas (ordre chronologique).
 * La BDD renvoie ORDER BY DESC → on inverse pour avoir le plus ancien en premier,
 * puis on appende chaque message en bas via appendDM.
 */
async function loadInitialMessages() {
  DMstate.isLoading = true;

  const res = await fetch(
    `/api/dm?user=${DMstate.loggedUserID}&limit=${DMstate.limit}&offset=0`,
  );
  const messages = await res.json();

  if (!messages || messages.length < DMstate.limit) {
    DMstate.hasMore = false;
    const sentinel = document.getElementById("dm-scroll-sentinel");
    if (sentinel) sentinel.remove();
  }

  if (messages && messages.length > 0) {
    DMstate.offset = messages.length;
    const container = document.getElementById("dm-messages");

    // Inverse pour afficher du plus ancien (en haut) au plus récent (en bas)
    messages.reverse().forEach((msg) => appendDM(msg, container));
  }

  DMstate.isLoading = false;
}

/**
 * Chargement au scroll vers le haut : insère les messages plus anciens en haut.
 * La BDD renvoie ORDER BY DESC → messages[0] est le plus récent du lot.
 * On insère chaque message juste après la sentinelle : le dernier inséré
 * (le plus ancien) se retrouve le plus haut → ordre chronologique correct.
 */
async function loadMoreMessages() {
  if (DMstate.isLoading || !DMstate.hasMore) return;
  DMstate.isLoading = true;

  const res = await fetch(
    `/api/dm?user=${DMstate.loggedUserID}&limit=${DMstate.limit}&offset=${DMstate.offset}`,
  );
  const messages = await res.json();

  if (!messages || messages.length < DMstate.limit) {
    DMstate.hasMore = false;
    const sentinel = document.getElementById("dm-scroll-sentinel");
    if (sentinel) sentinel.remove();
  }

  if (messages && messages.length > 0) {
    const container = document.getElementById("dm-messages");
    const prevScrollHeight = container.scrollHeight;

    // Insère du plus récent du lot au plus ancien → le plus ancien finit juste sous la sentinelle
    messages.forEach((msg) => prependDM(msg, container));

    DMstate.offset += messages.length;

    // Restaure la position visuelle du scroll pour éviter le saut vers le haut
    container.scrollTop = container.scrollHeight - prevScrollHeight;
  }

  DMstate.isLoading = false;
}

/**
 * Ajoute un message en bas du conteneur avec regroupement.
 * Utilisé pour le chargement initial et les messages temps réel.
 * @param {object} msg
 * @param {HTMLElement} container
 */
function appendDM(msg, container) {
  const senderId = msg.sender_id;
  const username = msg.sender_username;
  const isMine = username === SessionData.username;
  const msgDateObj = parseDate(msg.created_at);
  const timeDiffInGroup = 10 * 60 * 1000;

  const isSameSender = DMstate.lastSenderID === senderId;
  const isWithinTime =
    DMstate.lastDMTime && msgDateObj - DMstate.lastDMTime < timeDiffInGroup;
  const shouldGroup = isSameSender && isWithinTime;

  if (shouldGroup && DMstate.lastGroup) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("dm-content");
    messageDiv.textContent = decodeHTML(msg.content);
    DMstate.lastGroup.appendChild(messageDiv);
  } else {
    DMstate.lastGroup = document.createElement("div");
    DMstate.lastGroup.classList.add("dm-group", isMine ? "mine" : "theirs");
    DMstate.lastGroup.innerHTML = `
      <div class="dm-header">
        <div class="reduced-avatar">
          <img src="assets/images-avatar/${msg.sender_image}.png">
        </div>
        <div>
          <div class="dm-author">${username}</div>
          <span class="dm-time">${formatDMTime(msg.created_at)}</span>
        </div>
      </div>
      <div class="dm-content">${decodeHTML(msg.content)}</div>
    `;
    container.appendChild(DMstate.lastGroup);
  }

  DMstate.lastSenderID = senderId;
  DMstate.lastDMTime = msgDateObj;
}

/**
 * Insère un message en haut du conteneur (juste après la sentinelle) avec regroupement.
 * Utilisé lors du chargement des messages plus anciens au scroll vers le haut.
 * @param {object} msg
 * @param {HTMLElement} container
 */
function prependDM(msg, container) {
  const sentinel = document.getElementById("dm-scroll-sentinel");
  const senderId = msg.sender_id;
  const username = msg.sender_username;
  const isMine = username === SessionData.username;
  const msgDateObj = parseDate(msg.created_at);
  const timeDiffInGroup = 10 * 60 * 1000;

  // On compare ce message (plus récent du lot restant) avec le premier groupe
  // déjà affiché en haut : si même expéditeur et proche dans le temps, on groupe.
  const isSameSender = DMstate.firstSenderID === senderId;
  const isWithinTime =
    DMstate.firstDMTime && DMstate.firstDMTime - msgDateObj < timeDiffInGroup;
  const shouldGroup = isSameSender && isWithinTime;

  if (shouldGroup && DMstate.firstGroup) {
    // Ajoute le contenu après le header pour respecter l'ordre chronologique dans le groupe
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("dm-content");
    messageDiv.textContent = decodeHTML(msg.content);
    const header = DMstate.firstGroup.querySelector(".dm-header");
    if (header && header.nextSibling) {
      DMstate.firstGroup.insertBefore(messageDiv, header.nextSibling);
    } else {
      DMstate.firstGroup.appendChild(messageDiv);
    }
  } else {
    DMstate.firstGroup = document.createElement("div");
    DMstate.firstGroup.classList.add("dm-group", isMine ? "mine" : "theirs");
    DMstate.firstGroup.innerHTML = `
      <div class="dm-header">
        <div class="reduced-avatar">
          <img src="assets/images-avatar/${msg.sender_image}.png">
        </div>
        <div>
          <div class="dm-author">${username}</div>
          <span class="dm-time">${formatDMTime(msg.created_at)}</span>
        </div>
      </div>
      <div class="dm-content">${decodeHTML(msg.content)}</div>
    `;

    // Insère juste après la sentinelle
    if (sentinel) {
      sentinel.insertAdjacentElement("afterend", DMstate.firstGroup);
    } else {
      container.prepend(DMstate.firstGroup);
    }
  }

  // Met à jour le tracking du "premier" message visible en haut
  DMstate.firstSenderID = senderId;
  DMstate.firstDMTime = msgDateObj;
}

/**
 * Attache un IntersectionObserver sur la sentinelle pour détecter le scroll vers le haut
 * @param {HTMLElement} container Le conteneur scrollable des messages
 */
function attachScrollObserver(container) {
  const sentinel = document.getElementById("dm-scroll-sentinel");
  if (!sentinel) return;

  DMstate._observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMoreMessages();
      }
    },
    { root: container, threshold: 0 },
  );

  DMstate._observer.observe(sentinel);
}

/**
 * Ferme la conversation en cliquant sur l'icône correspondant
 */
export function closeConversation() {
  if (DMstate._observer) {
    DMstate._observer.disconnect();
    DMstate._observer = null;
  }

  const container = document.getElementById("dm-messages");
  container.innerHTML = "";
  pageData.ConversationWith = "none";

  DMstate.lastSenderID = null;
  DMstate.lastGroup = null;
  DMstate.lastDMTime = null;
  DMstate.firstSenderID = null;
  DMstate.firstGroup = null;
  DMstate.firstDMTime = null;
  DMstate.offset = 0;
  DMstate.hasMore = true;
  DMstate.isLoading = false;

  const existingInput = document.querySelector(".dm-input");
  if (existingInput) existingInput.remove();
}

/**
 * Affiche un nouveau message reçu en temps réel (ajout en bas).
 * Délègue à appendDM qui gère le regroupement.
 * @param {object} msg Le message à afficher
 */
export function displayDM(msg) {
  const container = document.getElementById("dm-messages");
  appendDM(msg, container);
  container.scrollTop = container.scrollHeight;
}
