import { logOut, getLoginData, getRegisterData } from "./register-login.js";
import { SessionData } from "../variables.js";

/**
 * Création du HTML pour le popup de connexion
 */
export function injectpopupHTML() {
  if (document.getElementById("auth-popup")) return;

  const popupHTML = `
    <div id="auth-popup" class="popup-overlay is-hidden">
        <div class="popup-content"></div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", popupHTML);
}

/**
 * Génère le sélecteur d'âge entre 13 et 100 ans
 * @returns {HTMLElement}
 */
function generateAgeOptions() {
  let options = "";
  for (let i = 13; i <= 100; i++) {
    options += `<option value="${i}">${i}</option>`;
  }
  return options;
}

/**
 * Passe de la fenêtre d'inscription à la fenêtre de connexion
 */
export function switchToLogin() {
  const popupContent = document.querySelector(".popup-content");
  popupContent.innerHTML = `
    <span class="close-popup-btn">&times;</span>
    <h2>Connexion</h2>
    <form id="login-form">
        <div class="form-group">
            <label>Pseudo</label>
            <input type="text" name="username" autocomplete="username" required>
        </div>
        <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" name="password" autocomplete="current-password" required>
        </div>
        <button type="submit">Se connecter</button>
    </form>
    <hr>
    <button id="register-btn" type="button">Créer un compte</button>
  `;
  setupInteractions();
}

/**
 * Passe de la fenêtre de connexion à la fenêtre d'inscription
 */
export function switchToRegister() {
  const popupContent = document.querySelector(".popup-content");
  popupContent.innerHTML = `
    <span class="close-popup-btn">&times;</span>
    <h2>Inscription</h2>
    <form id="register-form">
        <div class="form-group"><label>Pseudo</label><input type="text" name="username" autocomplete="username" required></div>
        <div class="form-group"><label>Email</label><input type="text" name="email" autocomplete="email" required></div>
        <div class="form-group"><label>Mot de passe</label><input type="password" autocomplete="new-password" name="password" required></div>
        <div class="form-group"><label>Prénom</label><input type="text" name="firstname" autocomplete="given-name" required></div>
        <div class="form-group"><label>Nom de famille</label><input type="text" autocomplete="family-name" name="lastname" required></div>
        <div class="form-group">
            <label>Âge</label>
            <select name="age" id="age-select" required>
              <option value="" disabled selected>Choisir...</option>
              ${generateAgeOptions()}
            </select>
        </div>
        <div class="form-group"><label>Genre</label><input type="text" name="genre" required></div>
        <button type="submit">S'inscrire</button>
    </form>
    <hr>
    <button id="login-switch-btn" type="button">Déjà un compte ? Se connecter</button>
  `;
  setupInteractions();
}

/**
 * Gestion des interactions liées à la connexion
 * Appelle les fonction logOut (déconnexion), getLoginData (connexion) ou getRegisterData(inscription) selon les actions et le statut de l'utilisateur
 */
function setupInteractions() {
  const popup = document.getElementById("auth-popup");
  const loginBtn = document.getElementById("log-in");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  if (!loginBtn) return;

  loginBtn.onclick = async () => {
    if (SessionData.isLogged) {
      logOut();
      return;
    }
    popup.classList.toggle("is-hidden");
  };

  setPopupLinks(popup);

  if (loginForm) getLoginData(loginForm);
  if (registerForm) getRegisterData(registerForm);
}

/**
 * Crée les interactions au clic dans le popup de connexion
 * @param {HTMLElement} popup Le conteneur du popup de connexion
 */
function setPopupLinks(popup) {
  popup.addEventListener("click", (event) => {
    const loginSwitchBtn = event.target.closest("#login-switch-btn");
    if (loginSwitchBtn) {
      switchToLogin();
      return;
    }

    const registerBtn = event.target.closest("#register-btn");
    if (registerBtn) {
      switchToRegister();
      return;
    }

    const closeBtn = event.target.closest(".close-popup-btn");
    if (closeBtn) {
      popup.classList.add("is-hidden");
    }

    if (event.target === popup) {
      popup.classList.add("is-hidden");
    }
  });
}
