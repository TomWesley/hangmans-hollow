import React from 'react'
import Letters from './Letters'
import { useState, useEffect } from 'react'
import AnswerLetters from './AnswerLetters'
import {
  GiAbstract009,
  GiThreePointedShuriken,
  GiAbstract027,
} from 'react-icons/gi'
import firebase from './firebase'
import {
  query,
  orderBy,
  limit,
  getFirestore,
  startAt,
  collection,
  getDocs,
} from 'firebase/firestore'
// import { initializeApp } from 'firebase/app'

// const app = initializeApp(firebaseConfig)

let p = localStorage.getItem('puzzleLetters')
const db = getFirestore(firebase)
if (p) {
  if (JSON.parse(p)[0].name != 'B') {
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
  if (userName === 'temp') {
    localStorage.removeItem('userName')
    window.location.reload(true)
  }
  if (userName) {
    return JSON.parse(localStorage.getItem('userName'))
  } else {
    return ''
  }
}

function App() {
  let userN = ''
  const [leaderBoard, setLeaderboard] = useState([])
  const [userName, setUserName] = useState(getLocalStorageUsername())
  const [leaderboardStatus, setLeaderboardStatus] = useState(0)
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

  async function seeLeaderboard() {
    if (leaderboardStatus === 0) {
      setLeaderboardStatus(1)
    } else {
      setLeaderboardStatus(0)
    }
    const q = query(
      collection(db, 'users'),
      orderBy('winningPercentage', 'desc'),
      orderBy('averageScore'),
      limit(10)
    )
    const documentSnapshots = await getDocs(q)
    setLeaderboard([])
    var counter = 0
    var tempArray = []
    documentSnapshots.forEach((doc) => {
      var temp = doc.data()
      temp.id = counter
      //var tempArray = leaderBoard
      tempArray.push(temp)

      //setLeaderboard({ ...leaderBoard[counter], id: counter })
      counter = counter + 1
    })
    setLeaderboard(tempArray)
    // console.log('temporary', leaderBoard)
  }
  if (userName) {
    if (leaderboardStatus === 0) {
      return (
        <main>
          <div className='menu'>
            <button
              className='menuButton'
              onClick={() => {
                seeLeaderboard()
              }}
            >
              <GiAbstract009 />
            </button>
            <h1>Hangman's Hollow</h1>
          </div>
          <div>
            <section>
              <Letters />
            </section>
          </div>
        </main>
      )
    } else if (leaderBoard.length > 0) {
      // console.log('HERE', leaderBoard.length)
      return (
        <section>
          <div className='menu'>
            <button
              className='menuButton'
              onClick={() => {
                seeLeaderboard()
              }}
            >
              <GiAbstract027 />
            </button>
            <h1>Global Leaderboard</h1>
          </div>
          <div></div>
          <div className='lBoard'>
            {leaderBoard.map((topTen, index) => {
              console.log(index)
              if (index === 0) {
                return (
                  <div>
                    <div
                      key={index}
                      className='leaderboard'
                      className='columnHeaders'
                    >
                      <span>Rank</span>
                      <span>Username</span>
                      <span>Avg. Missed</span>
                      <span>Winning Percentage</span>
                    </div>
                    <div key={index} className='leaderboard'>
                      <span>#{index + 1}</span>
                      <span style={{ fontsize: '.1vh' }}>
                        {leaderBoard[index].name}
                      </span>
                      <span>{leaderBoard[index].averageScore}</span>
                      <span>{leaderBoard[index].winningPercentage}%</span>
                    </div>
                  </div>
                )
              } else {
                return (
                  <div key={index} className='leaderboard'>
                    <span>#{index + 1}</span>
                    <span style={{ fontsize: '.1vh' }}>
                      {leaderBoard[index].name}
                    </span>
                    <span>{leaderBoard[index].averageScore}</span>
                    <span>{leaderBoard[index].winningPercentage}%</span>
                    {/* <h4>{leaderBoard[index].score}</h4> */}
                  </div>
                )
              }
            })}
          </div>
        </section>
      )
    } else {
      return <h1>Loading...</h1>
    }
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
            className='userName'
            type='text'
            defaultValue=''
            //value={userName}
            maxLength={10}
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
