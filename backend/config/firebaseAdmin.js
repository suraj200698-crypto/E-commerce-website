import { initializeApp, cert, getApps } from "firebase-admin/app";
import serviceAccount from "../firebase-service-account.json" with {
  type: "json",
};

// Firebase Admin app initialize
const firebaseApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
      });

console.log("Firebase Admin initialized successfully");

export default firebaseApp;