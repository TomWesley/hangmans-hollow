import React from 'react'
import Letters from './Letters'
import { useState } from 'react'
import AnswerLetters from './AnswerLetters'
// import { initializeApp } from 'firebase/app'

// const firebaseConfig = {
//   apiKey: 'AIzaSyC7KRHKPJUlp997AFgUN1FwwbWxOZf1mII',
//   authDomain: 'singularity-c216f.firebaseapp.com',
//   databaseURL: 'https://singularity-c216f.firebaseio.com',
//   projectId: 'singularity-c216f',
//   storageBucket: 'singularity-c216f.appspot.com',
//   messagingSenderId: '877374644269',
//   appId: '1:877374644269:web:7e8a5f141d2572661b98a4',
//   measurementId: 'G-J997WH1WTT',
// }
// const app = initializeApp(firebaseConfig)

let p = localStorage.getItem('puzzleLetters')
if (p) {
  if (JSON.parse(p)[0].name != 'V') {
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
