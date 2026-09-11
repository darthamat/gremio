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

    // 🔗 COMBINAR TODAS LAS FUENTES DE LECTURAS (Retos y Lecturas Libres)
    const lecturasLibres = data.lecturas || data.estanteria || data.biblioteca || [];
    const retosCompletados = data.retosCompletados || data.retos || [];
    
    // Unificamos todo en una sola lista asegurando el flag 'esReto'
    const todasLasLecturas = [
        ...lecturasLibres.map(l => typeof l === 'object' ? { ...l, esReto: false } : { titulo: l, esReto: false }),
        ...retosCompletados.map(r => typeof r === 'object' ? { ...r, esReto: true } : { titulo: r, esReto: true })
    ];

    // 📊 CÁLCULO DINÁMICO DE PUNTOS (Si no existen directos en la BD)
    const xpTotal = data.xp ?? calcularXpTotal(todasLasLecturas);
    const prestigioTotal = data.prestigio ?? calcularPrestigio(todasLasLecturas);
    const nivelCalculado = comprobarSubidaNivel(xpTotal);

    // Información general
    document.getElementById("char-name").textContent = data.nombre || "Aventurero Anónimo";
    document.getElementById("char-class").textContent = `Clase: ${data.clase || "Iniciado"}`;
    document.getElementById("char-level").textContent = nivelCalculado;
    document.getElementById("char-xp").textContent = `${xpTotal} XP`;
    document.getElementById("char-prestige").textContent = prestigioTotal;
    document.getElementById("char-gold-bookmarks").textContent = data.marcapaginasOro || 0;
    document.getElementById("char-pages").textContent = data.paginasLeidas || calcularPaginasTotal(todasLasLecturas);
    document.getElementById("char-books").textContent = data.librosCompletados || todasLasLecturas.length;

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

    // ⬇️ RENDERIZAR BIBLIOTECA Y ESPEJO DEL LECTOR
    renderizarBiblioteca(todasLasLecturas);
    renderizarEspejoDelLector(data.huellas || todasLasLecturas);
}

// 🧮 FUNCIONES AUXILIARES DE CÁLCULO AUTOMÁTICO
function calcularXpTotal(lecturas) {
    return lecturas.reduce((acc, item) => {
        const paginas = item.paginas || 0;
        // Los retos otorgan un 50% extra de XP por página
        const multiplicador = item.esReto ? 1.5 : 1.0; 
        return acc + Math.round(paginas * multiplicador);
    }, 0);
}

function calcularPrestigio(lecturas) {
    // 10 puntos de prestigio por cada reto completado
    return lecturas.filter(item => item.esReto).length * 10;
}

function calcularPaginasTotal(lecturas) {
    return lecturas.reduce((acc, item) => acc + (item.paginas || 0), 0);
}

// 2. Funciones de XP y Nivel
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

// 3. Subida de Avatar
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

// 4. UI: Acordeón y Logout
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

// 5. Renderizar Espejo del Lector
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

// 6. Renderizar Biblioteca
function renderizarBiblioteca(lecturas) {
    const contenedor = document.getElementById("contenedor-biblioteca") || document.getElementById("tab-biblioteca");
    if (!contenedor) return;

    if (!lecturas || lecturas.length === 0) {
        contenedor.innerHTML = `<p class="sin-datos">Aún no has completado ninguna lectura ni reto.</p>`;
        return;
    }

    let html = '<div class="grid-biblioteca">';
    lecturas.forEach(item => {
        const titulo = typeof item === 'object' ? (item.titulo || "Tomo Leído") : "Tomo Leído";
        const autor = typeof item === 'object' ? (item.autor || "Desconocido") : "";
        const portada = typeof item === 'object' ? (item.portadaUrl || "img/placeholder-book.jpg") : "img/placeholder-book.jpg";
        const paginas = typeof item === 'object' ? (item.paginas || 0) : 0;
        const esReto = item.esReto || false;

        html += `
            <div class="tarjeta-libro-estanteria ${esReto ? 'es-reto' : ''}">
                <img src="${portada}" alt="${titulo}" onerror="this.src='img/placeholder-book.jpg';">
                <div class="info-libro-estanteria">
                    <h4>${titulo}</h4>
                    <p class="autor">${autor}</p>
                    <div class="badges-libro">
                        ${paginas ? `<span class="paginas">📖 ${paginas} pág.</span>` : ''}
                        ${esReto ? '<span class="badge-reto">🛡️ Reto</span>' : '<span class="badge-libre">📜 Libre</span>'}
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';

    contenedor.innerHTML = html;
}