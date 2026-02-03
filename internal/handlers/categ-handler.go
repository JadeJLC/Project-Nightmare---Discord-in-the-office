package handlers

import (
	"encoding/json"
	"log"
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
}


func NewCategoryHandler(us *services.UserService, ms *services.MessageService, cs services.CategoryService, ts *services.TopicService) *CategoryHandler {
    return &CategoryHandler{userService: us, messageService: ms, categoryService: cs, topicService: ts}
}

func (h *CategoryHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    catID, err := strconv.Atoi(r.URL.Query().Get("catID"))
	if err != nil {
		http.Error(w, "Identifiant de catégorie invalide", http.StatusNotFound)
	}

	w.Header().Set("Content-Type", "application/json")

	
	catInfo, err := h.categoryService.GetCategoryFromID(catID)
	if err != nil {
		log.Print("Erreur dans la récupération de la catégorie :", err)
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
	}

    json.NewEncoder(w).Encode(list)
	return

}