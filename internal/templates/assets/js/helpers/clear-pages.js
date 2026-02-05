import { displayHome } from "../page-creation/home-display.js";

export function clearPages(destination) {
  window.scrollTo(0, 0);

  if (destination != "home") {
    const frontPageContainer = document.getElementById("front-page");
    if (frontPageContainer) frontPageContainer.remove();

    const categories = document.getElementById("categories");
    if (categories) categories.remove();

    const feed = document.getElementById("feed");
    if (feed) feed.remove();

    const homeBtn = document.getElementById("go-home");
    homeBtn.style.display = "block";
  }

  if (destination != "profile") {
    const profilePageContainer = document.getElementById("profile-page");
    if (profilePageContainer) profilePageContainer.remove();
  }

  if (destination != "newtopic") {
    const categoryTopics = document.getElementById("category-topics");
    if (categoryTopics) categoryTopics.remove();
  }

  if (destination != "reply") {
    const topicPosts = document.getElementById("topic-posts");
    if (topicPosts) topicPosts.remove();
  }

  if (destination === "newtopic") {
    const newTopicBtn = document.getElementById("new-topic-button");
    if (newTopicBtn) newTopicBtn.remove();

    const catTitle = document.getElementById("cat-title");
    if (!catTitle) displayHome();

    if (!catTitle.innerHTML.includes("nouveau sujet"))
      catTitle.innerHTML =
        "Ouvrir un nouveau sujet dans<br>" + catTitle.innerHTML;

    const topicList = document.querySelectorAll(".topic-bloc");
    topicList.forEach((topic) => {
      topic.remove();
    });

    const noTopic = document.getElementById("notopic");
    if (noTopic) noTopic.remove();
  }

  if (destination === "reply") {
    const newMessageBtn = document.getElementById("new-message-button");
    if (newMessageBtn) newMessageBtn.remove();

    const topicTitle = document.getElementById("topic-title");

    if (!topicTitle.innerHTML.includes("Répondre au sujet"))
      topicTitle.innerHTML = "Répondre au sujet : <br>" + topicTitle.innerHTML;

    const postList = document.querySelectorAll(".post-bloc");
    postList.forEach((post) => {
      post.remove();
    });

    const newTopicBtn = document.getElementById("new-topic-button");
    if (newTopicBtn) newTopicBtn.remove();
  }
}
