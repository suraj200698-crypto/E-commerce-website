import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBRm29mQkw6yl9jFi9xuWABS7u0lOestXk",
  authDomain: "ecoshop-10145.firebaseapp.com",
  projectId: "ecoshop-10145",
  storageBucket: "ecoshop-10145.firebasestorage.app",
  messagingSenderId: "1031621209805",
  appId: "1:1031621209805:web:546b7e9b7fb43c70d0c384",
  measurementId: "G-9FD4JXJSDP",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;