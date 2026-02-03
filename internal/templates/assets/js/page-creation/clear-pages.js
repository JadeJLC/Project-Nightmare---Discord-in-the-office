export function clearPages(current) {
  window.scrollTo(0, 0);

  if (current != "home") {
    const frontPageContainer = document.getElementById("front-page");
    if (frontPageContainer) frontPageContainer.remove();

    const categories = document.getElementById("categories");
    if (categories) categories.remove();

    const feed = document.getElementById("feed");
    if (feed) feed.remove();

    const homeBtn = document.getElementById("go-home");
    homeBtn.style.display = "block";
  }

  if (current != "profile") {
    let profilePageContainer = document.getElementById("profile-page");
    if (profilePageContainer) profilePageContainer.remove();
  }

  if (current != "category") {
    let topicsPageContainer = document.getElementById("category-topics");
    if (topicsPageContainer) topicsPageContainer.remove();
  }

  if (current != "topic") {
    let topicsPageContainer = document.getElementById("topic-posts");
    if (topicsPageContainer) topicsPageContainer.remove();
  }
}
