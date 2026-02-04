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

func (h *MeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    // Lire le cookie
    cookie, err := r.Cookie("auth_token")
    if err != nil {
        json.NewEncoder(w).Encode(map[string]any{
            "logged": false,
        })
        return
    }

    // Vérifier le token
    userID, err := auth.ExtractUserID(cookie.Value)
    if err != nil {
        json.NewEncoder(w).Encode(map[string]any{
            "logged": false,
        })
        return
    }

    // Récupérer l'utilisateur
    user, err := h.userService.GetUserByID(int(userID))
    if err != nil {
        json.NewEncoder(w).Encode(map[string]any{
            "logged": false,
        })
       
        return
    }

    // Réponse
    json.NewEncoder(w).Encode(map[string]any{
        "logged":   true,
        "username": user.Username,
        "image": user.Image,
    })
}
