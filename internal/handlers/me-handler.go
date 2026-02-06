package handlers

import (
	"encoding/json"
	"net/http"

	"real-time-forum/internal/auth"
	"real-time-forum/internal/services"
)

type MeHandler struct {
    userService *services.UserService
}

func NewMeHandler(userService *services.UserService) *MeHandler {
    return &MeHandler{userService: userService}
}

/*
* Vérifie l'identité de l'utilisateur connecté pour créer et garder une session active
* Lit le cookie, le compare au token et retrouve les informations utilisateur correspondante
*/
func (h *MeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    cookie, err := r.Cookie("auth_token")
    if err != nil {
        json.NewEncoder(w).Encode(map[string]any{
            "logged": false,
        })
        return
    }

    userID, err := auth.ExtractUserID(cookie.Value)
    if err != nil {
        json.NewEncoder(w).Encode(map[string]any{
            "logged": false,
        })
        return
    }

    user, err := h.userService.GetUserByID(int(userID))
    if err != nil {
        json.NewEncoder(w).Encode(map[string]any{
            "logged": false,
        })
        return
    }

    json.NewEncoder(w).Encode(map[string]any{
        "logged":   true,
        "username": user.Username,
    })
}
