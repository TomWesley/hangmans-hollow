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
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore'

let p = localStorage.getItem('puzzleLetters')
const db = getFirestore(firebase)

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
  const [playMode, setPlayMode] = useState('') // 'casual' or 'competitive'
  
  // New state for username verification
  const [verificationState, setVerificationState] = useState('initial') // 'initial', 'needsEmail', 'needsCode'
  const [userEmail, setUserEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [pendingUsername, setPendingUsername] = useState('')

  useEffect(() => {
    localStorage.setItem('userName', JSON.stringify(userName))
  })
  
  // Updated handleSubmit function
  const handleSubmit = async (event) => {
    event.preventDefault()
    
    // Check if username exists
    const docRef = doc(db, 'users', userN)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      // Username exists, need to verify
      setPendingUsername(userN)
      setVerificationState('needsEmail')
    } else {
      // New username, ask for email
      setPendingUsername(userN)
      setVerificationState('needsEmail')
    }
  }
  
  // Handle email submission
  const handleEmailSubmit = async (event) => {
    event.preventDefault()
    
    const docRef = doc(db, 'users', pendingUsername)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      // Check if this email is associated with the username
      if (docSnap.data().email === userEmail) {
        // Generate verification code
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
        
        // Send verification email
        sendVerificationEmail(userEmail, generatedCode, pendingUsername)
        
        // Store the code temporarily (in production, store this securely on the server)
        localStorage.setItem('tempVerificationCode', generatedCode)
        
        // Move to code verification step
        setVerificationState('needsCode')
      } else {
        alert("This email is not associated with this username. Please try a different username or email.")
      }
    } else {
      // New user, create account with this email
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Send verification email
      sendVerificationEmail(userEmail, generatedCode, pendingUsername)
      
      // Store the code temporarily
      localStorage.setItem('tempVerificationCode', generatedCode)
      
      // Move to code verification step
      setVerificationState('needsCode')
    }
  }
  
  // Send verification email function
  const sendVerificationEmail = async (email, code, username) => {
    try {
      // Use EmailJS or a similar service to send emails from the client-side
      // This is a simple example using fetch to call a hypothetical email API
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
          template_id: 'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
          user_id: 'YOUR_USER_ID', // Replace with your EmailJS user ID
          template_params: {
            to_email: email,
            verification_code: code,
            username: username,
            game_name: "Hangman's Hollow"
          }
        }),
      });
      
      if (response.ok) {
        console.log('Verification email sent successfully');
      } else {
        console.error('Failed to send verification email');
        // Fallback for testing - log the code to console
        console.log(`Verification code for ${username}: ${code}`);
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      // Fallback for testing - log the code to console
      console.log(`Verification code for ${username}: ${code}`);
    }
  }
  
  // Handle verification code submission
  const handleCodeSubmit = async (event) => {
    event.preventDefault()
    
    // Get the stored code (in production, validate against server)
    const storedCode = localStorage.getItem('tempVerificationCode')
    
    if (verificationCode === storedCode) {
      // Code is correct
      const docRef = doc(db, 'users', pendingUsername)
      const docSnap = await getDoc(docRef)
      
      if (!docSnap.exists()) {
        // Create new user with email
        await setDoc(doc(db, 'users', pendingUsername), {
          name: pendingUsername,
          email: userEmail,
          score: 0,
          numberOfGames: 0,
          averageScore: 0,
          victories: 0,
          winningPercentage: 0
        })
      }
      
      // Set the username and reset verification state
      setUserName(pendingUsername)
      setVerificationState('initial')
      localStorage.removeItem('tempVerificationCode')
    } else {
      alert("Incorrect verification code. Please try again.")
    }
  }

  // Handle play mode selection
  const handlePlayModeSelection = (mode) => {
    setPlayMode(mode);
    if (mode === 'casual') {
      // Set a temporary username for casual play
      setUserName('casual_player');
    }
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
      tempArray.push(temp)
      counter = counter + 1
    })
    setLeaderboard(tempArray)
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
              <Letters casualMode={userName === 'casual_player'} />
            </section>
          </div>
        </main>
      )
    } else if (leaderBoard.length > 0) {
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
              if (index === 0) {
                return (
                  <div key={`header-${index}`}>
                    <div className='columnHeaders'>
                      <span>Rank</span>
                      <span>Username</span>
                      <span>Avg. Missed</span>
                      <span>Winning Percentage</span>
                    </div>
                    <div className='leaderboard'>
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
    // Mode selection screen
    if (playMode === '') {
      return (
        <div className="play-mode-container">
          <h1 className="game-title">Hangman's Hollow</h1>
          <div className="play-options">
            <button 
              className="play-option-btn competitive" 
              onClick={() => handlePlayModeSelection('competitive')}
            >
              Play Competitively
            </button>
            <button 
              className="play-option-btn casual" 
              onClick={() => handlePlayModeSelection('casual')}
            >
              Play Casually
            </button>
          </div>
        </div>
      )
    }
    // Competitive mode flow
    else if (playMode === 'competitive') {
      if (verificationState === 'initial') {
        return (
          <form onSubmit={handleSubmit}>
            <label className='alias'>
              Enter An Alias
              <input
                className='userName'
                type='text'
                defaultValue=''
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
      } else if (verificationState === 'needsEmail') {
        return (
          <form onSubmit={handleEmailSubmit}>
            <label className='alias'>
              Enter Your Email
              <input
                className='userName'
                type='email'
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
            </label>
            <button className='enter' type='submit'>
              Verify
            </button>
          </form>
        )
      } else if (verificationState === 'needsCode') {
        return (
          <form onSubmit={handleCodeSubmit}>
            <label className='alias'>
              Enter Verification Code
              <div className="verification-message">
                A verification code has been sent to {userEmail}
              </div>
              <input
                className='userName'
                type='text'
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
            </label>
            <button className='enter' type='submit'>
              Submit
            </button>
          </form>
        )
      }
    }
    // Casual mode flow was already handled with handlePlayModeSelection
  }
}

export default App