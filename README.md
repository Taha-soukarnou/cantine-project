# FST Cantine

Application web de gestion de cantine universitaire permettant aux étudiants de consulter les menus et passer des précommandes, avec un espace d'administration complet pour la gestion des menus et des commandes.

Projet académique réalisé dans le cadre du module **Développement Web et Mobile 2** — Semestre S6, Faculté des Sciences et Techniques, Université Cadi Ayyad.

## Aperçu

Le système propose deux espaces distincts :

- **Espace Étudiant** : consultation des menus du jour, panier interactif, passage de commandes, suivi en temps réel du statut des commandes
- **Espace Administrateur** : tableau de bord analytique avec graphiques, gestion complète des menus (CRUD), supervision et traitement des commandes

## Stack technique

**Backend**
- Spring Boot 4.1
- Spring Security + JWT (jjwt)
- Spring Data JPA / Hibernate
- MySQL

**Frontend**
- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios
- Recharts

## Architecture
Architecture client-serveur à trois couches avec authentification JWT et autorisations par rôle (`student`, `agent`, `admin`).

## Structure du projet

<img width="729" height="560" alt="image" src="https://github.com/user-attachments/assets/fa38546a-1e8c-4b5e-b08d-f2354693c8f5" />

## Modèle de données

| Entité | Description |
|---|---|
| `User` | Utilisateurs du système (étudiant, agent, admin) |
| `Menu` | Plats disponibles avec prix, date et disponibilité |
| `Order` | Commandes passées par les étudiants |
| `OrderItem` | Détails des articles d'une commande |

<img width="955" height="688" alt="Capture d&#39;écran 2026-06-29 133430" src="https://github.com/user-attachments/assets/6647ed69-5e27-4e51-81d8-e911e016ce27" />

## Installation

### Prérequis

- Java 17+
- Node.js 18+
- MySQL (XAMPP recommandé en local)
- Maven

### Backend

```bash
# Créer la base de données dans phpMyAdmin
CREATE DATABASE cantine_db;

# Configurer application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/cantine_db
spring.datasource.username=root
spring.datasource.password=
server.port=8092

# Lancer l'application
mvn spring-boot:run
```

L'API sera disponible sur `http://localhost:8092`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Endpoints API principaux

### Authentification (public)

<img width="927" height="87" alt="image" src="https://github.com/user-attachments/assets/2873ac5e-97d4-4f3e-8c5c-66f82489a978" />

### Menus

<img width="918" height="202" alt="image" src="https://github.com/user-attachments/assets/c729bcd1-096b-4122-9921-22732b5272d6" />

### Commandes

<img width="925" height="145" alt="image" src="https://github.com/user-attachments/assets/8b32f44f-869c-4669-8422-26c9a1c518bd" />

## Sécurité

- Authentification via **JWT** (validité 24h)
- Mots de passe hachés avec **BCrypt**
- Autorisations par rôle via **Spring Security**
- Routes protégées selon le profil utilisateur (`student`, `agent`, `admin`)

## Fonctionnalités

**Étudiant**
- Consultation du menu du jour et de tous les menus
- Panier interactif (ajout, suppression, quantités)
- Passage de commandes avec récapitulatif
- Suivi du statut de commande en temps réel

**Administrateur**
- Tableau de bord avec statistiques et graphiques (évolution des commandes, répartition par statut)
- Gestion complète des menus (création, modification, suppression, disponibilité)
- Supervision et mise à jour des statuts de commandes
- Filtrage et recherche des commandes

## Tests

Les endpoints REST ont été validés fonctionnellement avec **Postman**, couvrant l'authentification, la gestion des menus, le passage de commandes et les restrictions d'accès par rôle.


# Demonstration Video



https://github.com/user-attachments/assets/40cbbb2a-b431-4aab-9461-18ee68ba20bd






