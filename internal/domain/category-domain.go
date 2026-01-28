package domain

type Category struct {
	ID int64 `json:"id"`
	Name string `json:"name"`
	Description string `json:"description"`
}

type CategoryRepo interface {
	GetCategoryFromID(catID int) (*Category, error)
}