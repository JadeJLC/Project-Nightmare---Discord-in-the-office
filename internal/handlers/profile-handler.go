package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"real-time-forum/internal/domain"
	"real-time-forum/internal/services"
)

type ProfileHandler struct{
     userService *services.UserService
	 messageService *services.MessageService
	 reactionService *services.ReactionService
	 topicService *services.TopicService
}


func NewProfileHandler(us *services.UserService, ms *services.MessageService, rs *services.ReactionService, ts *services.TopicService) *ProfileHandler {
    return &ProfileHandler{userService: us, messageService: ms, reactionService: rs, topicService: ts}
}


/*
* Affichage d'un profil utilisateur
* Compare l'utilisateur en ligne et l'utilisateur connecté pour savoir si on regarde son propre profil ou un autre
* Récupère les messages, les sujets ou les réactions selon le mode d'affichage
*/
func (h *ProfileHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    profileUser := r.URL.Query().Get("profile")
    loggedUser := r.URL.Query().Get("user")
    mode := r.URL.Query().Get("mode")

    data, err := h.userService.GetProfile(profileUser, loggedUser)
    if err != nil {
        logMsg := fmt.Sprintf("LOG : Tentative d'accès au profil d'un utilisateur introuvable : %v", profileUser)
        log.Print(logMsg)
        http.Error(w, logMsg, http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")

    switch mode {
    case "message":
        list, err := h.messageService.GetMessagesByAuthor(data.ID)
        if err != nil {
            list = []*domain.Message{{Content: "Nothing to Display"}}
        }
        json.NewEncoder(w).Encode(list)
        return

    case "reactions":
        list, err := h.reactionService.GetUserReactions(data.ID)
        if err != nil || len(list) == 0 {
            list = []*domain.ReactionDisplay{{TopicTitle: "Nothing to Display"}}
        }
        json.NewEncoder(w).Encode(list)
        return

    case "topics":
        list, err := h.topicService.GetTopicsByAuthorID(data.ID)
        if err != nil || len(list) == 0 {
            list = []*domain.Topic{{Title: "Nothing to Display"}}
        }
        json.NewEncoder(w).Encode(list)
        return

    default:
        json.NewEncoder(w).Encode(data)
    }
}

func (h *ProfileHandler) GetAvatarList(w http.ResponseWriter, r *http.Request) {
    files, err := os.ReadDir("./internal/templates/assets/images-avatar") 
    if err != nil {
        logMsg := fmt.Sprintf("Erreur dans la récupération de la liste des avatars : %v", err)
        log.Print(logMsg)
        http.Error(w, logMsg, http.StatusInternalServerError)
        return
    }

    var fileNames []string
    for _, file := range files {
        if !file.IsDir() {
            fileNames = append(fileNames, file.Name())
        }
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(fileNames)
}