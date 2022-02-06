import React from 'react'
import Letters from './Letters'
import { useState } from 'react'
import AnswerLetters from './AnswerLetters'
// import { initializeApp } from 'firebase/app'

// const app = initializeApp(firebaseConfig)

let p = localStorage.getItem('puzzleLetters')
if (p) {
  if (JSON.parse(p)[0].name != 'P') {
    localStorage.removeItem('preselected')
    localStorage.removeItem('letters')
    localStorage.removeItem('gameStateCurrent')
    localStorage.removeItem('usedLetters')
    localStorage.removeItem('puzzleLetters')
    window.location.reload(true)
  }
}
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
