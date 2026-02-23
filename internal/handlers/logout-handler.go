package handlers

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/services"
	"time"
)

type LogoutHandler struct {
    userService 	*services.UserService
	sessionService 	*services.SessionService
	adminService 	*services.AdminService
}

func NewLogoutHandler(us *services.UserService, ss *services.SessionService, as *services.AdminService) *LogoutHandler {
    return &LogoutHandler{userService: us, sessionService: ss, adminService: as}
}

/*
* Gestion de la déconnexion
* Récupère les informations de l'utilisateur et supprime le cookie de la base de données
*/
func (h *LogoutHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	PerformLogout(w, r, h.sessionService, h.adminService)
}

func PerformLogout(w http.ResponseWriter, r *http.Request, ss *services.SessionService, as *services.AdminService) error {
    cookie, err := r.Cookie("auth_token")
    if err != nil {
        logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération du cookie pour la déconnexion : %v", err)
        as.SaveLogToDatabase(logMsg)
        return fmt.Errorf(logMsg)
    }

    ss.DeleteSession(cookie.Value)

    http.SetCookie(w, &http.Cookie{
        Name:     "auth_token",
        Value:    "",
        Path:     "/",
        Expires:  time.Unix(0, 0),
        MaxAge:   -1,
        HttpOnly: true,
        Secure:   false,
        SameSite: http.SameSiteStrictMode,
    })

    return nil
}