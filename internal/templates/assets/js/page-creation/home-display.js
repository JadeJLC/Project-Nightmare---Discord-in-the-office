import { isLogged } from "../variables/page-data.js";

const usernameHeader = document.getElementById("header-username");

export function displayHome() {
  usernameHeader.innerHTML = "";
  if (!isLogged) {
    usernameHeader.innerHTML = "Bienvenue ! <br /> Pensez à vous connecter !";
  } else {
    usernameHeader.innerHTML =
      "Bienvenue (Nom) ! <br /> Heureux de vous revoir !";
  }
}
