package handlers

import (
	"encoding/json"
	"net/http"
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

func (h *ProfileHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    profileUser := r.URL.Query().Get("profile")
    loggedUser := r.URL.Query().Get("user")
    mode := r.URL.Query().Get("mode")

    // 1. Get user data (Needed for the ID in all cases)
    data, err := h.userService.GetProfile(profileUser, loggedUser)
    if err != nil {
        http.Error(w, "User not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")

    // 2. Decide what to send based on mode
    switch mode {
    case "message":
        list, err := h.messageService.GetMessagesByAuthor(int(data.ID))
        if err != nil {
            list = []*domain.Message{{Content: "Nothing to Display"}}
        }
        json.NewEncoder(w).Encode(list)
        return

    case "reactions":
        list, err := h.reactionService.GetUserReactions(int(data.ID))
        if err != nil {
            list = []*domain.Reaction{{Type: "Nothing to Display"}}
        }
        json.NewEncoder(w).Encode(list)
        return

    case "topics":
        list, err := h.topicService.GetTopicsByAuthorID(int(data.ID))
        if err != nil {
            list = []*domain.Topic{{Title: "Nothing to Display"}}
        }
        json.NewEncoder(w).Encode(list)
        return

    default:
        // If no mode (or unknown mode), send the profile info for the header
        json.NewEncoder(w).Encode(data)
    }
}