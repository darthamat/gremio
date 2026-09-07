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
        const snapshot = await getDocs(aventurerosRef);

        let listaAventureros = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            listaAventureros.push({
                id: docSnap.id,
                nombre: data.nombre || data.nombreReal || data.email || "Aventurero Anónimo",
                clase: data.clase || "Iniciado",
                rol: data.rol || data.tipoUsuario || "Aventurero",
                prestigio: Number(data.prestigio) || 0,
                avatar: data.imagen_avatar || data.photoURL || data.avatar || "/img/default-avatar.jpg",
                paginasLeidas: Number(data.paginasLeidas) || 0,
                librosCompletados: Number(data.librosCompletados) || 0
            });
        });

        // 1. Filtrar para excluir al usuario 'admin' (por nombre o rol)
        listaAventureros = listaAventureros.filter(a => {
            const nombre = (a.nombre || "").toLowerCase();
            const rol = (a.rol || "").toLowerCase();
            return nombre !== "admin" && rol !== "admin";
        });

        console.log("Aventureros válidos encontrados:", listaAventureros);

        if (listaAventureros.length === 0) {
            console.warn("No se encontró ningún aventurero válido.");
            return;
        }

        // 2. Extraer Archimago (Si existe por rol o clase)
        const archimagoIndex = listaAventureros.findIndex(
            a => (a.rol && a.rol.toLowerCase() === "archimago") || (a.clase && a.clase.toLowerCase() === "archimago")
        );
        let archimago = null;
        if (archimagoIndex !== -1) {
            archimago = listaAventureros.splice(archimagoIndex, 1)[0];
        }

        // 3. Ordenar ÚNICAMENTE por Prestigio (Desc) y Nombre (Asc) como desempate
        listaAventureros.sort((a, b) => {
            if (b.prestigio !== a.prestigio) return b.prestigio - a.prestigio;
            return a.nombre.localeCompare(b.nombre);
        });

        // 4. Campeón: El #1 de la clasificación
        const campeon = listaAventureros.length > 0 ? listaAventureros[0] : null;

        // 5. Señores del Gremio: Del puesto #2 al #6
        let senoresGremio = [];
        if (listaAventureros.length > 1) {
            senoresGremio = listaAventureros.slice(1, 6);
        }

        // 6. Renderizar cada bloque en el DOM (sin nivel)
        mostrarArchimago(archimago);
        mostrarCampeon(campeon);
        mostrarSenoresGremio(senoresGremio);
        mostrarRestoAventureros(listaAventureros);

    } catch (error) {
        console.error("Error al cargar la Orden de Aventureros:", error);
    }
}

// 🧙‍♂️ Renderizar Archimago
function mostrarArchimago(archimago) {
    const contenedor = document.getElementById("contenedor-archimago");
    if (!contenedor) return;

    if (!archimago) {
        contenedor.innerHTML = `<p class="sin-datos">No hay un Archimago designado.</p>`;
        return;
    }

    contenedor.innerHTML = `
        <div class="archimago-card">
            <div class="badge-rol">🧙‍♂️ ARCHIMAGO SUPREMO</div>
            <div class="avatar-frame">
                <img src="${archimago.avatar}" alt="${archimago.nombre}" onerror="this.onerror=null; this.src='/img/default-avatar.jpg';">
            </div>
            <h2>${archimago.nombre}</h2>
            <span class="clase-nivel">${archimago.clase}</span>
            <div class="stats">
                <span>✨ Prestigio: <strong>${Math.round(archimago.prestigio)}</strong></span>
                <span>📖 Páginas: <strong>${archimago.paginasLeidas}</strong></span>
                <span>📚 Libros: <strong>${archimago.librosCompletados}</strong></span>
            </div>
        </div>
    `;
}

// 👑 Renderizar la tarjeta del Campeón
function mostrarCampeon(campeon) {
    const contenedorCampeon = document.getElementById("contenedor-campeon");
    if (!contenedorCampeon) return;

    if (!campeon) {
        contenedorCampeon.innerHTML = `<p class="sin-datos">No hay un Campeón en la Orden.</p>`;
        return;
    }

    contenedorCampeon.innerHTML = `
        <div class="campeon-card">
            <div class="corona-badge">👑 CAMPEÓN DE LOS AVENTUREROS</div>
            <div class="campeon-avatar-frame">
                <img src="${campeon.avatar}" alt="${campeon.nombre}" onerror="this.onerror=null; this.src='/img/default-avatar.jpg';">
            </div>
            <h2>${campeon.nombre}</h2>
            <span class="campeon-clase">${campeon.clase}</span>
            <div class="campeon-stats">
                <span>✨ Prestigio: <strong>${Math.round(campeon.prestigio)}</strong></span>
                <span>📖 Páginas: <strong>${campeon.paginasLeidas}</strong></span>
                <span>📚 Libros: <strong>${campeon.librosCompletados}</strong></span>
            </div>
        </div>
    `;
}

// 🛡️ Renderizar Señores del Gremio
function mostrarSenoresGremio(senores) {
    const contenedor = document.getElementById("contenedor-senores");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (senores.length === 0) {
        contenedor.innerHTML = `<p class="sin-datos">No hay Señores del Gremio por el momento.</p>`;
        return;
    }

    senores.forEach((senor, index) => {
        const card = document.createElement("div");
        card.className = "senor-card";
        card.innerHTML = `
            <div class="badge-senor">🛡️ SEÑOR #${index + 1}</div>
            <img class="mini-avatar" src="${senor.avatar}" alt="${senor.nombre}" onerror="this.onerror=null; this.src='/img/default-avatar.jpg';">
            <div class="info">
                <strong>${senor.nombre}</strong>
                <span>${senor.clase}</span>
            </div>
            <span class="prestigio">✨ ${Math.round(senor.prestigio)}</span>
        `;
        contenedor.appendChild(card);
    });
}

// 📜 Renderizar la lista completa de aventureros
function mostrarRestoAventureros(lista) {
    const contenedorLista = document.getElementById("lista-aventureros");
    if (!contenedorLista) return;

    contenedorLista.innerHTML = "";

    if (lista.length === 0) {
        contenedorLista.innerHTML = `<p class="sin-mas-aventureros">No hay aventureros registrados.</p>`;
        return;
    }

    lista.forEach((aventurero, index) => {
        const item = document.createElement("div");
        item.className = "aventurero-item";
        item.innerHTML = `
            <span class="puesto">#${index + 1}</span>
            <img class="mini-avatar" src="${aventurero.avatar}" alt="${aventurero.nombre}" onerror="this.onerror=null; this.src='/img/default-avatar.jpg';">
            <div class="info">
                <strong>${aventurero.nombre}</strong>
                <span>${aventurero.clase}</span>
            </div>
            <span class="prestigio">✨ ${Math.round(aventurero.prestigio)}</span>
        `;
        contenedorLista.appendChild(item);
    });
}