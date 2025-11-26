# 🏠 Ajarly - Property Rental Platform

> A modern, full-stack property rental platform for the Egyptian market, connecting property owners with renters for both short-term and long-term stays.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Java](https://img.shields.io/badge/Java-17-red.svg)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🔐 **Secure Authentication** - JWT-based auth with role-based access control
- 🏡 **Property Management** - Create, update, and manage property listings
- 📸 **Image Upload** - Cloudinary integration for optimized image storage
- 🔍 **Advanced Search** - Filter by location, price, dates, amenities
- 📅 **Booking System** - Request, confirm, and manage bookings
- 💰 **Payment Processing** - Integrated payment gateway (Fawry)
- ⭐ **Review System** - Multi-criteria ratings and owner responses
- 💝 **Favorites** - Save and organize favorite properties
- 📊 **Analytics Dashboard** - Performance metrics for property owners
- 👨‍💼 **Admin Panel** - Comprehensive platform management tools
- 🌍 **Bilingual Support** - Arabic and English interface

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Database**: MySQL 8.0
- **Security**: Spring Security + JWT
- **Image Storage**: Cloudinary
- **API Documentation**: REST

### Frontend
- **Framework**: React 18.3.1
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Routing**: React Router v7
- **State Management**: Context API

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0+
- Maven 3.8+

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/ajarly.git
cd ajarly/Backend

# Configure database in application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/ajarly
spring.datasource.username=root
spring.datasource.password=yourpassword

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

### Frontend Setup
```bash
# Navigate to frontend
cd Frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8080/api/v1" > .env

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3355`

## 📚 API Documentation

### Authentication
```http
POST /api/v1/auth/register    # Register new user
POST /api/v1/auth/login        # Login user
```

### Properties
```http
GET    /api/v1/properties          # Search properties
GET    /api/v1/properties/{id}     # Get property details
POST   /api/v1/properties          # Create property
PUT    /api/v1/properties/{id}     # Update property
DELETE /api/v1/properties/{id}     # Delete property
```

### Bookings
```http
POST /api/v1/bookings                   # Create booking
GET  /api/v1/bookings                   # Get user bookings
PUT  /api/v1/bookings/{id}/confirm      # Confirm booking
PUT  /api/v1/bookings/{id}/cancel       # Cancel booking
```

[View Full API Documentation →](docs/API.md)

## 🏗️ Architecture
```
ajarly/
├── Backend/
│   ├── src/main/java/com/ajarly/backend/
│   │   ├── controller/     # REST endpoints
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Data access
│   │   ├── model/          # JPA entities
│   │   ├── dto/            # Data transfer objects
│   │   ├── security/       # JWT & authentication
│   │   └── scheduler/      # Scheduled tasks
│   └── src/main/resources/
│       ├── application.properties
│       └── schema.sql
│
├── Frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilities
│   └── public/
│
└── docs/
    ├── API.md
    ├── DEPLOYMENT.md
    └── CONTRIBUTING.md
```

## 🎯 Key Features Explained

### Multi-Role System
- **Renters**: Browse and book properties
- **Landlords**: List and manage properties
- **Brokers**: Manage multiple properties
- **Admins**: Platform oversight and moderation

### Smart Booking System
- Real-time availability checking
- Auto-expiry for pending bookings (48 hours)
- Cancellation with fee calculation
- Payment integration ready

### Advanced Analytics
- Property performance metrics
- Revenue tracking
- Booking conversion rates
- Daily scheduled calculations

### Robust Review System
- Multi-criteria ratings (cleanliness, accuracy, communication, location, value)
- Owner response capability
- Auto-approval with admin moderation
- Automatic rating aggregation

## 📊 Database Schema
```sql
Users ──────< Properties ──────< Property_Images
   │              │
   │              ├──────< Bookings ──────< Reviews
   │              │             │
   └──────< Favorites           └──────< Transactions
```

[View Full Schema →](Ajarly Documentation.pdf)

## 🔒 Security Features

- JWT-based stateless authentication
- BCrypt password encryption
- Role-based access control (RBAC)
