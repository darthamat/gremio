// js/misiones.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
let userData = null;
let todasLasMisiones = [];
let cicloActivo = "todos"; // 'todos' o un formato 'YYYY-MM'

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUserId = user.uid;
  const userSnap = await getDoc(doc(db, "aventureros", user.uid));
  userData = userSnap.exists() ? userSnap.data() : {};

  inicializarModalCreacion();
  await cargarTablonMisiones();
});

// Carga todas las misiones del tablón global
async function cargarTablonMisiones() {
  const contenedor = document.getElementById("tablon-misiones-lista");
  const contenedorCiclos = document.getElementById("contenedor-pestanas-ciclos");
  if (!contenedor) return;

  contenedor.innerHTML = `<p style="text-align: center; color: #f3e5ab; font-style: italic;">Examinando pergaminos en el tablón...</p>`;

  try {
    const querySnap = await getDocs(collection(db, "misionesSecundarias"));
    todasLasMisiones = [];

    querySnap.forEach(docSnap => {
      todasLasMisiones.push({ id: docSnap.id, ...docSnap.data() });
    });

    renderizarPestanasCiclos();
    renderizarPergaminosFiltrados();

  } catch (error) {
    console.error("Error al cargar misiones:", error);
    contenedor.innerHTML = "<p style='color: #ff6b6b; text-align: center;'>Error al consultar los archivos del tablón.</p>";
  }
}

// Genera las pestañas superiores agrupadas por Año y Mes según la fecha de creación
function renderizarPestanasCiclos() {
  const contenedorCiclos = document.getElementById("contenedor-pestanas-ciclos");
  if (!contenedorCiclos) return;

  const ciclosSet = new Set();
  todasLasMisiones.forEach(m => {
    const fecha = m.fechaCreacion ? new Date(m.fechaCreacion) : new Date();
    const ano = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    ciclosSet.add(`${ano}-${mes}`);
  });

  const ciclosOrdenados = Array.from(ciclosSet).sort().reverse();

  let html = `<button class="btn-ciclo ${cicloActivo === 'todos' ? 'activo' : ''}" data-ciclo="todos">📜 Todos</button>`;
  
  const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  ciclosOrdenados.forEach(ciclo => {
    const [ano, mes] = ciclo.split("-");
    const nombreMes = mesesNombres[parseInt(mes, 10) - 1];
    html += `<button class="btn-ciclo ${cicloActivo === ciclo ? 'activo' : ''}" data-ciclo="${ciclo}">${nombreMes} ${ano}</button>`;
  });

  contenedorCiclos.innerHTML = html;

  contenedorCiclos.querySelectorAll(".btn-ciclo").forEach(btn => {
    btn.addEventListener("click", (e) => {
      cicloActivo = e.target.getAttribute("data-ciclo");
      renderizarPestanasCiclos();
      renderizarPergaminosFiltrados();
    });
  });
}

// Filtra y pinta los pergaminos en el tablón
function renderizarPergaminosFiltrados() {
  const contenedor = document.getElementById("tablon-misiones-lista");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const misionFiltradas = todasLasMisiones.filter(m => {
    if (cicloActivo === "todos") return true;
    const fecha = m.fechaCreacion ? new Date(m.fechaCreacion) : new Date();
    const ano = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}` === cicloActivo;
  });

  if (misionFiltradas.length === 0) {
    contenedor.innerHTML = `<p style="text-align: center; color: #f3e5ab; font-style: italic; grid-column: 1/-1;">No hay contratos clavados en este periodo temporal.</p>`;
    return;
  }

  misionFiltradas.forEach(mision => {
    const usuariosCompletaron = mision.usuariosCompletaron || [];
    const completadoPorMi = usuariosCompletaron.includes(currentUserId);
    const yaUnido = (mision.usuariosAceptaron || []).includes(currentUserId);

    const card = document.createElement("div");
    // Si ya está completado, se añade la clase 'completado' (efecto pergamino enrollado / recortado)
    card.className = `pergamino-card ${completadoPorMi ? 'completado' : ''}`;

    card.innerHTML = `
      <h3>📜 ${mision.titulo}</h3>
      <div class="detalles-completos">
        <p style="margin: 4px 0; font-size: 0.85rem;"><strong>Autor:</strong> ${mision.autor || 'Desconocido'}</p>
        <p style="margin: 4px 0; font-size: 0.80rem; font-style: italic; color: #5c4033;">«${mision.proclama || 'Sin proclama específica'}»</p>
        <p style="margin: 4px 0; font-size: 0.75rem; color: #714624;">📄 ${mision.paginas || 0} págs | 👤 Creado por: ${mision.creadorNombre || 'Aventurero'}</p>
      </div>

      <div style="margin-top: 8px;">
        ${completadoPorMi ? `
          <span style="font-size: 0.75rem; font-weight: bold; color: #2e7d32; display: block; text-align: center;">✅ Expedición Completada</span>
        ` : `
          ${!yaUnido ? `
            <button class="btn-accion-tablon btn-unirse" data-id="${mision.id}">🗡️ Unirse a la Exploración</button>
          ` : `
            <span style="font-size: 0.75rem; font-weight: bold; color: #8b5a2b; display: block; text-align: center;">⏳ En curso (Termina en tu Perfil)</span>
          `}
        `}
      </div>
    `;

    const btnUnirse = card.querySelector(".btn-unirse");
    if (btnUnirse) {
      btnUnirse.addEventListener("click", () => unirseAMisionPortal(mision.id));
    }

    contenedor.appendChild(card);
  });
}

// Unirse a un portal desde el tablón
async function unirseAMisionPortal(misionId) {
  try {
    const misionRef = doc(db, "misionesSecundarias", misionId);
    await updateDoc(misionRef, {
      usuariosAceptaron: arrayUnion(currentUserId)
    });

    alert("⚔️ ¡Te has unido a la expedición! El contrato ha sido marcado. Para darlo por terminado y enfrentarte al calabozo, visita tu Perfil.");
    await cargarTablonMisiones();
  } catch (error) {
    console.error("Error al unirse a la misión:", error);
    alert("❌ No se pudo firmar el contrato.");
  }
}

// Control del modal para crear un nuevo contrato
function inicializarModalCreacion() {
  const modal = document.getElementById("modal-buscador-mision");
  const btnAbrir = document.getElementById("btn-abrir-buscador-mision");
  const btnCerrar = document.getElementById("btn-cerrar-modal-mision");
  const form = document.getElementById("form-crear-portal");

  if (btnAbrir && modal) btnAbrir.addEventListener("click", () => modal.style.display = "flex");
  if (btnCerrar && modal) btnCerrar.addEventListener("click", () => modal.style.display = "none");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titulo = document.getElementById("mision-titulo").value.trim();
      const autor = document.getElementById("mision-autor").value.trim();
      const paginas = Number(document.getElementById("mision-paginas").value) || 100;
      const proclama = document.getElementById("mision-proclama").value.trim();

      try {
        await addDoc(collection(db, "misionesSecundarias"), {
          titulo,
          autor,
          paginas,
          proclama,
          creadorId: currentUserId,
          creadorNombre: userData.nombre || "Aventurero",
          activa: true,
          usuariosAceptaron: [currentUserId],
          usuariosCompletaron: [],
          fechaCreacion: new Date().toISOString()
        });

        alert("📜 ¡Nuevo contrato clavado en el tablón con éxito!");
        modal.style.display = "none";
        form.reset();
        await cargarTablonMisiones();
      } catch (err) {
        console.error("Error al crear contrato:", err);
        alert("❌ No se pudo clavar el contrato en el roble.");
      }
    });
  }
}