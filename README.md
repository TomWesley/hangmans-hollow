# Wesley Arcade

A collection of arcade-style games and experiences.

## Games

### 🎯 Hangman's Hollow
A dark-themed hangman game with competitive and casual modes.
- **URL**: `/HangmansHollow`
- **Features**: 
  - Competitive mode with user accounts and leaderboards
  - Casual mode for quick play
  - Dark, atmospheric design

### 🌌 The Void
An atmospheric exploration experience.
- **URL**: `/void`
- **Features**: Built with Vite and React 18

## Structure

- **Homepage** (`/`): Wesley Arcade main page with game selection
- **Hangman's Hollow** (`/HangmansHollow`): The main hangman game
- **The Void** (`/void`): Atmospheric experience (separate Vite app)

## Development

```bash
# Install dependencies for main app
npm install

# Install dependencies for void app
cd public/void && npm install

# Start development server (main app)
npm start

# Start development server (void app)
cd public/void && npm run dev

# Build for production
npm run build:all

# Deploy to Firebase
npm run deploy
```

## Build Process

The project includes multiple apps:
- **Main App**: React app with Wesley Arcade homepage and Hangman's Hollow
- **Void App**: Separate Vite-based React app in `public/void/`

### Build Scripts

- `npm run build` - Build main app only
- `npm run build:void` - Build void app only  
- `npm run build:all` - Build both apps and copy void to main build
- `npm run deploy` - Build all apps and deploy to Firebase

## Technologies

- React
- Firebase (Hosting & Database)
- React Router v5
- CSS3 with arcade-style animations
- Vite (for void app)

## Deployment

The app is deployed on Firebase Hosting at: https://singularity-c216f.web.app
