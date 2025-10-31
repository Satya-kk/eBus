// js/firebase-config.js
// Replace the firebaseConfig object with your project's credentials
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-app.js";
import {
  getAuth,
} from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";
import {
  getFirestore,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "SENDER_ID",
  appId: "APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, serverTimestamp };
