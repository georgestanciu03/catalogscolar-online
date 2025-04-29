# Catalog Școlar (Demo)

## Cum rulezi local

1. Instalează dependențele:
   ```
   npm install
   ```

2. Pornește serverul:
   ```
   npm start
   ```

3. Accesează în browser:
   - Login: http://localhost:5000/login.html
   - Register: http://localhost:5000/register.html
   - Profil: http://localhost:5000/profile.html

## Testare API cu Postman

- POST http://localhost:5000/api/register
- POST http://localhost:5000/api/login
- GET http://localhost:5000/api/profile (cu header Authorization: Bearer TOKEN)