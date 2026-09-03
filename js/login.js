import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Previene la recarga de página por defecto

        const email = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const submitBtn = loginForm.querySelector("button[type='submit']");

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "✨ Abriendo el portal...";

            // Intentar inicio de sesión en Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Acceso concedido:", userCredential.user);

            // Redirigir a la taberna / sección privada del gremio
            window.location.href = "taberna.html";

        } catch (error) {
            console.error("Error de autenticación:", error.code, error.message);
            
            let mensajeError = "No se pudo cruzar el portal. Revisa tus credenciales.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                mensajeError = "Correo o Palabra Mágica incorrectos.";
            } else if (error.code === 'auth/invalid-email') {
                mensajeError = "El formato del correo electrónico no es válido.";
            }

            alert(mensajeError);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "✨ Entrar al gremio";
        }
    });
});