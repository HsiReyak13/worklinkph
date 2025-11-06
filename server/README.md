# WorkLink PH Backend API

Backend server for WorkLink PH application built with Node.js, Express, and SQLite.

## Features

- 🔐 JWT-based authentication
- 👤 User management (register, login, profile)
- 💼 Job listings with search and filters
- 📚 Resources directory
- 🛡️ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ Input validation
- 🗄️ SQLite database

## Setup

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
DB_PATH=./database/worklinkph.db
FRONTEND_URL=http://localhost:3000
```

### 3. Setup Database

```bash
npm run setup-db
```

This will create the database and all necessary tables.

### 4. Seed Sample Data (Optional)

```bash
npm run seed
```

This will add sample jobs and resources to the database.

### 5. Start Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000` (or your configured PORT).

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `GET /api/auth/me` - Get current user (requires auth)

### Users

- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update user profile (requires auth)
- `DELETE /api/users/profile` - Delete user account (requires auth)

### Jobs

- `GET /api/jobs` - Get all jobs (with filters: search, type, location, tags)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create a new job (requires auth)
- `PUT /api/jobs/:id` - Update a job (requires auth)
- `DELETE /api/jobs/:id` - Delete a job (requires auth)

### Resources

- `GET /api/resources` - Get all resources (with filters: search, type, category)
- `GET /api/resources/:id` - Get resource by ID
- `POST /api/resources` - Create a new resource (requires auth)
- `PUT /api/resources/:id` - Update a resource (requires auth)
- `DELETE /api/resources/:id` - Delete a resource (requires auth)

## Authentication

Protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are generated on login/register and expire after 7 days (configurable).

## Database Schema

### Users Table
- id, full_name, email, phone, password_hash
- city, province, identity, skills
- job_preferences (JSON), accessibility_settings (JSON), notification_preferences (JSON)
- created_at, updated_at

### Jobs Table
- id, title, company, location, description
- type, tags (JSON)
- posted_by (foreign key to users)
- created_at, updated_at

### Resources Table
- id, title, organization, category, description
- type, link, contact_info (JSON)
- created_at, updated_at

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configured
- **Rate Limiting**: Prevents abuse (100 requests per 15 minutes per IP)
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure authentication tokens
- **Input Validation**: express-validator for request validation

## Development

### Scripts

- `npm start` - Start server
- `npm run dev` - Start server with nodemon (auto-reload)
- `npm run setup-db` - Initialize database tables
- `npm run seed` - Seed sample data

### Project Structure

```
server/
├── config/          # Database configuration
├── middleware/      # Express middleware
├── models/         # Database models
├── routes/         # API routes
├── scripts/        # Database setup and seeding scripts
├── .env.example    # Environment variables template
├── .gitignore      # Git ignore rules
├── package.json    # Dependencies
└── server.js       # Main server file
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRE` | JWT expiration | 7d |
| `DB_PATH` | Database file path | ./database/worklinkph.db |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |

## Notes

- Database is SQLite for simplicity. Can be easily migrated to PostgreSQL/MySQL.
- Passwords are hashed using bcryptjs with 10 salt rounds.
- JWT tokens are used for authentication with configurable expiration.
- All user passwords are hashed and never stored in plain text.
- Rate limiting prevents API abuse.

## License

ISC

