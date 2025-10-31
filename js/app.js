// js/app.js
import { db } from "./firebase-config.js";
import {
  collection, query, where, getDocs, doc, onSnapshot
} from "https://www.gstatic.com/firebasejs/9.24.0/firebase-firestore.js";

let unsubscribe = null;

document.getElementById("btn-search").addEventListener("click", async () => {
  const from = document.getElementById("search-from").value.trim().toLowerCase();
  const to = document.getElementById("search-to").value.trim().toLowerCase();
  const resultsList = document.getElementById("results-list");
  resultsList.innerHTML = "";

  const q = query(collection(db, "buses"));
  const snap = await getDocs(q);
  let found = 0;
  snap.forEach(d => {
    const data = d.data();
    if (
      (!from || (data.from && data.from.toLowerCase().includes(from))) &&
      (!to || (data.to && data.to.toLowerCase().includes(to)))
    ) {
      found++;
      const li = document.createElement("li");
      li.innerHTML = `<strong>${data.busNumber}</strong> ${data.from} → ${data.to} | ${data.type || ''} 
        <button data-id="${d.id}" class="btn-track">Track</button>`;
      resultsList.appendChild(li);
    }
  });

  if (!found) resultsList.innerHTML = "<li>No buses matched.</li>";

  document.querySelectorAll(".btn-track").forEach(btn => {
    btn.addEventListener("click", () => startTracking(btn.dataset.id));
  });
});

function startTracking(busId) {
  // unsubscribe previous
  if (unsubscribe) unsubscribe();
  document.getElementById("track-card").style.display = "block";
  document.getElementById("track-title").innerText = busId;

  const busDoc = doc(db, "buses", busId);
  unsubscribe = onSnapshot(busDoc, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    if (data.location) {
      const lat = data.location.lat;
      const lng = data.location.lng;
      document.getElementById("track-loc").innerText = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      // compute ETA
      // For demo: assume user wants bus at 'to' location center — we don't have user location, so let user allow geolocation or compute ETA to destination point from current bus pos.
      // We'll estimate ETA to the bus's 'to' coordinate if stored, otherwise show N/A.
      estimateETAToDestination(data).then(etaText => {
        document.getElementById("track-eta").innerText = etaText;
      });
    } else {
      document.getElementById("track-loc").innerText = "No location yet";
      document.getElementById("track-eta").innerText = "-";
    }
  });
}

document.getElementById("btn-stop-track").addEventListener("click", () => {
  if (unsubscribe) unsubscribe();
  document.getElementById("track-card").style.display = "none";
  document.getElementById("track-loc").innerText = "-";
  document.getElementById("track-eta").innerText = "-";
});

async function estimateETAToDestination(busData) {
  // Simple heuristic: if busData.toCoords exist, use that; otherwise not available
  if (!busData.location) return "No location";
  // If the driver posted destination coords (not in our model), we could compute; for now we estimate ETA using fixed average speed to a placeholder distance
  // For demo, we'll assume average speed 30 km/h and estimate to destination distance using busData.toCoordinates if available
  if (busData.toCoords && busData.toCoords.lat && busData.toCoords.lng) {
    const dKm = haversine(busData.location.lat, busData.location.lng, busData.toCoords.lat, busData.toCoords.lng);
    const hours = dKm / 30; // 30 km/h average
    const mins = Math.round(hours * 60);
    return `${mins} min (${dKm.toFixed(2)} km)`;
  } else {
    // If we don't have coordinates, return "-" or a simple estimation using lastKnownSpeed if available
    if (busData.lastKnownSpeed) {
      // dummy ETA to end is impossible without route distance
      return "Approx ETA: unknown (no dest coords)";
    } else {
      return "Destination coordinates not available";
    }
  }
}

function haversine(lat1, lon1, lat2, lon2) {
  function toRad(x) { return x * Math.PI / 180; }
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
