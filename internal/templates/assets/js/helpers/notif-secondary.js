import { displayPosts } from "../page-creation/topic.js";
import { displayMailbox } from "../page-creation/chat.js";
import { openConversation } from "../websockets/private-message.js";
import { displayProfile } from "../page-creation/profile.js";
import {
  markAsRead,
  unFollow,
  deleteNotification,
  notifPopup,
} from "../page-creation/notifications.js";

/**
 * Tri les données de la notification pour les ajouter sous forme de dataset à la balise HTML
 * (data-topicid, data-postid, data-sender, data-dmid)
 * @param {string} dataStr Les données de notification dans la base de données
 * @returns {string} Le dataset à ajouter au HTML
 */
export function getNotifData(dataStr) {
  console.log("Récupération des données de notification : ", dataStr);
  let type;

  if (dataStr.includes("[TOPIC") && dataStr.includes("[POST")) type = "seepost";
  if (dataStr.includes("[DM")) type = "seedm";

  if (type === "seepost") {
    const topicMatch = dataStr.match(/TOPIC:(\d+)/);
    const postMatch = dataStr.match(/POST:(\d+)/);
    const topicID = topicMatch ? topicMatch[1] : null;
    const postID = postMatch ? postMatch[1] : null;
    const senderMatch = dataStr.match(/USER:([^\]]+)/);
    let senderName = senderMatch ? senderMatch[1] : null;
    if (senderName) senderName = senderName.replace(/"/g, "&quot;");

    return `data-type="seepost" data-topicid="${topicID}" data-postid="${postID}" data-sender="${senderName}"`;
  }

  if (type === "seedm") {
    const dmMatch = dataStr.match(/DM:([^\]]+)/);
    const dmID = dmMatch ? dmMatch[1] : null;

    return `data-type="seedm" data-dmid="${dmID}"`;
  }
}

/**
 * Crée tous les liens et actions au clic dans la fenêtre des notifications
 * @param {HTMLElement} notifWindow La popup contenant les notifications
 */
export function setNotificationLinks(notifWindow) {
  notifWindow.addEventListener("click", (event) => {
    const seeMessage = event.target.closest(".notif-topic");
    if (seeMessage) {
      const parentItem = seeMessage.closest(".notif-item");
      if (parentItem) {
        const notiftype = parentItem.dataset.type;
        console.log(notiftype);
        switch (notiftype) {
          case "seepost":
            const topicID = parentItem.dataset.topicid;
            const postID = parentItem.dataset.postid;
            displayPosts(topicID, postID);
            notifPopup();
            break;
          case "seedm":
            const dmID = parentItem.dataset.dmid;
            displayMailbox();
            openConversation(dmID);
            notifPopup();
            break;
        }
      }
    }

    const seeSender = event.target.closest(".notif-sender");
    if (seeSender) {
      const parentItem = seeSender.closest(".notif-item");
      if (parentItem) {
        const senderName = parentItem.dataset.sender;
        displayProfile(senderName);
      }
    }

    const markReadBtn = event.target.closest(".mark-read");
    if (markReadBtn) {
      const parentItem = markReadBtn.closest(".notif-item");
      if (parentItem) {
        const notifID = parentItem.dataset.notifid;
        markAsRead(notifID);
      }
    }

    const deleteBtn = event.target.closest(".delete-notif");
    if (deleteBtn) {
      const parentItem = deleteBtn.closest(".notif-item");
      if (parentItem) {
        const notifID = parentItem.dataset.notifid;
        deleteNotification(notifID);
      }
    }

    const stopFollow = event.target.closest(".stop-follow");
    if (stopFollow) {
      const parentItem = stopFollow.closest(".notif-item");
      if (parentItem) {
        const topicID = parentItem.dataset.topicid;
        unFollow(topicID);
        const notifID = parentItem.dataset.notifid;
        deleteNotif(notifID);

        // stopFollow.classList.remove("stop-follow");
        // stopFollow.classList.add("re-follow");
        // stopFollow.innerHTML = `<img src="/assets/images/bell.svg"/><span>Suivre à nouveau</span>`;
      }
    }

    // const reFollow = event.target.closest("re-follow");
    // if (reFollow) {
    //   const parentItem = reFollow.closest(".notif-item");
    //   if (parentItem) {
    //     const topicID = parentItem.dataset.topicid;
    //     followBack(topicID);

    //     reFollow.classList.remove("re-follow");
    //     reFollow.classList.add("stop-follow");
    //     reFollow.innerHTML = `<img src="/assets/images/bell-off.svg"/><span>Arrêter de suivre</span>`;
    //   }
    // }
  });
}
