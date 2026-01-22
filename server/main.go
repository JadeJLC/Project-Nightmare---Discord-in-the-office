package main

import (
	"log"
	"net/http"
	"real-time-forum/internal/config"
	"real-time-forum/internal/handlers"
	"real-time-forum/internal/repositories"
	"real-time-forum/internal/services"
)

func main() {
    db := config.InitDB()
    defer db.Close()

    // Repository
    userRepository := repositories.NewUserRepository(db)

    // Service
    userService := services.NewUserService(userRepository)

    // Router (handlers instanciés proprement)
    router := handlers.Router(userService)

    // Lancement serveur
    addr := ":5005"
    log.Printf("Server start → http://localhost%s\n", addr)

    if err := http.ListenAndServe(addr, router); err != nil {
        log.Fatal("❌ error trying to run the server: ", err)
    }
}
