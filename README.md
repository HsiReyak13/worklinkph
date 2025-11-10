<!-- Inspired by Best-README-Template: https://github.com/othneildrew/Best-README-Template/blob/main/README.md -->

<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](#license)

<!-- PROJECT TITLE/LOGO -->
<div align="center">
  <h1>WorkLink PH</h1>
  <p>Bridging Opportunities for Inclusive Employment in the Philippines</p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li><a href="#about-the-project">About the Project</a></li>
    <li><a href="#built-with">Built With</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#environment-variables">Environment Variables</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About the Project

WorkLink PH is a full‑stack web application that connects inclusive employers with job seekers from diverse communities (PWDs, Senior Citizens, Youth, and other marginalized groups). The platform offers accessible job matching, a resources directory, and a simple onboarding experience.

Key highlights:
- **Inclusive, mobile‑first UI** with accessibility considerations
- **Secure authentication** with Supabase Auth (Email/Password + Google OAuth)
- **Job listings** with filters and tags
- **Resources directory** for training and support
- **User profiles** with onboarding flow

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built With

- **Frontend:**
  - React 19.2.0
  - Supabase Client (@supabase/supabase-js)
  - CSS3

- **Backend:**
  - Node.js with Express
  - Supabase (PostgreSQL)
  - Supabase Auth

- **Authentication:**
  - Supabase Auth (Email/Password)
  - Google OAuth Integration

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Features

- ✅ **User Authentication**
  - Email/Password registration and login
  - Google OAuth sign-in
  - Secure session management

- ✅ **User Profiles**
  - Customizable profiles
  - Onboarding flow
  - Accessibility settings

- ✅ **Job Listings**
  - Browse available jobs
  - Filter by location, type, tags
  - Full-text search

- ✅ **Resources Directory**
  - Training programs
  - Legal resources
  - Support organizations

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v14+)
- npm
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/karl1227/worklinkph.git
   cd worklinkph
   ```

2. **Install dependencies**
   ```bash
   # Root (frontend)
   npm install

   # Backend
   cd server && npm install && cd ..
   ```

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Get your API keys from **Settings** → **API**
   - Go to **SQL Editor** and run `server/database/worklinkph.sql`

4. **Configure environment variables**
   
   Create `server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   FRONTEND_URL=http://localhost:3000
   ```

   Create root `.env`:
   ```env
   REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
   ```

5. **Configure Google OAuth (Optional)**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add to Supabase Dashboard → **Authentication** → **Providers** → **Google**
   - See `SUPABASE_AUTH_MIGRATION.md` for detailed instructions

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

**Start both frontend and backend in development mode:**
```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

**Start frontend only:**
```bash
npm run start:frontend
```

**Start backend only:**
```bash
npm run start:backend
```

**Build production assets:**
```bash
npm run build
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment mode | No (default: development) |
| `SUPABASE_URL` | Supabase project URL | **Yes** |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | **Yes** |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |

### Frontend (root `.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_SUPABASE_URL` | Supabase project URL | **Yes** |
| `REACT_APP_SUPABASE_ANON_KEY` | Supabase anonymous key | **Yes** |

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [ ] Refine onboarding and accessibility settings
- [ ] Expand job filters and saved searches
- [ ] Add deployment guides for preferred platforms
- [ ] Implement job application tracking
- [ ] Add email notifications

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contributing

Contributions are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## License

Distributed under the ISC License.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Contact

Project Link: [https://github.com/karl1227/worklinkph](https://github.com/karl1227/worklinkph)

<p align="right">(<a href="#readme-top">back to top</a>)</p>
