import { clearPages } from "../helpers/clear-pages.js";
import { SessionData } from "../variables.js";
import { formatDMTime } from "../helpers/text-formating.js";
import {
  getNotifData,
  setNotificationLinks,
} from "../helpers/notif-secondary.js";
import { updateNotificationCounter } from "../websockets/notif-websocket.js";
import { displayError } from "./errors.js";

export async function getUserNotifications() {
  try {
    const response = await fetch(`/api/notifications`);
    if (!response.ok) {
      displayError(response.status);
      return;
    }

    const notifList = await response.json();
    SessionData.notifications = notifList;
  } catch (error) {
    console.log("Erreur dans la récupération des notifications : ", error);
  }
  updateNotificationCounter();
  updateNotifList();
}

function initNotifPopup() {
  const popup = document.createElement("div");
  popup.id = "notif-popup";
  popup.classList.add("notif-popup", "is-hidden");

  const header = document.getElementById("nav-header");
  if (!header) return;

  header.insertAdjacentElement("afterend", popup);

  return popup;
}

export function notifPopup() {
  let popup = document.getElementById("notif-popup");
  if (!popup) popup = initNotifPopup();

  popup.classList.toggle("is-hidden");

  updateNotifList(popup);
}

export function updateNotifList() {
  let popup = document.getElementById("notif-popup");
  if (!popup) return;
  const notifArray = SessionData.notifications ?? [];

  popup.innerHTML = `<h4>Notifications</h4> <hr/>
  ${
    notifArray.length > 0
      ? notifArray
          .map((notif) => {
            const data = getNotifData(notif.notif_data);
            return `<div class="notif-item notif-${notif.notif_status}" 
                     data-notifid="${notif.notif_id}" 
                     ${notif.notif_status === "new" ? "title='Nouvelle notification!'" : ""} 
                     ${data}>
                  <div class="notif-content">
                    <span class="notif-date">${formatDMTime(notif.notif_time)}</span>
                    <span class="notif-message">${notif.notif_message}</span>
                   <div class="notif-icons"> 
                    <div class="notif-icon stop-follow"><img src="/assets/images/bell-off.svg"/><span>Arrêter de suivre</span></div>
                     ${
                       notif.notif_status === "new"
                         ? '<div class="notif-icon mark-read"><img src="/assets/images/eye-off.svg"/><span>Marquer comme lu</span></div>'
                         : ""
                     }
                    <div class="notif-icon delete-notif"><img src="/assets/images/trash.svg"/><span>Supprimer</span></div>
                  </div>
                  </div>
                </div>`;
          })
          .join("")
      : `<div class="no-notif notif-content">Aucune notification pour le moment.</div>`
  }`;

  setNotificationLinks(popup);
}

function notifPage() {
  pageData.previousPage = pageData.currentPage;
  pageData.currentPage = "notif";
  clearPages("notif");
}

export async function createReplyNotification(topicID, sender) {
  try {
    const response = await fetch(`/api/topic?topicID=${topicID}`);
    if (!response.ok) {
      displayError(response.status);
      return;
    }

    const topic = await response.json();
    const message = `<span class="notif-sender">${sender}</span> a posté une réponse sur <span class="notif-topic">${topic.topic_title}</span>`;

    const data = {
      notif_type: "newreply",
      topic_id: parseInt(topicID),
      sender_name: sender,
      message: message,
    };

    sendNotification(data);
  } catch (error) {
    console.log("Erreur dans la récupération du sujet : ", error);
  }
}

async function sendNotification(data) {
  console.log("Envoi de la notification au serveur");
  try {
    const response = await fetch(`/api/notif?mode=newnotif`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (error) {
    console.log("Erreur dans l'envoi de la notification : ", error);
  }
}

export async function markAsRead(notifID) {
  try {
    const response = await fetch(
      `/api/notif?mode=markasread&notifID=${notifID}`,
    );

    if (!response.ok) {
      displayError(response.status);
      return;
    }

    getUserNotifications();
  } catch (error) {
    console.log("Erreur pour marquer la notification comme lue : ", error);
  }
}

export async function deleteNotification(notifID) {
  try {
    const response = await fetch(`/api/notif?mode=delete&notifID=${notifID}`);

    if (!response.ok) {
      displayError(response.status);
      return;
    }

    getUserNotifications();
  } catch (error) {
    console.log("Erreur pour supprimer la notification : ", error);
  }
}

export async function unFollow(topicID) {
  try {
    const response = await fetch(`/api/notif?mode=unfollow&topicID=${topicID}`);

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (error) {
    console.log("Erreur pour mute le topic : ", error);
  }
}

async function followBack(topicID) {
  try {
    const response = await fetch(`/api/notif?mode=follow&topicID=${topicID}`);

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (error) {
    console.log("Erreur pour demute le topic : ", error);
  }
}
