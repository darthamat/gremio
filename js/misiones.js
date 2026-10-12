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
let filtroActivo = "mes_actual"; // 'todas', 'mes_actual', 'en_curso', 'completadas'

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
  if (!contenedor) return;

  contenedor.innerHTML = `<p style="text-align: center; color: #f3e5ab; font-style: italic; width: 100%;">Examinando pergaminos en el tablón...</p>`;

  try {
    const querySnap = await getDocs(collection(db, "misionesSecundarias"));
    todasLasMisiones = [];

    querySnap.forEach(docSnap => {
      const data = docSnap.data();
      const fechaValida = data.fechaCreacion ? new Date(data.fechaCreacion) : new Date();
      
      todasLasMisiones.push({ 
        id: docSnap.id, 
        ...data,
        fechaCreacionObj: isNaN(fechaValida.getTime()) ? new Date() : fechaValida
      });
    });

    renderizarPestanasFiltros();
    renderizarMisionesFiltradas();

  } catch (error) {
    console.error("Error al cargar misiones:", error);
    contenedor.innerHTML = "<p style='color: #ff6b6b; text-align: center; width: 100%;'>Error al consultar los archivos del tablón.</p>";
  }
}

// Genera los 4 Botones Principales de Filtrado
function renderizarPestanasFiltros() {
  const contenedorCiclos = document.getElementById("contenedor-pestanas-ciclos");
  if (!contenedorCiclos) return;

  const html = `
    <button class="btn-ciclo ${filtroActivo === 'mes_actual' ? 'activo' : ''}" data-filtro="mes_actual">🗡️ Mes en Curso</button>
    <button class="btn-ciclo ${filtroActivo === 'en_curso' ? 'activo' : ''}" data-filtro="en_curso">⏳ Mis Misiones Aceptadas</button>
    <button class="btn-ciclo ${filtroActivo === 'completadas' ? 'activo' : ''}" data-filtro="completadas">📜 Histórico Completadas</button>
    <button class="btn-ciclo ${filtroActivo === 'todas' ? 'activo' : ''}" data-filtro="todas">🌍 Todas las Misiones</button>
  `;

  contenedorCiclos.innerHTML = html;

  contenedorCiclos.querySelectorAll(".btn-ciclo").forEach(btn => {
    btn.addEventListener("click", (e) => {
      filtroActivo = e.target.getAttribute("data-filtro");
      renderizarPestanasFiltros();
      renderizarMisionesFiltradas();
    });
  });
}

// Filtra y pinta las misiones según el botón seleccionado
function renderizarMisionesFiltradas() {
  const contenedor = document.getElementById("tablon-misiones-lista");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const fechaHoy = new Date();
  const mesActual = fechaHoy.getMonth();
  const anoActual = fechaHoy.getFullYear();

  let misionesAVisualizar = [];

  // Lógica de filtrado según la pestaña activa
  if (filtroActivo === "mes_actual") {
    misionesAVisualizar = todasLasMisiones.filter(m => {
      const f = m.fechaCreacionObj;
      return f.getMonth() === mesActual && f.getFullYear() === anoActual;
    });
  } else if (filtroActivo === "en_curso") {
    misionesAVisualizar = todasLasMisiones.filter(m => {
      const aceptados = m.usuariosAceptaron || [];
      const completados = m.usuariosCompletaron || [];
      return aceptados.includes(currentUserId) && !completados.includes(currentUserId);
    });
  } else if (filtroActivo === "completadas") {
    misionesAVisualizar = todasLasMisiones.filter(m => {
      const completados = m.usuariosCompletaron || [];
      return completados.includes(currentUserId);
    });

    // Ordenar de más reciente a más antiguo para el histórico
    misionesAVisualizar.sort((a, b) => b.fechaCreacionObj - a.fechaCreacionObj);
  } else {
    // 'todas'
    misionesAVisualizar = [...todasLasMisiones];
  }

  if (misionesAVisualizar.length === 0) {
    let msgVacio = "No hay contratos registrados en esta sección.";
    if (filtroActivo === "mes_actual") msgVacio = "No hay misiones secundarias creadas durante este mes.";
    if (filtroActivo === "en_curso") msgVacio = "No tienes expediciones aceptadas pendientes de terminar.";
    if (filtroActivo === "completadas") msgVacio = "Aún no has completado ninguna misión secundaria.";

    contenedor.innerHTML = `<p style="text-align: center; color: #f3e5ab; font-style: italic; grid-column: 1/-1;">${msgVacio}</p>`;
    return;
  }

  // Pinta las tarjetas de las misiones filtradas
  misionesAVisualizar.forEach(mision => {
    const usuariosCompletaron = mision.usuariosCompletaron || [];
    const completadoPorMi = usuariosCompletaron.includes(currentUserId);
    const yaUnido = (mision.usuariosAceptaron || []).includes(currentUserId);

    const card = document.createElement("div");
    card.className = `pergamino-card ${completadoPorMi ? 'completado' : ''}`;

    const titulo = mision.titulo || 'Misión sin título';
    const autor = mision.autor || 'Desconocido';
    const proclama = mision.proclama || mision.mensaje || mision.descripcion || 'Sin proclama específica';
    const paginas = Number(mision.paginas) || 0;
    const creadorNombre = mision.creadorNombre || userData?.nombre || 'Aventurero';
    const portadaUrl = mision.portadaUrl || 'https://via.placeholder.com/150x220?text=Sin+Portada';

    // Formatear mes y año de creación para el histórico
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const fechaTexto = `${meses[mision.fechaCreacionObj.getMonth()]} ${mision.fechaCreacionObj.getFullYear()}`;

    card.innerHTML = `
      <img src="${portadaUrl}" alt="${titulo}" style="width: 55px; height: 80px; object-fit: cover; border-radius: 3px; border: 1px solid #8b5a2b; flex-shrink: 0;" onerror="this.src='https://via.placeholder.com/150x220?text=Sin+Portada'">
      <div style="flex-grow: 1;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="word-break: break-word; margin: 0;">📜 ${titulo}</h3>
          <small style="font-size: 0.65rem; color: #8b5a2b; font-weight: bold;">${fechaTexto}</small>
        </div>
        <div class="detalles-completos">
          <p style="margin: 3px 0; font-size: 0.8rem;"><strong>Autor:</strong> ${autor}</p>
          <p style="margin: 3px 0; font-size: 0.75rem; font-style: italic; color: #5c4033;">«${proclama}»</p>
          <p style="margin: 3px 0; font-size: 0.7rem; color: #714624;">📄 ${paginas} págs | 👤 Creado por: ${creadorNombre}</p>
        </div>
        <div style="margin-top: 6px;">
          ${completadoPorMi ? `
            <span style="font-size: 0.75rem; font-weight: bold; color: #2e7d32; display: block; text-align: center;">✅ Expedición Conquistada</span>
          ` : `
            ${!yaUnido ? `
              <button class="btn-accion-tablon btn-unirse" data-id="${mision.id}">🗡️ Unirse a la Exploración</button>
            ` : `
              <span style="font-size: 0.75rem; font-weight: bold; color: #8b5a2b; display: block; text-align: center;">⏳ En curso (Termina en tu Perfil)</span>
            `}
          `}
        </div>
      </div>
    `;

    const btnUnirse = card.querySelector(".btn-unirse");
    if (btnUnirse) {
      btnUnirse.addEventListener("click", () => unirseAMisionPortal(mision.id));
    }

    contenedor.appendChild(card);
  });
}

// Unirse a un portal
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

  if (btnAbrir && modal) btnAbrir.addEventListener("click", () => modal.classList.remove("oculto"));
  if (btnCerrar && modal) btnCerrar.addEventListener("click", () => modal.classList.add("oculto"));

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const titulo = document.getElementById("mision-titulo").value.trim();
      const autor = document.getElementById("mision-autor").value.trim();
      const paginas = Number(document.getElementById("mision-paginas").value) || 100;
      const portadaUrl = document.getElementById("mision-portada-url").value.trim() || "";
      const proclama = document.getElementById("mision-proclama").value.trim();

      const nombreCreador = userData?.nombre || "Aventurero del Cónclave";

      try {
        await addDoc(collection(db, "misionesSecundarias"), {
          titulo,
          autor,
          paginas,
          portadaUrl,
          proclama,
          creadorId: currentUserId,
          creadorNombre: nombreCreador,
          activa: true,
          usuariosAceptaron: [currentUserId],
          usuariosCompletaron: [],
          fechaCreacion: new Date().toISOString()
        });

        alert("📜 ¡Nuevo contrato clavado en el tablón con éxito!");
        modal.classList.add("oculto");
        form.reset();
        await cargarTablonMisiones();
      } catch (err) {
        console.error("Error al crear contrato:", err);
        alert("❌ No se pudo clavar el contrato en el roble.");
      }
    });
  }
}