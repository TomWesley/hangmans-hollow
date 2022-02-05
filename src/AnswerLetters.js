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

const AnswerLetters = (props) => {
  const u = props.u
  var fa = false
  if (props.s === 'victory') {
    fa = true
  }
  const [puzzleLetters, setPuzzleLetters] = useState(getLocalStorageLetters())
  //const result = jsonObject.filter((puzzle) => puzzle.name == 'David')
  if (puzzleLetters[0].name != 'K') {
    localStorage.clear()
    window.location.reload(true)
  }

  useEffect(() => {
    localStorage.setItem('puzzleLetters', JSON.stringify(puzzleLetters))
  })

  const hideLetter = (index) => {
    // setLetters({ ...letters, onHover: 'true' })
    const newArray = puzzleLetters
    newArray[index].isHidden = false
    setPuzzleLetters(newArray)
  }
  return (
    <section>
      <div className={`puzzle ${fa ? 'victory' : ''}`}>
        {puzzleLetters.map((answerLetter, index) => {
          if (u.indexOf(answerLetter.name) > -1) {
            // hideLetter(answerLetter.id)
            answerLetter.isHidden = false
          } else {
            //answerLetter.isHidden = true
          }

          if (props.s === 'solving') {
            return (
              <div key={answerLetter.id}>
                <AnswerLetter
                  st={props.s}
                  key={answerLetter.id}
                  {...answerLetter}
                />
              </div>
            )
          } else {
            return (
              <div key={answerLetter.id}>
                <AnswerLetter
                  st={props.s}
                  key={answerLetter.id}
                  {...answerLetter}
                />
              </div>
            )
          }
        })}
      </div>
    </section>
  )
}

export default AnswerLetters
