package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"real-time-forum/internal/domain"
)

func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	var newUser domain.User
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Données invalides", http.StatusBadRequest)
		return
	}
	existingUser, err := userRepository.GetUserByEmail(newUser.Email)
	if err == nil && existingUser != nil {
		http.Error(w, "Email déjà associé à un compte", http.StatusBadRequest)
		return
	}
	existingUser, err = userRepository.GetUserByUsername(newUser.Username)
	if err == nil && existingUser != nil {
		http.Error(w, "Pseudonyme déjà associé à un compte", http.StatusBadRequest)
		return
	}

	err = userRepository.Create(&newUser)
	if err !=nil {
		log.Fatal("Erreur injection : ", err)
		return
	}
	fmt.Printf("Nouvel utilisateur reçu : %+v\n", newUser)

	// Réponse au client
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}