import React, { useState } from 'react'
import { useEffect } from 'react'

const AnswerLetter = ({ id, name, isHidden }) => {
  const space = ' '
  if (isHidden) {
    return (
      <article>
        {/* <button className='btn' onClick={App.changeData}> */}
        <h3 className='puzzleLetter'>?</h3>
      </article>
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

export default AnswerLetter
