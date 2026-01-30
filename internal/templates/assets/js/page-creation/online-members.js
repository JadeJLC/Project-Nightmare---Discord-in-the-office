const onlineMembersBtn = document.getElementById("online-members-btn");
const onlineMembersList = document.getElementById("online-members-list");
const membersList = document.getElementById("members-list");

export function displayOnlineMembers() {
  membersList.classList.remove("isHidden");
  onlineMembersBtn.innerHTML = ">";
}

export function hideOnlineMembers() {
  panel.classList.toggle("isHidden");
  document.body.classList.toggle("members-list-visible");
}
