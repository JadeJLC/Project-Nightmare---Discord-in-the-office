package domain

type User struct {
	ID          int64  `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Firstname   string `json:"firstname"`
	Lastname    string `json:"lastname"`
	Age         int    `json:"age,string"`
	Gender      string `json:"genre"`
	Image       string `json:"image"`
	Inscription string `json:"inscription"`
}

type UserRepository interface {
	Create(user *User) error
	GetUserByEmail(email string) (*User, error)
	GetUserByUsername(username string) (*User, error)
	GetUserByToken(token string) (*User, error)
	GetUserByID(id int) (*User, error)
	UpdateUserProfile(userID int, user *User) error
}
