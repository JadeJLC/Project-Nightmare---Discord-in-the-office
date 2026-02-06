package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"real-time-forum/internal/services"
	"strconv"
)

type PostHandler struct{
   	messageService *services.MessageService
	topicService *services.TopicService
	userService *services.UserService
}


func NewPostHandler(ms *services.MessageService, ts *services.TopicService, us *services.UserService) *PostHandler {
    return &PostHandler{messageService: ms, topicService: ts, userService: us}
}

/*
* Gère l'envoi d'un message par l'utilisateur
* Mode "newtopic" : création d'un nouveau sujet dans la catégorie {sectionID} et ajout de son premier message à la BDD
* Mode "reply" : retrouve le sujet {sectionID} et ajoute son nouveau message associé dans la BDD
*/
func (h *PostHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    mode := r.URL.Query().Get("mode")
	sectionID, err := strconv.Atoi(r.URL.Query().Get("sectionID"))
	username := r.URL.Query().Get("user")

	user, err := h.userService.GetUserByUsername(username)

	if err !=nil {
		log.Print("Erreur dans la récupération des information du sujet :", err)
		return
	}

	type formData struct {
		Title string
		Content string
	 }

	var newTopic formData 

    if err := json.NewDecoder(r.Body).Decode(&newTopic); err != nil {
        http.Error(w, "Données invalides", http.StatusBadRequest)
        return
    }

	topicID := sectionID
	

	if mode == "newtopic" {
		h.topicService.CreateTopic(sectionID, int(user.ID), newTopic.Title)
		topicData, err := h.topicService.GetTopicByTitle(newTopic.Title)

		if err !=nil {
		return
		}
		topicID = topicData.ID
	} 
	

    h.messageService.CreateMessage(topicID, newTopic.Content, int(user.ID))

	json.NewEncoder(w).Encode(map[string]string{"status": "success"})

}
