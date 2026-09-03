import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
        
        // 1. Obtenemos TODOS los documentos sin filtrar por campos opcionales
        const snapshot = await getDocs(aventurerosRef);

        let listaAventureros = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            listaAventureros.push({
                id: docSnap.id,
                nombre: data.nombre || data.email || "Aventurero Anónimo",
                clase: data.clase || "Iniciado",
                nivel: Number(data.nivel) || 1,
                prestigio: Number(data.prestigio) || 0,
                avatar: data.avatar || "img/default-avatar.jpg",
                paginasLeidas: Number(data.paginasLeidas) || 0,
                librosCompletados: Number(data.librosCompletados) || 0
            });
        });

        console.log("Aventureros encontrados en Firestore:", listaAventureros);

        if (listaAventureros.length === 0) {
            console.warn("No se encontró ningún documento en la colección 'aventureros'.");
            return;
        }

        // 2. Ordenamos en JavaScript de mayor a menor prestigio (o nivel)
       listaAventureros.sort((a, b) => {
            if (b.nivel !== a.nivel) {
                return b.nivel - a.nivel;
            }
            if (b.prestigio !== a.prestigio) {
                return b.prestigio - a.prestigio;
            }
            return a.nombre.localeCompare(b.nombre);
        });

        // 👑 3. El de mayor puntuación (índice 0) es el Campeón
        const campeon = listaAventureros[0];
        mostrarCampeon(campeon);

        // 🛡️ 4. El resto de aventureros
        const restoAventureros = listaAventureros;
        mostrarRestoAventureros(restoAventureros);

    } catch (error) {
        console.error("Error al cargar la Orden de Aventureros:", error);
    }
}

// Renderizar la tarjeta del Campeón
function mostrarCampeon(campeon) {
    const contenedorCampeon = document.getElementById("contenedor-campeon");
    if (!contenedorCampeon) {
        console.error("No se encontró el elemento con id='contenedor-campeon' en orden.html");
        return;
    }

    // Redondear el prestigio si tiene decimales
    const prestigioFormateado = Math.round(campeon.prestigio);

    contenedorCampeon.innerHTML = `
        <div class="campeon-card">
            <div class="corona-badge">👑 CAMPEÓN ACTUAL</div>
            <div class="campeon-avatar-frame">
                <img src="${campeon.avatar}" alt="${campeon.nombre}">
            </div>
            <h2>${campeon.nombre}</h2>
            <span class="campeon-clase">${campeon.clase} - Nivel ${campeon.nivel}</span>
            <div class="campeon-stats">
                <span>✨ Prestigio: <strong>${prestigioFormateado}</strong></span>
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
        contenedorLista.innerHTML = `<p class="sin-mas-aventureros">No hay aventureros en la Orden por el momento.</p>`;
        return;
    }

    lista.forEach((aventurero, index) => {
        const item = document.createElement("div");
        item.className = "aventurero-item";
        item.innerHTML = `
            <span class="puesto">#${index + 1}</span>
            <img class="mini-avatar" src="${aventurero.avatar}" alt="${aventurero.nombre}">
            <div class="info">
                <strong>${aventurero.nombre}</strong>
                <span>${aventurero.clase} (Niv. ${aventurero.nivel})</span>
            </div>
            <span class="prestigio">✨ ${Math.round(aventurero.prestigio)}</span>
        `;
        contenedorLista.appendChild(item);
    });
}