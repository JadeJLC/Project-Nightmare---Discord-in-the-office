package domain

type User struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Firstname   string `json:"firstname"`
	Lastname    string `json:"lastname"`
	Age         int    `json:"age,string"`
	Gender      string `json:"genre"`
	Image       string `json:"image"`
	Inscription string `json:"inscription"`
	Role        int    `json:"role"`
}

type UserRepository interface {
	Create(user *User) error
	GetUserByEmail(email string) (*User, error)
	GetUserByUsername(username string) (*User, error)
	GetUserByToken(token string) (*User, error)
	GetUserByID(id string) (*User, error)
	UpdateUserProfile(userID string, user *User) error
}
