# LifeCure Healthcare Backend API

A comprehensive healthcare management system backend built with Node.js, Express.js, TypeScript, and PostgreSQL. This API provides complete functionality for managing patients, doctors, appointments, prescriptions, payments, and more in a healthcare ecosystem.

## 🚀 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication** with refresh token support
- **Role-based Access Control** (Admin, Doctor, Patient)
- **Password Management** with secure hashing using bcryptjs
- **Forgot/Reset Password** functionality with email verification
- **Multi-factor Authentication** support

### 👥 User Management
- **Multi-role User System** (Admin, Doctor, Patient)
- **Profile Management** with photo upload support
- **User Status Management** (Active, Inactive, Deleted)
- **Soft Delete** functionality for data preservation
- **Comprehensive User Validation** with Zod schemas

### 🏥 Doctor Management
- **Doctor Registration** with specialty assignment
- **Profile Management** with detailed information
- **Schedule Management** for appointment availability
- **AI-powered Doctor Suggestions** based on symptoms
- **Rating & Review System** for doctor performance
- **Experience & Qualification Tracking**

### 👤 Patient Management
- **Patient Registration** and profile management
- **Health Data Tracking** and medical history
- **Medical Reports** storage and management
- **Appointment History** tracking
- **Prescription Management** for medications

### 📅 Appointment System
- **Appointment Booking** with real-time availability
- **Schedule Management** for doctors
- **Appointment Status Tracking** (Scheduled, In Progress, Completed, Cancelled)
- **Video Calling Integration** for telemedicine
- **Automated Appointment Cancellation** for unpaid bookings
- **Appointment History** and tracking

### 💊 Prescription Management
- **Digital Prescription Creation** by doctors
- **Medicine Management** with dosage information
- **Follow-up Date Tracking**
- **Patient Prescription History**
- **Prescription Instructions** and guidelines

### 💳 Payment Integration
- **Stripe Payment Gateway** integration
- **Secure Payment Processing** with webhook support
- **Payment Status Tracking** (Paid, Unpaid)
- **Transaction Management** and history
- **Automated Payment Verification**

### 🏷️ Specialty Management
- **Medical Specialties** management
- **Icon-based Specialty** representation
- **Specialty-based Doctor Filtering**
- **Dynamic Specialty Addition** by admins

### ⭐ Review & Rating System
- **Patient Reviews** for doctors
- **Rating System** (1-5 stars)
- **Comment System** for detailed feedback
- **Review Management** and moderation

### 📊 Analytics & Reporting
- **Dashboard Metadata** for different user roles
- **Appointment Analytics**
- **Revenue Tracking**
- **User Statistics**
- **Performance Metrics**

### 🔧 Additional Features
- **File Upload** with Cloudinary integration
- **Email Notifications** using Nodemailer
- **Cron Jobs** for automated tasks
- **Comprehensive Error Handling**
- **Request Validation** with Zod
- **Pagination Support** for large datasets
- **Search and Filter** capabilities
- **API Documentation** with Postman collection

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database

### Authentication & Security
- **JWT** - JSON Web Tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Cookie Parser** - Cookie management

### External Services
- **Cloudinary** - Image and file storage
- **Stripe** - Payment processing
- **Nodemailer** - Email services
- **OpenAI** - AI-powered suggestions

### Development Tools
- **ts-node-dev** - Development server
- **Zod** - Schema validation
- **UUID** - Unique identifier generation
- **date-fns** - Date manipulation
- **node-cron** - Scheduled tasks

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd life-cure-healthcare-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/lifecure_db"
DIRECT_URL="postgresql://username:password@localhost:5432/lifecure_db"

# Server Configuration
NODE_ENV="development"
PORT=5000

# JWT Configuration
JWT_SECRET="your-jwt-secret-key"
EXPIRES_IN="1d"
REFRESH_TOKEN_SECRET="your-refresh-token-secret"
REFRESH_TOKEN_EXPIRES_IN="7d"
RESET_PASS_TOKEN="your-reset-password-secret"
RESET_PASS_TOKEN_EXPIRES_IN="1h"
SALT_ROUND=12

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Stripe Configuration
STRIPE_SECRET_KEY="your-stripe-secret-key"

# Email Configuration
EMAIL="your-email@gmail.com"
APP_PASS="your-app-password"

# OpenAI Configuration
OPENROUTER_API_KEY="your-openrouter-api-key"

# Reset Password Link
RESET_PASS_LINK="http://localhost:3000/reset-password"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npx prisma db seed
```

### 5. Start the Development Server
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/refresh-token` | Refresh access token | Public |
| GET | `/auth/me` | Get current user profile | Authenticated |
| POST | `/auth/change-password` | Change user password | Authenticated |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Reset password with token | Public |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/user` | Get all users | Admin |
| GET | `/user/me` | Get my profile | Authenticated |
| POST | `/user/create-patient` | Create patient account | Public |
| POST | `/user/create-doctor` | Create doctor account | Admin |
| POST | `/user/create-admin` | Create admin account | Admin |
| PATCH | `/user/:id/status` | Change user status | Admin |
| PATCH | `/user/update-my-profile` | Update my profile | Authenticated |

### Doctor Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/doctor` | Get all doctors | Public |
| GET | `/doctor/:id` | Get doctor by ID | Public |
| POST | `/doctor/suggestion` | AI doctor suggestions | Public |
| PATCH | `/doctor/:id` | Update doctor | Admin/Doctor |
| DELETE | `/doctor/:id` | Delete doctor | Admin |
| DELETE | `/doctor/soft/:id` | Soft delete doctor | Admin |

### Appointment Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/appointment` | Get all appointments | Admin |
| GET | `/appointment/my-appointments` | Get my appointments | Patient/Doctor |
| POST | `/appointment` | Create appointment | Patient |
| PATCH | `/appointment/status/:id` | Update appointment status | Admin/Doctor |

### Prescription Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/prescription/my-prescription` | Get my prescriptions | Patient |
| POST | `/prescription` | Create prescription | Doctor |

### Review Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/review` | Get all reviews | Public |
| POST | `/review` | Create review | Patient |

### Specialty Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/specialties` | Get all specialties | Public |
| POST | `/specialties` | Create specialty | Admin |
| DELETE | `/specialties/:id` | Delete specialty | Admin |

### Schedule Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/schedule` | Get schedules | Doctor |
| POST | `/schedule` | Create schedule | Admin |
| DELETE | `/schedule/:id` | Delete schedule | Admin |

### Doctor Schedule Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/doctor-schedule` | Get all doctor schedules | Admin/Doctor/Patient |
| GET | `/doctor-schedule/my-schedule` | Get my schedule | Doctor |
| POST | `/doctor-schedule` | Create doctor schedule | Doctor |
| DELETE | `/doctor-schedule/:id` | Delete doctor schedule | Doctor |

### Metadata Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/metadata` | Get dashboard metadata | Admin/Doctor/Patient |

### Payment Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/webhook` | Stripe webhook handler | Stripe |

## 🔒 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **ADMIN**: Full system access
- **DOCTOR**: Doctor-specific features and patient management
- **PATIENT**: Patient-specific features and appointment booking

## 📊 Database Schema

### Core Models
- **User**: Base user model with authentication
- **Admin**: Administrator profiles
- **Doctor**: Doctor profiles with specialties
- **Patient**: Patient profiles with health data
- **Appointment**: Appointment management
- **Prescription**: Digital prescriptions
- **Review**: Doctor reviews and ratings
- **Payment**: Payment transactions
- **Schedule**: Time slot management
- **Specialty**: Medical specialties

### Key Relationships
- Users have one-to-one relationships with Admin, Doctor, or Patient
- Appointments link Patients, Doctors, and Schedules
- Prescriptions are linked to Appointments
- Reviews are linked to Appointments and Doctors
- Payments are linked to Appointments

## 🧪 Testing

### Using Postman
1. Import the provided Postman collection: `life_cure_api.postman_collection.json`
2. Import the environment file: `life_cure_env.json`
3. Set up your environment variables
4. Start testing the API endpoints

### Manual Testing
```bash
# Test server health
curl http://localhost:5000/

# Test authentication
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'
```

## 🚀 Deployment

### Environment Setup
1. Set up a PostgreSQL database
2. Configure environment variables for production
3. Set up Cloudinary for file storage
4. Configure Stripe for payments
5. Set up email service

### Production Build
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start production server
npm start
```

## 🔧 Configuration

### CORS Configuration
The API is configured to accept requests from `http://localhost:3001` (frontend). Update the CORS configuration in `src/app.ts` for production.

### File Upload
- Maximum file size: 10MB
- Supported formats: Images (jpg, png, gif)
- Storage: Cloudinary cloud storage

### Cron Jobs
- **Appointment Cleanup**: Runs every minute to cancel unpaid appointments
- **Email Notifications**: Automated email sending for various events

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errorDetails": {
    // Detailed error information
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core healthcare management features

## 📞 Contact

- **Project**: LifeCure Healthcare Backend
- **Version**: 1.0.0
- **Last Updated**: 2025

---

**Note**: This is a healthcare management system. Ensure all data handling complies with healthcare data protection regulations (HIPAA, GDPR, etc.) in your jurisdiction.
