import { displayHome } from "../page-creation/home-display.js";
import { displayProfile } from "../page-creation/profile.js";
import { displayError } from "../page-creation/errors.js";
import { SessionData } from "../variables.js";

// #region ***** Fonctions administratives sur les utilisateurs
/**
 * Gère le bannissement d'un utilisateur
 * @param {object} user Les données de l'utilisateur à bannir
 */
async function banUser(user) {
  console.log("Bannissement de l'utilisateur ", user.username);
  try {
    const response = await fetch(`/api/admin?mode=ban&userID=${user.id}`);

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (error) {
    console.log("Erreur dans le bannissement de l'utilisateur : ", error);
  }

  displayProfile(user.username);
}

/**
 * Gère le débannissement d'un utilisateur
 * @param {object} user Les données de l'utilisateur à débannir
 */
async function unbanUser(user) {
  console.log("Débannissement de l'utilisateur ", user.username);
  try {
    const response = await fetch(`/api/admin?mode=unban&userID=${user.id}`);

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (error) {
    console.log("Erreur dans le bannissement de l'utilisateur : ", error);
  }

  displayProfile(user.username);
}

/**
 * Popup de confirmation pour la suppression d'un compte d'utilisateur
 * @returns {boolean} Confirmation / Annulation de l'opération
 */
function deleteAccountConfirmation() {
  return new Promise((resolve) => {
    const popup = document.createElement("div");
    popup.id = "opened-popup";
    popup.className = "profile-popup-overlay";

    let question = "Voulez-vous vraiment supprimer votre compte ?";
    let note = "Vous perdrez l'accès au forum ainsi que toutes vos données.";

    if (SessionData.role == 1) {
      question = "Voulez-vous vraiment supprimer cet utilisateur ?";
      note = "Il perdra l'accès au forum ainsi que toutes ses données.";
    }

    popup.innerHTML = `
      <div class="profile-popup">
        <h3 style="text-align:center"><span style="color:var(--danger)">Attention ! Cette action est irréversible.</span> ${question}
        </h3>
        <div class="profile-popup-actions">
          <button id="profile-popup-cancel">Annuler</button>
          <button id="profile-popup-send">Confirmer</button>
          <center><i>${note}</i></center>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    popup.addEventListener("click", (event) => {
      const confirmBtn = event.target.closest("#profile-popup-send");
      if (confirmBtn) {
        popup.remove();
        resolve(true);
      }

      const cancelBtn =
        event.target.closest("#profile-popup-cancel") || event.target === popup;
      if (cancelBtn) {
        popup.remove();
        resolve(false);
      }
    });
  });
}

/**
 * Suppression d'un utilisateur de la base de données
 * @param {string} profileName Le nom de l'utilisateur à supprimer
 */
async function deleteAccount(profileName) {
  console.log("Suppression de l'utilisateur");
  const confirmed = await deleteAccountConfirmation();

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/admin?mode=delete&user=${profileName}`);
    if (!response.ok) {
      displayError(response.status);
      return;
    }

    window.location.reload();
    displayHome();
  } catch (e) {
    console.log("Erreur dans la suppression du  compte");
    displayError(500);
  }
}

// #endregion

export { banUser, unbanUser, deleteAccount };
