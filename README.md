# eBus
# Ebus Management Based Current Location System

## Overview
Realtime bus location tracking web app using Firebase (Auth + Firestore). Drivers push location; users search & track.

## Setup
1. Create Firebase project: enable Email/Password auth and Firestore.
2. Replace `js/firebase-config.js` firebaseConfig object with your project credentials.
3. Serve files:
   - Option A: Deploy to Firebase Hosting
   - Option B: Serve locally using `npx http-server` in project folder
4. Open `auth.html` to register/login.

## Collections used
- `users` — user profiles `{name, email, role}`
- `buses` — bus documents keyed by busNumber `{busNumber, from, to, location, status, lastSeen}`
- `logs` — activity logs

## Notes & Next steps
- For production: secure Firestore rules.
- For ETA improvements: store route polyline and compute path distance.
- Add map UI (Google Maps / Leaflet) to display markers visually.
