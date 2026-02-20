import { displayError } from "../page-creation/errors.js";

export function toggleReactionWindow(postID, container) {
  let reactionPopup = container.querySelector("#reaction-popup");

  if (!reactionPopup) {
    reactionPopup = document.createElement("div");
    reactionPopup.classList.add("reaction-popup");
    reactionPopup.id = "reaction-popup";

    createReactionList(reactionPopup, postID);
    container.appendChild(reactionPopup);
  } else {
    reactionPopup.remove();
  }
}

async function createReactionList(reactionPopup, postID) {
  const responseList = await fetch("/api/reactions?mode=files");
  const files = await responseList.json();

  if (!responseList.ok) {
    displayError(response.status);
    return;
  }

  const responseMe = await fetch(`/api/myreactions?postID=${postID}`);
  const myReactions = await responseMe.json();

  if (!responseMe.ok) {
    displayError(response.status);
    return;
  }

  files.forEach((fileName) => {
    const imageWrapper = document.createElement("div");

    const reactionType = fileName.replace(".png", "");

    const isActive = myReactions.some((r) => r.reaction_type === reactionType);
    imageWrapper.className = `react-image-bloc ${isActive ? "active" : ""}`;
    imageWrapper.dataset.rtype = reactionType;

    imageWrapper.innerHTML = `<img src="/assets/images-reactions/${fileName}" alt="${reactionType}" title="${reactionType}"/>`;
    reactionPopup.appendChild(imageWrapper);
  });
  setReactionEffects(postID, reactionPopup);
}

export function setReactionEffects(postID, reactionPopup) {
  reactionPopup.addEventListener("click", (event) => {
    const reactImg = event.target.closest(".react-image-bloc");

    if (reactImg) {
      const reactionType = reactImg.dataset.rtype;
      if (reactImg.classList.contains("active")) {
        removeReaction(postID, reactionType);
      } else {
        addReaction(postID, reactionType);
      }
      reactImg.classList.toggle("active");
    }
  });
}

export async function addReaction(postID, reactionType) {
  try {
    const response = await fetch(
      `/api/reactions?mode=add&postID=${postID}&reactionType=${reactionType}`,
    );

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
  }
}

export async function removeReaction(postID, reactionType) {
  try {
    const response = await fetch(
      `/api/reactions?mode=remove&postID=${postID}&reactionType=${reactionType}`,
    );

    if (!response.ok) {
      displayError(response.status);
      return;
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
  }
}

export async function buildPostReactions(reactions, mode) {
  if (!reactions || reactions.length === 0) return;
  const postID = reactions[0].post_id;
  const responseMe = await fetch(`/api/myreactions?postID=${postID}`);
  const myReactions = await responseMe.json();

  const reactionList = reactions
    .map((reaction) => {
      const isActive = myReactions.some(
        (r) => r.reaction_type === reaction.reaction_type,
      );
      if (!isActive && mode == "profile") return "";
      return `<div class="reaction-bloc ${isActive ? "active" : ""}" data-postid="${postID}" data-rtype="${reaction.reaction_type}"><img src="/assets/images-reactions/${reaction.reaction_type}.png"/> ${reaction.reaction_count}</div>`;
    })
    .join("");

  return `${reactionList}`;
}
