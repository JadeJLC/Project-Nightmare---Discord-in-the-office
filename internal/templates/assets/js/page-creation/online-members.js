import { SessionData } from "../variables/session-data.js";
import { state } from "../variables/state.js";

const onlineMembersBtn = document.getElementById("online-members-btn");
const onlineMembersList = document.getElementById("online-members-list");
const membersList = document.getElementById("members-list");

export function updateOnlineUsers(users) {
  state.UserList = users;

  const container = document.getElementById("online-user-cards");
  container.innerHTML = "";

  users.forEach((user) => {
    const card = createUserCard(user);
    container.appendChild(card);
  });
}

function createUserCard(user) {
  const card = document.createElement("div");
  card.className = "user-card";

  card.innerHTML = `
        <div class="reduced-avatar">
            <img src="assets/images-avatar/${user.image}.png" alt="Image de profil - ${user.image}" />
        </div>
        <div class="info">
            <span class="username">${user.username}</span>
            <span class="status online">Online</span>
        </div>
    `;

  return card;
}
