# 📚 Documentation Technique - Module de Gestion des Comptes Rendus

## 📋 Vue d'ensemble

Ce module fait partie de la plateforme de gestion de l'Université Cheikh Hamidou Kane et permet la gestion des comptes rendus (réunions, séminaires, webinaires, etc.) avec un système de rôles utilisateurs et des notifications.

## 🏗️ Architecture

Le projet est construit selon une architecture en trois couches:
- **Frontend**: Angular avec Material UI
- **API REST**: Spring Boot
- **Backend**: Spring Boot avec base de données relationnelle (PostgreSQL)
- **Déploiement**: Conteneurisation avec Docker et Docker Compose

## 💾 Modèle de données

### 📊 Diagramme des entités

![Diagramme des entités](https://github.com/99mass/project_cours_tecno_web/blob/master/diagrammes/diagramme-des-entites.png)

### 📄 Entités principales

#### User
```sql
Table users {
  id uuid [pk]
  name varchar(30) [not null]
  email varchar(30) [not null, unique]
  password varchar [not null]
  role varchar [not null] // ADMIN ou USER
  created_at timestamp [not null]
  updated_at timestamp [not null]
}
```

#### Report
```sql
Table reports {
  id uuid [pk]
  title varchar(100) [not null]
  type varchar [not null] // Enum Type (REUNION, SEMINAIRE, WEBINAIRE, etc.)
  description varchar(1000) [not null]
  file_path varchar(100) [not null]
  is_new boolean [not null]
  created_at timestamp [not null]
  updated_at timestamp [not null]
}
```

## 👑 Super Admin par défaut

Pour faciliter le démarrage de l'application, un compte administrateur par défaut est créé lors de l'initialisation:

```
Email: superadmin@example.com
Mot de passe: superadmin123
```

Ce compte dispose de tous les privilèges d'administration et peut être utilisé pour:
- Créer d'autres comptes administrateurs
- Gérer tous les utilisateurs
- Ajouter, modifier et supprimer des comptes rendus
- Envoyer des comptes rendus par email

⚠️ **Sécurité**: Par mesure de sécurité, il est recommandé de changer le mot de passe de ce compte après la première connexion ou de créer un nouveau compte administrateur et de désactiver celui-ci en environnement de production.

## 🐳 Configuration Docker

L'application est conteneurisée avec Docker et orchestrée via Docker Compose:

### Dockerfile
```dockerfile
# Étape 1 : build avec Maven + JDK 21
FROM maven:3.9.4-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Étape 2 : image finale avec JDK 21 uniquement
FROM eclipse-temurin:21-jdk
WORKDIR /app

# Copie le JAR compilé depuis l'étape précédente
COPY --from=build /app/target/*.jar app.jar

# Expose le port de l'application Spring Boot
EXPOSE 8080

# Lancement de l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Docker Compose
```yaml
services:
  app:
    build:
      context: .
    image: docker-spring-boot-postgres:latest
    container_name: app
    depends_on:
      - db
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/compt_rendu
      - SPRING_DATASOURCE_USERNAME=breukh
      - SPRING_DATASOURCE_PASSWORD=breukh
      - SPRING_JPA_HIBERNATE_DDL_AUTO=update
    ports:
      - 8081:8080
    restart: unless-stopped
    volumes:
      - ./uploads:/uploads  # Montage du répertoire des fichiers uploadés

  db:
    image: postgres
    container_name: db
    environment:
      - POSTGRES_USER=breukh
      - POSTGRES_PASSWORD=breukh
      - POSTGRES_DB=compt_rendu
    ports:
      - 5432:5432
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 🚀 Démarrage de l'application
```bash
# Construire et démarrer les conteneurs
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down
```

## 🔐 Sécurité et Authentification

- Authentification basée sur JWT (JSON Web Tokens)
- Contrôle d'accès basé sur les rôles (ADMIN, USER)
- Protection des endpoints sensibles avec annotations @PreAuthorize

## 🔌 API Endpoints

### 🔑 Authentification

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| POST | `/api/auth/login` | Authentification utilisateur | Public |

### 👥 Gestion des Utilisateurs

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/api/users` | Récupérer tous les utilisateurs | ADMIN |
| GET | `/api/users/{id}` | Récupérer un utilisateur par ID | ADMIN ou Utilisateur concerné |
| GET | `/api/users/me` | Récupérer l'utilisateur courant | Authentifié |
| POST | `/api/users` | Créer un nouvel utilisateur | ADMIN |
| PUT | `/api/users/{id}` | Mettre à jour un utilisateur | ADMIN ou Utilisateur concerné |
| PUT | `/api/users/me/{id}` | Mettre à jour son propre profil | Utilisateur concerné |
| DELETE | `/api/users/{id}` | Supprimer un utilisateur | ADMIN |
| PUT | `/api/users/me/password` | Changer son mot de passe | Authentifié |

### 📝 Gestion des Comptes Rendus

| Méthode | Endpoint | Description | Accès |
|---------|----------|-------------|-------|
| GET | `/api/reports` | Récupérer tous les comptes rendus | Authentifié |
| GET | `/api/reports?type={type}` | Filtrer les comptes rendus par type | Authentifié |
| GET | `/api/reports/new` | Récupérer les nouveaux comptes rendus | Authentifié |
| GET | `/api/reports/{id}` | Récupérer un compte rendu par ID | Authentifié |
| GET | `/api/reports/{id}/download` | Télécharger le fichier PDF d'un compte rendu | Authentifié |
| POST | `/api/reports` | Créer un nouveau compte rendu | ADMIN |
| POST | `/api/reports/{id}/send-email` | Envoyer un compte rendu par email | ADMIN |
| PUT | `/api/reports/{id}` | Mettre à jour un compte rendu | ADMIN |
| DELETE | `/api/reports/{id}` | Supprimer un compte rendu | ADMIN |
| POST | `/api/reports/{id}/read` | Marquer un compte rendu comme lu | Authentifié |

## 📨 Notifications

- Les nouveaux comptes rendus sont marqués avec `isNew = true`
- Les utilisateurs peuvent voir les nouveaux comptes rendus via l'endpoint `/api/reports/new`
- Après lecture, un compte rendu est marqué comme lu avec l'endpoint `/api/reports/{id}/read`
- Les administrateurs peuvent envoyer des notifications par email via `/api/reports/{id}/send-email`

## 🛠️ Configuration Technique

### 🗄️ Stockage des fichiers

- Les fichiers PDF sont stockés dans un répertoire configuré par `file.upload-dir` (par défaut: "uploads")
- Les chemins des fichiers sont enregistrés dans la base de données
- Dans l'environnement Docker, le répertoire des uploads est monté comme volume (`./uploads:/uploads`)

### 📊 Base de données

- PostgreSQL est utilisé comme base de données relationnelle
- Les données sont persistées dans un volume Docker nommé `postgres_data`
- Les tables sont créées automatiquement grâce à JPA/Hibernate (`spring.jpa.hibernate.ddl-auto=update`)

### 🔄 Configuration des ports

- L'application Spring Boot tourne sur le port 8080 dans le conteneur
- Le port est mappé au port 8081 sur la machine hôte
- La base de données PostgreSQL est accessible sur le port 5432

## 🔄 Flux utilisateur typique

1. L'utilisateur s'authentifie via `/api/auth/login`
2. L'administrateur crée un nouveau compte rendu via `/api/reports`
3. Les utilisateurs voient les nouveaux comptes rendus via `/api/reports/new`
4. Les utilisateurs téléchargent les fichiers via `/api/reports/{id}/download`
5. Les comptes rendus sont marqués comme lus via `/api/reports/{id}/read`

## 💻 Exemples d'utilisation

### Authentification
```json
// POST /api/auth/login
{
  "email": "utilisateur@example.com",
  "password": "motdepasse123"
}

// Réponse
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Jean Dupont",
    "email": "utilisateur@example.com",
    "role": "USER"
  }
}
```

### Création d'un compte rendu
```json
// POST /api/reports
{
  "title": "Réunion du conseil d'université",
  "type": "REUNION",
  "description": "Compte rendu de la réunion du conseil d'université du 15 avril 2025",
  "filePath": "reunion-conseil-15042025.pdf"
}

// Réponse
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Réunion du conseil d'université",
  "type": "REUNION",
  "description": "Compte rendu de la réunion du conseil d'université du 15 avril 2025",
  "filePath": "reunion-conseil-15042025.pdf",
  "isNew": true,
  "createdAt": "2025-04-15T10:30:00",
  "updatedAt": "2025-04-15T10:30:00"
}
```

### Envoi d'un compte rendu par email
```
// POST /api/reports/{id}/send-email
// Aucun corps de requête nécessaire

// Réponse
// Status 200 OK si l'envoi réussit
```