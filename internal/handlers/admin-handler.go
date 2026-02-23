package handlers

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/services"
)

type AdminHandler struct{
     userService *services.UserService
	 sessionService *services.SessionService
	 adminService *services.AdminService
}


func NewAdminHandler(us *services.UserService, ss *services.SessionService, as *services.AdminService) *AdminHandler {
    return &AdminHandler{userService: us, sessionService: ss, adminService: as}
}

func (h *AdminHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	mode := r.URL.Query().Get("mode")
	cookie, err := r.Cookie("auth_token")
	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Impossible d'accéder au cookie pour poster un message : %v", err)
        h.adminService.SaveLogToDatabase(logMsg)
        http.Error(w, logMsg, http.StatusUnauthorized)
        return
    }

	sessionUserID, sessionUserRole, err := h.sessionService.GetUserID(cookie.Value)	

	if sessionUserID == "" || err != nil{
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'utilisateur connectée : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	sessionUserName, _ := h.userService.GetUserByID(sessionUserID)
	if sessionUserRole != "1" {
		logMsg := fmt.Sprintf("ALERT : Un utilisateur non autorisé a tenté d'accéder à une fonction administrative : %v (%v)", sessionUserName, sessionUserID)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusForbidden)
		return
	}

	if mode == "ban" {
		userID := r.URL.Query().Get("userID")

		user, err := h.userService.GetUserByID(userID)

		if err != nil {
		logMsg := fmt.Sprintf("ERROR : Impossible de récupérer les informations de l'utilisateur à bannir : %v, %v", userID, err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusBadRequest)
		return
		}

		if user.Role == 1 {
			logMsg := fmt.Sprintf("ALERT : %v a tenté de bannir un administrateur : %v", sessionUserName, user.Username)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusBadRequest)
			return
		}

		err = h.adminService.BanUser(userID)

		if err != nil {
			logMsg := fmt.Sprintf("ERROR : Erreur lors du bannissement de l'utilisateur : %v", err)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
			return
		}

		logMsg := fmt.Sprintf("ADMIN : L'utilisateur %v a été banni par %v.", user.Username, sessionUserName)
		h.adminService.SaveLogToDatabase(logMsg)
		return
	}

	if mode == "unban" {
		userID := r.URL.Query().Get("userID")

		user, err := h.userService.GetUserByID(userID)

		if err != nil {
			logMsg := fmt.Sprintf("ERROR : Impossible de récupérer les informations de l'utilisateur à débannir : %v, %v", userID, err)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusBadRequest)
			return
		}

		if user.Role != 4 {
			logMsg := fmt.Sprintf("LOG : Tentative de débannir un utilisateur qui n'était pas banni : %v", sessionUserName)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusBadRequest)
			return
		}

		err = h.adminService.UnbanUser(userID)

		if err != nil {
			logMsg := fmt.Sprintf("ERROR : Erreur lors du débannissement de l'utilisateur : %v", err)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
			return
		}

		logMsg := fmt.Sprintf("ADMIN : L'utilisateur %v a été débanni par %v.", user.Username, sessionUserName)
		h.adminService.SaveLogToDatabase(logMsg)
		return
	}


}