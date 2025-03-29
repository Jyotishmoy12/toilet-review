// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc,getDocs , deleteDoc,doc, updateDoc, getDoc, query, serverTimestamp, where, orderBy} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB2_ixSACl_cz4Z_DoM7YA237FYdpZimX8",
  authDomain: "toilet-review-f8f2e.firebaseapp.com",
  projectId: "toilet-review-f8f2e",
  storageBucket: "toilet-review-f8f2e.firebasestorage.app",
  messagingSenderId: "733667086837",
  appId: "1:733667086837:web:8f294dd90e4fc37fbbd0bc",
  measurementId: "G-LM6ZN77T3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
export { db, auth, storage, addDoc, collection,getDocs, deleteDoc,doc,updateDoc, getDoc,query, serverTimestamp, where, orderBy, getAuth, onAuthStateChanged};