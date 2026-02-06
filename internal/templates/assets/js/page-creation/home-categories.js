<<<<<<< HEAD
import { displayTopics } from "./category-topics.js";
import { displayProfile } from "./profile.js";
import { displayPosts } from "./topic.js";

/**
 * Affiche la liste des catégories sur la page d'accueil
 */
=======
// Fonctions pour la création de la page d'accueil avec toutes les catégories du forum

import { displayTopics } from "./category-topics.js";

>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396
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

<<<<<<< HEAD
    setHomeCategoriesLinks(categoriesContainer);
=======
    categoriesContainer.addEventListener("click", (event) => {
      const title = event.target.closest(".cat-title");
      if (title) {
        const catId = title.dataset.id;
        displayTopics(catId);
      }
    });
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396

    let feedContainer = document.getElementById("feed");
    if (feedContainer) feedContainer.remove();
  } catch (error) {
    console.log("Erreur dans la récupération des catégories : ", error);
  }
}

<<<<<<< HEAD
/**
 * Place les "liens" accessibles depuis la page d'accueil en affichage catégories : titre de la catégorie, dernier message, auteurs
 * @param {HTMLElement} categPageContainer Le conteneur de la partie catégorie de la page
 */
function setHomeCategoriesLinks(categoriesContainer) {
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
}

/**
 * Construit une catégorie à partir des informations de la BDD
 * @param {object} category La catégorie à afficher
 * @returns {HTMLElement} L'élément HTML de la catégorie
 */
=======
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396
function buildCategory(category) {
  const catBloc = document.createElement("div");
  catBloc.className = "cat-bloc";

  const catID = String(category.id).padStart(2, "0");

  const image = `assets/icons/cat_${catID}.png`;
  const lastpost = category.lastpost;

<<<<<<< HEAD
  const postID = String(lastpost.post_id).padStart(2, "0");
=======
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396
  let lastPostHTML;
  if (lastpost.topic_title === "Aucun message pour le moment") {
    lastPostHTML = `<div class="cat-lastpost"><center>${lastpost.topic_title}</center></div>`;
  } else {
<<<<<<< HEAD
    lastPostHTML = `<div class="cat-lastpost"><button data_topicid="${lastpost.topic_id}" data_catid="${catID}" data_postid="${postID}" type="button" class="button-link link-right">
=======
    lastPostHTML = `<div class="cat-lastpost"><button type="button" class="button-link link-right">
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button>
                <center>Dernier message</center>
<<<<<<< HEAD
    <div class="last-post-title" data_catid="${catID}" data_id="${lastpost.topic_id}">
 ${lastpost.topic_title} </div>
    <div class="last-post-date">• le ${lastpost.created_on} par <span class="last-post-author" data_id="${lastpost.author}">${lastpost.author}</span></div>
=======
    <div class="last-post-title">
 ${lastpost.topic_title} </div>
    <div class="last-post-date">• le ${lastpost.created_on} par ${lastpost.author}</div>
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396
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
