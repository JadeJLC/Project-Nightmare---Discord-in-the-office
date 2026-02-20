// internal/handlers/login_handler.go
package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/internal/auth"
	"real-time-forum/internal/services"
)

type LoginHandler struct {
	userService    *services.UserService
	sessionService *services.SessionService
}

func NewLoginHandler(us *services.UserService, ss *services.SessionService) *LoginHandler {
	return &LoginHandler{userService: us, sessionService: ss}
}

type LoginRequest struct {
	Authenticator string `json:"username"`
	Password      string `json:"password"`
}

// Gestion de la connexion
// Récupère le formulaire de connexion et crée un cookie dans la BDD des sessions
func (h *LoginHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	var req LoginRequest
	json.NewDecoder(r.Body).Decode(&req)

	user, err := h.userService.Authenticate(req.Authenticator, req.Password)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]any{
			"success": false,
			"message": "Identifiants incorrects",
		})
		return
	}

	token, err := auth.GenerateToken(user.ID)
	if err != nil {
		logMsg := fmt.Sprintf("Erreur lors de la génération du token : %v", err)
		log.Print(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	if err := h.sessionService.CreateSession(user.ID, token); err != nil {
		logMsg := fmt.Sprintf("Erreur lors de la création de la session : %v", err)
		log.Print(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		MaxAge:   3600,
		Secure:   false,
		SameSite: http.SameSiteStrictMode,
	})

	json.NewEncoder(w).Encode(map[string]any{
		"success": true,
		"message" : "Connexion réussie.",
	})
}