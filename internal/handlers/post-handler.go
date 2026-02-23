package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/internal/services"
	"strconv"
)

type PostHandler struct{
   	messageService 	*services.MessageService
	topicService 	*services.TopicService
	userService 	*services.UserService
	sessionService 	*services.SessionService
	adminService 	*services.AdminService
}

type formData struct {
		Title string
		Content string
}


func NewPostHandler(ms *services.MessageService, ts *services.TopicService, us *services.UserService, ss *services.SessionService, as *services.AdminService) *PostHandler {
    return &PostHandler{messageService: ms, topicService: ts, userService: us, sessionService: ss, adminService: as}
}

/*
* Gère l'envoi d'un message par l'utilisateur
* Mode "newtopic" : création d'un nouveau sujet dans la catégorie {sectionID} et ajout de son premier message à la BDD
* Mode "reply" : retrouve le sujet {sectionID} et ajoute son nouveau message associé dans la BDD
* Mode "edit" : récupère les informations du post {postID} pour pouvoir en modifier le contenu
* Mode "delete" : récupère les informations du post {postID} et du sujet associé {topicID} pour pouvoir le supprimer de la BDD
*/
func (h *PostHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// Récupération des informations nécessaires dans tous les modes
    mode := r.URL.Query().Get("mode")
	cookie, err := r.Cookie("auth_token")
	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Impossible d'accéder au cookie pour poster un message : %v", err)
        h.adminService.SaveLogToDatabase(logMsg)
        http.Error(w, logMsg, http.StatusUnauthorized)
        return
    }

	sessionUserID, sessionUserRole, _ := h.sessionService.GetUserID(cookie.Value)	
	
	if (sessionUserRole == "4") {
		logMsg := fmt.Sprintf("ALERT : Un utilisateur banni (ID : %v) a tenté d'accéder à une fonction non autorisée : %v", sessionUserID, mode)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusForbidden)
		return
	}

	if mode == "delete" {
	h.DeleteMessageFromBDD(w, r, sessionUserID, sessionUserRole)
	return
	}

	// Récupération des informations nécessaires pour l'édition ou l'ajout d'un message
	var newTopic formData 

    if err := json.NewDecoder(r.Body).Decode(&newTopic); err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération des données du message à envoyer : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
        http.Error(w, "Données invalides", http.StatusBadRequest)
        return
    }

	if mode == "edit" {
		h.EditMessageInBDD(w, r, sessionUserID, sessionUserID, newTopic)
		return
	} 


	// Récupération des informations nécessaires uniquement à l'ajour d'un message
	sectionID, err := strconv.Atoi(r.URL.Query().Get("sectionID"))
	username := r.URL.Query().Get("user")

	user, err := h.userService.GetUserByUsername(username)
	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération des informations de l'utilisateur connecté : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		return
	}
	
	topicID := sectionID
	if mode == "newtopic" {
		err := h.topicService.CreateTopic(sectionID, user.ID, newTopic.Title)
		if err !=nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la création d'un nouveau sujet : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
		}

		topicData, err := h.topicService.GetTopicByTitle(newTopic.Title)

		if err !=nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération du nouveau sujet créé : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
		}

		topicID = topicData.ID
	} 
	

    h.messageService.CreateMessage(topicID, newTopic.Content, user.ID)	

	json.NewEncoder(w).Encode(map[string]string{"status": "success"})

}
 
/*
* Fonction pour la suppression d'un message dans la base de données
* Reçoit les informations de l'utilisateur connecté (ID et role)
* Vérifie les autorisations avant de supprimer le message. Si le message est supprimé par l'administrateur, il est effacé. S'il est supprimé par un membre,
* il est conservé dans la BDD des logs
*/
func (h *PostHandler) DeleteMessageFromBDD(w http.ResponseWriter, r *http.Request, sessionUserID, sessionUserRole string) {
	postID, err := strconv.Atoi(r.URL.Query().Get("postID"))
	topicID, err2 := strconv.Atoi(r.URL.Query().Get("topicID"))
	topicDeleted := false

	if err != nil || err2 != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération des informations du message à supprimer : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	deletedPost, err := h.messageService.GetMessageByID(postID)

	if err == sql.ErrNoRows {
		logMsg := fmt.Sprintf("LOG : Le message à supprimer n'existe pas ou plus : %v", postID)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusBadRequest)
		return
	} else if err != nil {
		logMsg := fmt.Sprintf("ERROR : Echec de la récupération du message à supprimer : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	canDelete := (deletedPost.Author.ID == sessionUserID || sessionUserRole == "1" || sessionUserRole == "2")
    if !canDelete {
        logMsg := fmt.Sprintf("ALERT : Tentative de suppression du message d'un autre utilisateur")
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusForbidden)
		return
    }
	
	mode := "MEMBER"
	if sessionUserRole == "1" {mode = "ADMIN"} else if sessionUserRole == "2" {mode = "MODO"}

	username := r.URL.Query().Get("user")
	err = h.messageService.DeleteMessage(topicID, postID, mode, username)
	if err == sql.ErrNoRows {
		logMsg := fmt.Sprintf("LOG : Tentative de suppression d'un message inexistant : %d", postID)
		h.adminService.SaveLogToDatabase(logMsg)
	} else if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la suppression du message : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	messages, err := h.messageService.GetMessagesByTopic(topicID)
	if len(messages) == 0 {
		logMsg := fmt.Sprintf("LOG : Ce sujet ne contient plus aucun message : %d. Suppression du sujet", topicID)
		h.adminService.SaveLogToDatabase(logMsg)
		err := h.topicService.DeleteTopic(topicID)

		if err == sql.ErrNoRows {
			logMsg := fmt.Sprintf("LOG : Le sujet à supprimer n'existe pas ou plus : %v", topicID)
			h.adminService.SaveLogToDatabase(logMsg)
		} else if err != nil {
			logMsg := fmt.Sprintf("ERROR : Erreur dans la suppression du sujet : %v", err)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
			return
		}
		topicDeleted = true
	} 

		response := map[string]interface{}{
    	"status":       "success",
    	"topicDeleted": topicDeleted,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	
		return
}

func (h *PostHandler) EditMessageInBDD (w http.ResponseWriter, r *http.Request, sessionUserID, sessionUserRole string, newTopic formData) {
	postID, err := strconv.Atoi(r.URL.Query().Get("postID"))
	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'ID du message à éditer : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	editedPost, err := h.messageService.GetMessageByID(postID)
	if err != nil {
		if err == sql.ErrNoRows {
			logMsg := fmt.Sprintf("LOG : Tentative de modification d'un message inexistant : %d", postID)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusNotFound)
		} else {
			logMsg := fmt.Sprintf("ERROR : Echec dans la récupération du post à modifier %v: ", err)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
		}
		return
	}

	if editedPost.Author.ID == sessionUserID || sessionUserRole == "1" {
		err := h.messageService.EditMessage(postID, newTopic.Content)
		if err == sql.ErrNoRows {
			logMsg := fmt.Sprintf("ERROR : Echec dans la tentative de modification de post : %v", err)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
		} else if err != nil{
		logMsg := fmt.Sprintf("ALERT : Tentative de modification du message d'un autre utilisateur")
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, "Tentative de modification du message d'un autre utilisateur", http.StatusForbidden)
		return
	}

}
}