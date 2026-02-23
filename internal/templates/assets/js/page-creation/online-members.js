import { state } from "../variables.js";
import { displayProfile } from "./profile.js";

const onlineMembersBtn = document.getElementById("online-members-btn");
const onlineMembersList = document.getElementById("online-members-list");
const membersList = document.getElementById("members-list");

export function updateOnlineUsers(users) {
  state.UserList = users;

  const container = document.getElementById("online-user-cards");
  if (users.length !== 0) {
    container.innerHTML = "<h3>Membres connectés</h3>";
  } else {
    container.innerHTML = "";
  }

  users.forEach((user) => {
    const card = createUserCard(user, "online");
    container.appendChild(card);
  });
}

export function updateOfflineUsers(users) {
  state.UserList = users;

  const container = document.getElementById("offline-user-cards");
  if (users.length !== 0) {
    container.innerHTML = "<h3>Membres hors ligne</h3>";
  } else {
    container.innerHTML = "";
  }

  users.forEach((user) => {
    const card = createUserCard(user, "offline");
    container.appendChild(card);
  });
}

function createUserCard(user, status) {
  const card = document.createElement("div");
  card.className = "user-card";

  card.innerHTML = `
        <div class="reduced-avatar" data-name="${user.username}">
            <img src="assets/images-avatar/${user.image}.png" alt="Image de profil - ${user.image}" />
        </div>
        <div class="info">
            <span class="username" data-name="${user.username}">${user.username}</span>
            ${status == "online" ? `<span class="status online">En&nbsp;ligne</span>` : ""}
        </div>
    `;

  card.addEventListener("click", (event) => {
    const userImg = event.target.closest(".reduced-avatar");
    if (userImg) {
      const username = userImg.dataset.name;
      displayProfile(username);
      return;
    }

    const userName = event.target.closest(".username");
    if (userName) {
      const username = userName.dataset.name;
      displayProfile(username);
      return;
    }
  });

  return card;
}
