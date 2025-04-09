
// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore';


//  Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtv4TYIOXxjh0t7ZjRf1fkyrvg5VOP_XA",
  authDomain: "caress-449615.firebaseapp.com",
  projectId: "caress-449615",
  storageBucket: "caress-449615.firebasestorage.app",
  messagingSenderId: "563323757566",
  appId: "1:563323757566:web:098ecf4c41cfadcfe296af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
const db = getFirestore(app);

export { db };
