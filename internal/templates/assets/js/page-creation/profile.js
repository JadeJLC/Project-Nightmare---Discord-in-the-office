// Création de la page profil

import { SessionData } from "../variables/session-data.js";
import { displayHome } from "./home-display.js";

// Manque : récupération des variables dans la base de données
export function displayProfile() {
  clearPages("profile");
  const homeBtn = document.getElementById("go-home");
  homeBtn.style.display = "block";

  const usernameHeader = document.getElementById("header-username");
  usernameHeader.innerHTML = "";
  if (!SessionData.isLogged) {
    // Seul les membres connectés peuvent accéder aux profils
    console.log("Vous devez vous connecter pour ouvrir un profil");
    const popup = document.getElementById("auth-popup");
    popup.classList.remove("is-hidden");
    displayHome();
    return;
  } else {
    usernameHeader.innerHTML = "Visualiser un profil<br /> (Nom))";
  }

  let profilePageContainer = document.getElementById("profile-page");

  if (!profilePageContainer) {
    let addedContainer = `<div id="profile-page"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
    profilePageContainer = document.getElementById("profile-page");
  }

  profilePageContainer.innerHTML = `
      <div class="profile-left">
        <div class="profile-user-info">
          <div class="profile-icon">
            <img src="assets/images/cat_01.png" alt="Image de profil" />
          </div>
          <div class="profile-basics">
            <h3>
              <span class="profile-status online" alt="En ligne"></span>
              Pseudo
            </h3>
            <span class="profile-signup">Inscrit.e le DD/MM/YYYY</span>
          </div>
        </div>
        <br />
        <hr />
        <div id="profile-messages">
          <div id="profile-buttons">
            <button type="button" id="profile-mytopics" class="active">Sujets ouverts</button>
            <button type="button" id="profile-mymessages">Messages postés</button>
            <button type="button" id="profile-myreactions">Réactions</button>
          </div>
          <div id="profile-display-posts"></div>
        </div>
      </div>
      <div class="profile-right">
        <button type="button" class="edit-content">
          <img src="assets/images/tool.svg" />
          <span>Modifier mon profil</span>
        </button>
        <div class="profile-details">
          <span>Informations</span>
          <div class="profile-public">
            <p><span>Âge&nbsp;:</span> AA&nbsp;ans</p>
            <p><span>Genre&nbsp;:</span> F</p>
          </div>
          <hr />
          <div class="profile-private">
            <p><span>Né.e le&nbsp;:</span> DD/MM/YYYY</p>
            <p><span>Identité&nbsp;:</span> Prénom nom</p>
          </div>
        </div>
      </div>
   
         `;

  setProfileButtons();

  const profileDisplay = localStorage.getItem("profileDisplay") || "topics";
  if (profileDisplay === "reactions") {
    displayProfileReactions();
  } else if (profileDisplay === "messages") {
    displayProfileMessages();
  } else {
    displayProfileTopics();
  }
}

function displayProfileMessages() {
  let allReactions = [
    {
      topic_id: 0,
      topic_name: "Nom du sujet",
      post_id: 0,
      post_content: "Contenu du message",
      post_date: "01/01/2026",
    },
  ];

  const container = document.getElementById("profile-display-posts");
  container.innerHTML = ``;

  allReactions.forEach((message) => {
    const newMsg = document.createElement("div");
    newMsg.classList.add("profile-preview");
    newMsg.classList.add("preview-message");
    newMsg.innerHTML = `
            <h3 id="topic_${message.topic_id} message_${message.post_id}">Sur le sujet : ${message.topic_name}</h3>
            <div class="topic-content">
              <div class="topic-lastpost"> ${message.post_content} </div>
              <div class="topic-lastinfo">
                posté le ${message.post_date}
                <button type="button" class="button-link">
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button>
              </div>
            </div>
          </div>`;
    container.appendChild(newMsg);
  });
}

function displayProfileReactions() {
  let allReactions = [
    {
      reaction_image: "Juan.png",
      reaction_name: "Nom de la réaction",
      topic_id: 0,
      topic_name: "Nom du sujet",
      post_id: 0,
      post_content: "Contenu du message",
      post_author: "[pseudo]",
      post_date: "01/01/2026",
    },
  ];

  const container = document.getElementById("profile-display-posts");
  container.innerHTML = ``;

  allReactions.forEach((message) => {
    const newMsg = document.createElement("div");
    newMsg.classList.add("profile-preview");
    newMsg.classList.add("preview-message");
    newMsg.innerHTML = `
            <h3 id="topic_${message.topic_id} message_${message.post_id}">Sur le sujet : ${message.topic_name}</h3>
            <div class="preview-reaction">
              <img src="assets/avatars/${message.reaction_image}" alt="Réaction"/>
              <span>${message.reaction_name}</span>
            </div>
            <div class="topic-content">
              <div class="topic-lastpost"> ${message.post_content} </div>
              <div class="topic-lastinfo">
                message de ${message.post_author} le ${message.post_date}
                <button type="button" class="button-link">
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button>
              </div>
            </div>
          </div>`;
    container.appendChild(newMsg);
  });
}

function displayProfileTopics() {
  let allTopics = [
    {
      topic_id: 0,
      topic_name: "Nom du sujet",
      post_content: "Contenu du message",
      post_date: "01/01/2026",
    },
  ];

  const container = document.getElementById("profile-display-posts");
  container.innerHTML = ``;

  allTopics.forEach((topic) => {
    const newMsg = document.createElement("div");
    newMsg.classList.add("profile-preview");
    newMsg.classList.add("preview-topic");
    newMsg.innerHTML = `
            <h3 id="topic_${topic.topic_id}">
              ${topic.topic_name}
              <button type="button" class="button-link">
                <img
                  src="assets/images/external-link.svg"
                  alt="Voir le sujet"
                  title="Voir le sujet"
                />
              </button>
            </h3>
            <div class="topic-content">
              <div class="topic-lastpost">
                ${topic.post_content}
              </div>
              <div class="topic-lastinfo">ouvert le ${topic.post_date}</div>
            </div>
           `;
    container.appendChild(newMsg);
  });
}

// #region ***** Mise en place des boutons
function switchToReactions() {
  localStorage.setItem("profileDisplay", "reactions");
  displayProfile();
}

function switchToMessages() {
  localStorage.setItem("profileDisplay", "messages");
  displayProfile();
}

function switchToTopics() {
  localStorage.setItem("profileDisplay", "topics");
  displayProfile();
}

function setProfileButtons() {
  const topicBtn = document.getElementById("profile-mytopics");
  const messageBtn = document.getElementById("profile-mymessages");
  const reactionBtn = document.getElementById("profile-myreactions");

  topicBtn.addEventListener("click", switchToTopics);
  messageBtn.addEventListener("click", switchToMessages);
  reactionBtn.addEventListener("click", switchToReactions);

  const profileDisplay = localStorage.getItem("profileDisplay") || "topics";
  if (profileDisplay === "reactions") {
    topicBtn.classList.remove("active");
    reactionBtn.classList.add("active");
    messageBtn.classList.remove("active");
  } else if (profileDisplay === "messages") {
    topicBtn.classList.remove("active");
    reactionBtn.classList.remove("active");
    messageBtn.classList.add("active");
  } else {
    topicBtn.classList.add("active");
    reactionBtn.classList.remove("active");
    messageBtn.classList.remove("active");
  }
}

// #endregion
