import { displayProfile } from "../page-creation/profile.js";
import { displayError } from "../page-creation/errors.js";
import { SessionData, pageData } from "../variables.js";

// #region ***** Fonctions administratives sur les utilisateurs
/**
 * Gère le bannissement d'un utilisateur
 * @param {object} user Les données de l'utilisateur à bannir
 */
async function banUser(user) {
  try {
    const response = await fetch(`/api/admin?mode=ban&userID=${user.id}`);

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (error) {
    console.log("Erreur dans le bannissement de l'utilisateur : ", error);
    return;
  }

  displayProfile(user.username);
}

/**
 * Gère le débannissement d'un utilisateur
 * @param {object} user Les données de l'utilisateur à débannir
 */
async function unbanUser(user) {
  try {
    const response = await fetch(`/api/admin?mode=unban&userID=${user.id}`);

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (error) {
    console.log("Erreur dans le bannissement de l'utilisateur : ", error);
    return;
  }

  displayProfile(user.username);
}

/**
 * Popup de confirmation pour la suppression d'un compte d'utilisateur
 * @returns {boolean} Confirmation / Annulation de l'opération
 */
function deleteAccountConfirmation(profileName) {
  return new Promise((resolve) => {
    const popup = document.createElement("div");
    popup.id = "opened-popup";
    popup.className = "profile-popup-overlay";

    let question = "Voulez-vous vraiment supprimer votre compte ?";
    let note = "Vous perdrez l'accès au forum ainsi que toutes vos données.";

    if (SessionData.role <= 1 && SessionData.username != profileName) {
      question = "Voulez-vous vraiment supprimer cet utilisateur ?";
      note = "Il perdra l'accès au forum ainsi que toutes ses données.";
    }

    popup.innerHTML = `
      <div class="profile-popup">
        <h3 style="text-align:center"><span style="color:var(--danger)">Attention ! Cette action est irréversible.</span> ${question}
        </h3>
        <div class="profile-popup-actions">
          <button id="profile-popup-send">Confirmer</button>
          <button id="profile-popup-cancel">Annuler</button>
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
  const confirmed = await deleteAccountConfirmation(profileName);

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/admin?mode=delete&user=${profileName}`);
    if (!response.ok) {
      displayError(response.status);
      return;
    }
    pageData.currentPage = "home";
    window.location.reload();
  } catch (e) {
    console.log("Erreur dans la suppression du  compte");
    displayError(500);
  }
}

function promoteAdminConfirmation() {
  return new Promise((resolve) => {
    const popup = document.createElement("div");
    popup.id = "opened-popup";
    popup.className = "profile-popup-overlay";

    popup.innerHTML = `
      <div class="profile-popup">
        <h3 style="text-align:center"><span style="color:var(--danger)">Attention ! Ce rôle confère des droits importants sur le forum</span> 
        <br/>
        Voulez-vous vraiment promouvoir ce membre au rang d'aministrateur ?
        </h3>
        <div class="profile-popup-actions" style="margin-top:50px">
          <button id="profile-popup-send">Confirmer</button>
          <button id="profile-popup-cancel">Annuler</button>
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

function promoteUser(user) {
  if (SessionData.role > 1) {
    displayError(403);
    return;
  }

  const popup = document.createElement("div");
  popup.id = "opened-popup";
  popup.className = "profile-popup-overlay";

  popup.innerHTML = `
      <div class="profile-popup">
        <h3 style="text-align:center">Choisissez le nouveau rôle de l'utilisateur
        </h3>
        <div class="profile-popup-actions">
          ${SessionData.role == 0 && user.role != 1 ? `<button id="profile-popup-admin">Administrateur</button>` : ""}
         ${
           user.role != 2
             ? `<button id="profile-popup-modo">Modérateur</button>`
             : ""
         }
             ${
               user.role != 3
                 ? `<button id="profile-popup-member">Simple membre</button>`
                 : ""
             } 
          <button id="profile-popup-cancel">Annuler</button>
        </div>
      </div>
    `;

  document.body.appendChild(popup);

  popup.addEventListener("click", async (event) => {
    const adminBtn = event.target.closest("#profile-popup-admin");
    if (adminBtn) {
      popup.remove();
      await makeUserAdmin(user);
      return;
    }

    const cancelBtn =
      event.target.closest("#profile-popup-cancel") || event.target === popup;
    if (cancelBtn) {
      popup.remove();
    }

    const modoBtn = event.target.closest("#profile-popup-modo");
    if (modoBtn) {
      changeUserRole(user, 2);
      popup.remove();
      return;
    }

    const memberBtn = event.target.closest("#profile-popup-member");
    if (memberBtn) {
      changeUserRole(user, 3);
      popup.remove();
      return;
    }
  });
}

async function makeUserAdmin(user) {
  const confirmed = await promoteAdminConfirmation();
  if (!confirmed) return;

  changeUserRole(user, 1);
}

async function changeUserRole(user, role) {
  try {
    const response = await fetch(
      `/api/admin?mode=promote&role=${role}&userID=${user.id}`,
    );

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (e) {
    console.log("Erreur dans le changement de rôle de l'utilisateur");
    displayError(500);
    return;
  }
  displayProfile(user.username, "newrole");
}
// #endregion

export { banUser, unbanUser, deleteAccount, promoteUser };
