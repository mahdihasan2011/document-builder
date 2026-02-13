# Setup Guide

Follow these instructions to set up and run the project locally.

## Prerequisites
Ensure you have the following installed:
- [PHP](https://www.php.net/downloads) (8.2 or higher recommended)
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) & NPM

## Installation

1.  **Clone the repository** (if not already done).

2.  **Install PHP dependencies**:
    ```bash
    composer install
    ```

3.  **Install Node.js dependencies**:
    ```bash
    npm install
    ```

## Configuration

1.  **Environment File**:
    If `.env` does not exist, copy the example file:
    ```bash
    cp .env.example .env
    ```

2.  **Generate App Key**:
    ```bash
    php artisan key:generate
    ```

3.  **Database Setup**:
    - Ensure your database server (e.g., MySQL) is running.
    - Create a database named `cv_builder` (or update `DB_DATABASE` in `.env`).
    - Run migrations:
        ```bash
        php artisan migrate
        ```

## Running the Application

You need to run both the Laravel backend and the Vite frontend development server.

1.  **Start the Backend**:
    ```bash
    php artisan serve
    ```
    The app will be available at [http://localhost:8000](http://localhost:8000).

2.  **Start the Frontend**:
    Open a new terminal and run:
    ```bash
    npm run dev
    ```

## Running Tests

To run the test suite:
```bash
php artisan test
```
