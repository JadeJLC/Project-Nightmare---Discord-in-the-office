package domain

type Category struct {
	ID int `json:"id"`
	Name string `json:"name"`
	Description string `json:"description"`
	LastPost LastPost `json:"lastpost"`
}

type CategoryRepo interface {
	GetCategoryFromID(catID int) (*Category, error)
	GetAllCategories() ([]*Category, error)
}