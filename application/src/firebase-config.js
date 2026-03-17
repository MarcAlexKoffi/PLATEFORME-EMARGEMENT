import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// -------------------------------------------------------------
// CONFIGURATION FIREBASE
// Copiez ici l'objet "firebaseConfig" depuis votre console Firebase
// (Aller dans Project Settings > General > Your apps > Web app)
// -------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCy2oTqaeoU_rNLLmzvLEj1-ejpQjcsjko",
  authDomain: "gestion-emargement.firebaseapp.com",
  projectId: "gestion-emargement",
  storageBucket: "gestion-emargement.firebasestorage.app",
  messagingSenderId: "473706766434",
  appId: "1:473706766434:web:64d7ff75acbeb58ad1313b",
  measurementId: "G-RNY24SGYM8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export de la référence à la base de données
export const db = getFirestore(app);
export const auth = getAuth(app);