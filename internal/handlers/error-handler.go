package handlers

import (
	"encoding/json"
	"net/http"
	"real-time-forum/internal/services"
	"strconv"
)

type ErrorHandler struct{
    sessionService *services.SessionService
}

type Error struct {
	Code uint `json:"error_code"`
	Definition string `json:"error_definition"`
	Message string `json:"error_message"`
}

func NewErrorHandler(ss *services.SessionService) *ErrorHandler {
    return &ErrorHandler{sessionService: ss}
}


func (h *ErrorHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	codeStr := r.URL.Query().Get("code")
    code, err := strconv.Atoi(codeStr)
    if err != nil || code < 100 || code > 599 {
        code = http.StatusInternalServerError
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)

    errorResponse := Error{
        Code:       uint(code),
        Definition: http.StatusText(code),
        Message:    customMessage(code),
    }

    json.NewEncoder(w).Encode(errorResponse)

}

func customMessage(code int) string {
    messages := map[int]string{
        http.StatusNotFound:            "Impossible de trouver la page que vous recherchez. Avez-vous cliqué sur un lien mort ? <img src='/assets/images-avatar/Lucille.png'/>",
        http.StatusForbidden:           "Vous n'avez pas les droits nécessaires pour accéder à cette page ou effectuer cette action. Comment être-vous arrivé là ?<img src='/assets/images-avatar/Cristophe.png'/>",
        http.StatusUnauthorized:        "Seuls les membres du forum peuvent accéder à cette page. Connectez-vous et ressayez ! <img src='/assets/images-avatar/Lisa.png'/>",
        http.StatusInternalServerError: "Notre serveur a rencontré une erreur. Ça ne vient pas de vous, ressayez plus tard et tout sera sûrement rentré dans l'ordre. <img src='/assets/images-avatar/Dwayne.png'/>",
        http.StatusBadRequest:          "La requête est invalide. Avez-vous entré de mauvaises données ou tenté d'accéder à la page de la mauvaise façon ? <img src='/assets/images-avatar/Ulysse.png'/>",
        http.StatusMethodNotAllowed:    "Cette méthode n'est pas autorisée. Dans une entreprise, il faut faire les choses selon le protocole ! <img src='/assets/images-avatar/Stéphanie.png'/>",
    }

    if msg, ok := messages[code]; ok {
        return msg
    }
    return "Une erreur inattendue est survenue. Réessayez plus tard ! <img src='/assets/images-avatar/Sophie.png'/>"
}