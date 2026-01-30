function updateOnlineUsers(userIDs) {
  const list = document.getElementById("online-users");
  list.innerHTML = "";

  userIDs.forEach((id) => {
    const li = document.createElement("li");
    li.textContent = `User ${id} is online`;
    list.appendChild(li);
  });
}
