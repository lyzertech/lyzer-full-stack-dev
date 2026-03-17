import firebase from "firebase/compat/app";

// Add the Firebase products that you want to use
import "firebase/compat/auth";
import "firebase/compat/firestore";

// Firebase configuration from environment variables
// Get these values from: https://console.firebase.google.com/
// Project Settings → General → Your apps → Firebase SDK snippet → Config
const firebaseConfig = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
	measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
};

// Validate that required Firebase config values are present
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
	console.error("❌ Firebase configuration is missing! Please set up your .env.local file with Firebase credentials.");
	console.error("See .env.local.example for required environment variables.");
}

// Initialize Firebase (only if not already initialized)
let firebaseApp;
if (!firebase.apps.length) {
	firebaseApp = firebase.initializeApp(firebaseConfig);
} else {
	firebaseApp = firebase.app();
}

const db = firebaseApp.firestore();
const auth = firebase.auth();

export { db, auth };
