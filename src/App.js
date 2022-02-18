import React from 'react'
import Letters from './Letters'
import { useState, useEffect } from 'react'
import AnswerLetters from './AnswerLetters'
// import { initializeApp } from 'firebase/app'

// const app = initializeApp(firebaseConfig)

let p = localStorage.getItem('puzzleLetters')
if (p) {
  if (JSON.parse(p)[0].name != 'W') {
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
    return 'temp'
  }
}

function App() {
  let userN = ''
  const [userName, setUserName] = useState(getLocalStorageUsername())
  //Set username if you don't have one in local storage.

  // <form>
  //     <label>Enter your name:
  //       <input type="text" />
  //     </label>
  //   </form>
  useEffect(() => {
    localStorage.setItem('userName', JSON.stringify(userName))
  })
  const handleSubmit = (event) => {
    event.preventDefault()
    // alert(`The name you entered was: ${userName}`)
    setUserName(userN)
  }
  if (userName) {
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
  } else {
    return (
      <form onSubmit={handleSubmit}>
        <label className='alias'>
          Enter An Alias
          <hr
            style={{
              color: 0,
              height: 5,
            }}
          />
          <input
            type='text'
            defaultValue=''
            //value={userName}
            onChange={(e) => {
              userN = e.target.value
            }}
          />
        </label>
        <button className='enter' type='submit'>
          Enter
        </button>
      </form>
    )
  }
}

export default App
