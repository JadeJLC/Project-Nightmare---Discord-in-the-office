// Fonction pour l'affichage du contenu d'un sujet

import { clearPages } from "../helpers/clear-pages.js";
import { SessionData } from "../variables/session-data.js";
import { displayTopics } from "./category-topics.js";
import { displayHome } from "./home-display.js";
import { newMessage, newTopic } from "./new-message.js";
import { displayProfile } from "./profile.js";

// Liste des messages dans le sujet
async function writePosts(catID, topicID, postID) {
  try {
    const response = await fetch(`/api/topic?topicID=${topicID}`);
    const topic = await response.json();

    const topicsPageContainer = document.getElementById("topic-posts");
    topicsPageContainer.innerHTML = "";
    const topicTitle = document.createElement("h2");
    topicTitle.id = "topic-title";
    topicTitle.innerHTML = `<button class="go-back" data_catid="${catID}" id="go-back">
    <img src="/assets/images/arrow-left.svg"/><span>Retour à la catégorie</span></button>
    ${topic.topic_title} 
    <div class="topic-actions">
    <button class="new-topic-button" id="new-topic-button">Ouvrir un nouveau sujet</button>
    <button class="new-message-button" id="new-message-button">Répondre au sujet</button>
    </div>`;
    topicsPageContainer.appendChild(topicTitle);

    const postList = topic.post_list;
    postList.forEach((post) => {
      let postHTML;
      if (post == topic.post_list[0]) {
        postHTML = buildPostList(post, 0);
      } else {
        postHTML = buildPostList(post);
      }

      topicsPageContainer.appendChild(postHTML);
    });

    topicsPageContainer.addEventListener("click", (event) => {
      const author = event.target.closest(".post-author");
      if (author) {
        const username = author.getAttribute("data_id");
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
        const catID = document.getElementById("topic-posts").dataset.catid;
        displayTopics(catID);
        return;
      }

      const newTopicBtn = event.target.closest(".new-topic-button");
      if (newTopicBtn) {
        const catID = document.getElementById("topic-posts").dataset.catid;
        displayTopics(catID, "newtopic");
        return;
      }
    });

    if (postID) {
      document.getElementById(postID).scrollIntoView();
    }
  } catch (error) {
    console.log("Erreur dans la récupération des sujets : ", error);
  }
}

export function displayPosts(catID, topicID, postID) {
  clearPages("topic");

  if (!SessionData.isLogged) {
    const popup = document.getElementById("auth-popup");
    popup.classList.remove("is-hidden");
    displayHome();
    return;
  }

  let topicsPageContainer = document.getElementById("topic-posts");

  if (!topicsPageContainer) {
    let addedContainer = `<div id="topic-posts" data-catid="${catID}"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
  }

  writePosts(catID, topicID, postID);
}

function buildPostList(post, index) {
  const postBloc = document.createElement("div");
  postBloc.className = "post-bloc";

  const postID = String(post.post_id).padStart(2, "0");
  postBloc.id = postID;
  let postFirst = "";

  if (index === 0) {
    postBloc.classList.add("first-post");
    postFirst = "Premier post";
  }

  postBloc.innerHTML = `<div class="post-indic" id="postID"> ${postFirst}</div>
<div class="post-content">   

  <div class="post-left">
  <div class="post-date">Message du ${post.created_on}</div>
        <div class="post-message"> ${post.content}</div>
  </div>

  <div class="post-right">
    <div class="post-details">
        <div class="post-author" data_id="${post.author.username}">
           <span> ${post.author.username}</span>
            <div class="post-image"><img src="/assets/images-avatar/${post.author.image}.png"/></div> 
        </div>
        <div class="post-profile">
            Membre depuis le ${post.author.inscription}
            </div>
    </div>
  </div>
  
</div>`;

  return postBloc;
}
