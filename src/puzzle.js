import { generate, count } from 'random-words'

const Cat = () => {
  const w = generate()
  const word = Array.from(w)
  let p = {
    id: 1,
    name: 'I',
    isHidden: true,
  }
  let object = []
  for (let i = 0; i < word.length; i++) {
    p['id'] = i
    p['name'] = word[i]
    p['isHidden'] = true
    object.append(p)
  }
  return object
}

export default Cat

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
