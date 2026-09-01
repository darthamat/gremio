// Importaciones de Firebase SDK (versión modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { generarNombreAleatorio, obtenerClaseAleatoria } from './arquetipos.js';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCyQaF1cDBu_7mItUTqcp3I29bgxugRXqk",
  authDomain: "gremio-102c6.firebaseapp.com",
  projectId: "gremio-102c6",
  storageBucket: "gremio-102c6.firebasestorage.app",
  messagingSenderId: "831650836895",
  appId: "1:831650836895:web:9391d215aa0a0dc478cdaa"
};

// Inicialización de servicios
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Evento de envío del formulario
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".character-form");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Captura de campos del formulario
    const username = document.getElementById("reg-username").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value;
    const selectedClass = document.querySelector('input[name="class-choice"]:checked')?.value || "aventurero";

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = "📜 Inscribiendo en el Códice...";

    // Si eligió la tarjeta "aleatorio", tomamos la clase que le asignó la función; si no, la que marcó.
let claseFinal = selectedClass?.value;
if (claseFinal === "aleatorio") {
    claseFinal = selectedClass.dataset.claseAsignada || obtenerClaseAleatoria().id;
}

    try {
      // 1. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Crear la Ficha de Personaje en Firestore
      await setDoc(doc(db, "aventureros", user.uid), {
        uid: user.uid,
        nombre: username,
        email: email,
        clase: claseFinal,
        nivel: 1,
        xp: 0,
        paginasLeidas: 0,
        librosCompletados: 0,
        fechaUnicion: serverTimestamp()
      });

      alert("✨ ¡Tu firma ha sido registrada con éxito en el Códice! Redirigiendo a la Taberna...");
      window.location.href = "taberna.html"; // O tu página principal interna

    } catch (error) {
      console.error("Error al registrar aventurero:", error);
      
      // Manejo de errores comunes
      if (error.code === "auth/email-already-in-use") {
        alert("⚠️ Este correo ya ha sido firmado por otro aventurero.");
      } else if (error.code === "auth/weak-password") {
        alert("⚠️ La palabra mágica (contraseña) debe contener al menos 6 caracteres.");
      } else {
        alert("⚠️ Ocurrió un fallo en el ritual de inscripción. Revisa la consola.");
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerText = "✒️ Firmar el Códice y Comenzar";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
    const classCards = document.querySelectorAll('.class-card input[name="class-choice"]');
    const inputNombre = document.getElementById("reg-username");

    classCards.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const valorSeleccionado = e.target.value;

            // SOLO si selecciona la tarjeta del Azar / Aleatorio
            if (valorSeleccionado === "aleatorio") {
                // 1. Asigna un nombre aleatorio al campo de texto
                if (inputNombre) {
                    inputNombre.value = generarNombreAleatorio();
                }
                

                // 2. Selecciona una clase real de forma transparente para la base de datos
                const claseAzar = obtenerClaseAleatoria();
                
                // Guardamos la clase asignada por el azar en un atributo de datos
                e.target.dataset.claseAsignada = claseAzar.id;
            } else {
                // Si el usuario elige manualmente cualquier otra clase, NO tocamos el nombre
                // dejando que escriba o mantenga el que prefiera.
                delete e.target.dataset.claseAsignada;
                inputNombre.value = "";
            }
        });
    });
});