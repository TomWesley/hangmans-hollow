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

const ResetGame = () => {
  localStorage.removeItem('gameStateCurrent')
  getLocalStorageGameState()
  localStorage.removeItem('puzzleLetters')
  localStorage.removeItem('finalChosenLetters')
  getLocalStorageFinalChosenLetters()
  localStorage.removeItem('usedLetters')
  getLocalStorageUsedLetters()
  localStorage.removeItem('letters')
  getLocalStorageLetters()
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
    console.log(docSnap)
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

      console.log('Look at me', tempDidWin)
      setLocalStats({
        pct: tempDidWin,
        av: trueScore,
      })
    }

    const refer = collection(db, 'users')
    const q = query(refer, orderBy('averageScore'), limit(1))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      // console.log(doc.id, ' => ', doc.data())
    })
  }
  useEffect(() => {
    localStorage.setItem('letters', JSON.stringify(letters))
  }, [letters])
  useEffect(() => {
    localStorage.setItem(
      'finalChosenLetters',
      JSON.stringify(finalChosenLetters)
    )
    localStorage.setItem('preselected', JSON.stringify(preselected))
    localStorage.setItem('usedLetters', JSON.stringify(usedLetters))
    localStorage.setItem('gameStateCurrent', JSON.stringify(gameStateCurrent))
    const puzLength = puz.length

    var victoryTracker = 0
    if (gameStateCurrent.status === 'solving') {
      if (gameStateCurrent.score >= gameStateCurrent.maxBudget) {
        setfinalChosenLetters(usedLetters)
        setGameStateCurrent({ ...gameStateCurrent, status: 'defeat' })
        writeToDatabase('defeat')
        handleClick()
        setUsedLetters([
          'A',
          'B',
          'C',
          'D',
          'E',
          'F',
          'G',
          'H',
          'I',
          'J',
          'K',
          'L',
          'M',
          'N',
          'O',
          'P',
          'Q',
          'R',
          'S',
          'T',
          'U',
          'V',
          'W',
          'X',
          'Y',
          'Z',
        ])
      }
    }
    if (gameStateCurrent.status === 'solving') {
      {
        puz.map((l, index) => {
          if (usedLetters.indexOf(l.name) > -1) {
            victoryTracker = victoryTracker + 1
          } else {
            console.log(l.name, usedLetters)
          }
        })
      }

      if (victoryTracker === puz.length) {
        setfinalChosenLetters(usedLetters)
        setGameStateCurrent({ ...gameStateCurrent, status: 'victory' })

        writeToDatabase('victory')
        // const tempHandlerTwo = 1 + localStorage.getItem
        handleClick()
      }
    }
  })
  const scoreChange = (i) => {
    scoreInc = 0;
    let isCorrectGuess = false;
    
    // Check if the letter is in the puzzle
    puz.map((puzLetter) => {
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

  const resetGame = () => {
    localStorage.clear()
    letters.map((letters) => (letters.isUsed = false))
    setGameStateCurrent({ ...gameStateCurrent, score: 0 })
    setUsedLetters([])
  }
  function handleClick() {
    // const modal = document.querySelector('.modal')
    // const closeBtn = document.querySelector('.close')
    // // modal.style.display = 'block'
    // closeBtn.addEventListener('click', () => {
    //   modal.style.display = 'none'
    // })
  }

  const changeUsed = (index, newValue) => {
    scoreChange(index)

    const newArray = [...letters]
    setUsedLetters([...usedLetters, newArray[index].name])
    newArray[index].isUsed = true
    newArray[index].isHovered = false
    setPreselected({ value: '', status: false, key: '' })
    setLetters(newArray)
  }
  const changeHover = (index, newValue) => {
    const newArray = [...letters]
    newArray[index].isHovered = newValue
    if (newValue === false) {
      if (preselected.status === true) {
        newArray[preselected.key].isHovered = false
        setPreselected({ ...preselected, status: false })
      }
    }
    if (newValue === true) {
      if (preselected.status === true) {
        newArray[preselected.key].isHovered = false
      }
      setPreselected({ value: newArray[index].name, status: true, key: index })
    }
    setLetters(newArray)
  }

  if (gameStateCurrent.status === 'solving') {
    return (
      <section>
        {/* <div>
          <button className='btn' onClick={resetGame}>
            Debug Reset Game
          </button>
        </div> */}
        <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        <BatMeter currentSpent={gameStateCurrent.score} maxBudget={gameStateCurrent.maxBudget} />
        <div>
          {preselected.status ? (
            <button
              className='confirm'
              onClick={() => {
                changeUsed(preselected.key, true)
              }}
            >
              Confirm Guess: {preselected.value}
            </button>
          ) : (
            <button className='select'>Select A Letter</button>
          )}
        </div>
        <div className='letterlist'>
          {letters.map((letter, index) => {
            if (letter.isHovered) {
              // const result = ExampleButton()
              return (
                <div key={letter.id} className='btnscenter'>
                  <button
                    className='btntwo'
                    onClick={() => {
                      changeHover(index, false)
                    }}
                  >
                    <Letter key={letter.id} {...letter}></Letter>
                  </button>
                </div>
              )
            } else {
              if (letter.isUsed === false) {
                return (
                  <div key={letter.id} className='btnscenter'>
                    <button
                      className='btn'
                      onClick={() => {
                        changeHover(index, true)
                      }}
                    >
                      <Letter key={letter.id} {...letter}></Letter>
                    </button>
                  </div>
                )
              } else {
                return (
                  <div key={letter.id} className='btnscenter'>
                    <button className='btnUsed'>
                      <Letter key={letter.id} {...letter}></Letter>
                    </button>
                  </div>
                )
              }
            }
          })}
        </div>
      </section>
    )
  } else if (gameStateCurrent.status === 'victory') {
    return (
      <section>
        {/* <div class='modal'>
          <div class='modal_content'>
            <span class='close'>&times;</span>
            <p>I'm A Pop Up!!!</p>
          </div>
        </div> */}
        <div>
          <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        </div>
        <div className='container victorywords'>
          <h4>
            Congratulations - You won with {gameStateCurrent.maxBudget - gameStateCurrent.score} budget to spare
          </h4>

          {/* <h4>
            Your Average # of Misses per game is {localStats.av} and your
            winning percentage is {localStats.pct}%
          </h4> */}
          {/* Add in the used letters */}
        </div>
        <div>
          <h3>Your Guesses In Order:</h3>
        </div>
        <div className='letterlist'>
          {finalChosenLetters.map((letter, index) => {
            return (
              <div key={index} className='btnscenter'>
                <button className='btnUsed'>
                  <h2>{letter}</h2>
                  {/* <Letter key={index} {...letter}></Letter> */}
                </button>
              </div>
            )
          })}
        </div>
        <div className='btnscenter'>
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
      <section>
        <div className='defeat'>
          <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        </div>
        <div className='container defeatwords'>
          <h4>
            Sorry, You exceeded your budget. Come back to the Hollow Tomorrow.
          </h4>
          {/* <h4>
            Your Average # of Misses per game is {localStats.av} and your
            winning percentage is {localStats.pct}%
          </h4> */}
        </div>
        <div>
          <h3>Your Guesses In Order:</h3>
        </div>
        <div className='letterlist'>
          {finalChosenLetters.map((letter, index) => {
            return (
              <div key={index} className='btnscenter'>
                <button className='btnUsed'>
                  <h2>{letter}</h2>
                  {/* <Letter key={index} {...letter}></Letter> */}
                </button>
              </div>
            )
          })}
        </div>
        <div className='btnscenter'>
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