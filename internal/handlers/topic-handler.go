package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time-forum/internal/services"
	"strconv"
)

type TopicHandler struct{
	 messageService *services.MessageService
	 topicService *services.TopicService
}


func NewTopicHandler(ms *services.MessageService, ts *services.TopicService) *TopicHandler {
    return &TopicHandler{messageService: ms, topicService: ts}
}

/*
* Affichage d'un sujet
* Récupère tous les messages associés au sujet dans la BDD pour les afficher
*/
func (h *TopicHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    topicID, err := strconv.Atoi(r.URL.Query().Get("topicID"))
	postID, err2 := strconv.Atoi(r.URL.Query().Get("postID"))
	if err != nil {
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
		http.Error(w, "Erreur dans le format du sujet", http.StatusInternalServerError)
	}
	
    json.NewEncoder(w).Encode(topicInfo)
	return
}