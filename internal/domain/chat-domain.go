package domain

import "time"

type DM struct {
    ID            int       `json:"id"`
    SenderID      string       `json:"sender_id"`
    SenderName    string    `json:"sender_username"`
    SenderImage   string    `json:"sender_image"`
    ReceiverID    string       `json:"receiver_id"`
    ReceiverName  string    `json:"receiver_username"`
    ReceiverImage string    `json:"receiver_image"`
    Content       string    `json:"content"`
    CreatedAt     time.Time `json:"created_at"`
}




type Conversation struct {
    ID            int       `json:"id"`
    User1ID       string       `json:"user1_id"`
    User2ID       string       `json:"user2_id"`
    LastMessageAt time.Time `json:"last_message_at"`
}
