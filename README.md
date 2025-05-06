# Hangman's Hollow

[![React](https://img.shields.io/badge/React-16.13.1-blue.svg)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-9.6.6-orange.svg)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, mobile-optimized word guessing game with a unique budget-based twist on the classic Hangman formula.

<!-- <p align="center">
  <img src="/src/HangmansHollowLogo.png" alt="Hangman's Hollow Logo"  />
</p> -->

## 🎮 Game Overview

Hangman's Hollow transforms the traditional Hangman game by introducing a budget system that adds strategic depth. Instead of counting incorrect guesses, players manage a limited budget where each letter has a different cost based on its commonality in English. Players must strategically select letters to reveal the hidden word before depleting their budget.

### Key Features

- **Budget-Based Gameplay**: Each letter costs a different amount from your 100-point budget
- **Competitive Mode**: Register to appear on the global leaderboard
- **Casual Mode**: Play without registration for a quick game
- **Modern Mobile-Optimized Interface**: Responsive design with touch controls and swipeable letter carousel
- **User Statistics**: Track your performance over time with detailed statistics
- **Global Leaderboard**: Compete against other players worldwide
- **Secure Data Storage**: Utilizes Firebase Firestore for user data management
- **Basic Anti-Cheat Systems**: Encrypted local storage prevents casual cheating

## 📱 Responsive Design

Hangman's Hollow has been carefully designed to provide an optimal gaming experience across all devices:

- Fully responsive layout adapts to different screen sizes
- Special landscape mode optimization for mobile devices
- Touch-optimized controls with swipe navigation
- Prevention of accidental zooming and scrolling on mobile devices
- Smooth scrolling for auxiliary screens (rules, prizes, leaderboard)

## 🛠️ Technical Stack

- **Frontend**: React 16.13.1
- **Database**: Firebase Firestore
- **Storage**: Firebase Hosting
- **Containerization**: Docker with Nginx for production
- **Package Management**: NPM
- **Icons**: React Icons
- **Word Generation**: random-words

## 🔧 Setup & Installation

### Prerequisites

- Node.js (v12 or higher)
- npm or yarn
- Firebase account (for production deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/hangmans-hollow.git
cd hangmans-hollow

# Install dependencies
npm install

# Start development server
npm start
```

Visit `http://localhost:3000` to view the app in development mode.

### Firebase Setup

1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Set up Firestore database with appropriate security rules
3. Update the Firebase configuration in `src/firebase.js`

### Production Build

```bash
# Create production build
npm run build

# Deploy to Firebase
firebase deploy
```

### Docker Deployment

```bash
# Build Docker image
docker build -t hangmans-hollow .

# Run Docker container
docker run -p 8080:8080 hangmans-hollow
```

## 📂 Project Structure

```
hangmans-hollow/
├── public/                 # Static files
├── src/                    # Source code
│   ├── components/         # React components
│   ├── firebase.js         # Firebase configuration
│   ├── data.js             # Letter cost data
│   ├── puzzle.js           # Puzzle generation
│   ├── encryption.js       # Simple encryption utilities
│   ├── userManagement.js   # User management functions
│   ├── touchUtils.js       # Mobile touch optimization
│   └── index.js            # Entry point
├── .firebase/              # Firebase deployment cache
├── .gitignore              # Git ignore file
├── Dockerfile              # Docker configuration
├── nginx.conf              # Nginx configuration for Docker
├── firebase.json           # Firebase configuration
├── package.json            # NPM configuration
└── README.md               # Project documentation
```

## 🔄 Game Flow

1. **Title Screen**: Choose between Competitive or Casual mode
2. **User Registration/Login**: Enter username and email (Competitive mode only)
3. **Gameplay**: Select letters from the carousel to guess the hidden word
4. **Game End**: Victory when all letters are revealed, defeat when budget is depleted
5. **Stats Update**: Performance statistics update after each game (Competitive mode)

## 🔐 Security Features

- Basic client-side encryption for puzzle words in localStorage
- Email verification for user accounts
- Firebase security rules to protect user data
- XSS protection through React's inherent security features

## 🔮 Future Enhancements

- Difficulty levels with different budget allocations
- Theme customization options
- Daily challenges with unique words
- Social sharing functionality
- Achievement system
- Multiplayer mode for head-to-head competition
- Progressive Web App (PWA) implementation
- Advanced analytics for gameplay optimization

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

For questions or support, please create an issue in the repository or contact the project maintainer.

---

<p align="center">
  Developed with ❤️ by [Your Name]
</p>
