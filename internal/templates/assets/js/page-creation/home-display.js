import { buttonMove } from "../theme-switch.js";
<<<<<<< HEAD
import { displayCategories } from "./home-categories.js";
import { displayFeed } from "./home-feed.js";
import { clearPages } from "../helpers/clear-pages.js";
=======
import { SessionData } from "../variables/session-data.js";
import { displayCategories } from "./home-categories.js";
import { displayFeed } from "./home-feed.js";
import { clearPages } from "./clear-pages.js";
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396

let displayType = "categ";

/**
 * Création de la page d'accueil. Appelle les fonctions de construction
 */
export function displayHome() {
  clearPages("home");

  const frontPageContainer = createHomeWelcome();

<<<<<<< HEAD
  const buttonZone = document.getElementById("front-page-buttons");

  const button = createHomeButtons();
  buttonZone.appendChild(button);

  frontPageContainer.appendChild(buttonZone);

  const savedMode = localStorage.getItem("displaymode") || "categ";
  if (savedMode === "feed") {
    displayAsFeed();
  } else {
    displayAsCats();
=======
  if (!SessionData.isLogged) {
    usernameHeader.innerHTML =
      "Bienvenue&nbsp;! <br /> Pensez à vous connecter&nbsp;!";
  } else {
    usernameHeader.innerHTML = `Bienvenue ${SessionData.username}&nbsp;! <br /> Heureux de vous revoir&nbsp;!`;
  }

  if (!SessionData.isLogged) {
    logButton.innerHTML = "Inscription/Connexion";
  } else {
    logButton.innerHTML = `Déconnexion`;
>>>>>>> 817be74ba432ba264337ba67e9d00cfedbf1d396
  }
  buttonMove();
}

/**
 * Crée le conteneur principal de la page d'accueil
 * @returns {HTMLElement} Le conteneur de la page d'accueil
 */
function createHomeWelcome() {
  let frontPageContainer = document.getElementById("front-page");

  if (!frontPageContainer) {
    let addedContainer = `<div id="front-page"></div>`;
    document.body.insertAdjacentHTML("beforeend", addedContainer);
    frontPageContainer = document.getElementById("front-page");
  }

  frontPageContainer.innerHTML = ` <div class="front-page-header">
        <img
          src="assets/images/front-page.png"
          alt="Visuel de la page d'accueil"
        />
        <span>
          <center>
            Bienvenue sur Project Nightmare&nbsp;: Discord in the office.
          </center>
          <br />
          Ce forum est dédié à la licence Project Nightmare et à sa communauté.
          Discutez, partagez vos scores et vos parties, proposez des
          améliorations et suivez les sorties et les avancements de
          projets&nbsp;!
          <br />
        </span>
      </div>
      <div id="front-page-buttons"></div>`;

  return frontPageContainer;
}

/**
 * Crée le bouton permettant de changer d'affichage entre catégorie et feed
 * Récupère l'affichage de préférence dans le navigateur, affiche en catégories par défaut
 * @returns {HTMLElement}
 */
function createHomeButtons() {
  const savedMode = localStorage.getItem("displaymode") || "categ";
  const button = document.createElement("button");
  button.type = "button";

  if (savedMode === "feed") {
    button.id = "display-front-page-categ";
    button.innerHTML = "Passer en affichage catégories";
    button.addEventListener("click", () => {
      localStorage.setItem("displaymode", "categ");
      displayHome();
    });
  } else {
    button.id = "display-front-page-feed";
    button.innerHTML = "Passer en affichage feed";
    button.addEventListener("click", () => {
      localStorage.setItem("displaymode", "feed");
      displayHome();
    });
  }
  return button;
}

/**
 * Affichage de la page d'accueil en mode "catégories" + stocke l'information dans le navigateur
 */
function displayAsCats() {
  displayType = "categ";
  localStorage.setItem("displaymode", "categ");

  displayCategories();
}

/**
 * Affichage de la page d'accueil en mode "feed" + stocke l'information dans le navigateur
 */
function displayAsFeed() {
  displayType = "feed";
  localStorage.setItem("displaymode", "feed");

  displayFeed();
}
