import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", async (event) => {
        // 1. Detener el envío nativo del formulario
        event.preventDefault();
        event.stopPropagation();

        const emailInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");

        // Buscar el botón de envío dentro del formulario de manera segura
        const submitBtn = loginForm.querySelector("button[type='submit']") || document.getElementById("submit-btn");

        if (!emailInput || !passwordInput) {
            console.error("No se encontraron los campos de input id='username' o id='password'");
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {
            // Cambiar estado del botón si existe
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "✨ Abriendo el portal...";
            }

            // 2. Iniciar sesión con Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("¡Bienvenido al gremio!", userCredential.user);

            // 3. Redirigir a la página principal del gremio
            window.location.href = "carga.html";

        } catch (error) {
            console.error("Error en el inicio de sesión:", error.code, error.message);

            let mensajeError = "No se pudo cruzar el portal. Revisa tus credenciales.";
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                mensajeError = "Correo o Palabra Mágica incorrectos.";
            } else if (error.code === 'auth/invalid-email') {
                mensajeError = "El formato del correo no es válido.";
            }

            alert(mensajeError);

        } finally {
            // Restablecer el botón de forma segura si ocurrió un error
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "✨ Entrar al gremio";
            }
        }
    });
});