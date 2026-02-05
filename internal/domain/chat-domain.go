package domain

import "time"

type DM struct {
    ID           int       `json:"id"`
    SenderID       int       `json:"from_id"`
    SenderName string    `json:"from_username"`
    ReceiverID         int       `json:"to_id"`
    ReceiverName   string    `json:"to_username"`
    Content      string    `json:"content"`
    CreatedAt    time.Time `json:"created_at"`
}


type Conversation struct {
    ID            int       `json:"id"`
    User1ID       int       `json:"user1_id"`
    User2ID       int       `json:"user2_id"`
    LastMessageAt time.Time `json:"last_message_at"`
}
