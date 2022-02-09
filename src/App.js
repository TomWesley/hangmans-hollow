import React from 'react'
import Letters from './Letters'
import { useState } from 'react'
import AnswerLetters from './AnswerLetters'
// import { initializeApp } from 'firebase/app'

// const app = initializeApp(firebaseConfig)

let p = localStorage.getItem('puzzleLetters')
if (p) {
  if (JSON.parse(p)[0].name != 'D') {
    localStorage.removeItem('preselected')
    localStorage.removeItem('letters')
    localStorage.removeItem('gameStateCurrent')
    localStorage.removeItem('usedLetters')
    localStorage.removeItem('puzzleLetters')
    window.location.reload(true)
  }
}

const getLocalStorageUsername = () => {
  let userName = localStorage.getItem('userName')
  if (userName) {
    return JSON.parse(localStorage.getItem('userName'))
  } else {
    return ''
  }
}

function App() {
  const [userName, setUserName] = useState(getLocalStorageUsername())
  //Set username if you don't have one in local storage.
  return (
    <main>
      <div>
        <h1>Hangman's Hollow</h1>
      </div>
      <div>
        <section>
          <Letters />
        </section>
      </div>
    </main>
  )
}

export default App
