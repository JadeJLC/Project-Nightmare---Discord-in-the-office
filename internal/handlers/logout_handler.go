package handlers

import (
	"net/http"
	"real-time-forum/internal/services"
	"time"
)

type LogoutHandler struct {
    userService *services.UserService
	sessionService *services.SessionService
}

func NewLogoutHandler(us *services.UserService, ss *services.SessionService) *LogoutHandler {
    return &LogoutHandler{userService: us, sessionService: ss}
}

func (h *LogoutHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	cookie, err := r.Cookie("auth_token") 
	if err == nil { 
		h.sessionService.DeleteSession(cookie.Value) 
	}
	// Supprime le cookie côté client
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token", // adapte au nom réel de ton cookie
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false, // true si HTTPS
		SameSite: http.SameSiteLaxMode,
	})

	

	// Si tu as un service de session, tu peux invalider ici :
	// h.service.Logout(token)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Déconnecté"}`))
}
