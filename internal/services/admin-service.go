package services

import (
	"real-time-forum/internal/repositories"
)

type AdminService struct {
    repo *repositories.AdminRepo
}

func NewAdminService(r *repositories.AdminRepo) *AdminService {
    return &AdminService{repo: r}
}

func (s *AdminService) SaveLogToDatabase(log string) (error) {
	return s.repo.SaveLogToDatabase(log)
}
