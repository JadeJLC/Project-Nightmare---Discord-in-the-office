// Fonctions pour la création de la page "messages privés" avec un utilisateur

import { SessionData } from "../variables/session-data.js";
import { clearPages } from "./clear-pages.js";

export function displayMailbox() {
  const usernameHeader = document.getElementById("header-username");
  const homeBtn = document.getElementById("go-home");
  if (SessionData.isLogged) {
    usernameHeader.innerHTML = `Messagerie de ${SessionData.username}`;
  }
  homeBtn.style.display = "block";
  clearPages("dm");
}
