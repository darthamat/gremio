// js/buscadorGremio.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, setDoc, writeBatch 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

// 🔗 Importación desde tu archivo exacto rasgosData.js
import { BANCO_HUELLAS } from "./rasgosData.js";

const auth = getAuth(app);
const db = getFirestore(app);

const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
const PORTADA_DEFAULT = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400";

let currentUser = null;
let esAdmin = false;
let generosSeleccionados = new Set();
let listaRasgos = [];
let listaCicatrices = [];
let mapaGenerosGlobal = {};

function generarLibroId(titulo) {
  return titulo
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function obtenerIdMesActual() {
  const fecha = new Date();
  const yy = String(fecha.getFullYear()).slice(-2);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  return `reto${yy}_${mm}`;
}

export function inicializarBuscadorGremio() {
  inyectarModalHTML();
  
  onAuthStateChanged(auth, async (user) => {
    if (!user) return;
    currentUser = user;
    
    const userDoc = await getDoc(doc(db, "aventureros", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      esAdmin = data.rol === "admin" || data.rol === "Archimago";
    }
    
    configurarInterfaz();
    await inicializarSelectorGeneros();
  });

  vincularEventosDOM();
}

export function abrirBuscadorGremio() {
  const modal = document.getElementById("modal-buscador-gremio");
  if (modal) modal.style.display = "block";
}

function cerrarBuscadorGremio() {
  const modal = document.getElementById("modal-buscador-gremio");
  if (modal) modal.style.display = "none";
}

function configurarInterfaz() {
  const tituloModal = document.getElementById("gb-titulo-modal");
  const btnSubmit = document.getElementById("gb-btn-submit");
  
  if (esAdmin) {
    if (tituloModal) tituloModal.textContent = "⚔️ Crear Reto Mensual (Modo Admin)";
    if (btnSubmit) btnSubmit.textContent = "📜 Publicar Reto Mensual";
  } else {
    if (tituloModal) tituloModal.textContent = "🗺️ Aceptar Nueva Misión Secundaria de Lectura";
    if (btnSubmit) btnSubmit.textContent = "⚔️ Aceptar Misión Secundaria";
  }
}

function inyectarModalHTML() {
  if (document.getElementById("modal-buscador-gremio")) return;

  const modalHTML = `
  <div id="modal-buscador-gremio" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; overflow-y:auto;">
    <div style="max-width:680px; margin:40px auto; background:#f3e5ab; border:4px solid #8b5a2b; padding:20px; border-radius:8px; color:#3b2219; position:relative;">
      <span id="gb-cerrar-modal" style="position:absolute; right:15px; top:10px; font-size:28px; cursor:pointer; font-weight:bold;">&times;</span>
      
      <h2 id="gb-titulo-modal" style="margin-top:0; border-bottom:2px solid #8b5a2b; padding-bottom:8px;">📜 Buscador de Obras del Gremio</h2>

      <!-- BUSCADOR -->
      <div style="margin-bottom:15px; position:relative;">
        <label style="font-weight:bold; display:block; margin-bottom:5px;">🔍 Buscar en Google Books:</label>
        <div style="display:flex; gap:8px;">
          <input type="text" id="gb-input-buscar" placeholder="Título o autor..." style="flex:1; padding:8px; border:2px solid #5a3a1a; background:#fff8e7;">
          <button type="button" id="gb-btn-buscar" style="background:#8b5a2b; color:white; border:1px solid #d4af37; padding:8px 12px; cursor:pointer; font-weight:bold;">Buscar</button>
        </div>
        <div id="gb-resultados-busqueda" style="display:none; position:absolute; top:100%; left:0; right:0; max-height:200px; overflow-y:auto; background:#2a221b; color:#fff8e7; border:2px solid #8b5a2b; z-index:100;"></div>
      </div>

      <form id="gb-form-libro">
        <div style="margin-bottom:10px;">
          <label style="font-weight:bold; display:block;">Título:</label>
          <input type="text" id="gb-titulo" required style="width:100%; padding:8px; border:2px solid #5a3a1a; background:#fff8e7;">
        </div>

        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <div style="flex:1;">
            <label style="font-weight:bold; display:block;">Autor:</label>
            <input type="text" id="gb-autor" required style="width:100%; padding:8px; border:2px solid #5a3a1a; background:#fff8e7;">
          </div>
          <div style="width:120px;">
            <label style="font-weight:bold; display:block;">Páginas:</label>
            <input type="number" id="gb-paginas" min="1" required style="width:100%; padding:8px; border:2px solid #5a3a1a; background:#fff8e7;">
          </div>
        </div>

        <div style="margin-bottom:10px;">
          <label style="font-weight:bold; display:block;">Descripción / Sinopsis:</label>
          <textarea id="gb-descripcion" rows="3" required style="width:100%; padding:8px; border:2px solid #5a3a1a; background:#fff8e7;"></textarea>
        </div>

        <!-- SECCIÓN GÉNEROS -->
        <div style="margin-bottom:15px; border:1px solid #8b5a2b; padding:10px; background:rgba(139,90,43,0.1);">
          <label style="font-weight:bold; display:block;">Géneros Literarios:</label>
          <div id="gb-generos-tags" style="min-height:30px; margin:5px 0;"></div>
          
          <select id="gb-select-generos" style="width:100%; padding:8px; margin-bottom:8px; border:1px solid #5a3a1a; background:#fff8e7;">
            <option value="">Cargando géneros...</option>
          </select>
        </div>

        <!-- PORTADA -->
        <div style="margin-bottom:15px;">
          <label style="font-weight:bold; display:block;">URL de Portada:</label>
          <input type="text" id="gb-portada-url" style="width:100%; padding:8px; border:2px solid #5a3a1a; background:#fff8e7;">
          <img id="gb-preview-portada" style="max-width:90px; display:none; margin-top:8px; border:1px solid #8b5a2b;">
        </div>

        <!-- RASGOS Y CICATRICES SUGERIDOS -->
        <div style="border:2px dashed #8b5a2b; padding:10px; margin-bottom:15px; background:rgba(255,255,255,0.4);">
          <label style="font-weight:bold;">🎭 Rasgos y Cicatrices a Obtener:</label>
          <div id="gb-container-rasgos" style="margin-top:5px;"></div>
          <div id="gb-container-cicatrices" style="margin-top:5px;"></div>
        </div>

        <button type="submit" id="gb-btn-submit" style="width:100%; background:#8b5a2b; color:white; font-weight:bold; padding:12px; border:2px solid #d4af37; cursor:pointer; font-size:1.05rem;">
          ⚔️ Aceptar Misión Secundaria
        </button>
      </form>

      <div id="gb-mensaje-estado" style="text-align:center; margin-top:10px; font-weight:bold;"></div>
    </div>
  </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

function vincularEventosDOM() {
  document.getElementById("gb-cerrar-modal")?.addEventListener("click", cerrarBuscadorGremio);
  document.getElementById("gb-btn-buscar")?.addEventListener("click", buscarGoogleBooks);
  
  document.getElementById("gb-form-libro")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    await guardarLectura();
  });
}

async function inicializarSelectorGeneros() {
  const select = document.getElementById("gb-select-generos");
  if (!select) return;

  const docRef = doc(db, "configuracion", "generos");
  const snap = await getDoc(docRef);
  mapaGenerosGlobal = snap.exists() ? snap.data().mapaGeneros : { fantasia: { nombre: "Fantasía", padre: "fantasia" } };

  select.innerHTML = '<option value="">-- Añadir un género --</option>';
  Object.keys(mapaGenerosGlobal).forEach(key => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = mapaGenerosGlobal[key].nombre;
    select.appendChild(opt);
  });

  select.onchange = (e) => {
    if (e.target.value) {
      generosSeleccionados.add(e.target.value);
      renderizarTagsGeneros();
      actualizarHuellas();
      e.target.value = "";
    }
  };
}

function renderizarTagsGeneros() {
  const container = document.getElementById("gb-generos-tags");
  container.innerHTML = "";
  generosSeleccionados.forEach(key => {
    const info = mapaGenerosGlobal[key] || { nombre: key };
    const tag = document.createElement("span");
    tag.style.cssText = "background:#3b2219; color:#f3e5ab; padding:3px 8px; border-radius:12px; margin:2px; display:inline-block; font-size:0.85rem;";
    tag.innerHTML = `📚 ${info.nombre} <b style="color:#ff6b6b; cursor:pointer;">&times;</b>`;
    tag.querySelector("b").onclick = () => {
      generosSeleccionados.delete(key);
      renderizarTagsGeneros();
      actualizarHuellas();
    };
    container.appendChild(tag);
  });
}

/**
 * Extrae limpiamente el nombre del rasgo/cicatriz desde el objeto o string dentro de BANCO_HUELLAS
 */
function obtenerNombreHuella(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  // Extrae el nombre del objeto importado desde BANCO_HUELLAS
  return item.nombre || item.nombreRasgo || item.titulo || item.id || "";
}

function actualizarHuellas() {
  listaRasgos = [];
  listaCicatrices = [];

  generosSeleccionados.forEach(key => {
    const info = mapaGenerosGlobal[key];
    const padre = info ? info.padre : key;

    // Buscar en BANCO_HUELLAS por género o categoría
    if (BANCO_HUELLAS && BANCO_HUELLAS[padre]) {
      const datosGenero = BANCO_HUELLAS[padre];
      
      if (datosGenero.rasgos) {
        datosGenero.rasgos.forEach(r => { 
          const nombre = obtenerNombreHuella(r);
          if (nombre && !listaRasgos.includes(nombre)) listaRasgos.push(nombre); 
        });
      }
      if (datosGenero.cicatrices) {
        datosGenero.cicatrices.forEach(c => { 
          const nombre = obtenerNombreHuella(c);
          if (nombre && !listaCicatrices.includes(nombre)) listaCicatrices.push(nombre); 
        });
      }
    }
  });

  // Renderizado limpio de los nombres
  document.getElementById("gb-container-rasgos").innerHTML = listaRasgos.length > 0
    ? listaRasgos.map(r => `<span style="background:#2e7d32; color:white; padding:3px 8px; border-radius:4px; margin:2px; font-size:0.85rem; display:inline-block;">✨ ${r}</span>`).join("")
    : "<small style='color:#666;'>Selecciona un género con rasgos asignados.</small>";

  document.getElementById("gb-container-cicatrices").innerHTML = listaCicatrices.length > 0
    ? listaCicatrices.map(c => `<span style="background:#c62828; color:white; padding:3px 8px; border-radius:4px; margin:2px; font-size:0.85rem; display:inline-block;">👁️ ${c}</span>`).join("")
    : "";
}

async function buscarGoogleBooks() {
  const query = document.getElementById("gb-input-buscar").value.trim();
  const divRes = document.getElementById("gb-resultados-busqueda");
  if (!query) return;

  divRes.style.display = "block";
  divRes.innerHTML = "<div style='padding:8px;'>⏳ Buscando en Google Books...</div>";

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=4&key=${GOOGLE_BOOKS_API_KEY}`);
    const data = await res.json();
    
    divRes.innerHTML = "";
    if (!data.items) {
      divRes.innerHTML = "<div style='padding:8px;'>No se encontraron resultados.</div>";
      return;
    }

    data.items.forEach(item => {
      const info = item.volumeInfo;
      const img = info.imageLinks?.thumbnail?.replace("http://", "https://") || PORTADA_DEFAULT;
      
      const div = document.createElement("div");
      div.style.cssText = "padding:6px; border-bottom:1px solid #444; cursor:pointer; display:flex; gap:8px; align-items:center;";
      div.innerHTML = `<img src="${img}" style="width:30px; height:40px; object-fit:cover;"> <div><b>${info.title}</b><br><small>${info.authors ? info.authors.join(", ") : "Autor desconocido"}</small></div>`;
      
      div.onclick = () => {
        document.getElementById("gb-titulo").value = info.title || "";
        document.getElementById("gb-autor").value = info.authors ? info.authors.join(", ") : "";
        document.getElementById("gb-paginas").value = info.pageCount || 150;
        document.getElementById("gb-descripcion").value = info.description ? info.description.slice(0, 250) + "..." : "";
        document.getElementById("gb-portada-url").value = img;
        
        const prev = document.getElementById("gb-preview-portada");
        prev.src = img;
        prev.style.display = "block";
        divRes.style.display = "none";
      };
      divRes.appendChild(div);
    });
  } catch (err) {
    divRes.innerHTML = "<div style='padding:8px;'>Error al consultar la API.</div>";
  }
}

async function guardarLectura() {
  if (!currentUser) return;
  
  const mensaje = document.getElementById("gb-mensaje-estado");
  const btn = document.getElementById("gb-btn-submit");
  
  const titulo = document.getElementById("gb-titulo").value.trim();
  const autor = document.getElementById("gb-autor").value.trim();
  const paginas = Number(document.getElementById("gb-paginas").value) || 100;
  const descripcion = document.getElementById("gb-descripcion").value.trim();
  const portadaUrl = document.getElementById("gb-portada-url").value || PORTADA_DEFAULT;
  const arrayGeneros = Array.from(generosSeleccionados);

  if (arrayGeneros.length === 0) {
    alert("Selecciona al menos un género.");
    return;
  }

  btn.disabled = true;
  mensaje.textContent = "⏳ Aceptando Misión Secundaria...";

  try {
    const libroId = generarLibroId(titulo);
    const idHistorico = obtenerIdMesActual();
    const xpCalculada = paginas + 100;

    if (esAdmin) {
      // Modo Admin: Crea el Reto Principal Colectivo
      const batch = writeBatch(db);
      const datosReto = { 
        titulo, 
        autor, 
        paginas, 
        descripcion, 
        portadaUrl, 
        generos: arrayGeneros, 
        genero: arrayGeneros[0], 
        rasgosOtorga: listaRasgos, 
        cicatricesOtorga: listaCicatrices, 
        fechaCreacion: Date.now() 
      };
      
      batch.set(doc(db, "retos", "actual"), datosReto);
      batch.set(doc(db, "retos", idHistorico), datosReto);
      batch.set(doc(db, "biblioteca", libroId), { ...datosReto, esReto: true }, { merge: true });
      await batch.commit();

      mensaje.textContent = "✅ ¡Reto Mensual Publicado!";
    } else {
      // Modo Aventurero: Registra la Misión Secundaria Activa (Estado: en_progreso)
      const misionData = {
        id: libroId,
        titulo, 
        autor, 
        paginas, 
        genero: arrayGeneros[0], 
        generos: arrayGeneros, 
        portadaUrl, 
        descripcion, 
        estado: "en_progreso", 
        progresoPaginas: 0,
        xpRecompensa: xpCalculada,
        rasgosPrometidos: listaRasgos,
        cicatricesPrometidas: listaCicatrices,
        fechaInicio: Date.now()
      };

      // Guardado directo en la subcolección de misiones secundarias del usuario
      await setDoc(
        doc(db, "aventureros", currentUser.uid, "misionesSecundarias", libroId), 
        misionData
      );

      mensaje.textContent = `⚔️ ¡Misión Aceptada! Ganarás +${xpCalculada} XP al completarla.`;
    }

    setTimeout(() => {
      cerrarBuscadorGremio();
      mensaje.textContent = "";
      btn.disabled = false;
    }, 1500);

  } catch (err) {
    console.error(err);
    mensaje.textContent = "❌ Error al guardar la misión.";
    btn.disabled = false;
  }
}