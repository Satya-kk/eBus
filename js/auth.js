// js/auth.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";
import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";

// Sign up
document.getElementById("btn-signup").addEventListener("click", async () => {
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const role = document.getElementById("signup-role").value;

  if (!email || !password) return alert("Email & password required");

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;
    await setDoc(doc(db, "users", uid), { name, email, role, createdAt: new Date().toISOString() });
    alert("Signup successful");
    redirectByRole(role);
  } catch (err) {
    console.error(err);
    alert("Signup error: " + err.message);
  }
});

// Login
document.getElementById("btn-login").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const role = userDoc.data().role;
      redirectByRole(role);
    } else {
      // default to user
      window.location.href = "index.html";
    }
  } catch (err) {
    console.error(err);
    alert("Login error: " + err.message);
  }
});

function redirectByRole(role) {
  if (role === "admin") window.location.href = "admin.html";
  else if (role === "driver") window.location.href = "driver.html";
  else window.location.href = "index.html";
}
