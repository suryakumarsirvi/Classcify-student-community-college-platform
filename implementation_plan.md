# Implementation Plan - Backend Refactor & Professionalization

This plan describes the strategy to refactor the existing backend into an enterprise-grade, clean, and scalable architecture.

## User Review Required

> [!IMPORTANT]
> - Ensure all `.env` credentials are correct and loaded properly. We will implement environment variable schema validation.
> - Emojis and comments will be completely removed from all updated source files to satisfy the strict styling requirements.
> - A new `Report` Mongoose model will be introduced under `src/database/models/report.model.js` to natively support the analytics reports CRUD operations required by the frontend dashboard.

## Proposed Changes

We will create a highly organized directory structure under `src/` and migrate existing code incrementally while ensuring backward compatibility.

### Configuration & Bootstrap
- **`src/config/env.config.js`**: Environment variable loading and validation.
- **`src/config/db.config.js`**: Database connection configuration and logic.
- **`src/config/cors.config.js`**: Standard CORS setup.
- **`src/config/logger.config.js`**: Morgan/Winston-based logging configuration.
- **`src/app.js`**: Express application setup, mounting middleware, route registration, and socket.io association.
- **`src/server.js`**: Application entry point, HTTP server creation, socket.io server initialization, database connection, and graceful shutdown handling.

### Centralized Utilities
- **`src/utils/ApiError.js`**: Custom error class extending standard Error, distinguishing operational vs programming errors.
- **`src/utils/ApiResponse.js`**: Standardized response helper formatting all success and error responses.
- **`src/utils/asyncHandler.js`**: Wrapper function to eliminate try-catch blocks in controllers.
- **`src/utils/bcrypt.js`**: Password hashing and verification helper functions.
- **`src/utils/jwt.js`**: Token signing, verification, and decoding helpers.
- **`src/utils/logger.js`**: Winston structured logging configuration.
- **`src/utils/objectFreeze.js`**: Object freezing utility for constants.

### Centralized Middleware
- **`src/middlewares/auth.middleware.js`**: Authentication and authorization middleware verifying JWT tokens and validating user roles.
- **`src/middlewares/error.middleware.js`**: Global error handling middleware formatting error responses and logging stacks.
- **`src/middlewares/validate.middleware.js`**: Request validation middleware using Zod schemas.
- **`src/middlewares/rateLimit.middleware.js`**: Express-rate-limit middleware to prevent brute force.
- **`src/middlewares/sanitize.middleware.js`**: Sanitization middleware to protect against NoSQL injection.
- **`src/middlewares/fileUpload.middleware.js`**: Multer config for file upload.

### Shared Constants & Enums
- **`src/shared/constants/statusCodes.js`**: Centralized HTTP status codes.
- **`src/shared/constants/roles.js`**: Centralized user roles (Admin, Teacher, Student).
- **`src/shared/constants/messages.js`**: Standardized success and error messages.

### Centralized Services
- **`src/services/email/email.service.js`**: Refactored nodemailer wrapper for sending transactional emails.
- **`src/services/email/templates/`**: Refactored, comment-free HTML email templates.
- **`src/services/sms/sms.service.js`**: Twilio service wrapper for SMS OTP sending.
- **`src/services/storage/cloudinary.service.js`**: Cloudinary upload helper.

### Database Layer
- **`src/database/connection.js`**: Connection state helper.
- **`src/database/models/`**: central folder containing all database schemas.

### Module Restructuring (Routes, Controllers, Services, Repositories, Validations)
For each domain module under `src/modules/`, we will create a dedicated structure:
- **`admin`**: Handles login, profile, system statistics, recent activity, and report CRUD operations.
- **`teacher`**: Handles login, drafts, profile, courses, and timetables.
- **`student`**: Handles signup, login, profile, timetable, search, and invitations.
- **`post`**: Handles social media posts, comments, likes, and search.
- **`message`**: Handles conversation, direct messaging, and community messaging.
- **`announcement`**: Handles broadcasts and course announcements.
- **`assignment`**: Handles assignments.
- **`timetable`**: Handles timetable entry.
- **`attendance`**: Handles student and teacher attendance.
- **`asset`**: Handles file assets sharing.
- **`resource`**: Handles educational resource sharing.

## Verification Plan

### Automated Verification
- Run server and check routes through manual requests/Postman collections.
- Verify socket connection and events.

### Manual Verification
- Start server using `npm run dev` and test key features.
- Connect the frontend application to the new server and run end-to-end flows: Admin Login/Dashboard, Teacher OTP/Verification, Student Login/Timetable/Community, Direct Messaging, Resource upload.
