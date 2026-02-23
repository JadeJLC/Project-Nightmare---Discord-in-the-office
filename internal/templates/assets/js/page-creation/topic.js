// Fonction pour l'affichage du contenu d'un sujet

import { isUserLoggedIn } from "../helpers/check-log-status.js";
import { clearPages } from "../helpers/clear-pages.js";
import { SessionData, pageData } from "../variables.js";
import { displayTopics } from "./category-topics.js";
import { editMessage, newMessage } from "./new-message.js";
import { displayProfile } from "./profile.js";
import {
  buildPostReactions,
  removeReaction,
  addReaction,
  toggleReactionWindow,
} from "../helpers/reactions.js";
import { displayError } from "./errors.js";

/**
 * Fonction-mère pour la génération du sujet et de ses messages
 * @param {int} catID Identifiant de la catégorie à laquelle appartient le sujet
 * @param {int} topicID Identifiant du sujet
 * @param {int} postID Identifiant du post précis à focus
 * @returns
 */
export function displayPosts(topicID, postID) {
  pageData.previousPage = pageData.currentPage;
  pageData.currentPage = `topic-${topicID}${postID ? `-${postID}` : ""}`;
  clearPages("topic");
  if (!isUserLoggedIn()) return;

  let topicsPageContainer = document.getElementById("topic-posts");

  if (!topicsPageContainer) {
    let addedContainer = `<div id="topic-posts"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
  }

  writePosts(topicID, postID);
}

/**
 * Récupère le sujet dans al BDD et génère le HTML
 * @param {int} catID Identifiant de la catégorie à laquelle appartient le sujet
 * @param {int} topicID Identifiant du sujet
 * @param {int} postID Identifiant du post à focus
 */
async function writePosts(topicID, postID) {
  try {
    const response = await fetch(`/api/topic?topicID=${topicID}`);
    if (!response.ok) {
      displayError(response.status);
      return;
    }
    const topic = await response.json();

    const topicsPageContainer = document.getElementById("topic-posts");

    const catID = topic.cat_id;

    const topicTitle = `<h2 id="topic-title"><button class="go-back" data_catid="${catID}" id="go-back">
    <img src="/assets/images/arrow-left.svg"/><span>Retour à la catégorie</span></button>
    ${topic.topic_title} </h2>`;

    const topicActions = `${
      SessionData.role != 4
        ? `<div class="topic-actions">
    <button class="new-topic-button" id="new-topic-button">Ouvrir un nouveau sujet</button>
    <button class="new-message-button" id="new-message-button">Répondre au sujet</button>
    </div>`
        : ""
    }`;

    const postList = (
      await Promise.all(
        topic.post_list.map((post, index) => buildPostHTML(post, index)),
      )
    ).join("");

    topicsPageContainer.innerHTML = `${topicTitle} ${topicActions} ${postList}`;
    setTopicLinks(topicsPageContainer, catID, topicID, postID);

    postID = String(postID).padStart(2, "0");
    const postHref = document.getElementById(postID);
    if (postHref) postHref.scrollIntoView();
  } catch (error) {
    console.log("Erreur dans la récupération des sujets : ", error);
  }
}

/**
 * Place les "liens" cliquables sur le sujet (avatar, nouveau sujet, réponse, retour)
 * @param {HTMLElement} topicsPageContainer Conteneur de la page du sujet
 * @param {int} catID Identifiant de la catégorie à laquelle appartient le sujet
 * @param {int} topicID Identifiant du sujet
 */
function setTopicLinks(topicsPageContainer, catID, topicID) {
  topicsPageContainer.addEventListener("click", (event) => {
    const author = event.target.closest(".post-author");
    if (author) {
      const username = author.dataset.username;
      if (username != "Inconnu") displayProfile(username);
      return;
    }

    const newPostBtn = event.target.closest(".new-message-button");
    if (newPostBtn) {
      newMessage(topicID);
      return;
    }

    const backToCat = event.target.closest(".go-back");
    if (backToCat) {
      displayTopics(catID);
      return;
    }

    const newTopicBtn = event.target.closest(".new-topic-button");
    if (newTopicBtn) {
      displayTopics(catID, "newtopic");
      return;
    }

    const editBtn = event.target.closest(".edit-message");
    if (editBtn) {
      const postID = editBtn.dataset.postid;
      const postContainer = editBtn.closest(".post-left");
      const postContent =
        postContainer.querySelector(".post-message").innerHTML;
      editMessage(topicID, postID, postContent);
    }

    const deleteBtn = event.target.closest(".delete-message");
    if (deleteBtn) {
      const postID = deleteBtn.dataset.postid;
      deleteMessage(topicID, postID, catID);
    }

    const reactImg = event.target.closest(".reaction-bloc");
    if (reactImg) {
      const reactionType = reactImg.dataset.rtype;
      const postID = reactImg.dataset.postid;
      if (SessionData.role === 4) return;
      if (reactImg.classList.contains("active")) {
        removeReaction(postID, reactionType);
      } else {
        addReaction(postID, reactionType);
      }
      reactImg.classList.toggle("active");
    }

    const reactBtn = event.target.closest(".add-reaction");
    if (reactBtn) {
      const postID = reactBtn.dataset.postid;
      const postContainer = reactBtn.closest(".post-left");
      toggleReactionWindow(postID, postContainer);
    }
  });
}

/**
 * Construit le bloc de chaque message sur le sujet
 * @param {object} post Les données du message
 * @param {int} index La position du message sur la page
 * @returns {HTMLElement} L'élément HTML contenant le message
 */
async function buildPostHTML(post, index) {
  const postID = String(post.post_id).padStart(2, "0");
  const isFirst = index === 0;
  let editBtn;
  let reactBtn;
  let deleteBtn;

  if (
    (post.author.username === SessionData.username && SessionData.role != 4) ||
    SessionData.role === 1 ||
    SessionData.role === 2
  ) {
    editBtn = `<button type="button" class="edit-content edit-message" id="confirm-edit" data-postid="${post.post_id}">
          <img src="assets/images/tool.svg" />
          <span>Modifier le<br> message</span>
        </button>`;
    deleteBtn = `<button type="button" class="edit-content delete-message" id="confirm-delete" data-postid="${post.post_id}">
          <img src="assets/images/trash.svg" />
          <span>Supprimer le<br> message</span>
        </button>`;
  }

  if (post.author.username !== SessionData.username && SessionData.role != 4) {
    reactBtn = `<button type="button" class="edit-content add-reaction" id="add-reaction" data-postid="${post.post_id}">
          <img src="assets/images/react.svg" />
          <span>Réagir à ce message</span>
        </button>`;
  }
  const postReactions = await buildPostReactions(post.reactions);

  return `
    <div class="post-bloc ${isFirst ? "first-post" : ""}" id="${postID}">
      <div class="post-indic">${isFirst ? "Premier post" : ""}</div>
      <div class="post-content">   
        
        <div class="post-left">
        <div class="post-buttons">${editBtn ? `${editBtn}` : ""}
        ${deleteBtn ? `${deleteBtn}` : ""}
        ${reactBtn ? `${reactBtn}` : ""} </div>
          <div class="post-date">Message du ${post.created_on}</div>
          <div class="post-message">${post.content}</div>
          <div class="post-reactions">${postReactions ? `${postReactions}` : ""}</div>
        </div>

        <div class="post-right">
          <div class="post-details">
            <div class="post-author" data-username="${post.author.username}">
              <span>${post.author.username}</span>
              <div class="post-image">
                <img src="/assets/images-avatar/${post.author.image}.png" alt="Avatar de ${post.author.username}"/>
              </div> 
            </div>
            <div class="post-profile">
            ${post.author.inscription != "Membre supprimé" ? "Membre depuis le" : ""}
            ${post.author.inscription}
            </div>
          </div>
        </div>
        
      </div>
    </div>`;
}

function deletePostConfirmation() {
  return new Promise((resolve) => {
    const popup = document.createElement("div");
    popup.id = "opened-popup";
    popup.className = "profile-popup-overlay";

    popup.innerHTML = `
      <div class="profile-popup">
        <h3>Voulez-vous vraiment supprimer ce message ?</h3>
        <div class="profile-popup-actions">
          <button id="profile-popup-cancel">Annuler</button>
          <button id="profile-popup-send">Confirmer</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    popup.addEventListener("click", (event) => {
      const confirmBtn = event.target.closest("#profile-popup-send");
      if (confirmBtn) {
        popup.remove();
        resolve(true);
      }

      const cancelBtn =
        event.target.closest("#profile-popup-cancel") || event.target === popup;
      if (cancelBtn) {
        popup.remove();
        resolve(false);
      }
    });
  });
}

async function deleteMessage(topicID, postID, catID) {
  const confirmed = await deletePostConfirmation();

  if (!confirmed) return;

  try {
    const response = await fetch(
      `/api/post?mode=delete&topicID=${topicID}&postID=${postID}&user=${SessionData.username}`,
    );
    if (!response.ok) {
      displayError(response.status);
      return;
    }

    const result = await response.json();

    if (result.topicDeleted) {
      displayTopics(catID);
    } else {
      displayPosts(topicID);
    }
  } catch (e) {
    console.log("Erreur dans la suppression du message");
    displayError(500);
  }
}
