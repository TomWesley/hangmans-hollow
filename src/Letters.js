import React from 'react'
import Letter from './Letter'
import { useState, useEffect } from 'react'
import data from './data'
import AnswerLetters from './AnswerLetters'
import puz from './puzzle'
import gamestate from './gamestate'

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

const Letters = () => {
  const [gameStateCurrent, setGameStateCurrent] = useState(
    getLocalStorageGameState()
  )
  const [letters, setLetters] = useState(getLocalStorageLetters())
  const [usedLetters, setUsedLetters] = useState(getLocalStorageUsedLetters())
  const [preselected, setPreselected] = useState(getLocalStoragePreselected())

  useEffect(() => {
    localStorage.setItem('letters', JSON.stringify(letters))
  }, [letters])
  useEffect(() => {
    localStorage.setItem('preselected', JSON.stringify(preselected))
    localStorage.setItem('usedLetters', JSON.stringify(usedLetters))
    localStorage.setItem('gameStateCurrent', JSON.stringify(gameStateCurrent))
    const puzLength = puz.length
    var victoryTracker = 0
    if (gameStateCurrent.status === 'solving') {
      if (gameStateCurrent.score === 0) {
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
        console.log(usedLetters)
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
      console.log(victoryTracker)
      if (victoryTracker === puz.length) {
        setGameStateCurrent({ ...gameStateCurrent, status: 'victory' })
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
    // if (gameStateCurrent.score === 0) {
    //   setGameStateCurrent({ ...gameStateCurrent, status: 'defeated' })
    //   setUsedLetters([
    //     'A',
    //     'B',
    //     'C',
    //     'D',
    //     'E',
    //     'F',
    //     'G',
    //     'H',
    //     'I',
    //     'J',
    //     'K',
    //     'L',
    //     'M',
    //     'N',
    //     'O',
    //     'P',
    //     'Q',
    //     'R',
    //     'S',
    //     'T',
    //     'U',
    //     'V',
    //     'W',
    //     'X',
    //     'Y',
    //     'Z',
    //   ])
    // }
    //score = score + scoreInc
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
    // const puzLength = puz.length
    // var victoryTracker = 0
    // {
    //   puz.map((l, index) => {
    //     if (usedLetters.indexOf(l.name) > -1) {
    //       victoryTracker = victoryTracker + 1
    //     } else {
    //       console.log(l.name, usedLetters)
    //     }
    //   })
    // }
    // console.log(victoryTracker)
    // if (victoryTracker === puz.length) {
    //   setGameStateCurrent({ ...gameStateCurrent, status: 'victory' })
    // }
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
    // setMessage('hello world')
  }
  if (gameStateCurrent.status == 'solving') {
    return (
      <section>
        <div>
          {/* <button className='btn' onClick={resetGame}>
            Debug Reset Game
          </button> */}
        </div>
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
                <div key={letter.id}>
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
        </div>

        <div className='letterlist'>
          {letters.map((letter, index) => {
            if (letter.isHovered) {
              // const result = ExampleButton()
              return (
                <div key={letter.id}>
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
              return (
                <div key={letter.id}>
                  <button className='btnUsed'>
                    <Letter key={letter.id} {...letter}></Letter>
                  </button>
                </div>
              )
            }
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

        <div className='letterlist'>
          {letters.map((letter, index) => {
            if (letter.isHovered) {
              // const result = ExampleButton()
              return (
                <div key={letter.id}>
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
              return (
                <div key={letter.id}>
                  <button className='btnUsed'>
                    <Letter key={letter.id} {...letter}></Letter>
                  </button>
                </div>
              )
            }
          })}
        </div>
      </section>
    )
  }
}

export default Letters
