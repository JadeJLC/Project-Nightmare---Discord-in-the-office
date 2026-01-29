package services

import (
	"real-time-forum/internal/domain"
	"real-time-forum/internal/repositories"
)

type CategoryService struct {
    repo *repositories.CategoryRepo
}

func NewCategoryService(r *repositories.CategoryRepo) *CategoryService {
    return &CategoryService{repo: r}
}

func (s *CategoryService) GetCategoryFromID(catID int) (*domain.Category, error) {
	return s.repo.GetCategoryFromID(catID)
}

func (s *CategoryService) GetAllCategories() ([]*domain.Category, error) {
	return s.repo.GetAllCategories()
}