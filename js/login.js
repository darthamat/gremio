import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

// Inicializar Firebase Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evitar el recargo de página por defecto

        const email = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;
        const submitBtn = loginForm.querySelector("button[type='submit']");

        try {
            // Deshabilitar botón durante el proceso
            submitBtn.disabled = true;
            submitBtn.textContent = "✨ Verificando hechizo...";

            // Intentar inicio de sesión en Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("¡Bienvenido al gremio!", user);
            
            // Redirigir a la taberna / panel principal
            window.location.href = "carga.html";

        } catch (error) {
            console.error("Error al iniciar sesión:", error.code, error.message);
            
            // Gestión de errores en español
            let errorMessage = "No se pudo cruzar el portal. Revisa tus datos.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Nombre o Palabra Mágica incorrectos.";
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = "El formato del correo/aventurero no es válido.";
            }

            alert(errorMessage);

        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "✨ Entrar al gremio";
        }
    });
});