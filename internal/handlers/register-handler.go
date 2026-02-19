// internal/handlers/register_handler.go
package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time-forum/internal/auth"
	"real-time-forum/internal/domain"
	"real-time-forum/internal/services"
	"regexp"
)

type RegisterHandler struct {
    userService *services.UserService
    sessionService *services.SessionService
}

func NewRegisterHandler(us *services.UserService, ss *services.SessionService) *RegisterHandler {
    return &RegisterHandler{userService: us, sessionService: ss}
}

/*
* Gestion de l'inscription d'un utilisateur ou de la modification d'un profil
* Le mode "edit" permet de modifier un profil, le mode "avatar" de changer d'image
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

    isValidUsername := regexp.MustCompile(`^[a-zA-Z0-9_]+$`).MatchString(newUser.Username)
    if !isValidUsername || len(newUser.Username) < 3 || len(newUser.Username) > 20 {
        http.Error(w, "Nom d'utilisateur invalide (Alphanumérique, 3-20 caractères)", http.StatusBadRequest)
        return
    }

    ip := r.RemoteAddr

    if auth.IsRateLimited(ip) {
        http.Error(w, "Veuillez attendre entre deux requêtes.", http.StatusTooManyRequests)
        return
    }

    mode := r.URL.Query().Get("mode")    

    if mode == "edit" || mode == "avatar" {
       if !h.checkUserLoggedIn(w, r, newUser.Username) {
        log.Print("Autorisation de modification de profil refusée")
            http.Error(w, "Autorisation de modification de profil refusée", http.StatusUnauthorized)
            return
        }

        if mode == "edit" {
        if err := h.userService.EditProfile(newUser); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
            }
        } 
        
        if mode =="avatar" {
            image := newUser.Image

            if err := h.userService.EditAvatar(newUser.Username, image); err != nil {
            http.Error(w, err.Error(), http.StatusBadRequest)
            return
            }

        }
    } else  {
        if err := h.userService.Register(&newUser); err != nil {
        http.Error(w, err.Error(), http.StatusBadRequest)
   
        return
    }
    }

    

    json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}


func (h *RegisterHandler) checkUserLoggedIn(w http.ResponseWriter, r *http.Request, targetUsername string) bool {
    
    cookie, err := r.Cookie("auth_token")
    if err != nil {
        return false
    }

    targetUser, err := h.userService.GetUserByUsername(targetUsername)
    sessionUserID, err2 := h.sessionService.GetUserID(cookie.Value)


    if err != nil || err2 != nil {
        log.Print(err)
        log.Print(err2)
        return false 
    }

    if targetUser.ID != sessionUserID {
        return false 
    }

    return true 
}