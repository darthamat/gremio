import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";
//import { auth } from "./firebase-config.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {
        // DETENER la recarga de página y el envío estándar del HTML
        event.preventDefault();
        event.stopPropagation();

        const email = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const submitBtn = document.getElementById("submit-btn");

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "✨ Abriendo el portal...";

            // 1. Iniciar sesión en Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Aventurero autenticado:", userCredential.user);

            // 2. Redirigir a gremio.html al autenticarse correctamente
            window.location.href = "gremio.html";

        } catch (error) {
            console.error("Error en el inicio de sesión:", error.code, error.message);

            let mensajeError = "No se pudo cruzar el portal. Revisa tus datos.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                mensajeError = "Correo o Palabra Mágica incorrectos.";
            } else if (error.code === 'auth/invalid-email') {
                mensajeError = "El correo escrito no tiene un formato válido.";
            }

            alert(mensajeError);

            // Reestablecer el botón en caso de error
            submitBtn.disabled = false;
            submitBtn.innerHTML = "✨ Entrar al gremio";
        }
    });
});