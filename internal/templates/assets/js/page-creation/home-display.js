import { buttonMove } from "../theme-switch.js";
import { SessionData } from "../variables/session-data.js";
import { displayCategories } from "./categories.js";
import { displayFeed } from "./feed.js";
import { clearPages } from "./profile.js";

const usernameHeader = document.getElementById("header-username");
const logButton = document.getElementById("log-in-text");
let displayType = "categ";

// Création de la page d'accueil
export function displayHome() {
  clearPages("home");
  const homeBtn = document.getElementById("go-home");
  homeBtn.style.display = "none";

  usernameHeader.innerHTML = "";

  if (!SessionData.isLogged) {
    usernameHeader.innerHTML = "Bienvenue ! <br /> Pensez à vous connecter !";
  } else {
    usernameHeader.innerHTML = `Bienvenue ${SessionData.username} ! <br /> Heureux de vous revoir !`;
  }

  if (!SessionData.isLogged) {
    logButton.innerHTML = "Inscription/Connexion";
  } else {
    logButton.innerHTML = `Déconnexion`;
  }

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
  const buttonZone = document.getElementById("front-page-buttons");

  const button = createHomeButtons();
  buttonZone.appendChild(button);

  frontPageContainer.appendChild(buttonZone);

  const savedMode = localStorage.getItem("displaymode") || "categ";
  if (savedMode === "feed") {
    displayAsFeed();
  } else {
    displayAsCats();
  }
  buttonMove();
}

// Création du bouton de changement d'affichage
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

function displayAsCats() {
  displayType = "categ";
  localStorage.setItem("displaymode", "categ");

  displayCategories();
}

function displayAsFeed() {
  displayType = "feed";
  localStorage.setItem("displaymode", "feed");

  displayFeed();
}
