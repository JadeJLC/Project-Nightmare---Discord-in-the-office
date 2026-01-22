// session/check-login.js
import { SessionData } from "../variables/session.js";

export async function checkLoginStatus() {
  try {
    const response = await fetch("/api/me", {
      credentials: "include",
    });

    const data = await response.json();

    if (data.logged) {
      SessionData.isLogged = true;
      SessionData.username = data.username;
    } else {
      SessionData.isLogged = false;
      SessionData.username = null;
    }
  } catch (err) {
    console.error("Erreur lors de la vérification de session :", err);
    SessionData.isLogged = false;
    SessionData.username = null;
  }
}
