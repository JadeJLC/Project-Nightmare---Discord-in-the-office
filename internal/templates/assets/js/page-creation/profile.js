import { SessionData, pageData } from "../variables.js";
import { clearPages } from "../helpers/clear-pages.js";
import { isUserLoggedIn } from "../helpers/check-log-status.js";
import { displayPosts } from "./topic.js";
import { decodeHTML } from "../helpers/text-formating.js";
import {
  editProfileDetails,
  editProfileImage,
} from "../helpers/profile-secondary.js";
import { initProfileDMButton } from "../helpers/profile-secondary.js";
import { selectPage } from "../helpers/call-page.js";
import { displayError } from "./errors.js";
import {
  banUser,
  unbanUser,
  deleteAccount,
  promoteUser,
} from "../helpers/admin-functions.js";

// #region ***** Affichage des informations utilisateur

/**
 * Fonction-mère pour la création du HTML de la page profil (conteneur, header, appel de fonction)
 * @param {string} profileName Nom de l'utilisateur dont on affiche le profil
 */
export function displayProfile(profileName, mode) {
  pageData.previousPage = pageData.currentPage;
  pageData.currentPage = `profile-${profileName}`;

  clearPages();

  const usernameHeader = document.getElementById("header-username");

  if (!isUserLoggedIn()) {
    displayError(401);
    return;
  }

  if (typeof profileName !== "string" || !profileName)
    profileName = SessionData.username;

  usernameHeader.innerHTML = `Profil de ${profileName}`;

  let profilePageContainer = document.getElementById("profile-page");

  if (!profilePageContainer) {
    let addedContainer = `<div id="profile-page"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
  }

  writeUserProfile(profileName, SessionData.username, mode);
}

/**
 * Génère le HTML du profil de l'utilisateur à partir des informations de la BDD
 * @param {string} profile Nom de l'utilisateur dont on consulte le profil
 * @param {string} logged Nom de l'utilisateur connecté
 * @param {string} mode Le mode d'ouverture (normal ou "switchprofile" pour ne changer que la partie des messages)
 */
async function writeUserProfile(profile, logged, mode) {
  try {
    const response = await fetch(
      `/api/profile?profile=${profile}&user=${logged}`,
    );
    if (!response.ok) {
      displayError(response.status);
      return;
    }

    const user = await response.json();
    buildProfileHTML(user, logged);
    setProfileButtons(user.email, user);

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
  <button class="go-back" id="go-back" style="margin:0px 20px">
  <img src="/assets/images/arrow-left.svg"/><span>Revenir en arrière</span></button>
      <div class="profile-left">
        <div class="profile-user-info">
          <div class="profile-icon">
            <img id="profile-image" src="assets/images-avatar/${user.image}.png" data-character="${user.image}" alt="Image de profil : ${user.image}"/>
            <button type="button" class="edit-content is-hidden" id="edit-avatar">
          <img src="assets/images/images.svg" />
          <span>Changer d'image</span>
        </button>
            
          </div>
          <div class="profile-basics">
            <h3>
              ${user.username}
            </h3>
            <span class="profile-signup">Inscrit.e le ${user.inscription}</span>
            ${
              SessionData.role <= 1 && user.role == 4
                ? `<span class="profile-signup" style="color:var(--danger)">Utilisateur banni</span>`
                : `
          ${user.role == 0 ? `<span class="profile-signup">Compte fondateur</span>` : ""}
          ${user.role == 1 ? `<span class="profile-signup">Admin</span>` : ""}
          ${user.role == 2 ? `<span class="profile-signup">Modo</span>` : ""}
        `
            }
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
  ${
    (SessionData.role == 0 && user.role != 4 && user.role != 0) ||
    (SessionData.role == 1 && user.role != 4 && user.role > 1)
      ? `<button type="button" class="edit-content" id="ban-user">
          <img src="assets/images/${SessionData.username == "Panna" ? "gavel" : "scale"}.svg" />
          <span>Bannir l'utilisateur</span>
        </button>`
      : ""
  }
   ${
     SessionData.role <= 1 && user.role == 4
       ? `<button type="button" class="edit-content" id="unban-user">
          <img src="assets/images/key.svg" />
          <span>Débannir l'utilisateur</span>
        </button>`
       : ""
   }
        <div class="profile-details">
          <span>Informations</span>
          <div class="profile-public">
            <p><span>Âge&nbsp;:</span> ${user.age}&nbsp;ans</p>
            <p><span>Genre&nbsp;:</span> ${user.genre}</p>
          </div>
          ${
            (SessionData.role == 0 && user.role != 0) ||
            (SessionData.role == 1 && user.role > 1)
              ? `<button type="button" class="edit-content" id="delete-account">
          <img src="assets/images/x.svg" />
          <span>Supprimer le compte</span>
        </button>
        <button type="button" class="edit-content" id="promote-user">
          <img src="assets/images/promote.svg" />
          <span>Modifier le rôle</span>
        </button>`
              : ""
          }
        </div>
        ${
          SessionData.role != 4
            ? `<div id="profile-buttons">
          <button type="button" id="send-dm-btn">Envoyer un message</button>
              </div>
            </div>`
            : ""
        }`;
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
          <img src="assets/images/user-pen.svg" />
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
            <p><span>Genre&nbsp;:</span> <input class="is-hidden" type="text" name="genre" value="${decodeHTML(user.genre)}" id="profile-gender-input"><span id="profile-gender-span">${user.genre}</span></p>
          </div>
          <hr />
          <div class="profile-private">
            <p><span>Email&nbsp;:</span><input class="is-hidden" type="text" name="email" value="${decodeHTML(user.email)}" id="profile-email-input"> <span id="profile-email-span">${user.email}</span></p>
            <p><span>Identité&nbsp:</span>
            <input class="is-hidden" type="text" name="firstname" value="${decodeHTML(user.firstname)}" id="profile-first-input"><span id="profile-first-span"> ${user.firstname}</span>
            <input class="is-hidden" type="text" name="lastname" value="${decodeHTML(user.lastname)}" id="profile-last-input"><span id="profile-last-span"> ${user.lastname}</span></p>
          </div>
        </div>
        ${
          SessionData.role != 0
            ? `<button type="button" class="edit-content" id="delete-account">
          <img src="assets/images/x.svg" />
          <span>Supprimer mon compte</span>
        </button>`
            : ""
        }
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
      displayError(response.status);
      return;
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
            <h3 class="on-topic" data-topicid="${message.topic_id}">Sur le sujet : ${message.topic_title}</h3>
            <div class="topic-content">
              <div class="topic-lastpost"> ${message.content} </div>
              <div class="topic-lastinfo">
                posté le ${message.created_on}
                <button type="button" class="button-link last-post" data-topicid="${message.topic_id}" data-postid="${message.post_id}">
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
      displayError(response.status);
      return;
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

    const posts = await Promise.all(
      allReactions.map(async (message) => {
        const reactionBlocs = message.reaction_list
          .map(
            (type) =>
              `<div class="reaction-bloc"><img src="assets/images-reactions/${type}.png" alt="${type}"/></div>`,
          )
          .join("");

        return `<div class="profile-preview preview-message">
      <h3 class="on-topic" data-topicid="${message.topic_id}">Sur le sujet : ${message.topic_title}</h3>
      
      <div class="topic-content">
        <div class="topic-lastpost preview-reactions"> ${message.content} 
         <div class="post-reactions">${reactionBlocs}</div>
        </div>
        <div class="topic-lastinfo">
          message de <span class="last-post-author" data-author="${message.author}">${message.author}</span> le ${message.created_on}
          <button type="button" class="button-link last-post" data-catid=${message.cat_id} data-topicid="${message.topic_id}" data-postid="${message.post_id}">
            <img src="assets/images/external-link.svg" alt="Voir le message" title="Voir le message"/>
          </button>
        </div>
      </div>
    </div>`;
      }),
    );

    container.innerHTML = posts.join("");
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
      displayError(response.status);
      return;
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

// #endregion

// #region ***** Mise en place des boutons
/**
 * Passe en affichage "liste des réactions"
 * @param {string} profileName Nom de l'utilisateur
 */
function switchToReactions(profileName) {
  localStorage.setItem("profileDisplay", "reactions");
  displayProfile(profileName, "switchprofile");
}

/**
 * Passe en affichage "liste des messages"
 * @param {string} profileName Nom de l'utilisateur
 */
function switchToMessages(profileName) {
  localStorage.setItem("profileDisplay", "messages");
  displayProfile(profileName, "switchprofile");
  editProfileImage(profileName);
}

/**
 * Passe en affichage "liste des sujets"
 * @param {string} profileName Nom de l'utilisateur
 */
function switchToTopics(profileName) {
  localStorage.setItem("profileDisplay", "topics");
  displayProfile(profileName, "switchprofile");
}

/**
 * Active les effets de clic sur les boutons du profil. un seul event listener sur toute la page pour économiser les performances
 * @param {string} status Pour l'envoi à la fonction des boutons
 * @param {object} user Utilisateur concerné
 */
function setProfileButtons(status, user) {
  const profileName = user.username;
  const profileID = user.id;

  let profilePageContainer = document.getElementById("profile-page");

  if (profilePageContainer.dataset.listenerAttached) return;

  profilePageContainer.addEventListener("click", (event) => {
    const dmBtn = event.target.closest("#send-dm-btn");
    if (dmBtn) initProfileDMButton(profileID, profileName);

    const topicBtn = event.target.closest("#profile-mytopics");
    if (topicBtn) switchToTopics(profileName);

    const messageBtn = event.target.closest("#profile-mymessages");
    if (messageBtn) switchToMessages(profileName);

    const reactionBtn = event.target.closest("#profile-myreactions");
    if (reactionBtn) switchToReactions(profileName);

    const editBtn = event.target.closest("#edit-infos");
    if (editBtn && status != "Not Available") {
      editProfileDetails();
    }

    const delBtn = event.target.closest("#delete-account");
    if (
      (delBtn && status != "NotAvailable") ||
      (delBtn && SessionData.role <= 1)
    ) {
      deleteAccount(user.username);
    }

    const promoteBtn = event.target.closest("#promote-user");
    if (promoteBtn) {
      promoteUser(user);
    }

    const goBack = event.target.closest("#go-back");
    if (goBack) {
      selectPage("back");
    }

    const banBtn = event.target.closest("#ban-user");
    if (banBtn) {
      banUser(user);
    }

    const unbanBtn = event.target.closest("#unban-user");
    if (unbanBtn) {
      unbanUser(user);
    }

    const editAvatarBtn = event.target.closest("#edit-avatar");

    if (editAvatarBtn && status != "Not Available") {
      const avaName =
        document.getElementById("profile-image").dataset.character;

      editProfileImage({ ...user, image: avaName });
    }

    const profForm = document.getElementById("profile-form");
    if (profForm && status != "Not Available") {
      profForm.onsubmit = async (e) => {
        e.preventDefault();
        editProfileDetails("valider");
      };
    }

    const seeTopic = event.target.closest(".on-topic");
    if (seeTopic) {
      const topicID = seeTopic.dataset.topicid;
      displayPosts(topicID);
    }

    const seeLastPost = event.target.closest(".last-post");
    if (seeLastPost) {
      const topicID = seeLastPost.dataset.topicid;
      const postID = seeLastPost.dataset.postid;
      displayPosts(topicID, postID);
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
 * Gère l'affichage de tous les boutons du profil
 * Réaction / Messages / Topics mis en évidence selon le mode d'affichage
 * Modification d'avatar masquée ou afficher selon le profil consulté
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
