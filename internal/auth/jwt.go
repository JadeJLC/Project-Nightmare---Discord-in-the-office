// internal/auth/jwt.go
package auth

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
)

var secretKey = []byte("super-secret-key") // à sortir en config plus tard

func GenerateToken(userID int64) (string, error) {
    claims := jwt.MapClaims{
        "userID": userID,
        "exp":    time.Now().Add(24 * time.Hour).Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString(secretKey)
}

func ValidateToken(tokenString string) (int64, error) {
    token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
        return secretKey, nil
    })
    if err != nil || !token.Valid {
        return 0, err
    }

    claims, ok := token.Claims.(jwt.MapClaims)
    if !ok {
        return 0, err
    }

    idFloat, ok := claims["userID"].(float64)
    if !ok {
        return 0, err
    }

    return int64(idFloat), nil
}
