// js/registro.js
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Importaciones de configuración y arquetipos
import { auth, db } from "./firebase-config.js";
import { generarNombreAleatorio, obtenerClaseAleatoria, obtenerArquetipoPorId } from "./arquetipos.js";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".character-form");
    const classCards = document.querySelectorAll('.class-card input[name="class-choice"]');
    const inputNombre = document.getElementById("reg-username");

    // -----------------------------------------------------------
    // 1. Gestión de selección interactiva (Al hacer clic en las opciones)
    // -----------------------------------------------------------
    classCards.forEach(radio => {
        radio.addEventListener("change", (e) => {
            const valorSeleccionado = e.target.value;

            if (valorSeleccionado === "aleatorio") {
                // Genera un nombre de aventurero aleatorio si el campo existe
                if (inputNombre && !inputNombre.value.trim()) {
                    inputNombre.value = generarNombreAleatorio();
                }

                // Genera una clase al azar y guarda su ID en el dataset
                const claseAzar = obtenerClaseAleatoria();
                e.target.dataset.claseAsignadaId = claseAzar.id;
            } else {
                // Si elige una clase manual, limpia la asignación previa del azar
                delete e.target.dataset.claseAsignadaId;
                inputNombre.value = "";
            }
        });
    });

    // -----------------------------------------------------------
    // 2. Envío del Formulario y Guardado en Firestore
    // -----------------------------------------------------------
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // A. Validar selección de Clase Lectora
        const radioSeleccionado = document.querySelector('input[name="class-choice"]:checked');

        if (!radioSeleccionado) {
            alert("⚠️ ¡Aguardad, Aventurero! Debes elegir una Clase Lectora o dejar tu suerte en manos del 'Destino Impredecible' 🎲 antes de firmar el Códice.");
            
            const contenedorClases = document.querySelector(".class-selector");
            if (contenedorClases) {
                contenedorClases.scrollIntoView({ behavior: "smooth" });
            }
            return;
        }

        let idSeleccionada = radioSeleccionado.value;

        // B. Resolver asignación si eligió 'Destino Impredecible'
        if (idSeleccionada === "aleatorio") {
            idSeleccionada = radioSeleccionado.dataset.claseAsignadaId || obtenerClaseAleatoria().id;
            const claseAzarData = obtenerArquetipoPorId(idSeleccionada);
            if (claseAzarData) {
                alert(`🎲 ¡Los dados del destino han hablado! Has sido asignado a la clase: "${claseAzarData.nombre}".`);
            }
        }

        // C. Obtener el objeto de datos de la clase seleccionada
        const datosClase = obtenerArquetipoPorId(idSeleccionada);
        const nombreClaseFinal = datosClase ? datosClase.nombre : "Aventurero Novato";

        // D. Leer los campos del formulario
        const username = document.getElementById("reg-username").value.trim();
        const realname = document.getElementById("real-username").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;

        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;

        try {
            // E. Registrar usuario en Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // F. Guardar Ficha de Personaje en Firestore
            await setDoc(doc(db, "aventureros", user.uid), {
                uid: user.uid,
                nombre: username,
                nombreReal: realname,
                email: email,
                clase: nombreClaseFinal,     // Ejemplo: "Mago/a CuentaCuentos"
                claseId: idSeleccionada,      // Ejemplo: "fantasia"
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

            // G. Redirigir a la pantalla de carga
            window.location.href = "carga.html";

        } catch (error) {
            console.error("Error al registrar aventurero:", error);
            alert("⚠️ Fallo en el registro: " + error.message);
        } finally {
            submitBtn.disabled = false;
        }
    });
});