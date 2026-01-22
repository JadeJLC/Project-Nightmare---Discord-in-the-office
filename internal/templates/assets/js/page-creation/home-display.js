// home-display.js
import { SessionData } from "../variables/session.js";

const usernameHeader = document.getElementById("header-username");

export function displayHome() {
  usernameHeader.innerHTML = "";

  if (!SessionData.isLogged) {
    usernameHeader.innerHTML = "Bienvenue ! <br /> Pensez à vous connecter !";
  } else {
    usernameHeader.innerHTML = `Bienvenue ${SessionData.username} ! <br /> Heureux de vous revoir !`;
  }
}
