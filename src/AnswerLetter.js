import React from 'react'

const AnswerLetter = ({ st, id, name, isHidden }) => {
  const letterClass = isHidden 
    ? 'puzzleLetterHidden' 
    : `puzzleLetter ${st === 'victory' ? 'victory-letter' : st === 'defeat' ? 'defeat-letter' : ''}`;


  return (
    <div className="answer-letter">
      <div className={letterClass}>
        {isHidden ? '?' : name}
      </div>
    </div>
  )
}

export default AnswerLetter