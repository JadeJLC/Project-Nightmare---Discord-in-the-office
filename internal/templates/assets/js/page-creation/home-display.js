// home-display.js
import { SessionData } from "../variables/session.js";

const usernameHeader = document.getElementById("header-username");
const logButton = document.getElementById("log-in-text");

export function displayHome() {
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
}
