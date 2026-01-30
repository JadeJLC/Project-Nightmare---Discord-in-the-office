// Fonctions pour la création de la page "messages privés" avec un utilisateur

import { clearPages } from "./clear-pages.js";

export function displayMailbox() {
  const homeBtn = document.getElementById("go-home");
  homeBtn.style.display = "block";
  clearPages("dm");
}
