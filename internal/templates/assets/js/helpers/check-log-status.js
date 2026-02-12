import { SessionData } from "../variables.js";
import { displayHome } from "../page-creation/home-display.js";
/**
 * Vérifie si l'utilisateur est bien connecté pour l'affichage des pages
 * @returns {boolean} Utilisateur connecté = true
 */
export function isUserLoggedIn() {
  if (!SessionData.isLogged) {
    const popup = document.getElementById("auth-popup");
    popup.classList.remove("is-hidden");
    displayHome();
    return false;
  }
  return true;
}

/**
 * Récupère les données de session dans les cookies et met à jour SessionData si l'utilisateur est connecté
 */
export async function checkLoginStatus() {
  try {
    const response = await fetch("/api/me", {
      credentials: "include",
    });

    const data = await response.json();

    if (data.logged) {
      SessionData.isLogged = true;
      SessionData.username = data.username;
      SessionData.image = data.image;
    } else {
      SessionData.isLogged = false;
      SessionData.username = null;
      SessionData.image = null;
    }
  } catch (err) {
    console.error("Erreur lors de la vérification de session :", err);
    SessionData.isLogged = false;
    SessionData.username = null;
    SessionData.image = null;
  }
}
