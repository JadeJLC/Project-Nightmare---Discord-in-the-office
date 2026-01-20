package domain

type User struct {
	ID        int64
	Username  string `json:"username"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Firstname string `json:"firstname"`
	Lastname  string `json:"lastname"`
	Age       int64  `json:"age,string"`
	Gender    string `json:"genre"`
}

type UserRepository interface {
	Create(user *User) error
}

type UserService interface {
	Register(user *User) error
}