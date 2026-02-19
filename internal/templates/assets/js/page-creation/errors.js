import { clearPages } from "../helpers/clear-pages.js";
import { selectPage } from "../helpers/call-page.js";
import { pageData } from "../variables.js";

/**
 * Création des pages d'erreur
 */
export async function displayError(errorCode) {
  console.log("Page d'erreur : ", errorCode);
  pageData.currentPage = pageData.previousPage;
  clearPages("error");
  try {
    const response = await fetch(`/error?code=${errorCode}`);
    if (!response.ok) {
      displayError(response.status);
      return;
    }

    const error = await response.json();
    let errorPageContainer = document.getElementById("error-page");

    if (!errorPageContainer) {
      let addedContainer = `<div id="error-page"></div>`;
      document.body.insertAdjacentHTML("beforeend", addedContainer);
      errorPageContainer = document.getElementById("error-page");
    }

    errorPageContainer.innerHTML = `<h2>
  <button class="go-back" id="go-back" style="margin:0px 20px">
  <img src="/assets/images/arrow-left.svg"/><span>Revenir en arrière</span></button>
  Erreur ${error.error_code} - <span>${error.error_definition}</span></h2>
  
  <div class="error-message">${error.error_message}</div>

  <div class="error-if">Si le problème persiste, contactez un administrateur du forum.</div>
  `;

    errorPageContainer.addEventListener("click", (event) => {
      const goBack = event.target.closest("#go-back");
      if (goBack) {
        selectPage("back");
      }
    });
  } catch (e) {}
}
