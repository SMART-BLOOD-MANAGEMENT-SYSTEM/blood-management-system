# Smart Blood Management System - Backend

## Requirements
- PHP 8.2+
- Composer
- PostgreSQL
- Laravel 12

## Setup Instructions

### 1. Clone the repository
```bash
git clone <https://github.com/SMART-BLOOD-MANAGEMENT-SYSTEM/blood-management-system.git>
cd blood-management-system
```

### 2. Install dependencies
```bash
composer install
```

### 3. Setup environment
```bash
cp .env.example .env
php artisan key:generate
```

### 4. Configure database
Edit `.env` file:
```
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=blood_management_system
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

### 5. Run migrations
```bash
php artisan migrate
```

### 6. Create admin user
```bash
php artisan tinker
\App\Models\User::create([
    'full_name' => 'Admin',
    'email' => 'admin@test.com',
    'password_hash' => bcrypt('123456'),
    'phone' => '0599000001',
    'role' => 'admin'
]);
```

### 7. Run the server
```bash
php artisan serve
```

## API Endpoints
- POST /api/login
- POST /api/register
- GET /api/blood-banks
- GET /api/slots
- GET /api/appointments
- GET /api/blood-requests
- GET /api/inventory
- GET /api/notifications (requires auth)
- POST /api/appointments (requires auth)
- PUT /api/appointments/{id} (requires auth)
- GET /api/my-appointments (requires auth)
- GET /api/profile (requires auth)
- PUT /api/profile (requires auth)

## Frontend
- Run frontend on: http://localhost:5173
- Backend runs on: http://localhost:8000
- Vite proxy handles API calls automatically
