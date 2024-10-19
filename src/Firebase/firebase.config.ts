// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration 
// bdd cruz
const firebaseConfig = {
  apiKey: "AIzaSyApn_K9T0UyldjeQoiT9ZCpqULkz7pk0HM",
  authDomain: "sandra-shop-bdd.firebaseapp.com",
  projectId: "sandra-shop-bdd",
  storageBucket: "sandra-shop-bdd.appspot.com",
  messagingSenderId: "246018511545",
  appId: "1:246018511545:web:cacb5f7f2cf9cfe22d8168"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const   Auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Cloud Storage and get a reference to the service
const storage = getStorage(app);

export {
    Auth,
    db,
    storage
}