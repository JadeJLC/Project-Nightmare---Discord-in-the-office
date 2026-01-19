package main

import (
	"log"
	"net/http"
	"real-time-forum/internal/handlers"
)

func main(){
	router := handlers.Router()
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