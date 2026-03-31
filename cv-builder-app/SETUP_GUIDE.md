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

## cPanel Deployment

To easily deploy the CV Builder site to your subdomain (`resume.5minuteshopping.com`) on cPanel and have all files inside one folder without needing to type `/public/` in the URL:

1. **Upload All Files**: Compress the entire `cv-builder` directory (which includes `cv-builder-app`, `public`, and `.htaccess`) into a `.zip` file.
2. **Extract in cPanel**: Open cPanel's **File Manager**, navigate to the `resume.5minuteshopping.com` folder, and upload the `.zip` file. Then, quickly right-click and extract exactly into that same folder.
3. **Check .htaccess**: A brand new `.htaccess` file has been added to the root of your project. This file automatically catches any traffic that hits `resume.5minuteshopping.com` and invisibly forwards it to the `public/` directory where your actual site lives!
4. **Environment Variables**: Create or rename `.env` inside `cv-builder-app`, making sure to update `APP_URL=https://resume.5minuteshopping.com` along with your database credentials.
5. **PHP Version**: Log into your cPanel and verify using **Select PHP Version** that your subdomain is running on **PHP 8.2 or 8.3**.
