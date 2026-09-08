import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { generarResumenEvolucion } from "./sintetizadorPerfil.js";

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

    actualizarProgresoUI(xpTotal, nivelCalculado);

    // ⬇️ RENDERIZAR LA BIBLIOTECA DEL USUARIO
    const librosBiblioteca = data.estanteria || data.biblioteca || [];
    renderizarBiblioteca(librosBiblioteca);
}

// Renderiza los libros guardados en la estantería/biblioteca
function renderizarBiblioteca(libros) {
    const contenedorBiblioteca = document.getElementById("contenedor-biblioteca") || document.getElementById("tab-biblioteca");
    if (!contenedorBiblioteca) return;

    if (!libros || libros.length === 0) {
        contenedorBiblioteca.innerHTML = `<p class="sin-datos">Aún no has añadido ningún tomo a tu estantería personal.</p>`;
        return;
    }

    let html = '<div class="grid-biblioteca">';
    libros.forEach((libro) => {
        // Manejo en caso de que el elemento guardado sea un String (id) u Objeto
        const titulo = typeof libro === 'object' ? libro.titulo : "Tomo Leído";
        const autor = typeof libro === 'object' ? (libro.autor || "Desconocido") : "";
        const portada = typeof libro === 'object' ? (libro.portadaUrl || "img/placeholder-book.jpg") : "img/placeholder-book.jpg";
        const paginas = typeof libro === 'object' ? (libro.paginas || 0) : 0;

        html += `
            <div class="tarjeta-libro-estanteria">
                <img src="${portada}" alt="${titulo}" onerror="this.src='img/placeholder-book.jpg';">
                <div class="info-libro-estanteria">
                    <h4>${titulo}</h4>
                    <p class="autor">${autor}</p>
                    ${paginas ? `<span class="paginas">📖 ${paginas} pág.</span>` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';

    contenedorBiblioteca.innerHTML = html;
}

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
    const xpEnEsteNivel = xpTotal - rango.xpBase;
    const xpNecesariaEnEsteNivel = rango.xpSiguiente - rango.xpBase;
    const porcentaje = Math.min(Math.max((xpEnEsteNivel / xpNecesariaEnEsteNivel) * 100, 0), 100);

    const elCurrent = document.getElementById("xp-current");
    const elNext = document.getElementById("xp-next-level");
    
    if (elCurrent) elCurrent.textContent = xpTotal;
    if (elNext) elNext.textContent = rango.xpSiguiente;
    
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
            }

        } catch (err) {
            console.error("Error al actualizar avatar:", err);
            alert("No se pudo subir la foto. Comprueba la configuración de Cloudinary.");
            avatarImg.style.opacity = "1";
        }
    });
}

// Lógica para el sistema de acordeón / pestañas
document.addEventListener("DOMContentLoaded", () => {
    const botones = document.querySelectorAll(".btn-tab");
    const panelContenido = document.getElementById("panel-contenido");
    const contenidos = document.querySelectorAll(".tab-contenido");

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const tabSeleccionada = boton.getAttribute("data-tab");
            const yaEstabaActivo = boton.classList.contains("activo");

            botones.forEach(b => b.classList.remove("activo"));
            contenidos.forEach(c => c.classList.add("oculto"));

            if (!yaEstabaActivo) {
                boton.classList.add("activo");
                panelContenido.classList.remove("oculto");
                
                const contenidoAMostrar = document.getElementById(`tab-${tabSeleccionada}`);
                if (contenidoAMostrar) {
                    contenidoAMostrar.classList.remove("oculto");
                }
            } else {
                panelContenido.classList.add("oculto");
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const btnLogout = document.getElementById("btn-logout");

    if (btnLogout) {
        btnLogout.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "index.html";
            } catch (error) {
                console.error("Error al cerrar la sesión:", error);
                alert("Ocurrió un error al intentar cerrar la sesión.");
            }
        });
    }
});

export function renderizarEspejoDelLector(huellasUsuario) {
    const contenedor = document.getElementById("bloque-espejo-lector");
    if (!contenedor) return;

    const { tituloArquetipo, resumenTextual } = generarResumenEvolucion(huellasUsuario);

    contenedor.innerHTML = `
        <div class="tarjeta-espejo">
            <div class="sello-cronista">📜 CRÓNICA DE TU EVOLUCIÓN</div>
            <h2 class="arquetipo-titulo">${tituloArquetipo}</h2>
            <p class="resumen-texto">${resumenTextual}</p>
        </div>
    `;
}