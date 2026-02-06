import { SessionData } from "../variables.js";
import { clearPages } from "../helpers/clear-pages.js";
import { isUserLoggedIn } from "../helpers/check-log-status.js";
import { displayPosts } from "./topic.js";
import { ws } from "../websockets/connect.js";

// #region ***** Affichage des informations utilisateur

/**
 * Fonction-mère pour la création du HTML de la page profil (conteneur, header, appel de fonction)
 * @param {string} profileName Nom de l'utilisateur dont on affiche le profil
 */
export function displayProfile(profileName) {
  clearPages("profile");

  const usernameHeader = document.getElementById("header-username");

  if (!isUserLoggedIn()) return;

  if (typeof profileName !== "string" || !profileName)
    profileName = SessionData.username;

  usernameHeader.innerHTML = `Profil de ${profileName}`;

  let profilePageContainer = document.getElementById("profile-page");

  if (!profilePageContainer) {
    let addedContainer = `<div id="profile-page"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
  }

  writeUserProfile(profileName, SessionData.username);
}

/**
 * Génère le HTML du profil de l'utilisateur à partir des informations de la BDD
 * @param {string} profile Nom de l'utilisateur dont on consulte le profil
 * @param {string} logged Nom de l'utilisateur connecté
 */
async function writeUserProfile(profile, logged) {
  try {
    const response = await fetch(
      `/api/profile?profile=${profile}&user=${logged}`,
    );
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const user = await response.json();

    buildProfileHTML(user, logged);
    setProfileButtons(user.email, profile, user.id);

    activateButton(user.email);

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

/**
 * Construit le HTML pour l'affichage d'un profil
 * @param {object} user L'utilisateur dont on affiche le profil
 */
function buildProfileHTML(user) {
  const profilePageContainer = document.getElementById("profile-page");
  const userDetails =
    user.email === "Not Available"
      ? buildOtherDetails(user)
      : buildSelfDetails(user);

  profilePageContainer.innerHTML = `
      <div class="profile-left">
        <div class="profile-user-info">
          <div class="profile-icon">
            <img id="profile-image" src="assets/images-avatar/${user.image}.png" alt="Image de profil - ${user.image}"/>
            <button type="button" class="edit-content is-hidden" id="edit-avatar">
          <img src="assets/images/tool.svg" />
          <span>Changer d'image</span>
        </button>
            
          </div>
          <div class="profile-basics">
            <h3>
              <!-- <span class="profile-status online" alt="En ligne"></span> -->
              ${user.username}
            </h3>
            <span class="profile-signup">Inscrit.e le ${user.inscription}</span>
          </div>
        </div>
        <div id="profile-buttons">
          <button type="button" id="send-dm-btn">Envoyer un message</button>
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
      ${userDetails}
          `;
}

/**
 * Génère la partie "détails" quand on ouvre le profil d'un autre utilisateur
 * @param {object} user L'utilisateur dont on affiche le profil
 * @param {HTMLElement} profilePageContainer Le conteneur HTML de la page du profil
 */
function buildOtherDetails(user) {
  return `<div class="profile-right">
        <div class="profile-details">
          <span>Informations</span>
          <div class="profile-public">
            <p><span>Âge&nbsp;:</span> ${user.age}&nbsp;ans</p>
            <p><span>Genre&nbsp;:</span> ${user.genre}</p>
          </div>
        </div>
      </div>`;
}

/**
 * Génère la partie "détails" quand on ouvre son propre profil
 * @param {object} user L'utilisateur dont on affiche le profil
 * @param {HTMLElement} profilePageContainer Le conteneur HTML de la page du profil
 */
function buildSelfDetails(user) {
  return `<form class="profile-right" method="post" id="profile-form">      
      <input type="hidden" name="username" value="${user.username}">
      <button type="button" class="edit-content" id="edit-infos">
          <img src="assets/images/tool.svg" />
          <span>Modifier mon profil</span>
        </button>
        <button type="submit" class="edit-content is-hidden" id="confirm-edit">
          <img src="assets/images/check-circle.svg" />
          <span>Valider les modifications</span>
        </button>
        <div class="profile-details">
          <span>Informations</span>
          <div class="profile-public">
            <p><span>Âge&nbsp;:</span> ${user.age}&nbsp;ans</p>
            <p><span>Genre&nbsp;:</span> <input class="is-hidden" type="text" name="genre" value="${user.genre}" id="profile-gender-input"><span id="profile-gender-span">${user.genre}</span></p>
          </div>
          <hr />
          <div class="profile-private">
            <p><span>Email&nbsp;:</span><input class="is-hidden" type="text" name="email" value="${user.email}" id="profile-email-input"> <span id="profile-email-span">${user.email}</span></p>
            <p><span>Identité&nbsp:</span>
            <input class="is-hidden" type="text" name="firstname" value="${user.firstname}" id="profile-first-input"><span id="profile-first-span"> ${user.firstname}</span>
            <input class="is-hidden" type="text" name="lastname" value="${user.lastname}" id="profile-last-input"><span id="profile-last-span"> ${user.lastname}</span></p>
          </div>
        </div>
      </form>`;
}

// #endregion

// #region ***** Affichage des messages

/**
 * Génère la liste des messages postés par l'utilisateur sur le forum
 * @param {string} profileName Nom de l'utilisateur
 */
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

    if (
      allMessages.length === 0 ||
      allMessages[0].content === "Nothing to Display"
    ) {
      container.innerHTML = `<div class="feed-notopic">Aucun sujet correspondant à votre recherche n'a été trouvé</div>`;
      return;
    }

    container.innerHTML = allMessages
      .map(
        (message) =>
          `<div class="profile-preview preview-message">
            <h3 class="on-topic" data-catid=${message.cat_id} data-topicid="${message.topic_id}">Sur le sujet : ${message.topic_title}</h3>
            <div class="topic-content">
              <div class="topic-lastpost"> ${message.content} </div>
              <div class="topic-lastinfo">
                posté le ${message.created_on}
                <button type="button" class="button-link last-post" data-catid=${message.cat_id} data-topicid="${message.topic_id}" data-postid="${message.post_id}">
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button>
              </div>
            </div>
          </div>
          </div>`,
      )
      .join("");
  } catch (error) {
    console.log("Erreur dans la récupération des messages : ", error);
  }
}

/**
 * Génère la liste des messages auquel l'utilisateur a réagi
 * @param {string} profileName Nom de l'utilisateur
 */
async function displayProfileReactions(profileName) {
  try {
    const response = await fetch(
      `/api/profile?profile=${profileName}&mode=reactions`,
    );
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const allReactions = await response.json();

    const container = document.getElementById("profile-display-posts");
    container.innerHTML = ``;

    if (
      allReactions.length === 0 ||
      allReactions[0].topic_title === "Nothing to Display"
    ) {
      container.innerHTML = `<div class="feed-notopic">Aucun sujet correspondant à votre recherche n'a été trouvé</div>`;
      return;
    }

    container.innerHTML = allReactions
      .map(
        (message) =>
          `<div class="profile-preview preview-message">
            <h3 class="on-topic" data-topicid="${message.topic_id}">Sur le sujet : ${message.topic_name}</h3>
            <div class="preview-reaction">
              <img src="assets/avatars/${message.reaction_image}" alt="Réaction"/>
              <span>${message.reaction_name}</span>
            </div>
            <div class="topic-content">
              <div class="topic-lastpost"> ${message.post_content} </div>
              <div class="topic-lastinfo">
                message de <span class="last-post-author" data-author="${message.post_author}">${message.post_author}</span> le ${message.post_date}
                <button type="button" class="button-link last-post" data-catid=${message.cat_id} data-topicid="${message.topic_id}" data-postid="${message.post_id}">
                  <img
                    src="assets/images/external-link.svg"
                    alt="Voir le message"
                    title="Voir le message"
                  />
                </button>
              </div>
            </div>
          </div>
          </div>`,
      )
      .join("");
  } catch (error) {
    console.log("Erreur dans la récupération des messages : ", error);
  }
}

/**
 * Génère la liste des sujets ouverts par l'utilisateur sur le forum
 * @param {string} profileName Nom de l'utilisateur
 */
async function displayProfileTopics(profileName) {
  try {
    const response = await fetch(
      `/api/profile?profile=${profileName}&mode=topics`,
    );
    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const allTopics = await response.json();

    const container = document.getElementById("profile-display-posts");
    container.innerHTML = ``;

    if (
      allTopics.length === 0 ||
      allTopics[0].topic_title === "Nothing to Display"
    ) {
      container.innerHTML = `<div class="feed-notopic">Aucun sujet correspondant à votre recherche n'a été trouvé</div>`;
      return;
    }

    container.innerHTML = allTopics
      .map(
        (topic) =>
          `<div class="profile-preview preview-topic">
             <h3 data-catid = "${topic.cat_id}" data-topicid="${topic.topic_id}" class="on-topic">
              ${topic.topic_title}
              <button type="button" class="button-link on-topic" data-topicid="${topic.topic_id}">
                <img
                  src="assets/images/external-link.svg"
                  alt="Voir le sujet"
                  title="Voir le sujet"
                />
              </button>
            </h3>
            <div class="topic-content">
              <div class="topic-lastpost">
                ${topic.content}
              </div>
              <div class="topic-lastinfo">ouvert le ${topic.created_on}</div>
            </div>
          </div>`,
      )
      .join("");
  } catch (error) {
    console.log("Erreur dans la récupération des messages : ", error);
  }
}

// #region

// #region ***** Mise en place des boutons
/**
 * Passe en affichage "liste des réactions"
 * @param {string} profileName Nom de l'utilisateur
 */
function switchToReactions(profileName) {
  localStorage.setItem("profileDisplay", "reactions");
  displayProfile(profileName);
}

/**
 * Passe en affichage "liste des messages"
 * @param {string} profileName Nom de l'utilisateur
 */
function switchToMessages(profileName) {
  localStorage.setItem("profileDisplay", "messages");
  displayProfile(profileName);
}

/**
 * Passe en affichage "liste des sujets"
 * @param {string} profileName Nom de l'utilisateur
 */
function switchToTopics(profileName) {
  localStorage.setItem("profileDisplay", "topics");
  displayProfile(profileName);
}

/**
 * Active les effets de clic sur les boutons du profil
 * @param {string} status Pour l'envoi à la fonction des boutons
 * @param {string} profileName Nom de l'utilisateur
 */
function setProfileButtons(status, profileName, profilId) {
  let profilePageContainer = document.getElementById("profile-page");

  if (profilePageContainer.dataset.listenerAttached) return;

  profilePageContainer.addEventListener("click", (event) => {
    const dmBtn = event.target.closest("#send-dm-btn");
    if (dmBtn) initProfileDMButton(profilId, profileName);

    const topicBtn = event.target.closest("#profile-mytopics");
    if (topicBtn) switchToTopics(profileName);

    const messageBtn = event.target.closest("#profile-mymessages");
    if (messageBtn) switchToMessages(profileName);

    const reactionBtn = event.target.closest("#profile-myreactions");
    if (reactionBtn) switchToReactions(profileName);

    const editBtn = event.target.closest("#edit-infos");
    if (editBtn) {
      editProfileDetails();
    }

    const profForm = document.getElementById("profile-form");
    if (profForm)
      profForm.onsubmit = async (e) => {
        e.preventDefault();
        editProfileDetails("valider");
      };

    const seeTopic = event.target.closest(".on-topic");
    if (seeTopic) {
      const catID = seeTopic.dataset.catid;
      const topicID = seeTopic.dataset.topicid;
      displayPosts(catID, topicID);
    }

    const seeLastPost = event.target.closest(".last-post");
    if (seeLastPost) {
      const catID = seeLastPost.dataset.catid;
      const topicID = seeLastPost.dataset.topicid;
      const postID = seeLastPost.dataset.postid;
      displayPosts(catID, topicID, postID);
    }

    const author = event.target.closest(".last-post-author");
    if (author) {
      const username = author.dataset.author;
      displayProfile(username);
    }
  });

  profilePageContainer.dataset.listenerAttached = "true";
}

/**
 * Gère l'affichage des boutons
 * @param {string} status "Not Available" si on affiche le profil de quelqu'un d'autre
 */
function activateButton(status) {
  const avaBtn = document.getElementById("edit-avatar");
  if (avaBtn && status != "Not Available") avaBtn.classList.remove("is-hidden");

  const reactionBtn = document.getElementById("profile-myreactions");
  const messageBtn = document.getElementById("profile-mymessages");
  const topicBtn = document.getElementById("profile-mytopics");
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

// #region ***** Modification du profil
/**
 * Permet à l'utilisateur de modifier les détails de son profil (mail, noms, age, genre)
 * @param {string} mode Si indiqué : le mode "valider" envoie dans la base de données
 */
async function editProfileDetails(mode) {
  if (!isUserLoggedIn()) return;
  displayEditForm();

  if (mode != "valider") return;

  const profileName = SessionData.username;
  const profForm = document.getElementById("profile-form");
  const data = Object.fromEntries(new FormData(profForm).entries());

  try {
    const response = await fetch("/api/register?mode=edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      displayProfile(profileName);
    } else {
      alert("Erreur : " + (await response.text()));
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
  }
}

/**
 * Affiche ou masque les champs d'édition du profil quand on clique sur le bouton
 */
function displayEditForm() {
  document.getElementById("profile-gender-span").classList.toggle("is-hidden");
  document.getElementById("profile-email-span").classList.toggle("is-hidden");
  document.getElementById("profile-first-span").classList.toggle("is-hidden");
  document.getElementById("profile-last-span").classList.toggle("is-hidden");
  document.getElementById("edit-infos").classList.toggle("is-hidden");

  document.getElementById("profile-gender-input").classList.toggle("is-hidden");
  document.getElementById("profile-email-input").classList.toggle("is-hidden");
  document.getElementById("profile-first-input").classList.toggle("is-hidden");
  document.getElementById("profile-last-input").classList.toggle("is-hidden");
  document.getElementById("confirm-edit").classList.toggle("is-hidden");
}

function openDMPopup(targetUsername) {
  return new Promise((resolve, reject) => {
    // Création du wrapper
    const popup = document.createElement("div");
    popup.classList.add("dm-popup-overlay");
    popup.innerHTML = `
      <div class="dm-popup">
        <h3>Envoyer un message à ${targetUsername}</h3>
        <textarea id="dm-popup-text" placeholder="Écrire un message..."></textarea>
        <div class="dm-popup-actions">
          <button id="dm-popup-cancel">Annuler</button>
          <button id="dm-popup-send">Envoyer</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    const textarea = popup.querySelector("#dm-popup-text");
    const btnCancel = popup.querySelector("#dm-popup-cancel");
    const btnSend = popup.querySelector("#dm-popup-send");

    btnCancel.addEventListener("click", () => {
      popup.remove();
      reject("cancelled");
    });

    btnSend.addEventListener("click", () => {
      const text = textarea.value.trim();
      if (!text) return;

      popup.remove();
      resolve(text);
    });
  });
}

export async function initProfileDMButton(targetId, targetUsername) {
  try {
    // 1. Ouvrir le pop-up et attendre le message
    const message = await openDMPopup(targetUsername);

    // 2. Envoyer via WebSocket
    ws.send(
      JSON.stringify({
        type: "private_message",
        to: targetId,
        content: message,
      }),
    );

    // 3. Redirection vers la messagerie
    window.location.href = `/messagerie?user=${targetId}`;
  } catch (e) {
    // L'utilisateur a annulé → on ne fait rien
  }
}

// #endregion
