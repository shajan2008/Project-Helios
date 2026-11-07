# Project Helios

An internal full-stack software system built with a high-performance **Java Spring Boot** backend and a modular **React** frontend. 

> **Confidentiality Notice:** This repository contains proprietary code and operational specifications. Distribution, reproduction, or public disclosure of any code, schema, or system logic without authorization is strictly prohibited.

---

## Architecture & Tech Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Frontend** | React (SPA) | Component-driven UI, state management, REST API consumption |
| **Backend** | Java Spring Boot | Robust REST API controllers, service layer architecture, enterprise security |
| **Data Layer** | Relational DB / JPA | Hibernate ORM, transactional consistency, structured migrations |
| **Tooling** | Maven/Gradle, npm/pnpm | Multi-module build management, automated dependency isolation |

---

## Project Structure

```
project-bomb/
├── backend/                # Spring Boot REST API
│   ├── src/
│   │   ├── main/java/      # Controllers, Services, Models, Repositories
│   │   └── main/resources/ # application.properties / application.yml
│   └── pom.xml (or build.gradle)
├── frontend/               # React client
│   ├── public/             # Static assets
│   ├── src/                # Components, hooks, context, API services
│   └── package.json
├── .gitignore              # Unified ignore configuration
└── README.md
