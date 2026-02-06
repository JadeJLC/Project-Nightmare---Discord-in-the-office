// internal/handlers/register_handler.go
package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/domain"
	"real-time-forum/internal/services"
)

type RegisterHandler struct {
    userService *services.UserService
    sessionService *services.SessionService
}

func NewRegisterHandler(us *services.UserService, ss *services.SessionService) *RegisterHandler {
    return &RegisterHandler{userService: us}
}

/*
* Gestion de l'inscription d'un utilisateur ou de la modification d'un profil
* Le mode "edit" permet de modifier un profil
*/
func (h *RegisterHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }

    var newUser domain.User
    if err := json.NewDecoder(r.Body).Decode(&newUser); err != nil {
        http.Error(w, "Données invalides", http.StatusBadRequest)
        return
    }

    mode := r.URL.Query().Get("mode")

    if mode == "edit" {
        if err := h.userService.EditProfile(newUser); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
        return
        }
    } else  {
        if err := h.userService.Register(&newUser); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
   
        return
    }
    }

    

    json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}
