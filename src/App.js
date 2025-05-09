import React from 'react'
import Letters from './Letters'
import { useState, useEffect } from 'react'
import {
  GiAbstract009,
} from 'react-icons/gi'
import { FiLogOut } from 'react-icons/fi' // Using Feather icons for logout
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

// Helper function to get stored user email
const getLocalStorageEmail = () => {
  let userEmail = localStorage.getItem('userEmail')
  if (userEmail) {
    return JSON.parse(localStorage.getItem('userEmail'))
  } else {
    return ''
  }
}

function App() {
  // Existing state variables
  const [userName, setUserName] = useState(getLocalStorageUsername())
  const [userEmail, setUserEmail] = useState(getLocalStorageEmail())
  const [currentView, setCurrentView] = useState('game') // 'game', 'rules', 'prizes', or 'leaderboard'
  const [playMode, setPlayMode] = useState('')
  const [userStats, setUserStats] = useState(null)
  
  // Login flow state
  const [loginStep, setLoginStep] = useState('username')
  const [inputValue, setInputValue] = useState('')
  const [pendingUsername, setPendingUsername] = useState('')
  const [loginError, setLoginError] = useState('')
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Save username to localStorage when it changes
  useEffect(() => {
    // Only update localStorage for competitive players, not casual players
    if (userName && userName !== 'casual_player') {
      localStorage.setItem('userName', JSON.stringify(userName));
      
      // Fetch user stats if needed
      if (!userStats) {
        const fetchUserStats = async () => {
          try {
            const userDoc = await initializeUser(userName);
            if (userDoc.exists) {
              setUserStats(userDoc.data);
              
              // Also store the email if we have it
              if (userDoc.data.email && userDoc.data.email !== userEmail) {
                setUserEmail(userDoc.data.email);
                localStorage.setItem('userEmail', JSON.stringify(userDoc.data.email));
              }
            }
          } catch (error) {
            console.error('Failed to fetch user stats:', error);
          }
        };
        
        fetchUserStats();
      }
    }
  }, [userName, userStats, userEmail]);
  
  // Save email to localStorage when it changes
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('userEmail', JSON.stringify(userEmail));
    }
  }, [userEmail]);
  
  // Navigation handlers
  const handleMainMenu = () => {
    console.log("handleMainMenu called");
    
    // Different behavior based on play mode
    if (userName === 'casual_player') {
      console.log("Casual player returning to main menu");
      // For casual player, just clear the casual username from state
      // but DON'T touch localStorage which might contain competitive credentials
      setUserName('');
    }
    // For competitive players, we keep userName intact in both state and localStorage
    
    // Reset game state
    setPlayMode('');
    setCurrentView('game');
    setLoginStep('username');
    setInputValue('');
    setPendingUsername('');
    setLoginError('');
    setShowLogoutConfirm(false);
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
          setUserEmail(inputValue);
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
          setUserEmail(inputValue);
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
      // Set temporary username for casual play, but DON'T store in localStorage
      setUserName('casual_player');
    } 
    else if (mode === 'competitive') {
      // Check if user is already logged in (has username in localStorage)
      const storedUsername = getLocalStorageUsername();
      
      if (storedUsername && storedUsername !== 'casual_player') {
        // User is already logged in, use their stored credentials
        console.log("User already logged in, skipping login screens");
        setUserName(storedUsername);
        
        // Fetch user stats if needed
        if (!userStats) {
          const fetchUserStats = async () => {
            try {
              const userDoc = await initializeUser(storedUsername);
              if (userDoc.exists) {
                setUserStats(userDoc.data);
              }
            } catch (error) {
              console.error('Failed to fetch user stats:', error);
            }
          };
          
          fetchUserStats();
        }
      }
      // If not logged in already, the playMode will be set to 'competitive'
      // and the render logic will show the login screens
    }
  };
  
  // Handle logout button click
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };
  
  // Handle logout confirmation
  const handleLogoutConfirm = () => {
    // Clear user data
    setUserName('');
    setUserEmail('');
    setUserStats(null);
    
    // Clear localStorage
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    
    // Reset UI state
    setShowLogoutConfirm(false);
  };
  
  // Handle logout cancellation
  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
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
    // Check if we're on the main menu but the user is already logged in competitively
    if (playMode === '' && userName !== 'casual_player') {
      return (
        <div className="play-mode-container">
          <img src={logo} alt="HH Logo" className='game-logo' />
          <h1 className="game-title">Hangman's Hollow</h1>
          
          {/* Show logged in status */}
          <div className="logged-in-status">
            <p>Logged in as: <span className="username-display">{userName}</span></p>
            
            {/* Logout button */}
            <button className="logout-button" onClick={handleLogoutClick}>
  <FiLogOut className="logout-icon" /> Log Out
</button>
          </div>
          
          {/* Logout confirmation */}
          {showLogoutConfirm && (
            <div className="logout-confirm">
              <p>Are you sure you want to log out?</p>
              <div className="logout-buttons">
                <button 
                  className="logout-confirm-button"
                  onClick={handleLogoutConfirm}
                >
                  Yes, Log Out
                </button>
                <button 
                  className="logout-cancel-button"
                  onClick={handleLogoutCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
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
      );
    }
    
    // Regular game view once in a game
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
    // Mode selection screen for not logged in users
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
      // Get stored username (returns '' if not found)
      const storedUsername = getLocalStorageUsername();
      
      // If we have a stored username and we're not showing the username field in state yet,
      // we should update it (this can happen if useState initial value didn't pick it up)
      if (storedUsername && storedUsername !== 'casual_player' && !userName) {
        // Instead of showing login, set the username and return null for this render cycle
        setUserName(storedUsername);
        return null; // Return null for this render cycle, will re-render with userName set
      }
      
      // If no stored username (or it's casual_player), show login
      if (!storedUsername || storedUsername === 'casual_player') {
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