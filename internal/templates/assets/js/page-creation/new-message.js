// Fonctions pour la création de nouveaux messages

import { clearPages } from "../helpers/clear-pages.js";
import { applyBBCode, readBBCode } from "../helpers/text-formating.js";
import { SessionData } from "../variables/session-data.js";
import { displayTopics } from "./category-topics.js";
import { displayPosts } from "./topic.js";

export function newTopic(catID) {
  let container = document.getElementById("category-topics");
  clearPages("newtopic");
  createPostEditor("newtopic", catID, container);
}

function createPostEditor(mode, sectionID, container) {
  let typeMode = {
    BBcode: true,
    MDon: true,
  };

  const goBack = document.getElementById("go-back");
  console.log(mode);
  console.log(goBack);
  if (goBack && mode === "newtopic") {
    goBack.innerHTML = `<img src="/assets/images/arrow-left.svg"/><span>Retour à la catégorie</span>`;
  } else if (goBack && mode === "reply") {
    goBack.innerHTML = `<img src="/assets/images/arrow-left.svg"/><span>Retour au sujet</span>`;
  }

  const postEdit = document.createElement("form");
  postEdit.className = "post-editor";
  postEdit.id = "post-form";

  if (mode === "newtopic") {
    postEdit.innerHTML = `<label for="title">Titre du sujet</label> 
    <input type="text" min="10" max="200" id"=title" name="title" placeholder="Titre du sujet" required>
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
  <button class="editor-button" data-type="b"><img src="/assets/images/bold.svg"/><span>Gras</span></button>
  <button class="editor-button" data-type="i"><img src="/assets/images/italic.svg"/><span>Italique</span></button>
  <button class="editor-button" data-type="u"><img src="/assets/images/underline.svg"/><span>Souligné</span></button>
  <button class="editor-button" data-type="s"><img src="/assets/images/strikethrough.svg"/><span>Barré</span></button>
       

  <button class="editor-button" data-type="left" style="margin-left:30px"><img src="/assets/images/align-left.svg"/><span>Aligné à gauche</span></button>
  <button class="editor-button" data-type="center"><img src="/assets/images/align-center.svg"/><span>Centré</span></button>
  <button class="editor-button" data-type="right"><img src="/assets/images/align-right.svg"/><span>Aligné à droite</span></button>
  <button class="editor-button" data-type="justify"><img src="/assets/images/align-justify.svg"/><span>Justifié</span></button>



  <button class="editor-button" data-type="BBswitch" style="margin-left:30px">[BB]<span>BBcode <br><b>ON</span></button>
  <button class="editor-button" data-type="MDswitch" id="MDswitch">*T*<span>Saisie&nbsp;enrichie <br><b>ON</span></button>
  </div>
  
  <textarea name="content" id="post-content" placeholder="Entrer ici le contenu de votre message" required></textarea>
  
  <div class="editor-actions">
   <button type="submit" class="editor-action" data_id="send-message">Envoyer</button>
   <button type="button" class="editor-action" data_id="preview-message">Prévisualiser</button>
  </div>`;

  container.appendChild(postEdit);

  container.addEventListener("click", (event) => {
    const backToCat = event.target.closest(".go-back");
    if (backToCat && mode === "newtopic") {
      backToCat.innerHTML = "Retour à la catégorie";
      displayTopics(sectionID);
      return;
    } else if (backToCat && mode === "reply") {
      const catID = backToCat.getAttribute("data_catid");
      displayPosts(catID, sectionID);
      return;
    }
    let editorBtn = event.target.closest(".editor-button");

    if (editorBtn) {
      event.preventDefault();
      const tag = editorBtn.dataset.type;
      if (tag != "BBswitch" && tag != "MDswitch") applyBBCode(tag, typeMode);

      if (tag == "BBswitch") {
        if (typeMode.BBcode) {
          typeMode.BBcode = false;
          editorBtn.querySelector("span").innerHTML = "BBcode <br><b>OFF</b>";
          editorBtn.classList.add("strike");
        } else {
          typeMode.BBcode = true;
          editorBtn.querySelector("span").innerHTML = "BBcode <br><b>ON</b>";
          editorBtn.classList.remove("strike");
        }
      } else if (tag == "MDswitch") {
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

function previewMessage(form, typeMode) {
  let message = form.content.value;

  const previewZone = document.getElementById("preview-zone");
  if (!previewZone) return;

  previewZone.innerHTML = readBBCode(message, typeMode)
    .split("\n")
    .join("<br/>");

  document.getElementById("editor-preview").classList.remove("is-hidden");
}

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

export function newMessage(topicID) {
  let container = document.getElementById("topic-posts");
  clearPages("reply");
  createPostEditor("reply", topicID, container);
}
