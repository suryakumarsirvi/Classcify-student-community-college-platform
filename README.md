# Classcify: Student Community & College Platform

Classcify is a next-generation EdTech portal and community platform designed for students, teachers, and administrators. Built on a modular, clean, repository-based architecture, it bridges academic operations (attendance, assignments, timetables, and student ID generation) with a vibrant community ecosystem (real-time chat, polymorphic messaging, a social explorer feed, and a collaborative note/asset sharing marketplace).

---

## 🌟 Core System Roles & Feature Portals

### 🔑 1. Administrator Portal (`admin`)
* **Secure Initialization & Setup:** Root admin account can be initialized via a dedicated `/api/admin/init` endpoint using environment variables (`ADMIN_EMAIL` and `ADMIN_INITIAL_PASSWORD`).
* **Visual Telemetry Dashboard:** View real-time stats and metrics tracking active students, onboarded teachers, classrooms, shared community spaces, and system-wide resources.
* **Staffroom Management:** Manage teacher profiles. Admins can create professional records, save onboarding progress, and trigger email invites to verify accounts.
* **Classroom & Course Configuration:** Set up academic streams, standards, courses, and assign teaching staff to relevant subjects.
* **Global Announcements & Events:** Broadcast institutional notices and create calendar events visible across the entire college.

### 🎓 2. Teacher Portal (`teacher`)
* **Onboarding Draft Wizard:** Save and fetch drafts during onboarding (`/api/teachers/draft`), allowing profiles to be filled in steps (experience, age, education, expectations).
* **Identity Verification:** Dual verification of profile registers via secure OTP codes sent through email (SMTP) and SMS (Twilio).
* **Roster-based Attendance Marker:** Select a course, load the live student roster, and record student attendance (`present`, `absent`, or `late`) with custom comments and remarks.
* **Curriculum Management:** Create assignments, upload study materials, update subject timetables, and publish notifications.
* **Dynamic Calendar & Dashboard:** Track upcoming classes, evaluate assignments, and view attendance trends.

### 🧑‍🎓 3. Student Portal (`student`)
* **Student Onboarding & Security:** Secure OTP-based registration flow for verify-on-signup email validations.
* **Personalized Dashboard:** Unified dashboard displaying weekly class timetables, upcoming assignment deadlines, recent course grades, and real-time announcement tickers.
* **Digital Student ID Card Builder:** Dynamically renders a student identity card including personal details, academic course information, a barcode/QR code, and a clean, printable layout.
* **Social Explorer Feed:** Share updates, post code/images/videos, tag posts, and comment on other students' uploads. Features search and filter capabilities.
* **Real-time Messaging & Community Hub:** Join academic community groups, create direct 1-to-1 chats, and communicate using Socket.io (equipped with message status, media uploads, and emoji pickers).
* **Asset Sharing & Marketplace:** Upload and exchange course notes, text books, or accessories. Supports classifying assets into specific categories, tagging, marking notes as paid/free, and favorite lists.

---

## 🛠️ Technological Stack

### Frontend Architecture
* **Core Framework:** React 18 powered by Vite.
* **State Management:**
  * **Redux Toolkit:** Handles local state, authentication statuses, active user contexts, and persistent UI states.
  * **TanStack React Query (v5):** Coordinates asynchronous server synchronization, automated caching, cache invalidation, and background state synchronization.
* **Client-Side Routing:** React Router v7 (`createBrowserRouter`) leveraging modular layout wrappers and role-based guards:
  * `ProtectedRoute`: Grants access only to logged-in users matching specific roles.
  * `UnauthenticatedRoute`: Prevents authenticated users from revisiting signin/registration workflows.
* **Styling & UX:**
  * **Tailwind CSS (v4):** Next-gen CSS compiler with Vite integration (`@tailwindcss/vite`).
  * **shadcn/ui & Radix UI Primitives:** Base design system utilizing fully accessible popovers, dialogs, dropdowns, and select components.
  * **Framer Motion (`motion`):** Smooth layout transforms, transition hooks, page navigations, and interactive model animations.
  * **@formkit/auto-animate:** Micro-animations for dynamic DOM entries/exits (lists, messages, comments).
  * **celebration utilities:** `canvas-confetti` & `react-confetti` trigger confetti bursts on milestone completions (like uploading assets, joining communities, or finalizing attendance).
* **Network Layer:** Custom Axios client wrapper (`api.js`) equipped with:
  * Authorization request interceptor (automatically attaches standard JWT tokens from localStorage).
  * Unified error mapping interceptors converting backend statuses (401, 403, 404, 500) to clean, user-friendly enums (`ErrorCodes`, `ErrorMessages`).
  * Automatic connection timeout handlers (10s limit) and request cancellation support using `AbortController`.

### Backend Architecture
* **Runtime & Framework:** Node.js (ES Module standard) and Express.js.
* **Database & ODM:** MongoDB & Mongoose. Features:
  * text indexes on `Student` model (supporting full-text search on names, courses, and college details).
  * text indexes on `Post` model (supporting search on captions and hashtag tags).
  * Descending indices for chronologically sorting feed posts and messages.
* **Real-Time Communication Layer:** Socket.io server with:
  * JWT verification middleware during handshake (restricting connections to authenticated clients).
  * Targeted rooms based on `userId` to route direct 1-to-1 messages safely.
  * Dynamically joined rooms for community channel group chats (`joinCommunity`, `leaveCommunity`).
  * Real-time indicators for "typing..." and "stop typing...".
  * Server connection recovery state configuration.
* **Security Middlewares:**
  * `helmet`: Configures secure HTTP response headers.
  * `cors`: Strict origin restriction pointing to client port.
  * `express-rate-limit`: Prevents brute force and DOS attacks on API routes.
  * `express-mongo-sanitize`: Sanitizes request parameters to prevent NoSQL injection attacks.
  * `hpp`: Protects against HTTP Parameter Pollution.
* **Validation Schema:** Zod schemas validating request structures before entering database layers.
* **Cryptography:** `bcryptjs` for salting and hashing database credentials, and `jsonwebtoken` (JWT) for secure authentication claims.

### Third-Party Services & Integrations
* **Media Hosting:** Multer middleware with Cloudinary SDK to handle real-time image and video file streams directly to cloud buckets.
* **Communication Pipelines:**
  * **Nodemailer (SMTP Transport):** Sends transactional emails, welcome notifications, and registration OTPs.
  * **Twilio SMS Gateway:** Sends SMS verification codes to mobile devices.
  * *Bypass Mode:* Built-in fail-safe switches falling back to console logging when Twilio or SMTP services are unconfigured in local developments.

---

## 📂 Project Directory Structure

```text
ClasscifyPlatform/
├── Backend/
│   ├── src/
│   │   ├── config/                 # Environment validation and immutable configs
│   │   │   └── env.config.js       # Validates and exports system env variables
│   │   ├── database/               # Mongoose connection & DB models
│   │   │   ├── connection.js       # MongoDB connection client
│   │   │   └── models/             # Schema definitions (16 distinct schemas)
│   │   │       ├── admin.model.js
│   │   │       ├── student.model.js
│   │   │       ├── teacher.model.js
│   │   │       └── ... (community, post, message, attendance, etc.)
│   │   ├── middlewares/            # Express request interceptors
│   │   │   ├── auth.middleware.js      # JWT validation & role restriction
│   │   │   ├── fileUpload.middleware.js # Multer file upload & mime filter
│   │   │   ├── rateLimit.middleware.js  # API request throttle rules
│   │   │   └── sanitize.middleware.js   # SQL/NoSQL injection cleaner
│   │   ├── modules/                # Feature Modules (Clean Repository Pattern)
│   │   │   ├── teacher/
│   │   │   │   ├── contracts/           # Repository abstract interface classes
│   │   │   │   ├── implementations/     # Concrete data queries (Mongoose hooks)
│   │   │   │   ├── teacher.controller.js# Request controller handlers
│   │   │   │   ├── teacher.service.js   # Business & transaction processing
│   │   │   │   └── teacher.routes.js    # Express route mappings
│   │   │   ├── student/
│   │   │   └── ... (admin, post, message, timetable, assignment, etc.)
│   │   ├── routes/                 # Root router mapping modular routes
│   │   │   └── index.route.js
│   │   ├── services/               # Outbound integration logic
│   │   │   ├── email/              # Nodemailer transporter & HTML templates
│   │   │   ├── sms/                # Twilio SMS client wrapper
│   │   │   └── storage/            # Cloudinary asset uploader
│   │   └── utils/                  # Logger, custom error formatting, helpers
│   ├── server.js                   # Node entry, Socket.io lifecycle, shutdown hooks
│   ├── jsconfig.json
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── app/                    # Central routing, state configurations, styles
│   │   │   ├── App.css             # Main styling, typography variables
│   │   │   ├── App.jsx             # Entry component & context/store provider
│   │   │   ├── App.routes.jsx      # Router configuration (layouts/guards)
│   │   │   ├── App.stack.js        # TanStack Query initialization
│   │   │   └── App.store.js        # Redux Toolkit store config
│   │   ├── components/             # Reusable UI parts & custom interfaces
│   │   │   ├── Common/             # Sidebars, ChatArea, Explorer, IDCard, Assets
│   │   │   ├── ui/                 # shadcn accessibility primitives
│   │   │   ├── auth/               # Shared Login & wizard wrappers
│   │   │   └── posts/              # Explorer feeds & comment sections
│   │   ├── contexts/               # Global contexts (AuthContext.jsx)
│   │   ├── errors/                 # Error Boundary fallbacks, ApiError
│   │   ├── hooks/                  # Custom hooks (fetching, WebSockets)
│   │   ├── layouts/                # Role layout structures (Admin, Teacher, Student)
│   │   │   ├── AdminDashboardLayout.jsx
│   │   │   ├── StudentDashboardLayout.jsx
│   │   │   └── TeacherDashboardLayout.jsx
│   │   ├── lib/                    # Library setup (utils.js for cn class merger)
│   │   ├── modules/                # Feature modules containing page workflows
│   │   │   ├── admin/              # Analytics, management dashboards
│   │   │   ├── auth/               # Registration wizard, login steps
│   │   │   ├── student/            # Communities, profile customization
│   │   │   └── teacher/            # Attendance checkers, creators
│   │   ├── routes/                 # Protected route wrapper classes
│   │   ├── services/               # Axios services client & request interception
│   │   │   └── api.js
│   │   ├── utils/                  # Client-side utility functions
│   │   └── main.jsx                # DOM renderer mounting React
│   ├── index.html
│   ├── vite.config.js              # Bundler config (Tailwind v4 integration)
│   └── package.json
└── README.md
```

---

## 📡 API Endpoint Registry

| Module | Method | Endpoint | Access Level | Description |
| :--- | :---: | :--- | :--- | :--- |
| **Admin** | `POST` | `/api/admin/init` | Public | Initial admin creation |
| | `POST` | `/api/admin/login` | Public | Administrator login |
| **Teacher** | `POST` | `/api/teachers/send-invitation` | Admin | Sends UID invitation email |
| | `POST` | `/api/teachers/draft` | Public | Saves draft teacher details |
| | `GET` | `/api/teachers/draft/:draftId` | Public | Fetches saved teacher draft |
| | `POST` | `/api/teachers/send-otp` | Public | Sends OTP for verification |
| | `POST` | `/api/teachers/verify` | Public | Verifies OTP and registers account |
| | `POST` | `/api/teachers/login` | Public | Teacher portal authentication |
| | `GET` | `/api/teachers/courses` | Teacher | Retrieves assigned course modules |
| **Student** | `POST` | `/api/students/signup` | Public | Initiates student registration |
| | `POST` | `/api/students/verify` | Public | Verifies signup OTP code |
| | `POST` | `/api/students/login` | Public | Student portal authentication |
| | `GET` | `/api/students/profile` | Student | Fetches current profile payload |
| | `GET` | `/api/students/search` | Student | Searches other platform students |
| | `GET` | `/api/students/timetable` | Student / Teacher | Gets academic timetable feed |
| | `GET` | `/api/students/assignment` | Student | Fetches assignments list |
| | `GET` | `/api/students/announcements`| Student | Retrieves active announcements |
| **Feed / Posts** | `POST` | `/api/posts` | Student | Creates new feed post (with media) |
| | `GET` | `/api/posts` | Student / Teacher | Retrieves feed posts |
| | `POST` | `/api/posts/:id/like` | Student | Likes / unlikes a feed post |
| | `POST` | `/api/posts/:id/comments` | Student | Adds text comment to post |
| | `PUT` | `/api/posts/:postId/comments/:commentId` | Student | Modifies an existing comment |
| | `DELETE`| `/api/posts/:postId/comments/:commentId` | Student | Deletes a comment |
| | `GET` | `/api/posts/search` | Student | Search posts by tags or captions |
| | `GET` | `/api/posts/explore` | Student | Fetches all explorer feed updates |
| **Class Work** | `POST` | `/api/assignments` | Admin / Teacher | Creates academic coursework |
| | `GET` | `/api/assignments` | Admin / Teacher | Retrieves created courseworks |
| | `POST` | `/api/timetable` | Admin / Teacher | Schedules lecture timetables |
| | `POST` | `/api/announcements` | Admin / Teacher | Publishes institutional notice |
| **Attendance** | `GET` | `/api/attendance/teacher` | Teacher | Retrieves active student roster |
| | `POST` | `/api/attendance` | Teacher | Saves attendance markers |
| | `GET` | `/api/attendance` | Teacher / Student | Gets general attendance list |
| | `PUT` | `/api/attendance/:id` | Teacher | Edits past attendance logs |
| | `GET` | `/api/attendance/stats` | Teacher | Retrieves overview analytics |
| | `GET` | `/api/attendance/student` | Student | Retrieves marked attendance sheet |
| | `GET` | `/api/attendance/heatmap/:studentId` | Student / Teacher | Generates calendar heatmap array |
| | `GET` | `/api/attendance/mystats` | Student | Shows student attendance stats |
| **Realtime Chat**| `POST` | `/api/conversations` | All Users | Establishes a new chat context |
| | `GET` | `/api/conversations` | All Users | Lists user conversations |
| | `GET` | `/api/conversations/:id/messages`| All Users | Fetches past chat history |
| | `PUT` | `/api/conversations/:id/read`| All Users | Marks messages in conversation as read |
| | `POST` | `/api/messages/direct` | All Users | Dispatches direct message |
| | `GET` | `/api/messages/direct/:receiverId`| All Users | Retrieves direct conversation logs |
| | `POST` | `/api/messages/community/:communityId`| All Users | Dispatches message to channel |
| | `GET` | `/api/messages/community/:communityId`| All Users | Retrieves community chat logs |
| | `POST` | `/api/messages/communities`| All Users | Creates new community channel |
| | `GET` | `/api/messages/communities`| All Users | Lists all channels |
| | `GET` | `/api/messages/communities/search`| All Users | Filter channels by name query |
| | `POST` | `/api/messages/communities/:id/request`| All Users | Sends request to join a community |
| | `POST` | `/api/messages/communities/:id/request/:userId/accept`| All Users | Accepts member request |
| | `POST` | `/api/messages/communities/:id/request/:userId/reject`| All Users | Rejects member request |
| **Assets Marketplace**| `POST` | `/api/assets` | Student | Upload notes, accessories, files |
| | `GET` | `/api/assets` | Student / Teacher | Lists marketplace assets |
| | `GET` | `/api/assets/my-assets` | Student | Retrieves assets uploaded by user |
| | `GET` | `/api/assets/my-downloads`| Student | Retrieves downloads history |
| | `GET` | `/api/assets/my-favorites`| Student | Retrieves favorited assets |
| | `GET` | `/api/assets/:id/download`| Student / Teacher | Triggers asset file download |
| | `POST` | `/api/assets/:id/favorite`| Student | Favorites / unfavorites asset |

---

## 🔒 Configuration & Environment Setup

The application requires the following settings in configuration files.

### Backend Environments (`Backend/.env`)
```bash
# Server Port & Env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
MONGO_URI=mongodb://localhost:27017/classcify   # MongoDB connection string

# JWT Secret
JWT_SECRET=your_jwt_signing_key_here

# Initial Admin Configuration
ADMIN_EMAIL=admin@classcify.com
ADMIN_INITIAL_PASSWORD=adminSecurePass123

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# SMS verification Gateway (Twilio)
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE=your_twilio_registered_phone

# SMTP Mail server gateway configuration
SMTP_HOST=your_smtp_server_host
SMTP_PORT=465
SMTP_PASS=your_smtp_mailbox_password
SENDER_EMAIL=noreply@classcify.com
```

### Frontend Environments (`Frontend/.env`)
```bash
VITE_API_BASE_URL=http://localhost:5000
```
