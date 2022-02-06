import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite'

const firebaseConfig = {
  apiKey: 'AIzaSyC7KRHKPJUlp997AFgUN1FwwbWxOZf1mII',
  authDomain: 'singularity-c216f.firebaseapp.com',
  databaseURL: 'https://singularity-c216f.firebaseio.com',
  projectId: 'singularity-c216f',
  storageBucket: 'singularity-c216f.appspot.com',
  messagingSenderId: '877374644269',
  appId: '1:877374644269:web:7e8a5f141d2572661b98a4',
  measurementId: 'G-J997WH1WTT',
}

const firebase = initializeApp(firebaseConfig)

export default firebase
