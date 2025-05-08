// Updated App.js with improved styling
import React from 'react'
import Letters from './Letters'
import { useState, useEffect } from 'react'
import {
  GiAbstract009,
} from 'react-icons/gi'
import ResetButton from './ResetButton'
import DebugButtons from './DebugButtons'
import NavigationMenu from './NavigationMenu'
import RulesPage from './RulesPage'
import PrizesPage from './PrizesPage'
import LeaderboardPage from './LeaderboardPage'
import { initializeUser, verifyUserEmail } from './userManagement'
import logo from './HangmansHollowLogo.png';

// Helper function to get username from localStorage
const getLocalStorageUsername = () => {
  let userName = localStorage.getItem('userName')
  if (userName === 'temp') {
    localStorage.removeItem('userName')
    window.location.reload(true)
  }
  if (userName) {
    return JSON.parse(localStorage.getItem('userName'))
  } else {
    return ''
  }
}

function App() {
  // Existing state variables
  const [userName, setUserName] = useState(getLocalStorageUsername())
  const [currentView, setCurrentView] = useState('game') // 'game', 'rules', 'prizes', or 'leaderboard'
  const [playMode, setPlayMode] = useState('')
  const [userStats, setUserStats] = useState(null)
  
  // Login flow state
  const [loginStep, setLoginStep] = useState('username')
  const [inputValue, setInputValue] = useState('')
  const [pendingUsername, setPendingUsername] = useState('')
  const [loginError, setLoginError] = useState('')

  // Save username to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('userName', JSON.stringify(userName))
    
    // If user is logged in and we don't have their stats, fetch them
    if (userName && userName !== 'casual_player' && !userStats) {
      const fetchUserStats = async () => {
        try {
          const userDoc = await initializeUser(userName);
          if (userDoc.exists) {
            setUserStats(userDoc.data);
          }
        } catch (error) {
          console.error('Failed to fetch user stats:', error);
        }
      };
      
      fetchUserStats();
    }
  }, [userName, userStats]);
  
  // Navigation handlers
  const handleMainMenu = () => {
    // Reset game state
    localStorage.removeItem('userName');
    setUserName('');
    setPlayMode('');
    setCurrentView('game');
    setLoginStep('username');
    setInputValue('');
    setPendingUsername('');
    setLoginError('');
  };

  const handleShowRules = () => {
    setCurrentView('rules');
  };

  const handleShowPrizes = () => {
    setCurrentView('prizes');
  };
  
  const handleShowLeaderboard = () => {
    setCurrentView('leaderboard');
  };

  const handleBackToGame = () => {
    setCurrentView('game');
  };
  
  // Handle login form submission
  const handleLoginStep = async (event) => {
    event.preventDefault();
    
    if (loginStep === 'username') {
      if (!inputValue.trim()) {
        setLoginError('Please enter a username');
        return;
      }
      
      // Check if username exists
      const userDoc = await initializeUser(inputValue);
      
      if (userDoc.exists) {
        // Username exists, need to verify email
        setPendingUsername(inputValue);
        setLoginStep('email');
        setInputValue('');
        setLoginError('');
      } else {
        // New username, ask for email
        setPendingUsername(inputValue);
        setLoginStep('email');
        setInputValue('');
        setLoginError('');
      }
    } else if (loginStep === 'email') {
      // Basic email validation
      if (!inputValue.includes('@') || !inputValue.includes('.')) {
        setLoginError('Please enter a valid email address');
        return;
      }
      
      // Check if this is an existing user or new user
      const userDoc = await initializeUser(pendingUsername);
      
      if (userDoc.exists) {
        // Existing user - verify email
        const isValid = await verifyUserEmail(pendingUsername, inputValue);
        
        if (isValid) {
          // Email matches - log in user
          setUserName(pendingUsername);
          setLoginStep('username');
          setInputValue('');
          setLoginError('');
          setUserStats(userDoc.data);
        } else {
          setLoginError('Email does not match our records for this username');
        }
      } else {
        // New user - create account
        const newUser = await initializeUser(pendingUsername, inputValue);
        if (newUser.exists) {
          setUserName(pendingUsername);
          setLoginStep('username');
          setInputValue('');
          setLoginError('');
          setUserStats(newUser.data);
        } else {
          setLoginError('Failed to create account. Please try again.');
        }
      }
    }
  };

  // Handle play mode selection
  const handlePlayModeSelection = (mode) => {
    setPlayMode(mode);
    if (mode === 'casual') {
      // Set a temporary username for casual play
      setUserName('casual_player');
    }
  };

  // Handle various views based on currentView state
  if (currentView === 'rules') {
    return <RulesPage onBack={handleBackToGame} />;
  }

  if (currentView === 'prizes') {
    return <PrizesPage onBack={handleBackToGame} />;
  }
  
  if (currentView === 'leaderboard') {
    return <LeaderboardPage onBack={handleBackToGame} />;
  }
  
  // Main game views
  if (userName) {
    return (
      <main>
        <div className='menu'>
          <button
            className='menuButton'
            onClick={handleShowLeaderboard}
          >
            <GiAbstract009 />
          </button>
          <h1>Hangman's Hollow</h1>
          <NavigationMenu 
            onMainMenu={handleMainMenu}
            onRules={handleShowRules}
            onPrizes={handleShowPrizes}
          />
        </div>
        <div>
          <section>
            <Letters 
              casualMode={userName === 'casual_player'} 
              username={userName}
            />
          </section>
        </div>
        <>
          <DebugButtons />
          <ResetButton />
        </>
      </main>
    );
  } else {
    // Mode selection screen
    if (playMode === '') {
      return (
        <div className="play-mode-container">
          <img src={logo} alt="HH Logo" className='game-logo' />
          <h1 className="game-title">Hangman's Hollow</h1>
          
          <div className="play-options">
            <button 
              className="play-option-btn competitive" 
              onClick={() => handlePlayModeSelection('competitive')}
            >
              Play Competitively
            </button>
            <button 
              className="play-option-btn casual" 
              onClick={() => handlePlayModeSelection('casual')}
            >
              Play Casually
            </button>
          </div>
          <ResetButton />
        </div>
      )
    }
    // Competitive mode login flow
    else if (playMode === 'competitive') {
      return (
        <div className="login-container">
          <h1 className="login-title">Hangman's Hollow</h1>
          
          <form className="login-form" onSubmit={handleLoginStep}>
            {loginStep === 'username' ? (
              <>
                <label className="login-label">
                  Enter Your Alias
                  <input
                    className="login-input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    maxLength={10}
                    placeholder="Your username"
                    autoComplete="username"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="login-label">
                  {pendingUsername ? `Email for ${pendingUsername}` : 'Enter Your Email'}
                  <input
                    className="login-input"
                    type="email"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="your.email@example.com"
                    autoComplete="email"
                  />
                </label>
              </>
            )}
            
            {loginError && (
              <div className="login-error">
                {loginError}
              </div>
            )}
            
            <button className="login-button" type="submit">
              {loginStep === 'username' ? 'Continue' : 'Submit'}
            </button>
          </form>
          
          <ResetButton />
          <NavigationMenu 
            onMainMenu={handleMainMenu}
            onRules={handleShowRules}
            onPrizes={handleShowPrizes}
          />
        </div>
      );
    }
    
    // Fallback view
    return (
      <div className="loading-container">
        <h1>Something went wrong</h1>
        <ResetButton />
        <NavigationMenu 
          onMainMenu={handleMainMenu}
          onRules={handleShowRules}
          onPrizes={handleShowPrizes}
        />
      </div>
    )
  }
}

export default App