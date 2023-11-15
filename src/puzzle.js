import { generate, count } from 'random-words'

const w = 'IVORY'
const word = Array.from(w)
let p = {
  id: 1,
  name: 'I',
  isHidden: true,
}
let puz = []
for (let i = 0; i < word.length; i++) {
  p = {}
  p['id'] = i + 1
  p['name'] = word[i]
  p['isHidden'] = true
  puz.push(p)
}
console.log(puz)
let letterLength = word.length * 12

let text = letterLength.toString()
text = text + 'vw'
console.log(text)
// Get the root element
const root = document.documentElement

// Update the CSS variable value
root.style.setProperty('--letter-size', text)

export default puz

// export default [
//   {
//     id: 1,
//     name: 'I',
//     isHidden: true,
//   },
//   {
//     id: 2,
//     name: 'L',
//     isHidden: true,
//   },
//   {
//     id: 3,
//     name: 'K',
//     isHidden: true,
//   },
//   {
//     id: 4,
//     name: 'L',
//     isHidden: true,
//   },
//   {
//     id: 5,
//     name: 'I',
//     isHidden: true,
//   },
//   {
//     id: 6,
//     name: 'N',
//     isHidden: true,
//   },
//   {
//     id: 7,
//     name: 'G',
//     isHidden: true,
//   },
// ]
