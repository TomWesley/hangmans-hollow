import React from 'react'
import AnswerLetter from './AnswerLetter'
import { useState, useEffect } from 'react'
import puzzle from './puzzle'

const AnswerLetters = (props) => {
  const u = props.u
  const fa = props.s === 'victory';
  
  // Use the imported puzzle directly instead of localStorage
  const [puzzleLetters, setPuzzleLetters] = useState(puzzle);

  // Calculate the number of letters to determine responsive layout
  const letterCount = puzzleLetters.length;
  
  // Create a dynamic class name based on the number of letters
  const puzzleClass = `puzzle puzzle-${letterCount} ${fa ? 'victory' : ''}`;

  return (
    <div className="answer-letters-container">
      <div className={puzzleClass}>
        {puzzleLetters.map((answerLetter, index) => {
          // Update isHidden based on used letters
          const letterIsUsed = u.indexOf(answerLetter.name) > -1;
          
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