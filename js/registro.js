// js/registro.js
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Importaciones centralizadas con rutas relativas correctas
import { auth, db } from "./firebase-config.js";
import { generarNombreAleatorio, obtenerClaseAleatoria, obtenerArquetipoPorId } from "./arquetipos.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".character-form");
    const classCards = document.querySelectorAll('.class-card input[name="class-choice"]');
    const inputNombre = document.getElementById("reg-username");

    // -----------------------------------------------------------
    // 1. Gestión de selección de tarjetas (Lógica interactiva)
    // -----------------------------------------------------------
    classCards.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const valorSeleccionado = e.target.value;

            if (valorSeleccionado === "aleatorio") {
                // Genera un nombre aleatorio
                if (inputNombre) {
                    inputNombre.value = generarNombreAleatorio();
                }

                // Asigna una clase real al azar y guarda su ID en el dataset
                const claseAzar = obtenerClaseAleatoria();
                e.target.dataset.claseAsignadaId = claseAzar.id;
            } else {
                // Si selecciona otra clase, se limpia la asignación previa del azar
                delete e.target.dataset.claseAsignadaId;
            }
        });
    });

    // -----------------------------------------------------------
    // 2. Envío del Formulario y Guardado en Firestore
    // -----------------------------------------------------------
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const username = document.getElementById("reg-username").value.trim();
        const realname = document.getElementById("real-username").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;

        // Capturar elemento de clase seleccionado
        const radioSeleccionado = document.querySelector('input[name="class-choice"]:checked');
        let idSeleccionada = radioSeleccionado ? radioSeleccionado.value : "fantasia";

        // Si eligió la tarjeta aleatoria, tomar la ID que generó la tirada al azar
        if (idSeleccionada === "aleatorio") {
            idSeleccionada = radioSeleccionado.dataset.claseAsignadaId || obtenerClaseAleatoria().id;
        }

        // Buscar los datos de la clase desde CLASES_GREMIO
        const datosClase = obtenerArquetipoPorId(idSeleccionada);
        const nombreClaseFinal = datosClase ? datosClase.nombre : "Mago/a CuentaCuentos";

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            // Registrar usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Guardar Ficha de Personaje en Firestore
            await setDoc(doc(db, "aventureros", user.uid), {
                uid: user.uid,
                nombre: username,
                nombreReal: realname,
                email: email,
                clase: nombreClaseFinal,    // 👈 Nombre legible (ej: "Mago/a CuentaCuentos")
                claseId: idSeleccionada,     // 👈 Identificador de clase (ej: "fantasia")
                nivel: 1,
                xp: 0,
                prestigio: 0,
                paginasLeidas: 0,
                librosCompletados: 0,
                fechaUnion: serverTimestamp(), 
                tipoUsuario: "aventurero",
                imagen_avatar: "",
                fuerza: 10,
                agilidad: 10,
                inteligencia: 10,
                sabiduria: 10,
                fatiga: 0,
                mente: 0,
                corazon: 0,
                suerte: 0
            });

            // Redirigir a la pantalla de carga intermedia
            window.location.href = "carga.html";

        } catch (error) {
            console.error("Error al registrar aventurero:", error);
            alert("⚠️ Fallo en el registro: " + error.message);
        } finally {
            submitBtn.disabled = false;
        }
    });
});