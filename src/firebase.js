import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEMhn3V6QkBI13sJXkaf2UrMeIi2e6sY",
  authDomain: "familia-maia-finance.firebaseapp.com",
  projectId: "familia-maia-finance",
  storageBucket: "familia-maia-finance.firebasestorage.app",
  messagingSenderId: "770515053249",
  appId: "1:770515053249:web:2e27464fd188ad37d74240"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);