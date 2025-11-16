import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzmedhs3cySTZiYSb6DKcz9--vyjOxpF8",
  authDomain: "vocab-cards-4745c.firebaseapp.com",
  databaseURL: "https://vocab-cards-4745c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vocab-cards-4745c",
  storageBucket: "vocab-cards-4745c.firebasestorage.app",
  messagingSenderId: "97663724156",
  appId: "1:97663724156:web:7b54c990b67ff28ca0b7f9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
