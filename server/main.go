package main

import (
	"log"
	"net/http"
	"real-time-forum/internal/config"
	"real-time-forum/internal/handlers"
	"real-time-forum/internal/repositories"
)

func main(){
	db := config.InitDB()
	defer db.Close()

	userRepository := repositories.NewUserRepository(db)
	router := handlers.Router(userRepository)
	//5- Lancement serveur:
	addr := ""//os.Getenv("SERVER_PORT")
	if addr == "" {
		addr = ":5005" // valeur par défaut en dev, sinon c'est une variable définie dans .env
	}
	log.Printf("Server start → http://localhost%s\n", addr)
	err := http.ListenAndServe(addr, router)
	if err != nil {
		log.Fatal("❌ error trying to run the server: ", err)
	}
}