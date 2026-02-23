import { displayHome } from "../page-creation/home-display.js";
import { pageData, SessionData } from "../variables.js";
import { updateNotificationCounter } from "../websockets/notif-websocket.js";

/**
 * Vide la page HTML pour la remplir avec les données de la nouvelle page
 * @param {string} destination La page que l'on souhaite charger après avoir vidé la page actuelle
 *
 */
export function clearPages(destination) {
  console.log("Destination : ", destination);
  window.scrollTo(0, 0);
  clearPopups();

  localStorage.setItem("currentPage", pageData.currentPage);

  if (destination != "home") clearHomePage();
  if (destination === "newtopic") showNewTopicForm();
  if (destination === "reply") showReplyForm();
  if (destination === "edit") showEditForm();

  if (destination != "error") {
    const errorPageContainer = document.getElementById("error-page");
    if (errorPageContainer) errorPageContainer.remove();
  }

  if (destination != "notif") {
    const notifPageContainer = document.getElementById("notif-page");
    if (notifPageContainer) notifPageContainer.remove();
  }

  const profilePageContainer = document.getElementById("profile-page");
  if (profilePageContainer) profilePageContainer.remove();

  if (destination != "newtopic") {
    const categoryTopics = document.getElementById("category-topics");
    if (categoryTopics) categoryTopics.remove();
  }

  if (destination != "reply" && destination != "edit") {
    const topicPosts = document.getElementById("topic-posts");
    if (topicPosts) topicPosts.remove();
  }

  if (destination != "dm") {
    let dmPageContainer = document.getElementById("dm-page");
    if (dmPageContainer) dmPageContainer.remove();
  }

  updateHeader(destination);
}

/**
 * Retire le contenu de la page d'accueil
 */
function clearHomePage() {
  const frontPageContainer = document.getElementById("front-page");
  if (frontPageContainer) frontPageContainer.remove();

  const categories = document.getElementById("categories");
  if (categories) categories.remove();

  const feed = document.getElementById("feed");
  if (feed) feed.remove();
}

/**
 * Affiche le formulaire pour poster un nouveau sujet dans une catégorie
 * Conserve le titre de la catégorie et son ID pour pouvoir revenir en arrière
 */
function showNewTopicForm() {
  const newTopicBtn = document.getElementById("new-topic-button");
  if (newTopicBtn) newTopicBtn.remove();

  const catTitle = document.getElementById("cat-title");
  if (!catTitle) displayHome();

  if (!catTitle.innerHTML.includes("nouveau sujet"))
    catTitle.innerHTML =
      "Ouvrir un nouveau sujet dans<br>" + catTitle.innerHTML;

  const topicList = document.querySelectorAll(".topic-bloc");
  topicList.forEach((topic) => {
    topic.remove();
  });

  const noTopic = document.getElementById("notopic");
  if (noTopic) noTopic.remove();
}

/**
 * Affiche le formulaire pour répondre à un sujet en postant un nouveau message
 * Conserve le titre du sujet, son ID et celui de la catégorie pour pouvoir revenir en arrière
 */
function showReplyForm() {
  const newMessageBtn = document.getElementById("new-message-button");
  if (newMessageBtn) newMessageBtn.remove();

  const topicTitle = document.getElementById("topic-title");

  if (!topicTitle.innerHTML.includes("Répondre au sujet"))
    topicTitle.innerHTML = "Répondre au sujet : <br>" + topicTitle.innerHTML;

  const postList = document.querySelectorAll(".post-bloc");
  postList.forEach((post) => {
    post.remove();
  });

  const newTopicBtn = document.getElementById("new-topic-button");
  if (newTopicBtn) newTopicBtn.remove();
}

/**
 * Affiche le formulaire pour modifier un message
 * Conserve le titre du sujet, son ID et celui de la catégorie pour pouvoir revenir en arrière
 */
function showEditForm() {
  const newMessageBtn = document.getElementById("new-message-button");
  if (newMessageBtn) newMessageBtn.remove();

  const topicTitle = document.getElementById("topic-title");

  if (!topicTitle.innerHTML.includes("Modifier mon message sur"))
    topicTitle.innerHTML =
      "Modifier mon message sur : <br>" + topicTitle.innerHTML;

  const postList = document.querySelectorAll(".post-bloc");
  postList.forEach((post) => {
    post.remove();
  });

  const newTopicBtn = document.getElementById("new-topic-button");
  if (newTopicBtn) newTopicBtn.remove();
}

/**
 * Met à jour le header en fonction de la page que l'on ouvre et du statut de connexion
 * @param {string} destination La page que l'on est en train d'ouvrir
 */
function updateHeader(destination) {
  const usernameHeader = document.getElementById("header-username");

  if (destination === "home") {
    const homeBtn = document.getElementById("go-home");
    homeBtn.style.display = "none";
  } else {
    const homeBtn = document.getElementById("go-home");
    homeBtn.style.display = "block";
  }

  const logBtn = document.getElementById("log-in-text");
  const logImg = document.getElementById("log-in-img");
  const memberBtns = document.getElementById("member-buttons");
  const memberList = document.getElementById("online-members-list");

  if (!SessionData.isLogged) {
    usernameHeader.innerHTML =
      "Bienvenue&nbsp;! <br /> Pensez à vous connecter&nbsp;!";

    logBtn.innerHTML = `Inscription /<br />Connexion`;
    logImg.src = `assets/images/log-in.svg`;
    memberBtns.innerHTML = "";

    memberList.classList.add("is-hidden");
  } else {
    usernameHeader.innerHTML = `Bienvenue ${SessionData.username}&nbsp;! <br /> Heureux de vous revoir&nbsp;!`;
    logBtn.innerHTML = `Déconnexion`;
    logImg.src = "assets/images/log-out.svg";

    memberBtns.innerHTML = `<button type="button" id="display-profile">
          <img src="assets/images/user.svg" />
          <span>Ouvrir mon profil</span>
        </button>
        <button type="button" id="display-mailbox">
          <img src="assets/images/message-circle.svg" />
          <span>Messagerie privée</span>
        </button>
        <button type="button" id="display-notifications">
        <div id="notif-counter" class="is-hidden"></div>
          <img src="assets/images/bell.svg" />
          <span>Afficher les notifications</span>
        </button>`;

    memberList.classList.remove("is-hidden");
    updateNotificationCounter();
  }
}

export function clearPopups() {
  const popup = document.getElementById("opened-popup");

  if (popup) popup.remove();
}
