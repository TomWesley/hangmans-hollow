import React from 'react'
import AnswerLetter from './AnswerLetter'
import { useState, useEffect } from 'react'
import puzzle from './puzzle'
import { encryptObject, decryptObject } from './encryption'

const getLocalStoragePuzzleLetters = () => {
  const encryptedPuzzleLetters = localStorage.getItem('puzzleLetters')
  
  if (encryptedPuzzleLetters) {
    // Decrypt the puzzle letters from localStorage
    const decrypted = decryptObject(encryptedPuzzleLetters)
    return decrypted || puzzle
  } else {
    return puzzle
  }
}

const AnswerLetters = (props) => {
  const u = props.u
  // Changed: Use gameStateClass instead of just checking for victory
  const gameStateClass = props.s === 'victory' ? 'victory' : (props.s === 'defeat' ? 'defeat' : '')
  
  // Use the puzzle letters from localStorage (decrypted) or the imported puzzle
  const [puzzleLetters, setPuzzleLetters] = useState(getLocalStoragePuzzleLetters)

  // Save encrypted puzzle letters to localStorage when they change
  useEffect(() => {
    const encrypted = encryptObject(puzzleLetters)
    localStorage.setItem('puzzleLetters', encrypted)
  }, [puzzleLetters])

  // Calculate the number of letters to determine responsive layout
  const letterCount = puzzleLetters.length
  
  // Changed: Use gameStateClass for the puzzle class
  const puzzleClass = `puzzle puzzle-${letterCount} ${gameStateClass}`

  return (
    <div className="answer-letters-container">
      <div className={puzzleClass}>
        {puzzleLetters.map((answerLetter, index) => {
          // Update isHidden based on used letters
          const letterIsUsed = u.indexOf(answerLetter.name) > -1
          
          // Return the letter component
          return (
            <div key={answerLetter.id} className="answer-letter-wrapper">
              <AnswerLetter
                st={props.s}
                key={answerLetter.id}
                id={answerLetter.id}
                name={answerLetter.name}
                isHidden={!letterIsUsed}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AnswerLetters