import { SessionData } from "../variables.js";
import { injectpopupHTML, switchToLogin } from "./login-popup.js";
import { displayError } from "./errors.js";

/**
 * Gestion de la déconnexion des utilisateurs
 */
export async function logOut() {
  try {
    const response = await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      displayError(response.status);
      return;
    }

    const result = await response.json();

    if (result.success) {
      alert("Déconnexion réussie !");
      SessionData.isLogged = false;
      window.location.reload();
    } else {
      alert(result.message || "Erreur lors de la déconnexion");
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
  }
}

/**
 * Récupère les données du formulaire de connexion pour les enregistrer dans la base de données
 * @param {HTMLElement} loginForm Le formulaire de connexion
 */
export function getLoginData(loginForm) {
  loginForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        displayError(response.status);
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Connexion réussie !");
        window.location.reload();
      } else {
        alert(result.message || "Erreur de connexion");
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
    }
  };
}

/**
 * Récupère les données du formulaire d'inscription pour les enregistrer dans la base de données
 * @param {HTMLElement} registerForm Le formulaire d'inscription
 */
export function getRegisterData(registerForm) {
  registerForm.onsubmit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(registerForm).entries());

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Inscription réussie !");
        window.location.reload();
      } else {
        displayError(response.status);
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
    }
  };
}

/**
 * Appelle la fenêtre de connexion au clic sur le bouton
 */
export function initAuth() {
  injectpopupHTML();
  switchToLogin();
}
