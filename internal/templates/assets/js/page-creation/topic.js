// Fonction pour l'affichage du contenu d'un sujet

import { isUserLoggedIn } from "../helpers/check-log-status.js";
import { clearPages } from "../helpers/clear-pages.js";
import { displayTopics } from "./category-topics.js";
import { newMessage, newTopic } from "./new-message.js";
import { displayProfile } from "./profile.js";

/**
 * Fonction-mère pour la génération du sujet et de ses messages
 * @param {int} catID Identifiant de la catégorie à laquelle appartient le sujet
 * @param {int} topicID Identifiant du sujet
 * @param {int} postID Identifiant du post précis à focus
 * @returns
 */
export function displayPosts(catID, topicID, postID) {
  clearPages("topic");

  if (!isUserLoggedIn()) return;

  let topicsPageContainer = document.getElementById("topic-posts");

  if (!topicsPageContainer) {
    let addedContainer = `<div id="topic-posts" data-catid="${catID}"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
  }

  writePosts(catID, topicID, postID);
}

/**
 * Récupère le sujet dans al BDD et génère le HTML
 * @param {int} catID Identifiant de la catégorie à laquelle appartient le sujet
 * @param {int} topicID Identifiant du sujet
 * @param {int} postID Identifiant du post à focus
 */
async function writePosts(catID, topicID, postID) {
  try {
    const response = await fetch(`/api/topic?topicID=${topicID}`);
    const topic = await response.json();

    const topicsPageContainer = document.getElementById("topic-posts");

    const topicTitle = `<h2 id="topic-title"><button class="go-back" data_catid="${catID}" id="go-back">
    <img src="/assets/images/arrow-left.svg"/><span>Retour à la catégorie</span></button>
    ${topic.topic_title} </h2>`;

    const topicActions = `<div class="topic-actions">
    <button class="new-topic-button" id="new-topic-button">Ouvrir un nouveau sujet</button>
    <button class="new-message-button" id="new-message-button">Répondre au sujet</button>
    </div>`;

    const postList = topic.post_list
      .map((post, index) => buildPostHTML(post, index))
      .join("");

    topicsPageContainer.innerHTML = `${topicTitle} ${topicActions} ${postList}`;
    setTopicLinks(topicsPageContainer, catID, topicID, postID);

    if (postID) document.getElementById(postID).scrollIntoView();
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
      displayProfile(username);
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
  });
}

/**
 * Construit le bloc de chaque message sur le sujet
 * @param {object} post Les données du message
 * @param {int} index La position du message sur la page
 * @returns {HTMLElement} L'élément HTML contenant le message
 */
function buildPostHTML(post, index) {
  const postID = String(post.post_id).padStart(2, "0");
  const isFirst = index === 0;

  return `
    <div class="post-bloc ${isFirst ? "first-post" : ""}" id="${postID}">
      <div class="post-indic">${isFirst ? "Premier post" : ""}</div>
      <div class="post-content">   
        
        <div class="post-left">
          <div class="post-date">Message du ${post.created_on}</div>
          <div class="post-message">${post.content}</div>
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
              Membre depuis le ${post.author.inscription}
            </div>
          </div>
        </div>
        
      </div>
    </div>`;
}
