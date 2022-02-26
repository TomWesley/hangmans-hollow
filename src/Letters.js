import React from 'react'
import Letter from './Letter'
import { useState, useEffect } from 'react'
import data from './data'
import AnswerLetters from './AnswerLetters'
import puz from './puzzle'
import gamestate from './gamestate'
import firebase from './firebase'
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
} from 'firebase/firestore/lite'

const db = getFirestore(firebase)
const versionTrigger = 1
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

async function getUsers(db) {
  const ref = collection(db, 'users')

  const userSnapshot = await getDocs(ref)
  userSnapshot.forEach((doc) => {
    console.log(doc.id, ' => ', doc.data())
  })
  await setDoc(doc(db, 'users', 'userinfo'), {
    name: 'Jackson',
    averagescore: 9,
  })

  return 5
}

const Letters = () => {
  const [gameStateCurrent, setGameStateCurrent] = useState(
    getLocalStorageGameState()
  )
  const [finalChosenLetters, setfinalChosenLetters] = useState(
    getLocalStorageFinalChosenLetters
  )
  const [letters, setLetters] = useState(getLocalStorageLetters())
  const [usedLetters, setUsedLetters] = useState(getLocalStorageUsedLetters())
  const [preselected, setPreselected] = useState(getLocalStoragePreselected())

  //Firebase Incoming
  async function writeToDatabase() {
    await updateDoc(doc(db, 'users', localStorage.getItem('userName')), {
      name: JSON.parse(localStorage.getItem('userName')),
      score: increment(gameStateCurrent.score),
      numberOfGames: increment(1),
    })
    const refer = collection(db, 'users')
    const q = query(refer, orderBy('score'), limit(1))
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, ' => ', doc.data())
    })
  }
  useEffect(() => {
    localStorage.setItem('letters', JSON.stringify(letters))
  }, [letters])
  useEffect(() => {
    // const numb = getUsers(db)
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
      if (gameStateCurrent.score === 0) {
        setfinalChosenLetters(usedLetters)
        setGameStateCurrent({ ...gameStateCurrent, status: 'defeat' })
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
        //   console.log(usedLetters)
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
        writeToDatabase()
      }
    }
  })
  const scoreChange = (i) => {
    scoreInc = -1
    puz.map((puzLetter) => {
      if (puzLetter.name === letters[i].name) {
        // if (usedLetters.usedLetters.indexOf(letters[i].name) > -1) {
        scoreInc = 0
      }
    })
    var s = gameStateCurrent.score + scoreInc
    setGameStateCurrent({ ...gameStateCurrent, score: s })
  }

  const resetGame = () => {
    localStorage.clear()
    letters.map((letters) => (letters.isUsed = false))
    setGameStateCurrent({ ...gameStateCurrent, score: 8 })
    setUsedLetters([])
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
        // preselected.status = false
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
        <div className='container'>
          <h4>Number Of Misses Remaining: {gameStateCurrent.score}</h4>
        </div>
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
        <div>
          <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        </div>
        <div className='container' className='victorywords'>
          <h4>
            Congratulations - You won with {gameStateCurrent.score} letters to
            spare
          </h4>
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
      </section>
    )
  } else {
    return (
      <section>
        <div className='defeat'>
          <AnswerLetters s={gameStateCurrent.status} u={usedLetters} />
        </div>
        <div className='container' className='defeatwords'>
          <h4>
            Sorry, You Missed Today's Puzzle. Come back to the Hollow Tomorrow.
          </h4>
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
      </section>
    )
  }
}

export default Letters
