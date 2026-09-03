import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    await cargarOrdenAventureros();
});

async function cargarOrdenAventureros() {
    try {
        const aventurerosRef = collection(db, "aventureros");
        
        // Intentamos ordenar por prestigio o nivel (descendente)
        const q = query(aventurerosRef, orderBy("prestigio", "desc"));
        const snapshot = await getDocs(q);

        let listaAventureros = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            listaAventureros.push({
                id: docSnap.id,
                nombre: data.nombre || data.email || "Aventurero Anónimo",
                clase: data.clase || "Iniciado",
                nivel: data.nivel || 1,
                prestigio: data.prestigio || 0,
                avatar: data.avatar || "img/default-avatar.jpg",
                paginasLeidas: data.paginasLeidas || 0,
                librosCompletados: data.librosCompletados || 0
            });
        });

        // Si la ordenación por Firestore falló por campos vacíos, ordenamos manualmente en JS
        listaAventureros.sort((a, b) => b.prestigio - a.prestigio || b.nivel - a.nivel);

        if (listaAventureros.length === 0) {
            console.warn("No hay aventureros registrados aún.");
            return;
        }

        // 👑 1. EL CAMPEÓN: Siempre es el primer elemento (índice 0)
        const campeon = listaAventureros[0];
        mostrarCampeon(campeon);

        // 🛡️ 2. RESTO DE AVENTUREROS: Del índice 1 en adelante (o mostrar vacío si solo hay 1)
        const restoAventureros = listaAventureros.slice(1);
        mostrarRestoAventureros(restoAventureros);

    } catch (error) {
        console.error("Error al cargar la Orden:", error);
    }
}

// Renderizar la tarjeta del Campeón
function mostrarCampeon(campeon) {
    const contenedorCampeon = document.getElementById("contenedor-campeon");
    if (!contenedorCampeon) return;

    contenedorCampeon.innerHTML = `
        <div class="campeon-card">
            <div class="corona-badge">👑 CAMPEÓN ACTUAL</div>
            <div class="campeon-avatar-frame">
                <img src="${campeon.avatar}" alt="${campeon.nombre}">
            </div>
            <h2>${campeon.nombre}</h2>
            <span class="campeon-clase">${campeon.clase} - Nivel ${campeon.nivel}</span>
            <div class="campeon-stats">
                <span>✨ Prestigio: <strong>${campeon.prestigio}</strong></span>
                <span>📖 Páginas: <strong>${campeon.paginasLeidas}</strong></span>
                <span>📚 Libros: <strong>${campeon.librosCompletados}</strong></span>
            </div>
        </div>
    `;
}

// Renderizar la lista del resto de la Orden
function mostrarRestoAventureros(lista) {
    const contenedorLista = document.getElementById("lista-aventureros");
    if (!contenedorLista) return;

    contenedorLista.innerHTML = "";

    if (lista.length === 0) {
        contenedorLista.innerHTML = `<p class="sin-mas-aventureros">No hay más aventureros en la Orden por el momento. ¡Invita a tus compañeros!</p>`;
        return;
    }

    lista.forEach((aventurero, index) => {
        const item = document.createElement("div");
        item.className = "aventurero-item";
        item.innerHTML = `
            <span class="puesto">#${index + 2}</span>
            <img class="mini-avatar" src="${aventurero.avatar}" alt="${aventurero.nombre}">
            <div class="info">
                <strong>${aventurero.nombre}</strong>
                <span>${aventurero.clase} (Nivel ${aventurero.nivel})</span>
            </div>
            <span class="prestigio">✨ ${aventurero.prestigio} pts</span>
        `;
        contenedorLista.appendChild(item);
    });
}