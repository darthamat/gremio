import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
// 1. Importamos 'app' además de 'auth' desde tu archivo de configuración
import { auth, app } from "./firebase-config.js"; 
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {

    const db = getFirestore(app);
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
            const user = userCredential.user; // <-- ✅ Definimos la variable 'user'
            console.log("¡Bienvenido al gremio!", user);

            // 3. Consultar rol en Firestore usando la variable 'user'
            const userDocRef = doc(db, "aventureros", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const rol = userData.rol ? userData.rol.toLowerCase() : "";

                // 4. Redirigir según el rol
                if (rol === "admin" || rol === "archimago") {
                    window.location.href = "admin.html";
                } else {
                    window.location.href = "carga.html";
                }
            } else {
                // Si no existe el documento va al flujo habitual
                window.location.href = "carga.html";
            }

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
            // Restablecer el botón si ocurrió un error
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = "✨ Entrar al gremio";
            }
        }
    });
});