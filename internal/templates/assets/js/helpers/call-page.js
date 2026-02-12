import { displayTopics } from "../page-creation/category-topics.js";
import { displayMailbox } from "../page-creation/chat.js";
import { displayHome } from "../page-creation/home-display.js";
import { displayProfile } from "../page-creation/profile.js";
import { displayPosts } from "../page-creation/topic.js";
import { pageData } from "../variables.js";

export function selectPage(type) {
  let destination = pageData.currentPage;
  if (type === "back") destination = pageData.previousPage;

  if (destination === "home") displayHome();
  if (destination === "dm") displayMailbox();

  if (destination.includes("category")) getPageInfo(destination, "category");
  if (destination.includes("topic")) getPageInfo(destination, "topic");
  if (destination.includes("profile")) getPageInfo(destination, "profile");
}

function getPageInfo(destination, mode) {
  let pageInfo = destination.split("-");
  if (pageInfo.length < 2) return;

  if (mode === "category") {
    const catID = pageInfo[1];
    displayTopics(catID);
    return;
  }

  if (mode === "topic") {
    const topicID = pageInfo[1];
    let postID;
    if (pageInfo.length === 3) postID === pageInfo[2];
    displayPosts(topicID, postID);
    return;
  }

  if (mode === "profile") {
    const username = pageInfo[1];
    displayProfile(username);
    return;
  }
}
