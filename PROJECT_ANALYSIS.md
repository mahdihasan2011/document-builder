# Project Analysis: CV Builder

## Overview
CV Builder is a modern web application designed to help users create ATS-friendly resumes. It features a React-based frontend for interactive editing and real-time preview, backed by a Laravel API for data persistence.

## 1. Technology Stack

### Backend
-   **Framework**: Laravel 12.x
-   **Language**: PHP 8.2+
-   **Database**: MySQL (inferred from `.env` defaults, though compatible with SQLite/Postgres)
-   **Authentication**: Custom Token-based (Simple API Token)
-   **Testing**: PHPUnit

### Frontend
-   **Library**: React 19 + TypeScript
-   **Build Tool**: Vite
-   **Styling**: Tailwind CSS (inferred) + Lucide React (Icons)
-   **PDF Generation**: `html2pdf.js`
-   **HTTP Client**: Axios (inferred from service usage)

## 2. Architecture & Data Flow

 The application follows a Monolithic structure with decoupled Frontend and Backend communicated via API.

-   **Frontend Service**: Served via Vite, handles all UI/UX, state management, and PDF generation.
-   **Backend Service**: Serves database, handles authentication, and stores user resume data.
-   **API Communication**: The frontend communicates with the backend via RESTful API endpoints defined in `routes/api.php`.

### Key Workflows
1.  **Authentication**:
    -   User enters phone number.
    -   Backend sends OTP (currently mocked).
    -   User enters OTP.
    -   Backend verifies, creates user if new, assigns an `api_token`, and returns it.
    -   Frontend stores token and uses it for subsequent requests.

2.  **Resume Editing**:
    -   Frontend maintains `ResumeData` state.
    -   Changes are auto-saved to backend (`POST /api/user/resume`) periodically or on demand.
    -   Data is stored as a JSON blob (`resume_data` column) in the database, allowing flexible schema evolution.

## 3. Database Schema

### `users`
-   `id`: Primary Key
-   `name`: User's name
-   `phone`: Unique identifier (used for login)
-   `api_token`: Simple bearer token for API authentication
-   `email`: Nullable (optional)

### `resumes`
-   `id`: Primary Key
-   `user_id`: Foreign Key (`users.id`)
-   `resume_data`: JSON column storing the entire CV structure (experience, education, skills, etc.)
-   `template_id`: String identifier for the selected visual template (default: 'modern')

## 4. Key Components

### Frontend (`resources/js`)
-   **`App.tsx`**: Main controller. Manages:
    -   Session check & Auth
    -   Theme (Light/Dark)
    -   Resume Data State
    -   Auto-save logic
    -   PDF Download
-   **`types.ts`**: Defines the TypeScript interfaces for `ResumeData`, `User`, `Education`, `Experience`, etc.
-   **`services/apiService`**: Handles Axios calls to the backend.

### Backend (`app`)
-   **`AuthController`**: Handles OTP sending and verification.
    -   *Note*: OTP verification currently hardcoded to '1234'.
-   **`ResumeController`**:
    -   `save`: Updates/Creates resume record for the authenticated user.
    -   `profile`: Fetches user details and their latest resume.
    -   *Security Note*: Uses manual token extraction/verification in the controller rather than standard Laravel middleware in some places.

## 5. Current State & Observations
-   **Project Rules**: Recently established `config/project_rules.php` for centralized configuration.
-   **Quality**:
    -   Basic test suite exists and passes (`php artisan test`).
    -   500 Error on root path (`/`) has been fixed.
    -   Deprecation warning in `filesystems.php` fixed.
-   **Development**:
    -   Run locally with `php artisan serve` and `npm run dev`.

## 6. Recommendations
1.  **Security**: Migrate from manual `api_token` column handling to Laravel Sanctum's standard usage for better security and token management.
2.  **Validation**: Enhance backend validation for `resume_data` JSON structure to ensure data integrity.
3.  **Refactoring**: Extract the large logic block in `App.tsx` into smaller custom hooks (e.g., `useResumeSave`, `useAuth`) for better maintainability.
