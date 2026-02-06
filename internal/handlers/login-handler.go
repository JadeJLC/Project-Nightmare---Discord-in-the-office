// internal/handlers/login_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/auth"
	"real-time-forum/internal/services"
)

type LoginHandler struct {
    userService *services.UserService
    sessionService *services.SessionService
}

func NewLoginHandler(us *services.UserService, ss *services.SessionService) *LoginHandler {
    return &LoginHandler{userService: us, sessionService: ss,}
}

type LoginRequest struct {
    Authenticator string `json:"username"`
    Password      string `json:"password"`
}

/*
* Gestion de la connexion
* Réccupère le formulaire de connexion et créee un cookie dans la BDD des sessions
*/
func (h *LoginHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    var req LoginRequest
    json.NewDecoder(r.Body).Decode(&req)

    user, err := h.userService.Authenticate(req.Authenticator, req.Password)
    if err != nil {
        json.NewEncoder(w).Encode(map[string]any{
            "success": false,
            "message": "Identifiants incorrects",
        })
        return
    }

    token, _ := auth.GenerateToken(user.ID)

    if err := h.sessionService.CreateSession(user.ID, token); err != nil {
        http.Error(w, "Erreur session", http.StatusInternalServerError)
        return
    }


    http.SetCookie(w, &http.Cookie{
        Name:     "auth_token",
        Value:    token,
        Path:     "/",
        HttpOnly: true,
        MaxAge:   86400,
		Secure: false,
    })

    json.NewEncoder(w).Encode(map[string]any{
        "success": true,
    })
}
