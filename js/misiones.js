// js/misiones.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { buscarEnGoogleBooks, limpiarSeleccionBuscador } from "./buscadorMisiones.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
let userData = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUserId = user.uid;
  const userSnap = await getDoc(doc(db, "aventureros", user.uid));
  userData = userSnap.exists() ? userSnap.data() : {};

  inicializarBuscadorYModal();
  await cargarTablonMisiones();
});

// Carga las misiones globales disponibles
async function cargarTablonMisiones() {
  const contenedor = document.getElementById("tablon-misiones-lista");
  if (!contenedor) return;

  contenedor.innerHTML = "<p>Cargando portales comunitarios...</p>";

  try {
    const querySnap = await getDocs(collection(db, "misionesSecundarias"));
    contenedor.innerHTML = "";

    if (querySnap.empty) {
      contenedor.innerHTML = "<p>No hay portales abiertos. ¡Abre el primero!</p>";
      return;
    }

    querySnap.forEach(docSnap => {
      const mision = docSnap.data();
      const misionId = docSnap.id;
      const numAventureros = (mision.usuariosAceptaron || []).length;
      const yaUnido = (mision.usuariosAceptaron || []).includes(currentUserId);

      const card = document.createElement("div");
      card.className = "mision-portal-card";
      card.innerHTML = `
        <img src="${mision.portadaUrl || 'https://via.placeholder.com/150x220'}" class="portal-portada" />
        <div class="portal-detalles">
          <h3>${mision.titulo}</h3>
          <p class="autor">Autor: ${mision.autor}</p>
          <p class="proclama">"${mision.proclama || 'Sin proclama'}"</p>
          <div class="portal-meta">
            <span>📖 ${mision.paginas} págs</span> | 
            <span>👥 ${numAventureros} Aventurero(s) en la expedición</span>
          </div>
          <p class="creador">Portal abierto por: <strong>${mision.creadorNombre || 'Anónimo'}</strong></p>
        </div>
        <div class="portal-accion">
          ${yaUnido 
            ? `<button class="btn-unido" disabled>🛡️ Ya estás en este Portal</button>`
            : `<button class="btn-unirse" data-id="${misionId}">⚔️ Unirse a la Exploración</button>`
          }
        </div>
      `;

      const btnUnirse = card.querySelector(".btn-unirse");
      if (btnUnirse) {
        btnUnirse.addEventListener("click", () => unirseAMisionPortal(misionId, mision));
      }

      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error("Error al cargar misiones:", error);
    contenedor.innerHTML = "<p>Error al cargar el tablón de misiones.</p>";
  }
}

// Función para unirse a un Portal
async function unirseAMisionPortal(misionId, misionData) {
  try {
    const userRef = doc(db, "aventureros", currentUserId);
    const misionRef = doc(db, "misionesSecundarias", misionId);

    const misionesActuales = userData.misionesSecundarias || [];
    
    // Añadir a Firestore global y a la lista local del usuario
    await updateDoc(misionRef, {
      usuariosAceptaron: arrayUnion(currentUserId)
    });

    const nuevaMisionLocal = {
      id: misionId,
      titulo: misionData.titulo,
      autor: misionData.autor,
      paginas: misionData.paginas,
      portadaUrl: misionData.portadaUrl,
      generos: misionData.generos || [misionData.genero],
      estado: "EN_PROGRESO",
      esGrupal: true
    };

    misionesActuales.push(nuevaMisionLocal);
    await updateDoc(userRef, { misionesSecundarias: misionesActuales });

    alert(`⚔️ ¡Te has unido a la exploración de "${misionData.titulo}"! Visita tu perfil para registrar tus avances.`);
    window.location.href = "perfil.html";

  } catch (error) {
    console.error("Error al unirse al portal:", error);
    alert("❌ No se pudo unir al portal.");
  }
}

// Publicar un nuevo Portal de Lectura
function inicializarBuscadorYModal() {
  const formModal = document.getElementById("form-crear-portal");
  const inputBuscar = document.getElementById("input-buscar-libro");
  const btnBuscar = document.getElementById("btn-ejecutar-busqueda");
  const contenedorResultados = document.getElementById("resultados-busqueda-libros");

  if (btnBuscar && inputBuscar) {
    btnBuscar.addEventListener("click", (e) => {
      e.preventDefault();
      buscarEnGoogleBooks(inputBuscar.value, contenedorResultados);
    });
  }

  if (formModal) {
    formModal.addEventListener("submit", async (e) => {
      e.preventDefault();

      const titulo = document.getElementById("mision-titulo").value.trim();
      const autor = document.getElementById("mision-autor").value.trim();
      const paginas = parseInt(document.getElementById("mision-paginas").value, 10) || 0;
      const proclama = document.getElementById("mision-proclama").value.trim();
      const portadaUrl = document.getElementById("mision-portada-url")?.value || "https://via.placeholder.com/150x220";

      const generosChecked = Array.from(document.querySelectorAll('input[name="genero"]:checked')).map(cb => cb.value);

      const nuevaMisionData = {
        titulo,
        autor,
        paginas,
        proclama,
        generos: generosChecked.length ? generosChecked : ["Fantasía"],
        portadaUrl,
        creadorId: currentUserId,
        creadorNombre: userData.nombre || "Aventurero",
        activa: true,
        usuariosAceptaron: [currentUserId],
        fechaCreacion: new Date().toISOString()
      };

      try {
        const docRef = await addDoc(collection(db, "misionesSecundarias"), nuevaMisionData);
        
        // Auto-unir al creador
        const misionesActuales = userData.misionesSecundarias || [];
        misionesActuales.push({
          id: docRef.id,
          titulo,
          autor,
          paginas,
          portadaUrl,
          generos: nuevaMisionData.generos,
          estado: "EN_PROGRESO",
          esGrupal: true
        });

        await updateDoc(doc(db, "aventureros", currentUserId), {
          misionesSecundarias: misionesActuales
        });

        alert("✨ ¡Portal de Lectura Abierto! Ahora otros aventureros pueden unirse a tu expedición.");
        limpiarSeleccionBuscador();
        location.reload();

      } catch (err) {
        console.error(err);
        alert("❌ Ocurrió un error al crear el portal.");
      }
    });
  }
}