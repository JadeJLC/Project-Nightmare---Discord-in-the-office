import { SessionData } from "../variables.js";

export function handleIncomingNotification(msg) {
  // 1. Ajouter la notif dans SessionData
  const notif = {
    notif_id: Date.now(), // ID temporaire côté client
    notif_message: msg.notif_message,
    notif_status: msg.notif_status,
    notif_time: Date.now(), // Je triche, js râle sur le format de la date
    notif_data: msg.data ?? "",
  };

  if (!SessionData.notifications) {
    SessionData.notifications = [];
  }

  SessionData.notifications.unshift(notif);

  // 2. Mettre à jour le compteur
  updateNotificationCounter();

  // 3. Si le popup est ouvert → le rafraîchir
  const popup = document.getElementById("notif-popup");
  if (popup && !popup.classList.contains("is-hidden")) {
    notifPopup(); // réaffiche le contenu
  }
}

export function updateNotificationCounter() {
  const counter = document.getElementById("notif-counter");
  if (!counter) return;

  const unread = (SessionData.notifications || []).filter(
    (n) => n.notif_status === "new",
  ).length;

  counter.textContent = unread > 0 ? unread : "";
  counter.className = unread > 0 ? "" : "is-hidden";
}
