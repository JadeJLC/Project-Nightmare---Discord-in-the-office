package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"real-time-forum/internal/domain"
	"real-time-forum/internal/services"
	"strconv"
)

type CategoryHandler struct{
     userService *services.UserService
	 messageService *services.MessageService
	 categoryService services.CategoryService
	 topicService *services.TopicService
	 adminService *services.AdminService
}


func NewCategoryHandler(us *services.UserService, ms *services.MessageService, cs services.CategoryService, ts *services.TopicService, as *services.AdminService) *CategoryHandler {
    return &CategoryHandler{userService: us, messageService: ms, categoryService: cs, topicService: ts, adminService: as}
}

/*
* Fonction appelée en cliquant sur le nom d'une catégorie
* Récupère la liste des sujets présents dans la catégorie pour l'envoyer à la page
*/
func (h *CategoryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    catID, err := strconv.Atoi(r.URL.Query().Get("catID"))
	
	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'ID de catégorie : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")

	catInfo, err := h.categoryService.GetCategoryFromID(catID)
	if err == sql.ErrNoRows {
		logMsg := fmt.Sprintf("LOG : Tentative d'accès à une catégorie inexistante : %d", catID)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusNotFound)
		return
	} else if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans l'ouverture de la catégorie : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

    list, err := h.topicService.GetTopicsByCategory(catID)
	list.CatName = catInfo.Name
    if err != nil || len(list.Topics) == 0 {
		list.Topics = []*domain.Topic{{Title: "Nothing to Display"}}
		json.NewEncoder(w).Encode(list)
		return
    }

	for _, topic := range list.Topics {
		topic.PostList, err = h.messageService.GetMessagesByTopic(topic.ID)	
		if len(topic.PostList) == 0 {
			logMsg := fmt.Sprintf("ALERT : Aucun message trouvé sur le sujet %v. Vérifier ou supprimer le sujet.", topic.ID)
			h.adminService.SaveLogToDatabase(logMsg)
			continue
		}
		if err != nil {
			logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération des messages du sujet %v : %v", topic.Title, err)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
		}
	}

    json.NewEncoder(w).Encode(list)
	return
}
