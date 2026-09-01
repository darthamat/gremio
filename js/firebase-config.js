// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración de tu proyecto en Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCyQaF1cDBu_7mItUTqcp3I29bgxugRXqk",
  authDomain: "gremio-102c6.firebaseapp.com",
  projectId: "gremio-102c6",
  storageBucket: "gremio-102c6.firebasestorage.app",
  messagingSenderId: "831650836895",
  appId: "1:831650836895:web:9391d215aa0a0dc478cdaa"
};

// Inicialización de servicios
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);