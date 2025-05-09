import { db } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit // Make sure this is imported
} from 'firebase/firestore';

/**
 * Initialize or get a user from the database
 * @param {string} username - The username to check or create
 * @param {string|null} email - Email for new user creation (optional)
 * @returns {Promise<Object>} - User data and existence status
 */
export const initializeUser = async (username, email = null) => {
  try {
    const userRef = doc(db, 'users', username);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // User exists - return user data
      return {
        exists: true,
        data: userDoc.data()
      };
    } else if (email) {
      // Create new user
      const newUserData = {
        username,
        email,
        gamesPlayed: 0,
        gamesWon: 0,
        winningPercentage: 0,
        averageBudgetRemaining: 0,
        averageBudgetRemainingInWins: 0,
        commonLetters: [], // Will store the 5 most commonly selected letters
        selectedLettersCount: {}, // Object to track letter selection frequency
        totalPuzzleLength: 0, // For calculating average puzzle length
        averagePuzzleLength: 0,
        createdAt: new Date()
      };
      
      // Save to Firestore
      await setDoc(userRef, newUserData);
      
      return {
        exists: true,
        data: newUserData
      };
    } else {
      // User doesn't exist and no email provided
      return {
        exists: false,
        data: null
      };
    }
  } catch (error) {
    console.error('Error initializing user:', error);
    return {
      exists: false,
      error: error.message
    };
  }
};

/**
 * Verify a user's email
 * @param {string} username - Username to verify
 * @param {string} email - Email to check
 * @returns {Promise<boolean>} - Whether the email matches
 */
export const verifyUserEmail = async (username, email) => {
  try {
    const userRef = doc(db, 'users', username);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().email === email;
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying user email:', error);
    return false;
  }
};

/**
 * Update user stats after a game
 * @param {string} username - User to update
 * @param {boolean} isVictory - Whether the game was won
 * @param {number} budgetRemaining - Remaining budget points
 * @param {number} puzzleLength - Length of the puzzle word
 * @param {string[]} selectedLetters - Letters chosen by the user
 * @returns {Promise<Object|null>} - Updated user stats
 */
export const updateUserStats = async (
  username, 
  isVictory, 
  budgetRemaining, 
  puzzleLength, 
  selectedLetters = []
) => {
  try {
    if (!username || username === 'casual_player') {
      return null; // Don't update stats for casual play
    }
    
    const userRef = doc(db, 'users', username);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User not found during stats update');
      return null;
    }
    
    const userData = userDoc.data();
    
    // Calculate new values
    const newGamesPlayed = userData.gamesPlayed + 1;
    const newGamesWon = userData.gamesWon + (isVictory ? 1 : 0);
    const newWinningPercentage = Math.round((newGamesWon / newGamesPlayed) * 100);
    
    // Calculate running average for budget remaining
    const newAverageBudget = 
      ((userData.averageBudgetRemaining * userData.gamesPlayed) + budgetRemaining) / newGamesPlayed;
    
    // Calculate running average for budget remaining in wins
    let newAverageBudgetInWins = userData.averageBudgetRemainingInWins;
    if (isVictory) {
      const totalWinBudget = (userData.averageBudgetRemainingInWins * userData.gamesWon) + budgetRemaining;
      newAverageBudgetInWins = totalWinBudget / newGamesWon;
    }
    
    // Calculate running average for puzzle length
    const newTotalPuzzleLength = userData.totalPuzzleLength + puzzleLength;
    const averagePuzzleLength = newTotalPuzzleLength / newGamesPlayed;
    
    // Update letter frequency counts
    const letterCounts = { ...userData.selectedLettersCount };
    selectedLetters.forEach(letter => {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    });
    
    // Find top 5 most common letters
    const sortedLetters = Object.entries(letterCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(item => item[0]);
    
    // Update user document
    const updatedData = {
      gamesPlayed: newGamesPlayed,
      gamesWon: newGamesWon,
      winningPercentage: newWinningPercentage,
      averageBudgetRemaining: Math.round(newAverageBudget * 10) / 10,
      averageBudgetRemainingInWins: Math.round(newAverageBudgetInWins * 10) / 10,
      selectedLettersCount: letterCounts,
      commonLetters: sortedLetters,
      totalPuzzleLength: newTotalPuzzleLength,
      averagePuzzleLength: Math.round(averagePuzzleLength * 10) / 10,
      lastPlayed: new Date()
    };
    
    await updateDoc(userRef, updatedData);
    
    return updatedData;
  } catch (error) {
    console.error('Error updating user stats:', error);
    return null;
  }
};
/**
 * Get user stats without updating
 * @param {string} username - Username to get stats for
 * @returns {Promise<Object|null>} - User stats or null if user not found
 */
export const getUserStats = async (username) => {
    try {
      const userRef = doc(db, 'users', username);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Return user stats
        return userDoc.data();
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  };
/**
 * Get leaderboard data
 * @param {number} limitCount - Maximum number of results to return
 * @returns {Promise<Array>} - Array of leaderboard entries
 */
export const getLeaderboard = async (limitCount = 10) => {
    try {
      const usersRef = collection(db, 'users');
      
      // Query for users with at least 1 game played
      const q = query(
        usersRef,
        where('gamesPlayed', '>=', 1),
        orderBy('gamesPlayed', 'desc'),
        orderBy('winningPercentage', 'desc'),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return [];
      }
      
      // Process results
      const results = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.username || doc.id,
          winningPercentage: data.winningPercentage || 0,
          
          // Make sure we get the average budget remaining value
          // Format to one decimal place for clean display
          averageScore: data.averageBudgetRemaining 
            ? Math.round(data.averageBudgetRemaining * 10) / 10 
            : 0,
            
          gamesPlayed: data.gamesPlayed || 0,
          gamesWon: data.gamesWon || 0,
          commonLetters: data.commonLetters || []
        };
      });
      
      // Apply client-side sorting to ensure winning percentage is primary sort
      results.sort((a, b) => {
        // Primary sort by winning percentage (descending)
        if (b.winningPercentage !== a.winningPercentage) {
          return b.winningPercentage - a.winningPercentage;
        }
        // Secondary sort by average score (descending)
        return b.averageScore - a.averageScore;
      });
      
      // Add ranking index
      return results.slice(0, limitCount).map((item, index) => ({
        ...item,
        id: index
      }));
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  };