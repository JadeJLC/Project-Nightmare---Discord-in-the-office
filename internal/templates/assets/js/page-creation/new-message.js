import { clearPages } from "../helpers/clear-pages.js";
import { applyBBCode, readBBCode } from "../helpers/text-formating.js";
import { SessionData } from "../variables.js";
import { displayTopics } from "./category-topics.js";
import { displayPosts } from "./topic.js";
import { typeMode } from "../variables.js";

/**
 * Appelle les fonction pour l'ouverture d'un nouveau sujet
 * @param {int} catID Identifiant de la catégorie
 */
export function newTopic(catID) {
  let container = document.getElementById("category-topics");
  clearPages("newtopic");
  displayPostEditor("newtopic", catID, container);
}

/**
 * Appelle les fonction pour répondre sur un sujet
 * @param {int} topicID Identifiant du sujet
 */
export function newMessage(topicID) {
  let container = document.getElementById("topic-posts");
  clearPages("reply");
  displayPostEditor("reply", topicID, container);
}

/**
 * Création de l'éditeur de message
 * @param {string} mode newtopic ou reply
 * @param {int} sectionID L'identifiant de la catégorie (newtopic) ou du sujet (reply)
 * @param {HTMLElement} container Conteneur de la zone catégorie/sujet où s'ouvre l'éditeur
 */
function displayPostEditor(mode, sectionID, container) {
  const goBack = document.getElementById("go-back");
  if (goBack && mode === "newtopic") {
    goBack.innerHTML = `<img src="/assets/images/arrow-left.svg"/><span>Retour à la catégorie</span>`;
  } else if (goBack && mode === "reply") {
    goBack.innerHTML = `<img src="/assets/images/arrow-left.svg"/><span>Retour au sujet</span>`;
  }

  const postEdit = buildPostEditorHTML(mode);

  container.appendChild(postEdit);
  setPostEditorButtons(container, sectionID, mode);
}

/**
 * Construit le HTML de l'éditeur de message (avec ou sans champ titre selon le mode)
 * @param {string} mode newtopic ou reply - pour le champ titre
 * @returns {HTMLElement} Le bloc HTML de l'éditeur de mesage
 */
function buildPostEditorHTML(mode) {
  const postEdit = document.createElement("form");
  postEdit.className = "post-editor";
  postEdit.id = "post-form";

  if (mode === "newtopic") {
    postEdit.innerHTML = `<label for="title">Titre du sujet</label> 
    <input type="text" min="10" max="200" id="title" name="title" placeholder="Titre du sujet" required>
    <hr/>
  `;
  }

  postEdit.innerHTML += `<div id="editor-preview" class="is-hidden">
  <label>Prévisualisation</label>
  <div id="preview-zone"></div>
  <hr/>
  </div>
  
  <label for="post-content">Contenu de votre message</label>
  
  <div class="editor-buttons">
  <button class="editor-button" type="button" data-type="b"><img src="/assets/images/bold.svg"/><span>Gras</span></button>
  <button class="editor-button" type="button" data-type="i"><img src="/assets/images/italic.svg"/><span>Italique</span></button>
  <button class="editor-button" type="button" data-type="u"><img src="/assets/images/underline.svg"/><span>Souligné</span></button>
  <button class="editor-button" type="button" data-type="s"><img src="/assets/images/strikethrough.svg"/><span>Barré</span></button>
       

  <button class="editor-button" type="button" data-type="left" style="margin-left:30px"><img src="/assets/images/align-left.svg"/><span>Aligné à gauche</span></button>
  <button class="editor-button" type="button" data-type="center"><img src="/assets/images/align-center.svg"/><span>Centré</span></button>
  <button class="editor-button" type="button" data-type="right"><img src="/assets/images/align-right.svg"/><span>Aligné à droite</span></button>
  <button class="editor-button" type="button" data-type="justify"><img src="/assets/images/align-justify.svg"/><span>Justifié</span></button>


  <button class="editor-button" type="button" data-type="BBswitch" style="margin-left:30px">[BB]<span>BBcode <br><b>ON</span></button>
  <button class="editor-button" type="button" data-type="MDswitch" id="MDswitch">*T*<span>Saisie&nbsp;enrichie <br><b>ON</span></button>
  </div>
  
  <textarea name="content" id="post-content" placeholder="Entrer ici le contenu de votre message" required></textarea>
  
  <div class="editor-actions">
   <button type="submit" class="editor-action" data_id="send-message">Envoyer</button>
   <button type="button" class="editor-action" data_id="preview-message">Prévisualiser</button>
  </div>`;

  return postEdit;
}

/**
 * Crée les actions des boutons de l'éditeur de message (Formatage, prévisualisation, envoie)
 * @param {HTMLElement} container Élément HTML contenant l'éditeur de message
 * @param {int} sectionID Identifiant du sujet ou de la catégorie (pour le bouton retour)
 */
function setPostEditorButtons(container, sectionID, mode) {
  container.addEventListener("click", (event) => {
    const goBack = event.target.closest(".go-back");
    if (goBack && mode === "newtopic") {
      goBack.innerHTML = "Retour à la catégorie";
      displayTopics(sectionID);
      return;
    } else if (goBack && mode === "reply") {
      const catID = goBack.getAttribute("data_catid");
      displayPosts(catID, sectionID);
      return;
    }
    let editorBtn = event.target.closest(".editor-button");

    if (editorBtn) {
      event.preventDefault();
      const tag = editorBtn.dataset.type;
      if (tag != "BBswitch" && tag != "MDswitch") {
        applyBBCode(tag, typeMode);
      } else {
        updateTypeMode(tag, editorBtn);
      }
    }

    let editorAction = event.target.closest(".editor-action");

    if (editorAction) {
      const postForm = document.getElementById("post-form");
      const action = editorAction.getAttribute("data_id");

      if (action == "send-message") {
        postForm.onsubmit = async (e) => {
          e.preventDefault();
          sendMessage(postForm, mode, typeMode, sectionID);
        };
      } else if (action == "preview-message") {
        previewMessage(postForm, typeMode);
      }
    }
  });
}

/**
 * Active ou désactive le BBcode / Markdown lorsque l'utilisateur clique sur les boutons
 * @param {string} pressed Le bouton sur lequel l'utilisateur a cliqué
 */
function updateTypeMode(pressed, editorBtn) {
  if (pressed == "BBswitch") {
    if (typeMode.BBcode) {
      typeMode.BBcode = false;
      editorBtn.querySelector("span").innerHTML = "BBcode <br><b>OFF</b>";
      editorBtn.classList.add("strike");
    } else {
      typeMode.BBcode = true;
      editorBtn.querySelector("span").innerHTML = "BBcode <br><b>ON</b>";
      editorBtn.classList.remove("strike");
    }
  } else if (pressed == "MDswitch") {
    if (typeMode.MDon) {
      typeMode.MDon = false;
      editorBtn.querySelector("span").innerHTML =
        "Saisie&nbsp;enrichie <br><b>OFF</b>";
      editorBtn.classList.add("strike");
    } else {
      typeMode.MDon = true;
      editorBtn.querySelector("span").innerHTML =
        "Saisie&nbsp;enrichie <br><b>ON";
      editorBtn.classList.remove("strike");
    }
  }
}

/**
 * Permet de prévisualiser le message avant de l'envoyer
 * @param {HTMLElement} form Éditeur de message et son contenu
 * @param {object} typeMode Modes de saisie actifs (BBcode / Markdown)
 */
function previewMessage(form, typeMode) {
  let message = form.content.value;

  const previewZone = document.getElementById("preview-zone");
  if (!previewZone) return;

  previewZone.innerHTML = readBBCode(message, typeMode)
    .split("\n")
    .join("<br/>");

  document.getElementById("editor-preview").classList.remove("is-hidden");
}

/**
 * Envoie le message au serveur pour l'enregistrer dans la BDD
 * @param {HTMLElement} form Éditeur de message et son contenu
 * @param {string} mode newtopic ou reply
 * @param {object} typeMode Modes de saisie actifs
 * @param {int} sectionID Catégorie ou topic pour l'ajout du message en BDD
 */
async function sendMessage(form, mode, typeMode, sectionID) {
  const data = Object.fromEntries(new FormData(form).entries());

  data.content = readBBCode(data.content, typeMode).split("\n").join("<br/>");
  const user = SessionData.username;

  try {
    const response = await fetch(
      `/api/post?mode=${mode}&sectionID=${sectionID}&user=${user}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    if (response.ok) {
      alert("Message envoyé !");
      if (mode === "newtopic") displayTopics(sectionID);
      if (mode === "reply") displayPosts(sectionID);
    } else {
      alert("Erreur : " + (await response.text()));
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
  }
}
