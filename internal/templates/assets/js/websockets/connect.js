import { updateOnlineUsers } from "../page-creation/online-members.js";

export function connectWebSocket() {
  fetch("/api/me")
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then((user) => {
      const ws = new WebSocket("ws://localhost:5006/ws");

      ws.onopen = () => {
        console.log("WS connected");
        ws.send(
          JSON.stringify({ type: "presence_subscribe", userID: user.id }),
        );
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "presence_update") {
          updateOnlineUsers(data.users);
        }
      };

      ws.onerror = (e) => console.log("WS error:", e);
      ws.onclose = () => console.log("WS closed");
    })
    .catch(() => {
      console.log("Not logged in, WS not opened");
    });
}
