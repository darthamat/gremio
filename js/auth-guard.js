import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Escuchar si el usuario está autenticado o no
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Si no hay usuario activo, redirigir al Login
        console.warn("Acceso denegado: debes iniciar sesión.");
        window.location.href = "index.html"; // Cambia "index.html" por tu página de login
    } else {
        console.log("Acceso permitido. Aventurero autenticado:", user.email);
    }
});