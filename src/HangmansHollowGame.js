// Hangman's Hollow Game Component
import React from 'react';
import Letters from './Letters';
import { useState, useEffect } from 'react';
import {
  GiAbstract009,
} from 'react-icons/gi';
import { FiLogOut } from 'react-icons/fi';
import ResetButton from './ResetButton';
import DebugButtons from './DebugButtons';
import NavigationMenu from './NavigationMenu';
import RulesPage from './RulesPage';
import PrizesPage from './PrizesPage';
import LeaderboardPage from './LeaderboardPage';
import { initializeUser, verifyUserEmail } from './userManagement';
import { resetPuzzleWord } from './puzzle';
import logo from './HangmansHollowLogo.png';
import { encryptObject, decryptObject } from './encryption';

// Add app version constant - update this when deploying new versions
const APP_VERSION = '1.0.2';

// Helper function to get username from localStorage
const getLocalStorageUsername = () => {
  let userName = localStorage.getItem('userName');
  if (userName === 'temp') {
    localStorage.removeItem('userName');
    window.location.reload(true);
  }
  if (userName) {
    return JSON.parse(localStorage.getItem('userName'));
  } else {
    return '';
  }
};

// Helper function to get stored user email
const getLocalStorageEmail = () => {
  let userEmail = localStorage.getItem('userEmail');
  if (userEmail) {
    return JSON.parse(localStorage.getItem('userEmail'));
  } else {
    return '';
  }
};

// New helper function to get current view from localStorage
const getLocalStorageCurrentView = () => {
  const encryptedView = localStorage.getItem('currentView');
  if (encryptedView) {
    try {
      return decryptObject(encryptedView);
    } catch (e) {
      console.error("Error decrypting current view:", e);
      return 'game';
    }
  } else {
    return 'game';
  }
};

// New helper function to get casual player state from localStorage
const getLocalStorageCasualState = () => {
  const encryptedState = localStorage.getItem('casualPlayerState');
  if (encryptedState) {
    try {
      return decryptObject(encryptedState);
    } catch (e) {
      console.error("Error decrypting casual player state:", e);
      return false;
    }
  } else {
    return false;
  }
};

function HangmansHollowGame() {
  // Check for app version mismatch to force refresh with new code
  useEffect(() => {
    const storedVersion = localStorage.getItem('appVersion');
    
    // If version doesn't match or doesn't exist, update it and refresh
    if (storedVersion !== APP_VERSION) {
      console.log(`Version mismatch: stored ${storedVersion}, current ${APP_VERSION}`);
      localStorage.setItem('appVersion', APP_VERSION);
      
      // Only force refresh if there's an actual version mismatch (not first visit)
      if (storedVersion) {
        console.log("Forcing cache-busting reload");
        const cacheBuster = Date.now();
        window.location.href = window.location.pathname + '?v=' + cacheBuster;
        return;
      }
    }
  }, []);
  
  // New effect to cleanup redundant storage and ensure consistency
  useEffect(() => {
    // Import the cleanup function from puzzle.js
    const cleanupPuzzleStorage = () => {
      // Remove the redundant puzzle letters storage
      localStorage.removeItem('casualPuzzleLetters');
      localStorage.removeItem('competitivePuzzleLetters');
      localStorage.removeItem('puzzleLetters'); // Legacy item
      
      // Log cleanup
      console.log("Cleaned up redundant puzzle storage items");
    };
    
    // Run the cleanup once on app load
    cleanupPuzzleStorage();
  }, []);
  
  // Existing state variables
  const [userName, setUserName] = useState(() => {
    // Check for casual player state first
    const wasCasualPlayer = getLocalStorageCasualState();
    if (wasCasualPlayer) {
      return 'casual_player';
    }
    return getLocalStorageUsername();
  });
  
  const [userEmail, setUserEmail] = useState(getLocalStorageEmail());
  const [currentView, setCurrentView] = useState(getLocalStorageCurrentView());
  const [userStats, setUserStats] = useState(null);
  const [playMode, setPlayMode] = useState(() => {
    // If we have a casual player, set mode to casual
    const wasCasualPlayer = getLocalStorageCasualState();
    if (wasCasualPlayer) {
      return 'casual';
    }
    
    // Otherwise, check stored play mode
    const encryptedMode = localStorage.getItem('playMode');
    if (encryptedMode) {
      try {
        return decryptObject(encryptedMode);
      } catch (e) {
        console.error("Error decrypting play mode:", e);
        return '';
      }
    } else {
      return '';
    }
  });
  
  // Login flow state
  const [loginStep, setLoginStep] = useState('username');
  const [inputValue, setInputValue] = useState('');
  const [pendingUsername, setPendingUsername] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // Derived state - is the current user in casual mode?
  const isCasualMode = userName === 'casual_player';

  // Save username to localStorage ONLY for competitive players
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
  
  // New effect to save currentView to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('currentView', encryptObject(currentView));
  }, [currentView]);
  
  // New effect to track if we're in casual mode
  useEffect(() => {
    if (userName === 'casual_player') {
      // Store that we're in casual mode
      localStorage.setItem('casualPlayerState', encryptObject(true));
      
      // Add casual mode class to body
      document.body.classList.remove('competitive-mode');
      document.body.classList.add('casual-mode');
    } else {
      // Clear casual mode flag
      localStorage.removeItem('casualPlayerState');
      
      // Add competitive mode class to body if in competitive mode
      if (playMode === 'competitive') {
        document.body.classList.remove('casual-mode');
        document.body.classList.add('competitive-mode');
      }
    }
  }, [userName, playMode]);
  
  // Save playMode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('playMode', encryptObject(playMode));
  }, [playMode]);
  
  // Navigation handlers
  const handleMainMenu = () => {
    console.log("handleMainMenu called");
    
    // Different behavior based on play mode
    if (userName === 'casual_player') {
      console.log("Casual player returning to main menu");
      
      // Check if there's a real username stored in localStorage
      const storedUsername = getLocalStorageUsername();
      if (storedUsername && storedUsername !== 'casual_player') {
        // If there's a real user logged in, restore their username
        console.log("Restoring logged-in user:", storedUsername);
        setUserName(storedUsername);
      } else {
        // Otherwise clear username
        setUserName('');
      }
      
      // Remove casual mode class from body and clear localStorage flag
      document.body.classList.remove('casual-mode');
      localStorage.removeItem('casualPlayerState');
    } else if (userName) {
      // For competitive players who are logged in, we keep userName intact
      // but we need to reset the game mode
      document.body.classList.remove('competitive-mode');
    }
    
    // Clear any preselected state
    localStorage.removeItem('preselected');
    
    // Reset game state
    setPlayMode('');
    setCurrentView('game');
    setLoginStep('username');
    setInputValue('');
    setPendingUsername('');
    setLoginError('');
    setShowLogoutConfirm(false);
    
    // Force reload with cache busting to ensure latest version
    // Only do this occasionally (1 in 5 chance) to avoid too many reloads
    if (Math.random() < 0.2) {
      console.log("Performing cache-busting reload");
      const cacheBuster = Date.now();
      window.location.href = window.location.pathname + '?v=' + cacheBuster;
      return; // Exit early as we're reloading
    }
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

  // Handle play mode selection with skip login for existing users
  const handlePlayModeSelection = (mode) => {
    console.log(`Selecting play mode: ${mode}`);
    
    // Clear any existing preselected state to avoid state leak between modes
    localStorage.removeItem('preselected');
    
    // Set the mode in localStorage before the refresh
    localStorage.setItem('playMode', encryptObject(mode));
    
    // Add a version check to localStorage to force update on refresh
    localStorage.setItem('appVersion', '1.0.2'); // Increment this whenever you deploy
    
    // Set body classes for current mode
    if (mode === 'casual') {
      document.body.classList.remove('competitive-mode');
      document.body.classList.add('casual-mode');
      
      // Set temporary username for casual play
      setUserName('casual_player');
      
      // Store the casual player state
      localStorage.setItem('casualPlayerState', encryptObject(true));
      
      // Do a light refresh to ensure puzzles are correctly synchronized
      window.location.reload();
    } 
    else if (mode === 'competitive') {
      document.body.classList.remove('casual-mode');
      document.body.classList.add('competitive-mode');
      
      // Clear casual player state immediately
      localStorage.removeItem('casualPlayerState');
      
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
      
      // Do a light refresh to ensure puzzles are correctly synchronized
      window.location.reload();
    }
    
    // Set the play mode last, after other state updates
    setPlayMode(mode);
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
    
    // Clear localStorage for competitive data
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('competitivePuzzleWord');
    localStorage.removeItem('competitivePuzzleLetters');
    localStorage.removeItem('competitiveGameStateCurrent');
    localStorage.removeItem('competitiveFinalChosenLetters');
    localStorage.removeItem('competitiveUsedLetters');
    
    // Reset competitive puzzle
    resetPuzzleWord('competitive');
    
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
            casualMode={isCasualMode} 
            username={userName}
            key={isCasualMode ? 'casual' : 'competitive'}
          />
          </section>
        </div>
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
        </div>
      );
    }
    // Competitive mode login flow - only shown for new users
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
        <NavigationMenu 
          onMainMenu={handleMainMenu}
          onRules={handleShowRules}
          onPrizes={handleShowPrizes}
        />
      </div>
    );
  }
}

export default HangmansHollowGame; 