import { clearPages } from "../helpers/clear-pages.js";
import { SessionData } from "../variables.js";
import { displayTopics } from "./category-topics.js";
import { displayPosts } from "./topic.js";
import { typeMode } from "../variables.js";
import { htmlToBB, htmlToMD, readBBCode } from "../helpers/text-formating.js";
import { displayPostEditor } from "./post-editor.js";
import { createReplyNotification } from "./notifications.js";

/**
 * Appelle les fonction pour l'ouverture d'un nouveau sujet
 * @param {int} catID Identifiant de la catégorie
 */
function newTopic(catID) {
  let container = document.getElementById("category-topics");
  clearPages("newtopic");
  displayPostEditor("newtopic", catID, container);
}

/**
 * Appelle les fonction pour répondre sur un sujet
 * @param {int} topicID Identifiant du sujet
 */
function newMessage(topicID) {
  let container = document.getElementById("topic-posts");
  clearPages("reply");
  displayPostEditor("reply", topicID, container);
}

/**
 * Appelle les fonction pour modifier un message
 * @param {int} topicID Identifiant du sujet
 */
function editMessage(topicID, postID, postContent) {
  let container = document.getElementById("topic-posts");
  clearPages("edit");
  const post = {
    post_id: postID,
    content: htmlToBB(postContent),
  };

  if (!typeMode.BBcode) post.content = htmlToMD(postContent);

  displayPostEditor("edit", topicID, container, post);
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
async function sendMessage(form, mode, typeMode, sectionID, postID) {
  const data = Object.fromEntries(new FormData(form).entries());

  data.content = readBBCode(data.content, typeMode).split("\n").join("<br/>");
  const user = SessionData.username;

  try {
    const response = await fetch(
      `/api/post?mode=${mode}&sectionID=${sectionID}&user=${user}&postID=${postID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      },
    );

    if (response.ok) {
      if (mode === "newtopic") displayTopics(sectionID);
      if (mode === "reply") {
        displayPosts(sectionID);
        createReplyNotification(sectionID, user);
      }
      if (mode === "edit") displayPosts(sectionID, postID);
    } else {
      alert("Erreur : " + (await response.text()));
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
  }
}

export { previewMessage, sendMessage, newTopic, newMessage, editMessage };
