# WorkLink PH

> Bridging Opportunities for Inclusive Employment in the Philippines

[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)

## Overview

WorkLink PH is a full-stack web application designed to bridge employment opportunities for inclusive communities in the Philippines. The platform serves Persons with Disabilities (PWDs), Senior Citizens, Youth, and marginalized communities by providing accessible job matching, comprehensive resource directories, and employment support services.

## Features

- **User Authentication**: Secure login and registration system
- **Job Search & Matching**: Find employment opportunities tailored to specific needs
- **Resource Directory**: Access comprehensive services and support organizations
- **User Profiles**: Customize profiles for targeted recommendations
- **Onboarding System**: Guided setup for new users
- **Accessibility Features**: WCAG compliant with screen reader support, high contrast mode, and scalable fonts

## Technology Stack

### Frontend
- React 19.2.0
- React Router DOM 6.8.0
- React Icons 5.5.0
- CSS3

### Backend
- Node.js with Express
- SQLite Database
- JWT Authentication
- RESTful API

## Prerequisites

- Node.js (v14.0 or higher)
- npm (v6.0 or higher)
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/karl1227/worklinkph.git
cd worklinkph
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm run setup
```

This will install both frontend and backend dependencies and set up the database.

### 3. Configure Environment

Create a `.env` file in the `server` directory:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
DB_PATH=./database/worklinkph.db
FRONTEND_URL=http://localhost:3000
```

### 4. Seed Sample Data (Optional)

```bash
cd server
npm run seed
```

## Usage

### Development Mode

Start both frontend and backend:

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

### Production Build

```bash
npm run build
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start both frontend and backend |
| `npm run dev` | Start in development mode with hot-reload |
| `npm run build` | Build frontend for production |
| `npm test` | Run tests |
| `npm run setup` | Install dependencies and setup database |

## Project Structure

```
worklinkph/
├── src/          # Frontend React application
├── server/       # Backend Express API
├── public/       # Static assets
└── build/        # Production build output
```

## Development

### Guidelines

- Follow React best practices
- Maintain accessibility standards (WCAG 2.1 AA)
- Use semantic HTML elements
- Write clean, documented code
- Test on multiple devices

## Deployment

### Frontend

The frontend can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

### Backend

The backend requires:
- Node.js runtime environment
- Database (SQLite for development, PostgreSQL/MySQL for production)
- Environment variables configuration

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is developed for educational and social impact purposes, focusing on inclusive employment opportunities in the Philippines.

---

**Made with ❤️ for inclusivity**

*WorkLink PH - Bridging Opportunities for Inclusive Employment*
