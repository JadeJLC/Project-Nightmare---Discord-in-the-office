package handlers

import (
	"fmt"
	"log"
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

/*
* Gestion de la déconnexion
* Récupère les informations de l'utilisateur et supprime le cookie de la base de données
*/
func (h *LogoutHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {

	cookie, err := r.Cookie("auth_token") 
	if err == nil { 
		h.sessionService.DeleteSession(cookie.Value) 
	} else {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération du cookie pour la déconnexion : %v", err)
		log.Print(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
	}
	
	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   false, // true si HTTPS
		SameSite: http.SameSiteStrictMode,
	})


	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true, "message": "Déconnecté"}`))
}
