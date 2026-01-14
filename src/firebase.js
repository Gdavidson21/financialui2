// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDaxKJDzMFVDUQS7O1MiLTjGEuoNkt7fyc",
  authDomain: "financialui2.firebaseapp.com",
  projectId: "financialui2",
  storageBucket: "financialui2.firebasestorage.app",
  messagingSenderId: "303405681422",
  appId: "1:303405681422:web:0fe73a5ca35d97921a655f",
  measurementId: "G-LY6JY43PDV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);