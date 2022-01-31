import React from 'react'
import Letter from './Letter'
import { useState, useEffect } from 'react'
import data from './data'
import AnswerLetters from './AnswerLetters'
import puz from './puzzle'

const preselected = {
  status: false,
  value: '',
  key: '',
}
var score = 0
var scoreInc = 0

const Letters = () => {
  const [letters, setLetters] = useState(data)
  const [usedLetters, setUsedLetters] = useState(['T', 'C', 'D'])
  // useEffect(() => {
  //   puz.map((puzLetter) => {
  //     if (usedLetters.usedLetters.indexOf(puzLetter.name) > -1) {
  //       puzLetter.isHidden = false
  //     }
  //   })
  // })
  const scoreChange = (i) => {
    scoreInc = 1
    puz.map((puzLetter) => {
      if (puzLetter.name == letters[i].name) {
        // if (usedLetters.usedLetters.indexOf(letters[i].name) > -1) {
        scoreInc = 0
      }
    })
    score = score + scoreInc
  }
  // useEffect(() => {
  //   ;<h2>HERE</h2>
  // })
  // const scoreChange = () => {
  //   return (
  //     <div>
  //       {puz.map((puzLetter, index) => {
  //         if (usedLetters.usedLetters.indexOf(answerLetter.name) > -1) {
  //           answerLetter.isHidden = false
  //         }
  //         return (
  //           <div key={answerLetter.id}>
  //             <AnswerLetter key={answerLetter.id} {...answerLetter} />
  //             {/* <h3>{u}</h3> */}
  //           </div>
  //         )
  //       })}
  //     </div>
  //   )
  // }
  const changeUsed = (index, newValue) => {
    scoreChange(index)

    const newArray = [...letters]
    setUsedLetters([...usedLetters, newArray[index].name])
    newArray[index].isUsed = true
    newArray[index].isHovered = false
    preselected.status = false
    preselected.value = ''
    preselected.key = ''
    setLetters(newArray)
  }
  const changeHover = (index, newValue) => {
    console.log(index, newValue)
    const newArray = [...letters]
    newArray[index].isHovered = newValue
    if (newValue == false) {
      if (preselected.status == true) {
        newArray[preselected.key].isHovered = false
        preselected.status = false
      }
    }
    if (newValue == true) {
      if (preselected.status == true) {
        newArray[preselected.key].isHovered = false
      }
      preselected.status = true
      preselected.value = newArray[index].name
      preselected.key = index
    }
    setLetters(newArray)
    // setMessage('hello world')
  }
  return (
    <section>
      <AnswerLetters u={usedLetters} />
      <div className='container'>
        <h3>Number Of Misses: {score}</h3>
      </div>
      <div>
        {preselected.status ? (
          <button
            className='confirm'
            onClick={() => {
              changeUsed(preselected.key, true)
            }}
          >
            Confirm Guess: {preselected.value}
          </button>
        ) : (
          <button className='confirm'>Select A Letter</button>
        )}
      </div>

      <div className='nav-links'>
        {letters.map((letter, index) => {
          if (letter.isHovered) {
            // const result = ExampleButton()
            return (
              <div key={letter.id}>
                {/* <button
                  className='btntwo'
                  onClick={() => {
                    changeHover(index, false)
                  }}
                > */}
                <button
                  className='btntwo'
                  onClick={() => {
                    changeHover(index, false)
                  }}
                >
                  <Letter key={letter.id} {...letter}></Letter>
                </button>
              </div>
            )
          } else {
            if (letter.isUsed == false) {
              return (
                <div key={letter.id}>
                  <button
                    className='btn'
                    onClick={() => {
                      changeHover(index, true)
                    }}
                  >
                    <Letter key={letter.id} {...letter}></Letter>
                  </button>
                </div>
              )
            } else {
              return (
                <div key={letter.id}>
                  <button className='btnUsed'>
                    <Letter key={letter.id} {...letter}></Letter>
                  </button>
                </div>
              )
            }
          }
        })}
      </div>
    </section>
  )
}

export default Letters
