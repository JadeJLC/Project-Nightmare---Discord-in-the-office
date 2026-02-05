// Fonction pour l'affichage du contenu d'une catégorie :

import { clearPages } from "../helpers/clear-pages.js";
import { SessionData } from "../variables/session-data.js";
import { displayHome } from "./home-display.js";
import { displayProfile } from "./profile.js";
import { displayPosts } from "./topic.js";
import { newTopic } from "./new-message.js";

// Liste des sujets avec le dernier message posté sur chaque sujet + la date d'ouverture du sujet
async function writeTopics(catID, mode) {
  try {
    const response = await fetch(`/api/category?catID=${catID}`);
    const category = await response.json();

    const categPageContainer = document.getElementById("category-topics");
    categPageContainer.innerHTML = "";
    const catTitle = document.createElement("h2");
    catTitle.id = "cat-title";
    catTitle.innerHTML = `<button class="go-back" id="go-back"><img src="/assets/images/arrow-left.svg"/><span>Retour à l'accueil</span></button>
    ${category.cat_name} <button class="new-topic-button" id="new-topic-button">Ouvrir un nouveau sujet</button>`;
    categPageContainer.appendChild(catTitle);

    if (mode === "newtopic") {
      newTopic(catID);
      return;
    }

    const topicList = category.topic_list;

    topicList.forEach((topic) => {
      const topicHTML = buildTopic(topic);
      categPageContainer.appendChild(topicHTML);
    });

    categPageContainer.addEventListener("click", (event) => {
      const newTopicBtn = event.target.closest(".new-topic-button");
      if (newTopicBtn) {
        newTopic(catID);
        return;
      }

      const title = event.target.closest(".topic-title");
      if (title) {
        const topicID = parseInt(title.getAttribute("data_id"));
        displayPosts(catID, topicID);
        return;
      }

      const author = event.target.closest(".topic-author, .last-post-author");
      if (author) {
        const username = author.getAttribute("data_id");
        displayProfile(username);
        return;
      }

      const backHome = event.target.closest(".go-back");
      if (backHome) {
        displayHome();
        return;
      }

      const msgBtn = event.target.closest(".button-link");
      if (msgBtn) {
        const topicID = msgBtn.getAttribute("data_topicid");
        const postId = msgBtn.getAttribute("data_postid");

        displayPosts(catID, topicID, postId);
        return;
      }
    });
  } catch (error) {
    console.log("Erreur dans la récupération des sujets : ", error);
  }
}

export function displayTopics(catID, mode) {
  clearPages("category");

  if (!SessionData.isLogged) {
    const popup = document.getElementById("auth-popup");
    popup.classList.remove("is-hidden");
    displayHome();
    return;
  }

  let categPageContainer = document.getElementById("category-topics");

  if (!categPageContainer) {
    let addedContainer = `<div id="category-topics"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
  }

  writeTopics(catID, mode);
}

function buildTopic(topic) {
  const topicBloc = document.createElement("div");
  topicBloc.className = "topic-bloc";

  const topicID = String(topic.topic_id).padStart(2, "0");

  if (topic.topic_title === "Nothing to Display" || !topic.post_list) {
    topicBloc.className = "feed-notopic";
    topicBloc.id = "notopic";
    topicBloc.innerHTML = `<img src="/assets/icons/notopic.png"/> Cette catégorie ne contient pour l'instant aucun message`;
  } else {
    const last = topic.post_list.length - 1;
    const lastPost = topic.post_list[last];
    const postID = String(lastPost.post_id).padStart(2, "0");
    const lastPostAuthor = lastPost.author.username;
    const lastPostDate = lastPost.created_on;
    const lastPostImage = lastPost.author.image;

    topicBloc.innerHTML = `
                <h3 data_id="${topicID}" class="topic-title">${topic.topic_title}</h3> 
 <div class="topic-content">   
    <div class="topic-open">Ouvert le ${topic.created_on} par <span class="topic-author" data_id="${topic.author}">${topic.author}</span></div>

    <div class="topic-lastinfo">
    
    <button type="button" class="button-link" data_topicid="${topicID}" data_postid="${postID}" style="float:right;margin-top:-5px">
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button> Dernier message le ${lastPostDate} par 
                <div class="last-post-author" data_id="${lastPostAuthor}"> <div class="topic-image"><img src="/assets/images-avatar/${lastPostImage}.png"/></div> ${lastPostAuthor}</div>
                </div>
 </div>`;
  }

  return topicBloc;
}
