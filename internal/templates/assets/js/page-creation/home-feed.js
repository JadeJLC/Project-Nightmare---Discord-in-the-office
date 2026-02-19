import { displayPosts } from "./topic.js";
import { displayError } from "./errors.js";
import { displayProfile } from "./profile.js";

/**
 * Affiche les derniers messages postés sous forme de feed avec les sujets.
 * Si plusieurs message ont été posté sur le même sujet, le sujet n'apparaît qu'une fois.
 */
async function displayFeed() {
  try {
    const response = await fetch("/?mode=feed");
    if (!response.ok) {
      displayError(response.status);
      return;
    }

    const topicList = await response.json();

    let feedContainer = document.getElementById("feed");
    const frontPageContainer = document.getElementById("front-page");

    if (!feedContainer) {
      feedContainer = document.createElement("div");
      feedContainer.id = "feed";
      frontPageContainer.appendChild(feedContainer);
    }

    feedContainer.innerHTML = `<hr/><h2 class="feed-title">Derniers messages postés sur le forum</h2>`;

    topicList.forEach((topic) => {
      const topicBloc = buildFeedTopic(topic);
      feedContainer.appendChild(topicBloc);
    });

    setHomeFeedLinks(feedContainer);

    let categoriesContainer = document.getElementById("categories");
    if (categoriesContainer) categoriesContainer.remove();
  } catch (error) {
    console.log("Erreur dans la récupération du feed : ", error);
  }
}

/**
 * Place les "liens" accessibles depuis la page d'accueil en affichage feed : titre du sujet, dernier message, auteurs
 * @param {HTMLElement} feedPageContainer Le conteneur de la partie feed de la page
 */
function setHomeFeedLinks(feedContainer) {
  feedContainer.addEventListener("click", (event) => {
    const title = event.target.closest(".topic-title");
    if (title) {
      const topicID = title.dataset.topicid;
      displayPosts(topicID);
      return;
    }

    const lastPost = event.target.closest(".button-link");
    if (lastPost) {
      const topicID = lastPost.dataset.topicid;
      const postID = lastPost.dataset.postid;
      displayPosts(topicID, postID);
      return;
    }

    const author = event.target.closest(".last-post-author");
    if (author) {
      const profile = author.dataset.author;
      displayProfile(profile);
    }
  });
}

/**
 * Construit un sujet du feed à partir des informations de la BDD
 * @param {object} topic Le sujet à récupérer et afficher
 * @returns {HTMLElement} L'élément HTML du sujet
 */
function buildFeedTopic(topic) {
  const topicBloc = document.createElement("div");
  topicBloc.className = "topic-bloc";

  const topicID = String(topic.topic_id).padStart(2, "0");
  const postID = String(topic.post_id).padStart(2, "0");

  let message = topic.content.slice(0, 100);
  if (topic.content.length >= 100) message += "...";

  if (topic.topic_title === "Aucun message") {
    topicBloc.className = "feed-notopic";
    topicBloc.innerHTML = `<img src="/assets/icons/notopic.png"/> Aucun sujet correspondant à votre recherche n'a été trouvé`;
  } else {
    topicBloc.innerHTML = `<button type="button" class="button-link" style="float:right;padding-top:10px" data-topicid="${topicID}" data-postid="${postID}">
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button>
                <h3 class="topic-title" data-topicid="${topicID}">Sujet : ${topic.topic_title}</h3> 
 <div class="topic-content">   
    <div class="topic-lastpost">${message} </div>
    <div class="topic-lastinfo">posté le ${topic.created_on} par <span class="last-post-author" data-author="${topic.author}">${topic.author}</span></div>
 </div>`;
  }

  return topicBloc;
}

export { displayFeed };
