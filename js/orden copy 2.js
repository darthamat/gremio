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
                nombre: data.nombre || data.email || "Aventurero Anónimo",
                clase: data.clase || "Iniciado",
                rol: data.rol || "Aventurero",
                nivel: Number(data.nivel) || 1,
                prestigio: Number(data.prestigio) || 0,
                // Leemos photoURL o avatar de Firestore
                avatar: data.photoURL || data.avatar || "/img/default-avatar.jpg",
                paginasLeidas: Number(data.paginasLeidas) || 0,
                librosCompletados: Number(data.librosCompletados) || 0
            });
        });

        console.log("Aventureros encontrados en Firestore:", listaAventureros);

        if (listaAventureros.length === 0) {
            console.warn("No se encontró ningún documento en la colección 'aventureros'.");
            return;
        }

        // 1. Extraer Archimago (Si existe por rol o clase)
        const archimagoIndex = listaAventureros.findIndex(
            a => (a.rol && a.rol.toLowerCase() === "archimago") || (a.clase && a.clase.toLowerCase() === "archimago")
        );
        let archimago = null;
        if (archimagoIndex !== -1) {
            archimago = listaAventureros.splice(archimagoIndex, 1)[0];
        }

        // 2. Ordenar al resto por Nivel (Desc), Prestigio (Desc) y Nombre (Asc)
        listaAventureros.sort((a, b) => {
            if (b.nivel !== a.nivel) return b.nivel - a.nivel;
            if (b.prestigio !== a.prestigio) return b.prestigio - a.prestigio;
            return a.nombre.localeCompare(b.nombre);
        });

        // 3. Extraer Señores del Gremio SOLO SI hay más de 1 aventurero disponible
        let senoresGremio = [];
        if (listaAventureros.length > 1) {
            // Se toman máximo 5 señores, pero dejando siempre al menos 1 para el Campeón
            const cantidadSenores = Math.min(listaAventureros.length - 1, 5);
            senoresGremio = listaAventureros.splice(0, cantidadSenores);
        }

        // 4. El primer puesto restante es el Campeón
        const campeon = listaAventureros.length > 0 ? listaAventureros[0] : null;

        // 5. Renderizar cada bloque en el DOM
        mostrarArchimago(archimago);
        mostrarSenoresGremio(senoresGremio);
        mostrarCampeon(campeon);
        mostrarRestoAventureros(listaAventureros); // Muestra a todos los aventureros incluyendo al Campeón

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
            <span class="clase-nivel">${archimago.clase} - Nivel ${archimago.nivel}</span>
            <div class="stats">
                <span>✨ Prestigio: <strong>${Math.round(archimago.prestigio)}</strong></span>
                <span>📖 Páginas: <strong>${archimago.paginasLeidas}</strong></span>
                <span>📚 Libros: <strong>${archimago.librosCompletados}</strong></span>
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
                <span>${senor.clase} (Niv. ${senor.nivel})</span>
            </div>
            <span class="prestigio">✨ ${Math.round(senor.prestigio)}</span>
        `;
        contenedor.appendChild(card);
    });
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
            <span class="campeon-clase">${campeon.clase} - Nivel ${campeon.nivel}</span>
            <div class="campeon-stats">
                <span>✨ Prestigio: <strong>${Math.round(campeon.prestigio)}</strong></span>
                <span>📖 Páginas: <strong>${campeon.paginasLeidas}</strong></span>
                <span>📚 Libros: <strong>${campeon.librosCompletados}</strong></span>
            </div>
        </div>
    `;
}

// 📜 Renderizar la lista de aventureros
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
                <span>${aventurero.clase} (Niv. ${aventurero.nivel})</span>
            </div>
            <span class="prestigio">✨ ${Math.round(aventurero.prestigio)}</span>
        `;
        contenedorLista.appendChild(item);
    });
}