// Fonction pour l'affichage du contenu d'un sujet

import { clearPages } from "./clear-pages.js";
import { SessionData } from "../variables/session-data.js";
import { displayHome } from "./home-display.js";
import { displayProfile } from "./profile.js";

// Liste des messages dans le sujet
async function writePosts(topicID) {
  try {
    const response = await fetch(`/api/topic?topicID=${topicID}`);
    const topic = await response.json();

    const topicsPageContainer = document.getElementById("topic-posts");
    topicsPageContainer.innerHTML = "";
    const topicTitle = document.createElement("h2");
    topicTitle.innerHTML = `${topic.topic_title}`;
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
  } catch (error) {
    console.log("Erreur dans la récupération des sujets : ", error);
  }
}

export function displayPosts(topicID) {
  clearPages("topic");

  if (!SessionData.isLogged) {
    const popup = document.getElementById("auth-popup");
    popup.classList.remove("is-hidden");
    displayHome();
    return;
  }

  let topicsPageContainer = document.getElementById("topic-posts");

  if (!topicsPageContainer) {
    let addedContainer = `<div id="topic-posts"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
  }

  writePosts(topicID);
}

function buildPostList(post, index) {
  console.log(post);
  const postBloc = document.createElement("div");
  postBloc.className = "post-bloc";

  const postID = String(post.post_id).padStart(2, "0");
  postBloc.id = postID;
  let postFirst = "";

  if (index === 0) {
    postBloc.classList.add("first-post");
    postFirst = "Premier post";
  }

  postBloc.innerHTML = `<div class="post-indic"> ${postFirst}</div>
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
