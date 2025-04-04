
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';


// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBf6zQ1FPc3xjo5bTDbJczNCGfxeC9NbM8",
  authDomain: "caress-2025.firebaseapp.com",
  projectId: "caress-2025",
  storageBucket: "caress-2025.firebasestorage.app",
  messagingSenderId: "611170789334",
  appId: "1:611170789334:web:a6a308c8762bfebfb62677",
  measurementId: "G-KBZ51MMHFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);

export { db };
