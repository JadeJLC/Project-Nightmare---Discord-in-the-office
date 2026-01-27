// register-login.js
import { SessionData } from "../variables/session-data.js";
import { displayHome } from "./home-display.js";

function getLoginBtn() {
  return document.getElementById("log-in");
}

function injectpopupHTML() {
  if (document.getElementById("auth-popup")) return;

  const popupHTML = `
    <div id="auth-popup" class="popup-overlay is-hidden">
        <div class="popup-content"></div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", popupHTML);
}

function switchToLogin() {
  const popupContent = document.querySelector(".popup-content");
  popupContent.innerHTML = `
    <span class="close-popup-btn">&times;</span>
    <h2>Connexion</h2>
    <form id="login-form">
        <div class="form-group">
            <label>Pseudo</label>
            <input type="text" name="username" required>
        </div>
        <div class="form-group">
            <label>Mot de passe</label>
            <input type="password" name="password" required>
        </div>
        <button type="submit">Se connecter</button>
    </form>
    <hr>
    <button id="register-btn" type="button">Créer un compte</button>
  `;
  setupInteractions();
}

function generateAgeOptions() {
  let options = "";
  for (let i = 13; i <= 100; i++) {
    options += `<option value="${i}">${i}</option>`;
  }
  return options;
}

function switchToRegister() {
  const popupContent = document.querySelector(".popup-content");
  popupContent.innerHTML = `
    <span class="close-popup-btn">&times;</span>
    <h2>Inscription</h2>
    <form id="register-form">
        <div class="form-group"><label>Pseudo</label><input type="text" name="username" required></div>
        <div class="form-group"><label>Email</label><input type="text" name="email" required></div>
        <div class="form-group"><label>Mot de passe</label><input type="password" name="password" required></div>
        <div class="form-group"><label>Prénom</label><input type="text" name="firstname" required></div>
        <div class="form-group"><label>Nom de famille</label><input type="text" name="lastname" required></div>
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

function setupInteractions() {
  const popup = document.getElementById("auth-popup");
  const loginBtn = getLoginBtn();
  const closeBtn = document.querySelector(".close-popup-btn");
  const registerBtn = document.getElementById("register-btn");
  const loginSwitchBtn = document.getElementById("login-switch-btn");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");

  // Ouverture (Bouton dans la page)
  if (loginBtn) {
    loginBtn.onclick = () => popup.classList.toggle("is-hidden");
  }

  // --- LOGIN / LOGOUT BUTTON ---
  loginBtn.onclick = async () => {
    if (SessionData.isLogged) {
      // Déconnexion
      try {
        const response = await fetch("/api/logout", {
          method: "POST",
          credentials: "include",
        });

        // Si la route n'existe pas ou renvoie du texte → éviter JSON.parse
        if (!response.ok) {
          const text = await response.text();
          console.error("Erreur logout :", text);
          alert("Erreur logout : " + text);
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
      return;
    }

    // Sinon → ouvrir la popup de connexion
    popup.classList.remove("is-hidden");
  };

  // --- POPUP CLOSE ---
  if (closeBtn) closeBtn.onclick = () => popup.classList.add("is-hidden");

  popup.onclick = (e) => {
    if (e.target === popup) popup.classList.add("is-hidden");
  };

  // --- SWITCH FORMS ---
  if (registerBtn) registerBtn.onclick = () => switchToRegister();
  if (loginSwitchBtn) loginSwitchBtn.onclick = () => switchToLogin();

  // --- LOGIN FORM ---
  if (loginForm) {
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

  // --- REGISTER FORM ---
  if (registerForm) {
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
          popup.classList.add("is-hidden");
        } else {
          alert("Erreur : " + (await response.text()));
        }
      } catch (err) {
        console.error("Erreur réseau :", err);
      }
    };
  }
}

export function initAuth() {
  injectpopupHTML();
  switchToLogin();
}
