// Fonction pour l'affichage du contenu d'une catégorie :

import { clearPages } from "./clear-pages.js";
import { SessionData } from "../variables/session-data.js";
import { displayHome } from "./home-display.js";
import { displayProfile } from "./profile.js";

// Liste des sujets avec le dernier message posté sur chaque sujet + la date d'ouverture du sujet
async function writeTopics(catID) {
  try {
    const response = await fetch(`/api/topics?catID=${catID}`);
    const category = await response.json();

    const topicsPageContainer = document.getElementById("topics-page");
    const catTitle = document.createElement("h2");
    catTitle.innerHTML = `${category.cat_name}`;
    topicsPageContainer.appendChild(catTitle);

    const topicList = category.topic_list;
    topicList.forEach((topic) => {
      const topicHTML = buildTopic(topic);
      topicsPageContainer.appendChild(topicHTML);
    });

    topicsPageContainer.addEventListener("click", (event) => {
      const title = event.target.closest(".topic-title");
      if (title) {
        const topicID = title.getAttribute("data_id");
        console.log("Opening topic ID:", topicID);
        // displayTopicContent(id);
        return;
      }

      const author = event.target.closest(".topic-author, .last-post-author");
      if (author) {
        const username = author.getAttribute("data_id");
        displayProfile(username);
        return;
      }

      const msgBtn = event.target.closest(".button-link");
      if (msgBtn) {
        const postId = msgBtn.getAttribute("data_id");
        console.log("Navigating to specific post ID:", postId);
        // jumpToPost(postId);
        return;
      }
    });
  } catch (error) {
    console.log("Erreur dans la récupération des sujets : ", error);
  }
}

export function displayTopics(catID) {
  clearPages("topicList");
  const homeBtn = document.getElementById("go-home");
  homeBtn.style.display = "block";

  if (!SessionData.isLogged) {
    const popup = document.getElementById("auth-popup");
    popup.classList.remove("is-hidden");
    displayHome();
    return;
  }

  let topicsPageContainer = document.getElementById("topics-page");

  if (!topicsPageContainer) {
    let addedContainer = `<div id="topics-page"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
  }

  writeTopics(catID);
}

function buildTopic(topic) {
  const topicBloc = document.createElement("div");
  topicBloc.className = "topic-bloc";

  const topicID = String(topic.topic_id).padStart(2, "0");

  const last = topic.post_list.length - 1;
  const lastPost = topic.post_list[last];
  const postID = String(lastPost.post_id).padStart(2, "0");

  console.log(topic.post_list);

  const lastPostAuthor = lastPost.author;
  const lastPostDate = lastPost.created_on;
  const lastPostImage = lastPost.image;

  if (topic.topic_title === "Aucun message") {
    topicBloc.className = "feed-notopic";
    topicBloc.innerHTML = `<img src="/assets/icons/notopic.png"/> Cette catégorie ne contient pour l'instant aucun message`;
  } else {
    topicBloc.innerHTML = `
                <h3 data_id="${topicID}" class="topic-title">${topic.topic_title}</h3> 
 <div class="topic-content">   
    <div class="topic-open">Ouvert le ${topic.created_on} par <span class="topic-author" data_id="${topic.author}">${topic.author}</span></div>

    <div class="topic-lastinfo">
    
    <button type="button" class="button-link" data_id="${postID}" style="float:right;margin-top:-5px">
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
