// js/driver.js
import { auth, db, serverTimestamp } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.24.0/firebase-auth.js";
import {
  setDoc, doc, updateDoc, getDoc, collection, addDoc
} from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";

let watchId = null;
let currentBusId = null;

document.getElementById("btn-post").addEventListener("click", async () => {
  const busNumber = document.getElementById("bus-number").value.trim();
  const from = document.getElementById("route-from").value.trim();
  const to = document.getElementById("route-to").value.trim();
  const type = document.getElementById("bus-type").value.trim();
  const contact = document.getElementById("contact").value.trim();
  if (!busNumber) return alert("Bus number required");

  try {
    const busDocRef = doc(db, "buses", busNumber);
    await setDoc(busDocRef, {
      busNumber, from, to, type, contact, createdAt: serverTimestamp(), status: "posted"
    });
    currentBusId = busNumber;
    logAction({ action: "post_bus", busNumber, from, to });
    alert("Bus posted. Now you can start sharing location.");
  } catch (e) {
    console.error(e);
    alert("Error posting bus: " + e.message);
  }
});

document.getElementById("btn-start").addEventListener("click", () => {
  if (!currentBusId) return alert("Post the bus first (bus number).");
  if (!("geolocation" in navigator)) return alert("Geolocation not available.");
  watchId = navigator.geolocation.watchPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;
    document.getElementById("loc-display").innerText = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    // Update Firestore
    const bRef = doc(db, "buses", currentBusId);
    try {
      await updateDoc(bRef, {
        location: { lat, lng },
        lastSeen: serverTimestamp(),
        status: "running"
      });
      await logAction({ action: "location_update", busNumber: currentBusId, lat, lng });
    } catch (err) {
      console.error("update location err", err);
    }
  }, (err) => {
    console.error("geo err", err);
  }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 });
});

document.getElementById("btn-stop").addEventListener("click", async () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }
  if (currentBusId) {
    await updateDoc(doc(db, "buses", currentBusId), { status: "stopped", lastStopped: serverTimestamp() });
    await logAction({ action: "stop_sharing", busNumber: currentBusId });
  }
  document.getElementById("loc-display").innerText = "Stopped";
});

document.getElementById("btn-logout").addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "auth.html";
});

async function logAction(payload) {
  try {
    await addDoc(collection(db, "logs"), { ...payload, ts: serverTimestamp() });
  } catch (err) {
    console.error("log err", err);
  }
}
