// src/Letters.js
import React from 'react'
import Letter from './Letter'
import { useState, useEffect } from 'react'
import data from './data'
import AnswerLetters from './AnswerLetters'
import puz from './puzzle'
import gamestate from './gamestate'
import firebase from './firebase'
import BatMeter from './BatMeter'
import LetterCarousel from './LetterCarousel'
import { resetPuzzleWord } from './puzzle'
import {
  query,
  orderBy,
  limit,
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  writeBatch,
  increment,
  updateDoc,
  addDoc,
  getDoc,
} from 'firebase/firestore/lite'

const db = getFirestore(firebase)
const versionTrigger = 1

// Import the resetPuzzleWord function


// Updated ResetGame function
const ResetGame = () => {
  // Clear all game-related localStorage items
  localStorage.removeItem('gameStateCurrent')
  localStorage.removeItem('puzzleLetters')
  localStorage.removeItem('finalChosenLetters')
  localStorage.removeItem('usedLetters')
  localStorage.removeItem('letters')
  localStorage.removeItem('preselected')
  
  // Reset the puzzle word (this will trigger generating a new word next time)
  resetPuzzleWord();
  
  // Reload the page to start fresh
  window.location.reload(false)
}
const getLocalStorageUsedLetters = () => {
  let usedLetters = localStorage.getItem('usedLetters')
  if (usedLetters) {
    return JSON.parse(localStorage.getItem('usedLetters'))
  } else {
    return []
  }
}
const getLocalStorageGameState = () => {
  let gameStateCurrent = localStorage.getItem('gameStateCurrent')
  if (gameStateCurrent) {
    return JSON.parse(localStorage.getItem('gameStateCurrent'))
  } else {
    return gamestate
  }
}
const getLocalStorageFinalChosenLetters = () => {
  let finalChosenLetters = localStorage.getItem('finalChosenLetters')
  if (finalChosenLetters) {
    return JSON.parse(localStorage.getItem('finalChosenLetters'))
  } else {
    return []
  }
}

const getLocalStorageLetters = () => {
  let letters = localStorage.getItem('letters')
  if (letters) {
    return JSON.parse(localStorage.getItem('letters'))
  } else {
    return data
  }
}

const getLocalStoragePreselected = () => {
  let preselected = localStorage.getItem('preselected')
  if (preselected) {
    return JSON.parse(localStorage.getItem('preselected'))
  } else {
    return {
      status: false,
      value: '',
      key: '',
    }
  }
}

var scoreInc = 0

const Letters = ({ casualMode = false }) => {
  const [gameStateCurrent, setGameStateCurrent] = useState(
    getLocalStorageGameState()
  )
  const [localStats, setLocalStats] = useState({ av: 0, pct: 0 })
  const [finalChosenLetters, setfinalChosenLetters] = useState(
    getLocalStorageFinalChosenLetters
  )
  const [letters, setLetters] = useState(getLocalStorageLetters())
  const [usedLetters, setUsedLetters] = useState(getLocalStorageUsedLetters())
  const [preselected, setPreselected] = useState(getLocalStoragePreselected())

  useEffect(() => {
    localStorage.setItem('letters', JSON.stringify(letters))
  }, [letters])
  
  // Game state effects - runs less frequently
  useEffect(() => {
    localStorage.setItem(
      'finalChosenLetters',
      JSON.stringify(finalChosenLetters)
    )
    localStorage.setItem('preselected', JSON.stringify(preselected))
    localStorage.setItem('usedLetters', JSON.stringify(usedLetters))
    localStorage.setItem('gameStateCurrent', JSON.stringify(gameStateCurrent))
    
    // Check for defeat
    if (gameStateCurrent.status === 'solving' && gameStateCurrent.score >= gameStateCurrent.maxBudget) {
      setfinalChosenLetters(usedLetters)
      setGameStateCurrent({ ...gameStateCurrent, status: 'defeat' })
      writeToDatabase('defeat')
      setUsedLetters([
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      ])
    }
    
    // Check for victory
    if (gameStateCurrent.status === 'solving') {
      let victoryTracker = 0;
      puz.forEach((l) => {
        if (usedLetters.indexOf(l.name) > -1) {
          victoryTracker += 1;
        }
      });

      if (victoryTracker === puz.length) {
        setfinalChosenLetters(usedLetters);
        setGameStateCurrent({ ...gameStateCurrent, status: 'victory' });
        writeToDatabase('victory');
      }
    }
  }, [gameStateCurrent.status, gameStateCurrent.score, usedLetters]); // Only run when these values change

  //Firebase Incoming
  async function writeToDatabase(s) {
    // Skip writing to database in casual mode
    if (casualMode) return;
    var trueScore = gameStateCurrent.maxBudget - gameStateCurrent.score
    var didWin = 0

    if (s === 'victory') {
      didWin = 1
    }
    const docRef = doc(db, 'users', localStorage.getItem('userName'))
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      var avg =
        (docSnap.data().score + trueScore) / (docSnap.data().numberOfGames + 1)
      var winPct =
        (100 * (docSnap.data().victories + didWin)) /
        (docSnap.data().numberOfGames + 1)
      avg = parseInt(avg)
      winPct = parseInt(winPct)
      await updateDoc(doc(db, 'users', localStorage.getItem('userName')), {
        name: JSON.parse(localStorage.getItem('userName')),
        score: increment(trueScore),
        numberOfGames: increment(1),
        averageScore: avg,
        victories: increment(didWin),
        winningPercentage: winPct,
      })
      setLocalStats({
        pct: winPct,
        av: avg,
      })
    } else {
      var tempDidWin = parseInt(didWin) * 100
      await setDoc(doc(db, 'users', localStorage.getItem('userName')), {
        name: JSON.parse(localStorage.getItem('userName')),
        score: increment(trueScore),
        numberOfGames: increment(1),
        averageScore: trueScore,
        victories: didWin,
        winningPercentage: tempDidWin,
      })

      setLocalStats({
        pct: tempDidWin,
        av: trueScore,
      })
    }
  }

  const scoreChange = (i) => {
    scoreInc = 0;
    let isCorrectGuess = false;
    
    // Check if the letter is in the puzzle
    puz.forEach((puzLetter) => {
      if (puzLetter.name === letters[i].name) {
        isCorrectGuess = true;
      }
    });
    
    // If not a correct guess, add the letter's cost to the score
    if (!isCorrectGuess) {
      scoreInc = letters[i].cost;
    }
    
    var s = gameStateCurrent.score + scoreInc;
    setGameStateCurrent({ ...gameStateCurrent, score: s });
  }

  function handleClick() {
    // Placeholder for any click handling
  }

  const changeUsed = (index) => {
    scoreChange(index);

    const newArray = [...letters];
    setUsedLetters([...usedLetters, newArray[index].name]);
    newArray[index].isUsed = true;
    newArray[index].isHovered = false;
    setPreselected({ value: '', status: false, key: '' });
    setLetters(newArray);
  }
  
  const changeHover = (index) => {
    // Make a copy of the letters array
    const newArray = [...letters];
    
    // Reset any previously hovered letter
    newArray.forEach(letter => {
      letter.isHovered = false;
    });
    
    // Set the new hovered letter if index is valid
    if (index >= 0 && index < newArray.length && !newArray[index].isUsed) {
      newArray[index].isHovered = true;
      setPreselected({ 
        value: newArray[index].name, 
        status: true, 
        key: index 
      });
    } else {
      setPreselected({ value: '', status: false, key: '' });
    }
    
    setLetters(newArray);
  }

  if (gameStateCurrent.status === 'solving') {
    return (
      <section className="game-container">
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        <BatMeter currentSpent={gameStateCurrent.score} maxBudget={gameStateCurrent.maxBudget} />
        
        <LetterCarousel 
          letters={letters}
          usedLetters={usedLetters}
          onLetterSelect={changeHover}
          onLetterConfirm={changeUsed}
          preselected={preselected}
        />
      </section>
    )
  } else if (gameStateCurrent.status === 'victory') {
    return (
      <section className="game-container">
        <div>
          <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        </div>
        <div className='container victorywords'>
          <h4>
            Congratulations - You won with {gameStateCurrent.maxBudget - gameStateCurrent.score} budget to spare
          </h4>
        </div>
        <div>
          <h3>Your Guesses In Order:</h3>
        </div>
        <div className="used-letters-grid">
          {finalChosenLetters.map((letter, index) => (
            <div key={index} className="used-letter">
              {letter}
            </div>
          ))}
        </div>
        <div className='reset-button-container'>
          <button
            className='btnReset'
            onClick={() => {
              ResetGame()
            }}
          >
            Try Another
          </button>
        </div>
      </section>
    )
    
  } else {
    return (
      <section className="game-container">
        <div className='defeat'>
          <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        </div>
        <div className='container defeatwords'>
          <h4>
            Sorry, You exceeded your budget. Come back to the Hollow Tomorrow.
          </h4>
        </div>
        <div>
          <h3>Your Guesses In Order:</h3>
        </div>
        <div className="used-letters-grid">
          {finalChosenLetters.map((letter, index) => (
            <div key={index} className="used-letter">
              {letter}
            </div>
          ))}
        </div>
        <div className='reset-button-container'>
          <button
            className='btnReset'
            onClick={() => {
              ResetGame()
            }}
          >
            Try Another
          </button>
        </div>
      </section>
    )
  }
}

export default Letters