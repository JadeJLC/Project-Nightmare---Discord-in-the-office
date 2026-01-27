// On déplace la recherche du bouton à l'intérieur pour éviter les erreurs de chargement
function getLoginBtn() {
  return document.getElementById("log-in");
}

function injectpopupHTML() {
  if (document.getElementById("auth-popup")) return;

  // On injecte la base du popup
  const popupHTML = `
    <div id="auth-popup" class="popup-overlay is-hidden">
        <div class="popup-content">
            </div>
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
                <label>Identifiant</label>
                <input type="text" name="username" placeholder="Pseudo ou mail" required>
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
  // On doit relancer les interactions car le HTML interne est neuf
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

  // Fermeture (Croix)
  if (closeBtn) {
    closeBtn.onclick = () => popup.classList.add("is-hidden");
  }

  // Fermeture (Fond gris) - On utilise onclick pour écraser les anciens événements
  popup.onclick = (e) => {
    if (e.target === popup) popup.classList.add("is-hidden");
  };

  // Switch vers Inscription
  if (registerBtn) {
    registerBtn.onclick = () => switchToRegister();
  }

  // Switch vers Connexion
  if (loginSwitchBtn) {
    loginSwitchBtn.onclick = () => switchToLogin();
  }

  // Gestion Formulaire Login
  if (loginForm) {
    loginForm.onsubmit = (e) => {
      e.preventDefault();
      const authData = new FormData(loginForm);
      console.log(
        "Login JS :",
        authData.get("username"),
        authData.get("password"),
      );
    };
  }

  // Gestion Formulaire Register
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      // Ajout de async pour fetch
      e.preventDefault();
      const formData = new FormData(registerForm);

      // Conversion FormData en objet simple
      const data = Object.fromEntries(formData.entries());

      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data), // On envoie le JSON
        });

        if (response.ok) {
          const result = await response.json();
          alert("Inscription réussie !");
          document.getElementById("auth-popup").classList.add("is-hidden");
        } else {
          const error = await response.text();
          alert("Erreur : " + error);
        }
      } catch (err) {
        console.error("Erreur réseau :", err);
      }
    };
  }
}

export function initAuth() {
  injectpopupHTML();
  switchToLogin(); // On initialise avec la vue login par défaut
}
