import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

let usuarioSesionId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  usuarioSesionId = user.uid;
  await cargarYRenderizarRetos();
});

async function cargarYRenderizarRetos() {
  try {
    // 1. Obtener datos del usuario en sesión
    const userRef = doc(db, "aventureros", usuarioSesionId);
    const userSnap = await getDoc(userRef);
    const usuarioData = userSnap.exists() ? userSnap.data() : {};

    const retosAceptados = usuarioData.retosAceptados || [];
    const retosCompletados = usuarioData.retosCompletados || [];

    // 2. Obtener la colección de retos desde Firestore
    const snapshot = await getDocs(collection(db, "retos"));
    let listaRetos = [];

    snapshot.forEach((docSnap) => {
      listaRetos.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Ordenar por fecha de creación (los más recientes primero)
    listaRetos.sort((a, b) => (b.fechaCreacion || 0) - (a.fechaCreacion || 0));

    const contenedorActual = document.getElementById("contenedor-reto-actual");
    const contenedorPasados = document.getElementById("contenedor-retos-pasados");
    const elProponente = document.getElementById("proponente-reto");

    if (listaRetos.length === 0) {
      if (elProponente) elProponente.textContent = "[Aventurero Anónimo]";
      if (contenedorActual) contenedorActual.innerHTML = `<p class="sin-datos">No hay un reto activo en este momento.</p>`;
      return;
    }

    // 3. RETO ACTUAL (El primero de la lista)
    const retoActual = listaRetos[0];
    const retosPasados = listaRetos.slice(1);

    // Rellenar el proponente en la proclamación
    if (elProponente) {
      elProponente.textContent = retoActual.proponente || "un aventurero anónimo";
    }

    // Estado del reto actual para el usuario que inició sesión
    const esAceptado = retosAceptados.includes(retoActual.id);
    const esCompletado = retosCompletados.includes(retoActual.id);

    // Renderizar tarjeta del Reto Actual
    if (contenedorActual) {
      contenedorActual.innerHTML = `
        <div class="card-reto-actual">
          <div class="portada-frame">
            <img src="${retoActual.portada || '/img/default-reto.jpg'}" alt="${retoActual.titulo}" onerror="this.onerror=null; this.src='/img/default-reto.jpg';">
          </div>
          <div class="info-reto-actual">
            <h2>${retoActual.titulo || "Misión del Mes"}</h2>
            <p class="descripcion">${retoActual.descripcion || "Sin descripción proporcionada."}</p>
            <div class="meta-info">
              <span>📖 Libro asignado: <strong>${retoActual.libro || 'Libro del mes'}</strong></span>
              <span>🏆 Recompensa: <strong>+${retoActual.puntos || 0} Prestigio</strong></span>
            </div>

            <div class="acciones-reto">
              ${esCompletado ? `
                <div class="sello-completado grande">📜 RETO COMPLETADO</div>
              ` : `
                <button id="btn-aceptar" class="btn-magico ${esAceptado ? 'aceptado' : ''}" ${esAceptado ? 'disabled' : ''}>
                  ${esAceptado ? '⚔️ Reto Aceptado' : '🗡️ Aceptar Reto'}
                </button>
                <button id="btn-terminar" class="btn-magico exito" ${!esAceptado ? 'disabled' : ''}>
                  ✨ Marcar como Terminado
                </button>
              `}
            </div>
          </div>
        </div>
      `;

      // Eventos de interacción
      if (!esCompletado) {
        const btnAceptar = document.getElementById("btn-aceptar");
        const btnTerminar = document.getElementById("btn-terminar");

        if (btnAceptar && !esAceptado) {
          btnAceptar.addEventListener("click", () => aceptarReto(retoActual.id));
        }
        if (btnTerminar && esAceptado) {
          btnTerminar.addEventListener("click", () => terminarReto(retoActual.id, retoActual.puntos || 0));
        }
      }
    }

    // 4. RETOS PASADOS
    if (contenedorPasados) {
      contenedorPasados.innerHTML = "";

      if (retosPasados.length === 0) {
        contenedorPasados.innerHTML = `<p class="sin-datos">No hay retos pasados registrados.</p>`;
        return;
      }

      retosPasados.forEach((reto) => {
        const fueCompletado = retosCompletados.includes(reto.id);
        const item = document.createElement("div");
        item.className = "card-reto-pasado";
        item.innerHTML = `
          <div class="portada-miniatura">
            <img src="${reto.portada || '/img/default-reto.jpg'}" alt="${reto.titulo}" onerror="this.onerror=null; this.src='/img/default-reto.jpg';">
            ${fueCompletado ? `<div class="sello-completado mini">COMPLETADO</div>` : ''}
          </div>
          <div class="info-reto-pasado">
            <h3>${reto.titulo}</h3>
            <span class="proponente-pasado">Propuesto por: <strong>${reto.proponente || 'Anónimo'}</strong></span>
            <span class="estado-texto ${fueCompletado ? 'exito' : 'pendiente'}">
              ${fueCompletado ? '✅ Misión Cumplida' : '❌ No Logrado'}
            </span>
          </div>
        `;
        contenedorPasados.appendChild(item);
      });
    }

  } catch (error) {
    console.error("Error al cargar retos:", error);
  }
}

// Función para aceptar el reto
async function aceptarReto(retoId) {
  try {
    const userRef = doc(db, "aventureros", usuarioSesionId);
    await updateDoc(userRef, {
      retosAceptados: arrayUnion(retoId)
    });
    await cargarYRenderizarRetos();
  } catch (error) {
    console.error("Error al aceptar el reto:", error);
  }
}

// Función para completar el reto
async function terminarReto(retoId, puntos) {
  try {
    const userRef = doc(db, "aventureros", usuarioSesionId);
    const userSnap = await getDoc(userRef);
    const prestigioActual = userSnap.exists() ? (userSnap.data().prestigio || 0) : 0;

    await updateDoc(userRef, {
      retosCompletados: arrayUnion(retoId),
      prestigio: prestigioActual + puntos
    });

    await cargarYRenderizarRetos();
  } catch (error) {
    console.error("Error al marcar como terminado:", error);
  }
}