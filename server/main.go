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
    sessionRepository := repositories.NewSessionRepo(db)
    categRepository := repositories.NewCategRepo(db)
    topicRepository := repositories.NewTopicRepo(db)
    messageRepository := repositories.NewMessageRepo(db)
    reactionRepository := repositories.NewReactionRepo(db)

    // Service
    userService := services.NewUserService(userRepository)
    sessionService := services.NewSessionService(sessionRepository)
    categService := services.NewCategoryService(categRepository)
    topicService := services.NewTopicService(topicRepository)
    messageService := services.NewMessageService(messageRepository)
    reactionService := services.NewReactionService(reactionRepository)

    // Router (handlers instanciés proprement)
    router := handlers.Router(userService, sessionService, categService, topicService,messageService, reactionService)

    // Lancement serveur
    addr := ":5006"
    log.Printf("Server start → http://localhost%s\n", addr)

    if err := http.ListenAndServe(addr, router); err != nil {
        log.Fatal("❌ error trying to run the server: ", err)
    }
    
}
