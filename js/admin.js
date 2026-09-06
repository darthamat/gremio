import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// ⚙️ CONFIGURACIÓN DE CLOUDINARY
const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
const CLOUDINARY_UPLOAD_PRESET = "portadas";

const form = document.getElementById("form-crear-reto");
const mensajeEstado = document.getElementById("mensaje-estado");
const btnSubmit = document.getElementById("btn-submit");

// 🛠️ Función auxiliar para generar el ID según mes y año (ej: "reto26_09")
function obtenerIdMesActual() {
    const fecha = new Date();
    const yy = String(fecha.getFullYear()).slice(-2); // Últimos 2 dígitos del año (26)
    const mm = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes formato 2 dígitos (09)
    return `reto${yy}_${mm}`;
}

// 1. Verificación de Seguridad y Sesión
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    // Verificar si el usuario es Administrador o Archimago en Firestore
    const userDoc = await getDoc(doc(db, "aventureros", user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.rol !== "admin" && userData.rol !== "Archimago") {
            alert("No tienes permisos de administrador para acceder a esta página.");
            window.location.href = "retos.html";
        }
    }
});

// 2. Función para subir imagen a Cloudinary mediante API REST
async function subirACloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

    const respuesta = await fetch(url, {
        method: "POST",
        body: formData
    });

    if (!respuesta.ok) {
        throw new Error("Error en la respuesta de Cloudinary");
    }

    const data = await respuesta.json();
    return data.secure_url; // Devuelve la URL HTTPS pública de la imagen
}

// 3. Subida del Reto al Formulario (SISTEMA DE DOBLE GUARDADO AUTOMÁTICO)
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const puntosPrestigio = Number(document.getElementById("puntosPrestigio").value);
    const descripcion = document.getElementById("descripcion").value.trim();
    const archivoImagen = document.getElementById("portadaFile").files[0];

    if (!archivoImagen) {
        mensajeEstado.innerText = "⚠️ Por favor, selecciona una imagen para la portada.";
        mensajeEstado.style.color = "red";
        return;
    }

    try {
        btnSubmit.disabled = true;
        btnSubmit.innerText = "⏳ Subiendo portada a Cloudinary...";
        mensajeEstado.innerText = "";

        // A. Subir imagen a Cloudinary
        const portadaUrl = await subirACloudinary(archivoImagen);

        btnSubmit.innerText = "⏳ Guardando reto en Firestore...";

        // B. Generar IDs para el doble guardado
        const idHistorico = obtenerIdMesActual(); // Ejemplo: "reto26_09"
        
        const datosDelReto = {
            titulo: titulo,
            puntosPrestigio: puntosPrestigio,
            descripcion: descripcion,
            portadaUrl: portadaUrl,
            idMes: idHistorico,
            fechaCreacion: new Date()
        };

        // C. Guardar ambos documentos atómicamente con WriteBatch
        const batch = writeBatch(db);

        // Referencia 1: El documento pivote que lee la web principal
        const refActual = doc(db, "retos", "actual");

        // Referencia 2: El registro histórico del mes
        const refHistorico = doc(db, "retos", idHistorico);

        batch.set(refActual, datosDelReto);
        batch.set(refHistorico, datosDelReto);

        // Ejecutar la subida doble
        await batch.commit();

        mensajeEstado.innerText = `✅ ¡Reto publicado como 'actual' y respaldado como '${idHistorico}'!`;
        mensajeEstado.style.color = "green";
        form.reset();

    } catch (error) {
        console.error("Error al publicar el reto:", error);
        mensajeEstado.innerText = "❌ Error al subir la imagen o crear el reto.";
        mensajeEstado.style.color = "red";
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerText = "📜 Publicar Reto Mensual";
    }
});