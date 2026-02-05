// Fonctions pour la création de la page d'accueil avec toutes les catégories du forum

import { displayTopics } from "./category-topics.js";
import { displayProfile } from "./profile.js";
import { displayPosts } from "./topic.js";

async function displayCategories() {
  try {
    const response = await fetch("/?mode=categ");
    const catList = await response.json();

    const frontPageContainer = document.getElementById("front-page");
    let categoriesContainer = document.getElementById("categories");

    if (!categoriesContainer) {
      categoriesContainer = document.createElement("div");
      categoriesContainer.id = "categories";
      frontPageContainer.appendChild(categoriesContainer);
    }
    categoriesContainer.innerHTML = "";

    catList.forEach((category) => {
      const catBloc = buildCategory(category);
      categoriesContainer.appendChild(catBloc);
    });

    categoriesContainer.addEventListener("click", (event) => {
      const title = event.target.closest(".cat-title");
      if (title) {
        const catID = title.dataset.id;
        displayTopics(catID);
        return;
      }

      const lastPostTitle = event.target.closest(".last-post-title");

      if (lastPostTitle) {
        const topicID = lastPostTitle.getAttribute("data_id");
        const catID = lastPostTitle.getAttribute("data_catid");
        displayPosts(catID, topicID);
        return;
      }

      const lastPostBtn = event.target.closest(".button-link");

      if (lastPostBtn) {
        const topicID = lastPostBtn.getAttribute("data_topicid");
        const postId = lastPostBtn.getAttribute("data_postid");
        const catID = lastPostBtn.getAttribute("data_catid");
        displayPosts(catID, topicID, postId);
        return;
      }

      const author = event.target.closest(".last-post-author");
      if (author) {
        const profile = author.getAttribute("data_id");
        displayProfile(profile);
      }
    });

    let feedContainer = document.getElementById("feed");
    if (feedContainer) feedContainer.remove();
  } catch (error) {
    console.log("Erreur dans la récupération des catégories : ", error);
  }
}

function buildCategory(category) {
  const catBloc = document.createElement("div");
  catBloc.className = "cat-bloc";

  const catID = String(category.id).padStart(2, "0");

  const image = `assets/icons/cat_${catID}.png`;
  const lastpost = category.lastpost;

  const postID = String(lastpost.post_id).padStart(2, "0");
  let lastPostHTML;
  if (lastpost.topic_title === "Aucun message pour le moment") {
    lastPostHTML = `<div class="cat-lastpost"><center>${lastpost.topic_title}</center></div>`;
  } else {
    lastPostHTML = `<div class="cat-lastpost"><button data_topicid="${lastpost.topic_id}" data_catid="${catID}" data_postid="${postID}" type="button" class="button-link link-right">
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button>
                <center>Dernier message</center>
    <div class="last-post-title" data_catid="${catID}" data_id="${lastpost.topic_id}">
 ${lastpost.topic_title} </div>
    <div class="last-post-date">• le ${lastpost.created_on} par <span class="last-post-author" data_id="${lastpost.author}">${lastpost.author}</span></div>
    </div>`;
  }

  catBloc.innerHTML = `<h3 data-id="${catID}" class="cat-title">${category.name}</h3>
 <div class="cat-content">   
    <div class="cat-description">${category.description}</div>
    <div class="cat-image"><img src="${image}"/></div>
    ${lastPostHTML}
 </div>`;

  return catBloc;
}

export { displayCategories };
