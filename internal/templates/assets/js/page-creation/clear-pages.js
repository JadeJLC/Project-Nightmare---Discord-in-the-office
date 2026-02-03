export function clearPages(current) {
  if (current != "home") {
    const frontPageContainer = document.getElementById("front-page");
    if (frontPageContainer) frontPageContainer.remove();

    const categories = document.getElementById("categories");
    if (categories) categories.remove();

    const feed = document.getElementById("feed");
    if (feed) feed.remove();
  }

  if (current != "profile") {
    let profilePageContainer = document.getElementById("profile-page");
    if (profilePageContainer) profilePageContainer.remove();
  }

  if (current != "topicList") {
    let topicsPageContainer = document.getElementById("topics-page");
    if (topicsPageContainer) topicsPageContainer.remove();
  }
}
