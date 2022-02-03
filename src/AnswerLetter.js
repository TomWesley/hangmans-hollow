import React, { useState } from 'react'
import { useEffect } from 'react'

const AnswerLetter = ({ st, id, name, isHidden }) => {
  if (isHidden) {
    return (
      <article>
        {/* <button className='btn' onClick={App.changeData}> */}
        <h3 className='puzzleLetterHidden'>?</h3>
      </article>
    )
  } else {
    if (st == 'victory') {
      return (
        <div>
          {/* <button className='btn' onClick={App.changeData}> */}
          <h3 className='puzzleLetter'>{name}</h3>
        </div>
      )
    } else {
      return (
        <div>
          {/* <button className='btn' onClick={App.changeData}> */}
          <h3 className='puzzleLetter'>{name}</h3>
        </div>
      )
    }
  }
}

export default AnswerLetter
