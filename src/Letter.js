import React, { useState } from 'react'
import { useEffect } from 'react'
import App from './App'

const Letter = ({ id, name, isUsed, isHovered, brand }) => {
  return (
    <article>
      {/* <button className='btn' onClick={App.changeData}> */}
      <h2>{name}</h2>
    </article>
  )
}

export default Letter
