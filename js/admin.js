// js/admin.js
import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";
import {
  setDoc, doc, collection, getDocs
} from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";

document.getElementById("btn-create-driver").addEventListener("click", async () => {
  const name = document.getElementById("drv-name").value.trim();
  const email = document.getElementById("drv-email").value.trim();
  const pass = document.getElementById("drv-pass").value;
  if (!email || !pass) return alert("Email & password needed");

  try {
    // create auth user
    const newUser = await createUserWithEmailAndPassword(auth, email, pass);
    const uid = newUser.user.uid;
    // store profile with role driver
    await setDoc(doc(db, "users", uid), { name, email, role: "driver", createdAt: new Date().toISOString() });
    alert("Driver created: " + email);
  } catch (err) {
    console.error(err);
    alert("create driver error: " + err.message);
  }
});

async function loadBuses() {
  const ul = document.getElementById("buses-list");
  ul.innerHTML = "";
  const snap = await getDocs(collection(db, "buses"));
  snap.forEach(d => {
    const data = d.data();
    const li = document.createElement("li");
    li.textContent = `${data.busNumber} | ${data.from} -> ${data.to} | ${data.status || "N/A"} | Last: ${data.lastSeen?.toDate?.() || ""}`;
    ul.appendChild(li);
  });
}

document.getElementById("btn-logout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "auth.html";
});

// Load buses on start
loadBuses();
