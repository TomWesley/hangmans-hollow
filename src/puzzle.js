import { generate } from 'random-words'

// Check if we already have a puzzle word in localStorage
const existingPuzzle = localStorage.getItem('puzzleWord');

// Generate a new word or use existing one
let w;
if (!existingPuzzle) {
  // First time play or reset - generate a new word
  w = generate({ minLength: 5, maxLength: 8 });
  w = w.toUpperCase();
  // Store the word in localStorage
  localStorage.setItem('puzzleWord', w);
} else {
  // Use the existing word
  w = existingPuzzle;
}

// Log the word for debugging (you can remove this in production)
console.log('Current puzzle word:', w);

// Convert the word to an array of characters
const word = Array.from(w);

// Create the puzzle object array
let puz = [];
for (let i = 0; i < word.length; i++) {
  puz.push({
    id: i + 1,
    name: word[i],
    isHidden: true
  });
}

// Helper function to clear puzzle on reset (used by ResetGame function)
export const resetPuzzleWord = () => {
  localStorage.removeItem('puzzleWord');
};

export default puz;