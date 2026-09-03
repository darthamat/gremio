import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// ⚙️ CONFIGURACIÓN DE CLOUDINARY
const CLOUDINARY_CLOUD_NAME = "dwuokewzr";       // Ej: "dxy123abc"
const CLOUDINARY_UPLOAD_PRESET = "portadas"; // Ej: "retos_preset"

const form = document.getElementById("form-crear-reto");
const mensajeEstado = document.getElementById("mensaje-estado");
const btnSubmit = document.getElementById("btn-submit");

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

// 3. Subida del Reto al Formulario
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

        // B. Guardar los datos en Firestore con la URL de Cloudinary
        await addDoc(collection(db, "retos"), {
            titulo: titulo,
            puntosPrestigio: puntosPrestigio,
            descripcion: descripcion,
            portadaUrl: portadaUrl,
            fechaCreacion: new Date()
        });

        mensajeEstado.innerText = "✅ ¡Reto publicado exitosamente en el Cartel del Gremio!";
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