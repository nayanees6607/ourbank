# Modern Banking App

A full-stack banking application built with FastAPI (Backend) and React (Frontend), featuring a modern UI, real-time transfers, and comprehensive financial dashboards.

## Features

-   **Interactive Dashboard**: Real-time overview of accounts, investments, and debts.
-   **Quick Transfers**: Secure money transfers with PIN verification and real-time updates via WebSockets.
-   **Credit Score Widget**: Visual credit score calculation based on net liquid assets.
-   **Investment Portfolio**: Track stocks and assets with live market data simulation.
-   **Loan Management**: View active loans and calculate EMI.
-   **Insurance**: Browse and purchase insurance policies.
-   **Card Management**: Generate and manage debit/credit cards with realistic UI.
-   **Secure Authentication**: JWT-based auth with PIN protection for sensitive actions.

## Tech Stack

-   **Frontend**: React, Tailwind CSS, Framer Motion, Axios
-   **Backend**: FastAPI, SQLAlchemy, Pydantic, Celery
-   **Database**: PostgreSQL
-   **Infrastructure**: Docker, Docker Compose, Nginx, Redis, RabbitMQ

## Getting Started

### Prerequisites

-   Docker & Docker Compose

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd banking_app
    ```

2.  Start the application:
    ```bash
    docker-compose up -d --build
    ```

3.  Access the application:
    -   **Frontend**: http://localhost:8080
    -   **Backend API Docs**: http://localhost:8000/docs

### Default Credentials

You can register a new user or use the following test account (if seeded):
-   **Email**: `testuser@example.com`
-   **Password**: `123456`
-   **PIN**: `1234`

## Project Structure

-   `/frontend`: React application source code.
-   `/backend`: FastAPI application source code.
-   `docker-compose.yml`: Container orchestration configuration.

## License

MIT
