# WorkLink PH - Mobile Application

## Overview
WorkLink PH is a ReactJS mobile application designed to bridge opportunities for inclusive employment. The app serves Persons with Disabilities (PWDs), Senior Citizens, Youth, and marginalized communities by providing accessible job matching, training resources, and employment support.

## Features

### 🎯 Core Functionality
- **Inclusive Job Matching**: Find employment opportunities tailored to specific needs and abilities
- **Resource Directory**: Access comprehensive services and support organizations
- **Personalized Experience**: Customize profiles for targeted recommendations
- **Accessibility Features**: Built-in support for screen readers, high contrast mode, and larger text

### 📱 Screens
1. **Splash Screen**: Welcome screen with WorkLink PH branding
2. **Login Screen**: User authentication with email/phone and password
3. **Sign Up Screen**: Two-step account creation process with progress indicators
4. **Home Dashboard**: Main hub with hero section, features, and call-to-action
5. **Find Jobs**: Job search with filters, search functionality, and job listings
6. **Profile**: Personal information, preferences, and accessibility settings
7. **Resources**: Directory of employment resources, training, and legal information

### 🎨 Design Features
- **Mobile-First Design**: Optimized for mobile devices
- **Accessibility**: WCAG compliant with screen reader support
- **Responsive Layout**: Adapts to different screen sizes
- **Modern UI**: Clean, professional interface with intuitive navigation

## Target Beneficiaries

### 👥 Who We Serve
- **Persons with Disabilities (PWDs)**: Accessible job listings with inclusive employers
- **Senior Citizens**: Flexible work opportunities suited to experience and lifestyle
- **Youth**: Entry-level positions, internships, and career-building programs
- **Marginalized Groups**: Sustainable opportunities for underserved communities

## Technical Stack

### 🛠️ Technologies Used
- **React 19.2.0**: Modern React with hooks and functional components
- **React Router DOM 6.8.0**: Client-side routing for navigation
- **CSS3**: Custom styling with mobile-first responsive design
- **JavaScript ES6+**: Modern JavaScript features

### 📦 Dependencies
```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0", 
  "react-router-dom": "^6.8.0",
  "react-scripts": "5.0.1",
  "web-vitals": "^2.1.4"
}
```

#### Development Dependencies
- **@testing-library/react**: Testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM elements
- **@testing-library/user-event**: User interaction simulation for tests

### 📁 Project Structure
```
src/
├── screens/
│   ├── SplashScreen.js & .css
│   ├── LoginScreen.js & .css
│   ├── SignUpScreen.js & .css
│   ├── HomeDashboard.js & .css
│   ├── FindJobs.js & .css
│   ├── Profile.js & .css
│   └── Resources.js & .css
├── App.js
├── App.css
└── index.css
```

## Getting Started

### 📋 Prerequisites
Before running this project, make sure you have the following installed on your computer:

- **Node.js** (version 14.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn** package manager
- **Git** (for version control) - [Download here](https://git-scm.com/)

### 🚀 Installation & Setup

#### Option 1: Clone from GitHub
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/worklinkph.git
   cd worklinkph
   ```

#### Option 2: Download and Extract
1. Download the project files
2. Extract to your desired location
3. Navigate to the project directory:
   ```bash
   cd worklinkph
   ```

#### Install Dependencies
```bash
npm install
```

#### Start Development Server
```bash
npm start
```

The application will open automatically in your browser at [http://localhost:3000](http://localhost:3000)

### 🏗️ Building for Production
```bash
npm run build
```
This creates a `build` folder with optimized production files.

### 🧪 Running Tests
```bash
npm test
```

### 📦 Available Scripts
- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

### 🔧 Troubleshooting

#### Common Issues:
1. **Port 3000 already in use**: The app will automatically suggest using a different port
2. **Node modules issues**: Delete `node_modules` folder and run `npm install` again
3. **Permission errors**: Run terminal as administrator (Windows) or use `sudo` (Mac/Linux)

#### System Requirements:
- **Windows**: Windows 10 or later
- **macOS**: macOS 10.14 or later  
- **Linux**: Ubuntu 18.04+ or equivalent
- **RAM**: Minimum 4GB recommended
- **Storage**: At least 1GB free space

## Key Features Implementation

### 🔐 Authentication Flow
- Splash screen with auto-navigation to login
- Two-step signup process with progress tracking
- Form validation and user feedback

### 🎯 Job Search & Matching
- Real-time search functionality
- Filter by job type, location, and target groups
- Interactive job cards with detailed information
- Tag-based filtering system

### 👤 Profile Management
- Comprehensive personal information forms
- Job preference settings
- Accessibility customization options
- Notification preferences

### 📚 Resource Directory
- Categorized resource listings
- Search and filter functionality
- External link integration
- Organization and contact information

## Accessibility Features

### ♿ Inclusive Design
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast Mode**: Enhanced visibility options
- **Large Text Support**: Scalable font sizes
- **Keyboard Navigation**: Full keyboard accessibility
- **Focus Management**: Clear focus indicators

### 🎨 Visual Design
- **Color Contrast**: WCAG AA compliant color schemes
- **Typography**: Readable fonts with appropriate sizing
- **Spacing**: Adequate touch targets for mobile devices
- **Icons**: Meaningful icons with text alternatives

## Deployment

### 🌐 Deploy to GitHub Pages
1. Install gh-pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add homepage to package.json:
   ```json
   "homepage": "https://yourusername.github.io/worklinkph"
   ```

3. Add deploy scripts to package.json:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

### 🚀 Deploy to Netlify
1. Build the project: `npm run build`
2. Drag and drop the `build` folder to [Netlify](https://netlify.com)
3. Or connect your GitHub repository for automatic deployments

### ☁️ Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel` in your project directory
3. Follow the prompts

## Future Enhancements

### 🔮 Planned Features
- **Backend Integration**: Real API connections for job data
- **Push Notifications**: Real-time job alerts
- **Offline Support**: PWA capabilities
- **Multi-language Support**: Filipino and English
- **Advanced Matching**: AI-powered job recommendations
- **Training Modules**: Integrated learning platform

## Contributing

### 🤝 Development Guidelines
- Follow React best practices
- Maintain accessibility standards
- Use semantic HTML
- Write clean, documented code
- Test on multiple devices

## License
This project is developed for educational and social impact purposes, focusing on inclusive employment opportunities in the Philippines.

---

**Made with ❤️ for inclusivity**

*WorkLink PH - Bridging Opportunities for Inclusive Employment*