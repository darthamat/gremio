import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

let usuarioActual = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    usuarioActual = user;
    await cargarCartelRetos();
});

async function cargarCartelRetos() {
    const contenedor = document.getElementById("contenedor-retos");
    contenedor.innerHTML = "<p>Cargando retos de la tablilla del gremio...</p>";

    try {
        // 1. Obtener la lista general de retos mensuales
        const retosSnapshot = await getDocs(collection(db, "retos"));
        
        // 2. Obtener los datos del aventurero actual para comprobar retos aceptados/completados
        const usuarioRef = doc(db, "aventureros", usuarioActual.uid);
        const usuarioSnap = await getDoc(usuarioRef);
        
        const retosUsuario = usuarioSnap.exists() ? (usuarioSnap.data().retos || {}) : {};

        contenedor.innerHTML = "";

        if (retosSnapshot.empty) {
            contenedor.innerHTML = "<p>No hay retos disponibles este mes en la tablilla.</p>";
            return;
        }

        retosSnapshot.forEach((docReto) => {
            const reto = docReto.data();
            const retoId = docReto.id;
            
            // Estado actual del reto para este aventurero específico: 'pendiente', 'aceptado', 'completado'
            const estadoReto = retosUsuario[retoId] || 'pendiente'; 

            const cartel = document.createElement("div");
            cartel.className = `cartel-reto ${estadoReto === 'completado' ? 'completado' : ''}`;

            cartel.innerHTML = `
                <img class="portada-libro" src="${reto.portadaUrl || '/img/default-book.jpg'}" alt="${reto.titulo}">
                <h3>${reto.titulo}</h3>
                <p><strong>Recompensa:</strong> +${reto.puntosPrestigio || 50} Prestigio</p>
                
                <div class="acciones-reto">
                    <button class="btn-reto btn-info" onclick="mostrarInfo('${reto.descripcion || 'Sin descripción'}')">ℹ️ Información</button>
                    
                    ${renderizarBotonesAccion(retoId, estadoReto)}
                </div>
            `;

            contenedor.appendChild(cartel);
        });

    } catch (error) {
        console.error("Error al cargar los retos:", error);
        contenedor.innerHTML = "<p>Error al cargar la tablilla de retos.</p>";
    }
}

// Función auxiliar para renderizar los botones de estado
function renderizarBotonesAccion(retoId, estado) {
    if (estado === 'completado') {
        return `<button class="btn-reto" disabled>✔️ Reto Concluido</button>`;
    } else if (estado === 'aceptado') {
        return `<button class="btn-reto" onclick="marcarCompletado('${retoId}')">🏆 Terminar Reto</button>`;
    } else {
        return `<button class="btn-reto" onclick="aceptarReto('${retoId}')">⚔️ Aceptar Reto</button>`;
    }
}

// Acciones expuestas al DOM
window.mostrarInfo = (descripcion) => {
    alert(`📜 Detalles del Reto:\n\n${descripcion}`);
};

window.aceptarReto = async (retoId) => {
    try {
        const usuarioRef = doc(db, "aventureros", usuarioActual.uid);
        await updateDoc(usuarioRef, {
            [`retos.${retoId}`]: "aceptado"
        });
        await cargarCartelRetos(); // Recargar la vista
    } catch (error) {
        console.error("Error al aceptar reto:", error);
    }
};

window.marcarCompletado = async (retoId) => {
    try {
        const usuarioRef = doc(db, "aventureros", usuarioActual.uid);
        await updateDoc(usuarioRef, {
            [`retos.${retoId}`]: "completado"
        });
        await cargarCartelRetos(); // Recargar la vista
    } catch (error) {
        console.error("Error al completar reto:", error);
    }
};