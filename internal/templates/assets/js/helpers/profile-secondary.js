import { ws } from "../websockets/connect.js";
import { displayMailbox } from "../page-creation/chat.js";
import { openConversation } from "../websockets/private-message.js";
import { isUserLoggedIn } from "./check-log-status.js";
import { clearPopups } from "./clear-pages.js";
import { SessionData } from "../variables.js";
import { displayProfile } from "../page-creation/profile.js";
import { displayError } from "../page-creation/errors.js";

// #region ***** Modification des détails du profil
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
  if (data.username != profileName) return;

  try {
    const response = await fetch("/api/register?mode=edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      displayProfile(profileName);
    } else {
      displayError(response.status);
      return;
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
// #endregion

// #region ***** Modification d'avatar
/**
 * Ouvre une popup pour la modification d'avatar
 * @param {Object} user Informations de l'utilisateur dont on modifie le profil
 */
async function editProfileImage(user) {
  clearPopups();
  const response = await fetch("/api/avatars");

  if (!response.ok) {
    displayError(response.status);
    return;
  }

  const files = await response.json();

  const loggedName = SessionData.username;
  if (user.username != loggedName) return;

  const popup = document.createElement("div");
  popup.classList.add("profile-popup-overlay");
  popup.id = "opened-popup";
  popup.innerHTML = `
      <form method="post" id="profile-picture-change" class="profile-popup">
      <span class="close-popup-btn">&times;</span>
        <h3>Choisir un nouvel avatar
        <button type="submit" class="edit-content" id="confirm-picture">
          <img src="assets/images/check-circle.svg" />
          <span>Valider les modifications</span>
        </button>
        </h3>
        
        <div class="profile-picture-list"></div>
      </form>
    `;

  const pictureList = popup.querySelector(".profile-picture-list");
  const avaForm = popup.querySelector("#profile-picture-change");
  createImageList(pictureList, files, user);

  document.body.appendChild(popup);
  setPicturePopupButtons(popup, avaForm, user.username);
}

/**
 * Crée la liste des images sélectionnables dans la popup
 * @param {HTMLElement} pictureList La zone où sont affichées les images
 * @param {Arrau} files La liste des fichiers disponibles dans le dossier images-avatars
 * @param {object} user L'utilisateur à modifier
 */
function createImageList(pictureList, files, user) {
  files.forEach((fileName) => {
    const imageWrapper = document.createElement("div");

    imageWrapper.className = "profile-picture-bloc";
    const character = fileName.replace(".png", "");
    const checked = character == user.image ? "checked" : "";

    imageWrapper.innerHTML = `
    <input type="hidden" name="username" value="${user.username}">
    <input type="radio" id="${character}" value="${character}" name="image" ${checked}>
    
    <label for="${character}">${character}<br>
    <img src="/assets/images-avatar/${fileName}"/></label>
    `;
    pictureList.appendChild(imageWrapper);
  });
}

/**
 * Stocke la nouvelle image dans la base de données
 * @param {HTMLElement} avaForm Le formulaire où récupérer les données d'image
 * @returns
 */
async function updateProfilePicture(avaForm) {
  const profileName = SessionData.username;
  const data = Object.fromEntries(new FormData(avaForm).entries());
  if (data.username != profileName) return;

  try {
    const response = await fetch("/api/register?mode=avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      displayProfile(profileName);
    } else {
      displayError(response.status);
      return;
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
  }
}

/**
 * Installe les effets des boutons de la popup
 * @param {HTMLElement} popup La popup de changement d'avatar
 * @param {HTMLElement} avaForm Le formulaire où se trouvent les images
 */
function setPicturePopupButtons(popup, avaForm, username) {
  popup.addEventListener("click", (event) => {
    const closeBtn = event.target.closest(".close-popup-btn");
    if (closeBtn) {
      popup.remove();
    }

    if (event.target === popup) {
      popup.remove();
    }
  });

  avaForm.onsubmit = async (e) => {
    e.preventDefault();
    updateProfilePicture(avaForm);
    popup.remove();
    displayProfile(username);
  };
}
// #endregion

// #region ***** Envoyer un message privé
/**
 * Envoie un message privé via le profil de l'utilisateur
 * @param {string} targetUsername Nom de l'utilisateur à qui envoyer le message
 * @returns {Promise} Le message à envoyer
 */
function openDMPopup(targetUsername) {
  clearPopups();
  return new Promise((resolve, reject) => {
    // Création du wrapper
    const popup = document.createElement("div");
    popup.classList.add("profile-popup-overlay");
    popup.innerHTML = `
      <div class="profile-popup">
        <h3>Envoyer un message à ${targetUsername}</h3>
        <textarea id="profile-popup-text" placeholder="Écrire un message..."></textarea>
        <div class="profile-popup-actions">
          <button id="profile-popup-send">Envoyer</button>
          <button id="profile-popup-cancel">Annuler</button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    const textarea = popup.querySelector("#profile-popup-text");
    const btnCancel = popup.querySelector("#profile-popup-cancel");
    const btnSend = popup.querySelector("#profile-popup-send");

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

/**
 * Ouvrir une fenêtre de message pour l'envoyer à l'utilisateur connecté, puis ouvre la boîte MP
 * @param {string} targetId ID de l'utilisateur à qui envoyer le message
 * @param {string} targetUsername Nom de l'utilisateur
 */
async function initProfileDMButton(targetId, targetUsername) {
  try {
    const message = await openDMPopup(targetUsername);

    ws.send(
      JSON.stringify({
        type: "private_message",
        to: targetId,
        content: message,
      }),
    );

    displayMailbox()
      .then(() => openConversation(targetId))
      .then(() => {
        window.scrollTo(0, document.body.scrollHeight);
      });
  } catch (e) {
    return;
  }
}
// #endregion

export { editProfileDetails, editProfileImage, initProfileDMButton };
