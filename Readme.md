# **Plateforme de gestion des comptes rendus**

### **Objectif**
Développer une mini-plateforme web permettant de gérer des **comptes rendus de réunions, séminaires, webinaires, etc.**, avec un système de **rôles utilisateur** (admin et utilisateur simple) et des **notifications** lors de nouveaux ajouts.

---

## **Rôles et fonctionnalités**

### 1. **Admin**
- Ajouter un compte rendu (titre, type, description, date, fichier PDF)
- Modifier ou supprimer un compte rendu
- Gérer les utilisateurs (nom, email, mot de passe, rôle)
- Voir tous les comptes rendus

### 2. **Utilisateur (formateur ou étudiant)**
- Consulter la liste des comptes rendus
- Télécharger les fichiers PDF
- Être notifié des nouveaux comptes rendus

---

## **Fonctionnalités techniques à développer**

### 1. **Authentification (connexion)**
- Page de login
- Authentification avec email et mot de passe
- Redirection vers le bon dashboard selon le rôle

### 2. **Gestion des comptes rendus**
- Création (par admin) avec :
  - Titre
  - Description
  - Type (Réunion, Séminaire, etc.)
  - Date
  - Upload du fichier PDF
- Modification/Suppression (admin)
- Visualisation (liste filtrable par type ou date)
- Téléchargement des fichiers PDF (par tous)

### 3. **Notifications**
- Lorsqu’un nouveau compte rendu est ajouté, une **étiquette “Nouveau”** s’affiche pour les utilisateurs
- Cette étiquette disparaît après consultation ou dépassement d’un délai

---

## **Structure technique**

### **Backend : Spring Boot**
- **Base de données** : PostgreSQL
- **Entités principales** :
  - `User` (id, nom, email, mot de passe, rôle)
  - `CompteRendu` (id, titre, description, type, date, chemin_fichier, isNouveau)
- **Endpoints REST** :
  - `/auth/login` – login
  - `/comptes-rendus` – CRUD des comptes rendus
  - `/comptes-rendus/nouveaux` – pour marquer les nouveaux
  - `/users` – gestion des utilisateurs (optionnel)

### **Frontend : Angular**
- **Composants** :
  - `LoginComponent`
  - `DashboardAdminComponent`
  - `DashboardUserComponent`
  - `CompteRenduListComponent` (liste + filtre)
  - `CompteRenduFormComponent` (création/modif pour admin)
  - `NotificationComponent` (affiche les nouveautés)
- **Services Angular** :
  - `AuthService` – login, stockage du token
  - `CompteRenduService` – pour appeler l’API des comptes rendus
  - `NotificationService` – pour détecter les nouveaux documents

---

## **Exemple d’interface**
- **Page login** : simple avec email + mot de passe
- **Page admin** :
  - Tableau de bord
  - Bouton “Ajouter un compte rendu”
  - Liste des comptes rendus avec bouton Modifier/Supprimer
  - Gestions des utilisateurs

- **Page utilisateur** :
  - Liste des comptes rendus avec filtre par type/date
  - Icône "Nouveau" à côté des nouveaux documents

---

## **Livrables attendus**
1. Code source (Angular + Spring Boot) sur GitHub
2. Schéma base de données (MCD ou SQL)
3. Documentation technique (README + endpoints API)
4. Démo fonctionnelle (vidéo ou accès à l’app)

---

Souhaites-tu que je t’aide à démarrer concrètement avec :
- Un **diagramme des entités**
- Une **structure de projet backend**
- Une **structure de projet Angular**
- Ou un **exemple d'interface utilisateur (maquette)** ?