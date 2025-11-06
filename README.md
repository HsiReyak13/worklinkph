<!-- Inspired by Best-README-Template: https://github.com/othneildrew/Best-README-Template/blob/main/README.md -->

<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![React](https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js)](https://nodejs.org/)
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
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
  </details>

## About the Project

WorkLink PH is a full‑stack web application that connects inclusive employers with job seekers from diverse communities (PWDs, Senior Citizens, Youth, and other marginalized groups). The platform offers accessible job matching, a resources directory, and a simple onboarding experience.

Key highlights:
- Inclusive, mobile‑first UI with accessibility considerations
- Basic authentication and user profiles
- Job listings with filters and tags
- Resources directory for training and support

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Built With

- React
- Express (Node.js)
- SQLite (development default)
- CSS

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v14+)
- npm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/karl1227/worklinkph.git
   cd worklinkph
   ```
2. Install dependencies
   ```bash
   # Root (frontend)
   npm install

   # Backend
   cd server && npm install && cd ..
   ```
3. Configure environment (server/.env)
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   DB_PATH=./database/worklinkph.db
   FRONTEND_URL=http://localhost:3000
   ```
4. (Optional) Seed sample data
   ```bash
   cd server && npm run seed
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

Start both frontend and backend in development mode:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

Build production assets:

```bash
npm run build
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [ ] Refine onboarding and accessibility settings
- [ ] Expand job filters and saved searches
- [ ] Add deployment guides for preferred platforms

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

Project Link: `https://github.com/HsiReyak13/worklinkph`

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

<p align="right">(<a href="#readme-top">back to top</a>)</p>

