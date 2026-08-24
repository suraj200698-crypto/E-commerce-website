// Firebase App
import { initializeApp } from "firebase/app";

// Firebase Authentication
import { getAuth } from "firebase/auth";

// Firebase Analytics
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBRm29mQkw6yl9jFi9xuWABS7u0lOestXk",
  authDomain: "ecoshop-10145.firebaseapp.com",
  projectId: "ecoshop-10145",
  storageBucket: "ecoshop-10145.firebasestorage.app",
  messagingSenderId: "1031621209805",
  appId: "1:1031621209805:web:546b7e9b7fb43c70d0c384",
  measurementId: "G-9FD4JXJSDP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);

// Firebase Analytics
export const analytics = getAnalytics(app);

export default app;
