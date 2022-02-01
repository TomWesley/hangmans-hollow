import React from 'react'

import p5 from 'p5'
import { render } from '@testing-library/react'
import Letters from './Letters'
import data from './data'
import { useState } from 'react'
import AnswerLetters from './AnswerLetters'
//import UseStateBasics from './tutorial/1-useState/setup/2-useState-basics'

function App() {
  // useState

  //const letters = data
  return (
    <main>
      <div>
        <h1>Hangman's Hollow</h1>
      </div>
      <div>
        <section>
          <Letters />
        </section>
        {/* {data.map((temp) => {
        return <h2 key={temp.id}>{String(temp.isHovered)}</h2>
      })} */}
        {/* <Setup /> */}
        {/* <Final /> */}
      </div>
    </main>
  )
}

export default App
