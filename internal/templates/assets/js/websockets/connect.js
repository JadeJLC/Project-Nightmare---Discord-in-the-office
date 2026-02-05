import { updateOnlineUsers } from "../page-creation/online-members.js";
import { handleIncomingDM } from "./private-message.js";

export let ws = null;

export function connectWebSocket() {
  fetch("/api/me")
    .then((res) => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then((user) => {
      ws = new WebSocket("ws://localhost:5006/ws");

      ws.onopen = () => {
        console.log("WS connected");
        ws.send(
          JSON.stringify({ type: "presence_subscribe", userID: user.id }),
        );
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "private_message":
            handleIncomingDM(msg);
            break;

          case "presence_update":
            updateOnlineUsers(msg.users);
            break;

          // futures fonctionnalités comme les notifications
        }
      };

      ws.onerror = (e) => console.log("WS error:", e);
      ws.onclose = () => console.log("WS closed");
    })
    .catch(() => {
      console.log("Not logged in, WS not opened");
    });
}
