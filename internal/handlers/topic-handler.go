package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"real-time-forum/internal/services"
	"strconv"
)

type TopicHandler struct{
	 messageService 	*services.MessageService
	 topicService 		*services.TopicService
	 reactionService 	*services.ReactionService
	 sessionService 	*services.SessionService
	 adminService 		*services.AdminService
}


func NewTopicHandler(ms *services.MessageService, ts *services.TopicService, rs *services.ReactionService, ss *services.SessionService, as *services.AdminService) *TopicHandler {
    return &TopicHandler{messageService: ms, topicService: ts, reactionService: rs, sessionService: ss, adminService: as}
}

/*
* Affichage d'un sujet
* Récupère tous les messages associés au sujet dans la BDD pour les afficher
*/
func (h *TopicHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    topicID, err := strconv.Atoi(r.URL.Query().Get("topicID"))
	postID, err2 := strconv.Atoi(r.URL.Query().Get("postID"))
	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Identifiant de sujet invalide : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusNotFound)
	}
	if err2 != nil {
		postID = 0
	}

	w.Header().Set("Content-Type", "application/json")

	
	topicInfo, err := h.topicService.GetTopicById(topicID)
	if err != nil {

		if err == sql.ErrNoRows {
		logMsg := fmt.Sprintf("LOG : Tentative d'accès à un sujet inexistant : %d", topicID)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusNotFound)
		} else if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération du sujet à afficher : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
		}
		return
	}

    list, err := h.messageService.GetMessagesByTopic(topicID)
	
	topicInfo.PostList = list
	topicInfo.CurrentPost = postID
	
    if err != nil || len(topicInfo.PostList) == 0 {
		logMsg := fmt.Sprintf("ERROR : Erreur dans le format du sujet : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
	}
	
    json.NewEncoder(w).Encode(topicInfo)
	return
}

func (h *TopicHandler) ReactOnAPost(w http.ResponseWriter, r *http.Request) {
     files, err := os.ReadDir("./internal/templates/assets/images-reactions") 
    if err != nil {
		logMsg := fmt.Sprintf("Erreur dans la récupération des images de réaction : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
        http.Error(w, logMsg, http.StatusInternalServerError)
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
			logMsg := fmt.Sprintf("ERROR : Identifiant de sujet invalide : %v", err)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusNotFound)
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
		logMsg := fmt.Sprintf("LOG : Erreur dans la récupération du cookie pour l'accès au sujet : %v", err)
		log.Print(logMsg)
		http.Error(w, logMsg, http.StatusUnauthorized)
    }

	userID, _, _ := h.sessionService.GetUserID(cookie.Value)

	return userID
}

func (h *TopicHandler) GetUserReactionsOnPost(w http.ResponseWriter, r *http.Request) {
	postID, err := strconv.Atoi(r.URL.Query().Get("postID"))
    if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'ID du post : %v", err)
		log.Print(logMsg)
        http.Error(w, logMsg, http.StatusNotFound)
        return
    }

	userID := h.getUserIDFromSession(w, r)

   	reactionList, err := h.reactionService.GetUserReactionsOnPost(postID,userID)
   	if err != nil && err != sql.ErrNoRows {
		logMsg := fmt.Sprintf("Erreur dans la récupération des réactions de l'utilisateur : %v", err)
		log.Print(logMsg)
        http.Error(w, logMsg, http.StatusInternalServerError)
        return
   	}

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(reactionList)
}