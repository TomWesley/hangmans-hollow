import React from 'react'
import AnswerLetter from './AnswerLetter'
import { useState, useEffect } from 'react'
import puzzle from './puzzle'
import Letter from './Letter'

var victoryFlagger = false

const getLocalStorageLetters = () => {
  let puzzleLetters = localStorage.getItem('puzzleLetters')
  if (puzzleLetters) {
    return JSON.parse(localStorage.getItem('puzzleLetters'))
  } else {
    return puzzle
  }
}

const AnswerLetters = (u) => {
  const [puzzleLetters, setPuzzleLetters] = useState(getLocalStorageLetters())
  //const result = jsonObject.filter((puzzle) => puzzle.name == 'David')

  useEffect(() => {
    victoryFlagger = true
    localStorage.setItem('puzzleLetters', JSON.stringify(puzzleLetters))
  })

  const changeHover = (index, newValue) => {
    // setLetters({ ...letters, onHover: 'true' })
    console.log(index, newValue)
    const newArray = [...puzzleLetters]
    newArray[index].isHovered = newValue
    setPuzzleLetters(newArray)
    // setMessage('hello world')
  }
  return (
    <section>
      <div className='puzzle'>
        {puzzleLetters.map((answerLetter, index) => {
          if (u.u.indexOf(answerLetter.name) > -1) {
            answerLetter.isHidden = false
          } else {
            victoryFlagger = false
          }
          if (victoryFlagger === false) {
            return (
              <div key={answerLetter.id}>
                <AnswerLetter key={answerLetter.id} {...answerLetter} />
                {/* <h3>{u}</h3> */}
              </div>
            )
          } else {
            return (
              <div key={answerLetter.id}>
                <AnswerLetter key={answerLetter.id} {...answerLetter} />
                {/* <h3>{u}</h3> */}
                <h3>VICTORY</h3>
              </div>
            )
          }
        })}
      </div>
    </section>
  )
}

export default AnswerLetters
