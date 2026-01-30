// Création de la page profil

import { SessionData } from "../variables/session-data.js";
import { displayHome } from "./home-display.js";
import { clearPages } from "./clear-pages.js";

async function writeUserProfile(profile, logged) {
  try {
    const response = await fetch(
      `/api/profile?profile=${profile}&user=${logged}`,
    );
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const user = await response.json();

    const profilePageContainer = document.getElementById("profile-page");

    profilePageContainer.innerHTML = `
      <div class="profile-left">
        <div class="profile-user-info">
          <div class="profile-icon">
            <img src="assets/images-avatar/${user.image}.png" alt="Image de profil - ${user.image}"/>
          </div>
          <div class="profile-basics">
            <h3>
              <!-- <span class="profile-status online" alt="En ligne"></span> -->
              ${user.username}
            </h3>
            <span class="profile-signup">Inscrit.e le ${user.inscription}</span>
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
      
          `;

    if (user.email !== "Not Available") {
      profilePageContainer.innerHTML += `<div class="profile-right"><button type="button" class="edit-content">
          <img src="assets/images/tool.svg" />
          <span>Modifier mon profil</span>
        </button>
        <div class="profile-details">
          <span>Informations</span>
          <div class="profile-public">
            <p><span>Âge&nbsp;:</span> ${user.age}&nbsp;ans</p>
            <p><span>Genre&nbsp;:</span> ${user.genre}</p>
          </div>
          <hr />
          <div class="profile-private">
            <p><span>Email&nbsp;:</span> <span id="profile-email">${user.email}</span></p>
            <p><span>Identité&nbsp;:</span> ${user.firstname} ${user.lastname}</p>
          </div>
        </div>
      </div>`;
    } else {
      profilePageContainer.innerHTML += `<div class="profile-right">
        <div class="profile-details">
          <span>Informations</span>
          <div class="profile-public">
            <p><span>Âge&nbsp;:</span> ${user.age}&nbsp;ans</p>
            <p><span>Genre&nbsp;:</span> ${user.genre}</p>
          </div>
        </div>
      </div>`;
    }

    setProfileButtons();

    const profileDisplay = localStorage.getItem("profileDisplay") || "topics";
    if (profileDisplay === "reactions") {
      displayProfileReactions(profile);
    } else if (profileDisplay === "messages") {
      displayProfileMessages(profile);
    } else {
      displayProfileTopics(profile);
    }
  } catch (error) {
    console.log("Erreur dans la récupération du profil : ", error);
  }
}

// Manque : récupération des variables dans la base de données
export function displayProfile(profileName) {
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
    if (typeof profileName !== "string" || !profileName)
      profileName = SessionData.username;

    usernameHeader.innerHTML = `Profil de ${profileName}`;
  }

  let profilePageContainer = document.getElementById("profile-page");

  if (!profilePageContainer) {
    let addedContainer = `<div id="profile-page"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
  }

  writeUserProfile(profileName, SessionData.username);
}

async function displayProfileMessages(profileName) {
  try {
    const response = await fetch(
      `/api/profile?profile=${profileName}&mode=message`,
    );
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const allMessages = await response.json();

    const container = document.getElementById("profile-display-posts");
    container.innerHTML = ``;

    allMessages.forEach((message) => {
      if (message.content === "Nothing to Display") {
        console.log("Aucun message");
        const noTopic = document.createElement("div");
        noTopic.className = "feed-notopic";
        noTopic.innerHTML = `Aucun sujet correspondant à votre recherche n'a été trouvé`;
        container.appendChild(noTopic);
      } else {
        const newMsg = document.createElement("div");
        newMsg.classList.add("profile-preview");
        newMsg.classList.add("preview-message");
        newMsg.innerHTML = `
            <h3>Sur le sujet : ${message.topic_title}</h3>
            <div class="topic-content">
              <div class="topic-lastpost"> ${message.content} </div>
              <div class="topic-lastinfo">
                posté le ${message.created_on}
                <button type="button" class="button-link" id="topic_${message.topic_id} message_${message.post_id}">
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
      }
    });
  } catch (error) {
    console.log("Erreur dans la récupération des messages : ", error);
  }
}

async function displayProfileReactions(profileName) {
  try {
    const response = await fetch(
      `/api/profile?profile=${profileName}&mode=message`,
    );
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const allReactions = await response.json();

    const container = document.getElementById("profile-display-posts");
    container.innerHTML = ``;

    allReactions.forEach((message) => {
      if (message.reaction_type === "Nothing to Display") {
        console.log("Aucun message");
        const noTopic = document.createElement("div");
        noTopic.className = "feed-notopic";
        noTopic.innerHTML = `Aucun sujet correspondant à votre recherche n'a été trouvé`;
        container.appendChild(noTopic);
      } else {
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
      }
    });
  } catch (error) {
    console.log("Erreur dans la récupération des messages : ", error);
  }
}

function displayProfileTopics(profileName) {
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
