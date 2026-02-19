package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"real-time-forum/internal/services"
	"strconv"
)

type TopicHandler struct{
	 messageService *services.MessageService
	 topicService *services.TopicService
	 reactionService *services.ReactionService
	 sessionService *services.SessionService
}


func NewTopicHandler(ms *services.MessageService, ts *services.TopicService, rs *services.ReactionService, ss *services.SessionService) *TopicHandler {
    return &TopicHandler{messageService: ms, topicService: ts, reactionService: rs, sessionService: ss}
}

/*
* Affichage d'un sujet
* Récupère tous les messages associés au sujet dans la BDD pour les afficher
*/
func (h *TopicHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    topicID, err := strconv.Atoi(r.URL.Query().Get("topicID"))
	postID, err2 := strconv.Atoi(r.URL.Query().Get("postID"))
	if err != nil {
		log.Print("Identifiant de sujet invalide : ", err)
		http.Error(w, "Identifiant de sujet invalide", http.StatusNotFound)
	}
	if err2 != nil {
		postID = 0
	}

	w.Header().Set("Content-Type", "application/json")

	
	topicInfo, err := h.topicService.GetTopicById(topicID)
	if err != nil {
		log.Print("Erreur dans la récupération du sujet :", err)
		return
	}

    list, err := h.messageService.GetMessagesByTopic(topicID)
	
	topicInfo.PostList = list
	topicInfo.CurrentPost = postID
	
    if err != nil || len(topicInfo.PostList) == 0 {
		log.Print("Erreur dans le format du sujet : ", err)
		http.Error(w, "Erreur dans le format du sujet", http.StatusInternalServerError)
	}
	
    json.NewEncoder(w).Encode(topicInfo)
	return
}

func (h *TopicHandler) ReactOnAPost(w http.ResponseWriter, r *http.Request) {
     files, err := os.ReadDir("./internal/templates/assets/images-reactions") 
    if err != nil {
        http.Error(w, "Unable to read directory", http.StatusInternalServerError)
        return
    }

	mode := r.URL.Query().Get("mode")

	if mode == "files" {
    var fileNames []string
    for _, file := range files {
        if !file.IsDir() {
            fileNames = append(fileNames, file.Name())
        }
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(fileNames)
	}

	if mode == "add" || mode == "remove" {
	
		postID, err := strconv.Atoi(r.URL.Query().Get("postID"))
	if err != nil {
		log.Print("Identifiant de sujet invalide : ", err)
		http.Error(w, "Identifiant de sujet invalide", http.StatusNotFound)
	}
	reactionType := r.URL.Query().Get("reactionType")
	userID := h.getUserIDFromSession(w, r)

	switch mode {
	case "add" :
		h.reactionService.AddReaction(postID, userID, reactionType)
		return
	case "remove":
		h.reactionService.DeleteReaction(postID, userID, reactionType)
		return
	}

	}

}

func (h *TopicHandler) getUserIDFromSession(w http.ResponseWriter, r *http.Request) string {
	 cookie, err := r.Cookie("auth_token")
    if err != nil {
		log.Print(err)
		http.Error(w, "Non connecté", http.StatusUnauthorized)
    }

	userID, _ := h.sessionService.GetUserID(cookie.Value)

	return userID
}

func (h *TopicHandler) GetUserReactionsOnPost(w http.ResponseWriter, r *http.Request) {
	 postID, err := strconv.Atoi(r.URL.Query().Get("postID"))
    if err != nil {
		log.Print("Erreur dans la récupération du post : ", err)
        http.Error(w, "Erreur dans la récupération du post", http.StatusInternalServerError)
        return
    }

	userID := h.getUserIDFromSession(w, r)

   reactionList, err := h.reactionService.GetUserReactionsOnPost(postID,userID)
   if err != nil && err != sql.ErrNoRows {
	log.Print("Erreur dans la récupération des réactions de l'utilisateur : ", err)
        http.Error(w, "Erreur dans la récupération des réactions de l'utilisateur", http.StatusInternalServerError)
        return
   }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(reactionList)


   
}