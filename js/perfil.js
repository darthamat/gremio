import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dwuokewzr/image/upload";
const UPLOAD_PRESET = "avatar_users"; 

let currentUserDocRef = null;

// Tabla fija de experiencia acumulada para cada nivel (Estilo D&D)
const TABLA_NIVELES_DD = [
    { nivel: 1,  xpRequerida: 0 },
    { nivel: 2,  xpRequerida: 300 },   // 1 libro de 300 pág
    { nivel: 3,  xpRequerida: 900 },   // 3 libros acumulados
    { nivel: 4,  xpRequerida: 1800 },  // 6 libros acumulados
    { nivel: 5,  xpRequerida: 3000 },  // 10 libros acumulados
    { nivel: 6,  xpRequerida: 4500 },  // 15 libros
    { nivel: 7,  xpRequerida: 6500 },  // 21 libros
    { nivel: 8,  xpRequerida: 9000 },  // 30 libros
    { nivel: 9,  xpRequerida: 12000 }, // 40 libros
    { nivel: 10, xpRequerida: 16000 }  // Archimago
];

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUserDocRef = doc(db, "aventureros", user.uid);
    await cargarDatosAventurero(currentUserDocRef);
});

// 1. Cargar datos desde Firestore
async function cargarDatosAventurero(docRef) {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();

    const xpTotal = data.xp || 0;
    
    // Comprobar el nivel según la XP acumulada
    const nivelCalculado = comprobarSubidaNivel(xpTotal);

    // Información general
    document.getElementById("char-name").textContent = data.nombre || "Aventurero Anónimo";
    document.getElementById("char-class").textContent = `Clase: ${data.clase || "Iniciado"}`;
    document.getElementById("char-level").textContent = nivelCalculado;
    document.getElementById("char-xp").textContent = `${xpTotal} XP`;
    document.getElementById("char-prestige").textContent = data.prestigio || 0;
    document.getElementById("char-gold-bookmarks").textContent = data.marcapaginasOro || 0;
    document.getElementById("char-pages").textContent = data.paginasLeidas || 0;
    document.getElementById("char-books").textContent = data.librosCompletados || 0;

    if (data.photoURL) {
        document.getElementById("avatar-img").src = data.photoURL;
    }

    // Atributos
    document.getElementById("attr-fuerza").textContent = data.fuerza ?? 10;
    document.getElementById("attr-agilidad").textContent = data.agilidad ?? 10;
    document.getElementById("attr-inteligencia").textContent = data.inteligencia ?? 10;
    document.getElementById("attr-sabiduria").textContent = data.sabiduria ?? 10;
    document.getElementById("attr-fatiga").textContent = data.fatiga ?? 0;
    document.getElementById("attr-mente").textContent = data.mente ?? 0;
    document.getElementById("attr-corazon").textContent = data.corazon ?? 0;
    document.getElementById("attr-suerte").textContent = data.suerte ?? 0;

    // ⬇️ ¡AQUÍ ESTÁ LA LLAMADA QUE FALTABA! Actualizar la barra de XP en la UI
    actualizarProgresoUI(xpTotal, nivelCalculado);
}

// 2. Lógica para calcular rangos y actualizar la barra de progreso
export function obtenerRangoXP(nivelActual) {
    const actual = TABLA_NIVELES_DD.find(n => n.nivel === nivelActual) || { xpRequerida: 0 };
    const siguiente = TABLA_NIVELES_DD.find(n => n.nivel === nivelActual + 1) || { xpRequerida: actual.xpRequerida + 5000 };
    
    return {
        xpBase: actual.xpRequerida,
        xpSiguiente: siguiente.xpRequerida
    };
}

export function actualizarProgresoUI(xpTotal, nivelActual) {
    const rango = obtenerRangoXP(nivelActual);
    
    // Calcular cuánta XP se ha conseguido dentro del NIVEL ACTUAL
    const xpEnEsteNivel = xpTotal - rango.xpBase;
    const xpNecesariaEnEsteNivel = rango.xpSiguiente - rango.xpBase;
    
    // Porcentaje real del tramo del nivel actual
    const porcentaje = Math.min(Math.max((xpEnEsteNivel / xpNecesariaEnEsteNivel) * 100, 0), 100);

    // Actualizar elementos HTML (Muestra XP total y la meta del siguiente nivel)
    const elCurrent = document.getElementById("xp-current");
    const elNext = document.getElementById("xp-next-level");
    
    if (elCurrent) elCurrent.textContent = xpTotal;
    if (elNext) elNext.textContent = rango.xpSiguiente; // Para Nivel 1 mostrará 300
    
    const xpFill = document.getElementById("xp-fill");
    if (xpFill) {
        xpFill.style.width = `${porcentaje}%`;
    }
}

export function comprobarSubidaNivel(xpTotalActual) {
    let nivelCalculado = 1;

    for (let i = TABLA_NIVELES_DD.length - 1; i >= 0; i--) {
        if (xpTotalActual >= TABLA_NIVELES_DD[i].xpRequerida) {
            nivelCalculado = TABLA_NIVELES_DD[i].nivel;
            break;
        }
    }

    return nivelCalculado;
}

// 3. Gestionar subida de avatar a Cloudinary
const avatarContainer = document.getElementById("avatar-container");
const avatarInput = document.getElementById("avatar-input");
const avatarImg = document.getElementById("avatar-img");

if (avatarContainer && avatarInput) {
    avatarContainer.addEventListener("click", () => avatarInput.click());

    avatarInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        try {
            avatarImg.style.opacity = "0.5";

            const res = await fetch(CLOUDINARY_URL, {
                method: "POST",
                body: formData
            });

            if (!res.ok) throw new Error("Error en la subida a Cloudinary");

            const cloudData = await res.json();
            const imageUrl = cloudData.secure_url;

            avatarImg.src = imageUrl;
            avatarImg.style.opacity = "1";

            if (currentUserDocRef) {
                await updateDoc(currentUserDocRef, { photoURL: imageUrl });
                console.log("Avatar actualizado en Firestore");
            }

        } catch (err) {
            console.error("Error al actualizar avatar:", err);
            alert("No se pudo subir la foto. Comprueba la configuración de Cloudinary.");
            avatarImg.style.opacity = "1";
        }
    });
}