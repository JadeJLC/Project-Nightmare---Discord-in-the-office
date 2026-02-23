package handlers

import (
	"fmt"
	"net/http"
	"real-time-forum/internal/services"
	"strconv"
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
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'ID de l'utilisateur connecté : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	sessionData, err := h.userService.GetUserByID(sessionUserID)
	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'utilisateur connecté : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	sessionUserName := sessionData.Username

	if mode == "delete" {
		h.DeleteUser(w, r, sessionUserName, sessionUserRole, sessionUserID)
		return
	}

	if sessionUserRole != "1" && sessionUserRole != "0" {
		logMsg := fmt.Sprintf("ALERT : Un utilisateur non autorisé a tenté d'accéder à une fonction administrative : %v (%v)", sessionUserName, sessionUserID)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusForbidden)
		return
	}

	if mode == "ban" {
		h.BanUser(w, r, sessionUserName)
		return
	}

	if mode == "unban" {
		h.UnbanUser(w, r, sessionUserName)
		return
	}

	if mode == "promote" {
		h.PromoteUser(w, r, sessionUserName, sessionUserRole)
		return
	}
}

func (h *AdminHandler) DeleteUser(w http.ResponseWriter, r *http.Request, sessionUserName, sessionUserRole, sessionUserID string) {
	username := r.URL.Query().Get("user")
	if sessionUserName != username && sessionUserRole != "1" {
		logMsg := fmt.Sprintf("ALERT : Un utilisateur non autorisé (%v) a tenté de supprimer un compte qui n'est pas le sien : %v", sessionUserName, username)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusForbidden)
		return
	}

	user, err := h.userService.GetUserByUsername(username)
	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur dans la récupération de l'ID de l'utilisateur à supprimer : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	userID := user.ID
	err = h.adminService.DeleteUser(userID)
	if err != nil {
			logMsg := fmt.Sprintf("ERROR : Erreur lors de la suppression de l'utilisateur : %v", err)
			h.adminService.SaveLogToDatabase(logMsg)
			http.Error(w, logMsg, http.StatusInternalServerError)
			return
	}

	logMsg := fmt.Sprintf("USER : L'utilisateur %v a supprimé son compte.", sessionUserName)

	if sessionUserRole == "1" {
		logMsg = fmt.Sprintf("ADMIN : L'utilisateur %v a été supprimé par %v.", user.Username, sessionUserName)
	} else {
		PerformLogout(w, r, h.sessionService, h.adminService)
	}
	h.adminService.SaveLogToDatabase(logMsg)
	return
}

func (h *AdminHandler) BanUser(w http.ResponseWriter, r *http.Request, sessionUserName string) {
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

func (h *AdminHandler) UnbanUser(w http.ResponseWriter, r *http.Request, sessionUserName string) {

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

func (h *AdminHandler) PromoteUser(w http.ResponseWriter, r *http.Request, sessionUserName, sessionUserRole string)  {
	userID := r.URL.Query().Get("userID")
	user, err := h.userService.GetUserByID(userID)

	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Impossible de récupérer les informations de l'utilisateur à promouvoir : %v, %v", userID, err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusBadRequest)
		return
	}

	if (sessionUserRole != "0" && user.Role == 1) {
		logMsg := fmt.Sprintf("ALERT : %v a tenté de modifier le rôle d'un administrateur : %v", sessionUserName, user.Username)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusBadRequest)
		return
	}

	roleID, _ := strconv.Atoi(r.URL.Query().Get("role"))
	err = h.adminService.PromoteUser(userID, roleID)

	if err != nil {
		logMsg := fmt.Sprintf("ERROR : Erreur lors du changement de rôle de l'utilisateur : %v", err)
		h.adminService.SaveLogToDatabase(logMsg)
		http.Error(w, logMsg, http.StatusInternalServerError)
		return
	}

	role := ""
	switch roleID {
	case 1 : 
		role = "Administrateur"
		break
	case 2 :
		role = "Modérateur"
		break
	case 3 :
		role = "Simple membre"
		break

	}

	logMsg := fmt.Sprintf("ADMIN : L'utilisateur %v a été modifié par %v. Il est désormais %v.", user.Username, sessionUserName, role)
	h.adminService.SaveLogToDatabase(logMsg)
	return

}