import React from 'react'
import Letter from './Letter'
import { useState, useEffect } from 'react'
import data from './data'
import AnswerLetters from './AnswerLetters'
import puz from './puzzle'
import gameState from './gameState'
//Possibly do a gamestate to hang on to the scores, phase of the game, etc.

const getLocalStorageGameState = () => {
  let gameStateCurrent = localStorage.getItem('gameStateCurrent')
  if (gameStateCurrent) {
    return JSON.parse(localStorage.getItem('gameStateCurrent'))
  } else {
    return gameState
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
// const preselected = {
//   status: false,
//   value: '',
//   key: '',
// }
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

// var score = 0
var scoreInc = 0

const Letters = () => {
  const [gameStateCurrent, setGameStateCurrent] = useState(
    getLocalStorageGameState()
  )
  const [letters, setLetters] = useState(getLocalStorageLetters())
  const [usedLetters, setUsedLetters] = useState([])
  const [preselected, setPreselected] = useState(getLocalStoragePreselected())

  useEffect(() => {
    localStorage.setItem('letters', JSON.stringify(letters))
  }, [letters])
  useEffect(() => {
    localStorage.setItem('preselected', JSON.stringify(preselected))
    localStorage.setItem('gameStateCurrent', JSON.stringify(gameStateCurrent))
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
    if (gameStateCurrent.score === 0) {
      setGameStateCurrent({ ...gameStateCurrent, status: 'defeated' })
      // setUsedLetters([
      //   'A',
      //   'B',
      //   'C',
      //   'D',
      //   'E',
      //   'F',
      //   'G',
      //   'H',
      //   'I',
      //   'J',
      //   'K',
      //   'L',
      //   'M',
      //   'N',
      //   'O',
      //   'P',
      //   'Q',
      //   'R',
      //   'S',
      //   'T',
      //   'U',
      //   'V',
      //   'W',
      //   'X',
      //   'Y',
      //   'Z',
      // ])
    }
    //score = score + scoreInc
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
    console.log(index, newValue)
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
    // setMessage('hello world')
  }
  if (gameStateCurrent.score > 0) {
    return (
      <section>
        <AnswerLetters u={usedLetters} />
        <div className='container'>
          <h3>Number Of Misses: {gameStateCurrent.score}</h3>
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
            <button className='confirm'>Select A Letter</button>
          )}
        </div>
        <div className='nav-links'>
          {letters.map((letter, index) => {
            if (letter.isHovered) {
              // const result = ExampleButton()
              return (
                <div key={letter.id}>
                  {/* <button
                  className='btntwo'
                  onClick={() => {
                    changeHover(index, false)
                  }}
                > */}
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
                  <div key={letter.id}>
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
                  <div key={letter.id}>
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
  } else {
    return (
      <section>
        <AnswerLetters u={usedLetters} />
        <div className='container'>
          <h3>Game Over</h3>
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
            <button className='confirm'>Select A Letter</button>
          )}
        </div>
        <div className='nav-links'>
          {letters.map((letter, index) => {
            if (letter.isHovered) {
              // const result = ExampleButton()
              return (
                <div key={letter.id}>
                  {/* <button
                  className='btntwo'
                  onClick={() => {
                    changeHover(index, false)
                  }}
                > */}
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
                  <div key={letter.id}>
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
                  <div key={letter.id}>
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
  }
}

export default Letters
