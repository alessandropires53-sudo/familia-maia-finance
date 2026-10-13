import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCEmhn3VG6QkBI13sJXkaf2UrmEiI2e6sY",
  authDomain: "familia-maia-finance.firebaseapp.com",
  projectId: "sfamilia-maia-finance.firebaseapp.comeu-projeto-id",
  storageBucket: "seufamilia-maia-finance.firebaseapp.com-projeto.appspot.com",
  messagingSenderId: "1770515053249",
  appId: "1:770515053249:web:2e27464fd188ad37d74240"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);