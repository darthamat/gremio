// js/buscadorGremio.js  
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";  
import {   
  getFirestore, doc, getDoc, setDoc, writeBatch   
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";  
import { app } from "./firebase-config.js";  
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
  const modal = document.getElementById("modal-buscador-mision");  
  if (modal) modal.classList.remove("oculto");  
}  
  
function cerrarBuscadorGremio() {  
  const modal = document.getElementById("modal-buscador-mision");  
  if (modal) modal.classList.add("oculto");  
}  
  
function configurarInterfaz() {  
  const tituloModal = document.querySelector("#modal-buscador-mision h2");  
  const btnSubmit = document.getElementById("btn-guardar-mision-libre");  
    
  if (esAdmin) {  
    if (tituloModal) tituloModal.textContent = "⚔️ Crear Reto Mensual (Modo Admin)";  
    if (btnSubmit) btnSubmit.textContent = "📜 Publicar Reto Mensual";  
  } else {  
    if (tituloModal) tituloModal.textContent = "📜 Registrar Lectura Libre / Misión";  
    if (btnSubmit) btnSubmit.textContent = "💾 Registrar Misión en el Grimorio";  
  }  
}  
  
let eventosVinculados = false;  
  
function vincularEventosDOM() {  
  if (eventosVinculados) return;  
  eventosVinculados = true;  
  
  // Delegación de eventos global usando los IDs reales de perfil.html
  document.addEventListener("click", (e) => {  
    if (e.target && e.target.id === "btn-ejecutar-busqueda") {  
      e.preventDefault();  
      ejecutarBusquedaGoogleBooks();  
    }  
      
    if (e.target && e.target.id === "btn-cerrar-modal-mision") {  
      cerrarBuscadorGremio();  
    }  
  });  
  
  document.addEventListener("keydown", (e) => {  
    if (e.target && e.target.id === "input-buscar-libro" && e.key === "Enter") {  
      e.preventDefault();  
      ejecutarBusquedaGoogleBooks();  
    }  
  });  
}  
  
async function inicializarSelectorGeneros() {  
  const select = document.getElementById("select-generos-mision");  
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
  const container = document.getElementById("generos-tags-contenedor-mision");  
  if (!container) return;  
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
  
function obtenerNombreHuella(item) {  
  if (!item) return "";  
  if (typeof item === "string") return item;  
  return item.nombre || item.nombreRasgo || item.titulo || item.id || "";  
}  
  
function actualizarHuellas() {  
  listaRasgos = [];  
  listaCicatrices = [];  
  
  generosSeleccionados.forEach(key => {  
    const info = mapaGenerosGlobal[key];  
    const padre = info ? info.padre : key;  
  
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
  
  const containerRasgos = document.getElementById("container-rasgos-mision");  
  const containerCicatrices = document.getElementById("container-cicatrices-mision");  
  
  if (containerRasgos) {  
    containerRasgos.innerHTML = listaRasgos.length > 0  
      ? listaRasgos.map(r => `<span style="background:#2e7d32; color:white; padding:3px 8px; border-radius:4px; margin:2px; font-size:0.85rem; display:inline-block;">✨ ${r}</span>`).join("")  
      : "<small style='color:#666;'>Selecciona un género con rasgos asignados.</small>";  
  }  
  
  if (containerCicatrices) {  
    containerCicatrices.innerHTML = listaCicatrices.length > 0  
      ? listaCicatrices.map(c => `<span style="background:#c62828; color:white; padding:3px 8px; border-radius:4px; margin:2px; font-size:0.85rem; display:inline-block;">👁️ ${c}</span>`).join("")  
      : "";  
  }  
}  
  
async function ejecutarBusquedaGoogleBooks() {  
  const input = document.getElementById("input-buscar-libro");  
  const contenedorResultados = document.getElementById("resultados-busqueda-libros");  
    
  if (!input || !contenedorResultados) return;  
    
  const query = input.value.trim();  
  if (!query) return;  
  
  contenedorResultados.style.display = "block";  
  contenedorResultados.innerHTML = "<div style='padding: 8px;'>⏳ Buscando en los archivos del reino...</div>";  
  
  try {  
    const respuesta = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=4&key=${GOOGLE_BOOKS_API_KEY}`);  
    const datos = await respuesta.json();  
  
    contenedorResultados.innerHTML = "";  
  
    if (!datos.items || datos.items.length === 0) {  
      contenedorResultados.innerHTML = "<div style='padding: 8px;'>No se han hallado obras con ese título.</div>";  
      return;  
    }  
  
    datos.items.forEach(item => {  
      const info = item.volumeInfo;  
      const titulo = info.title || "Sin título";  
      const autor = info.authors ? info.authors.join(", ") : "Autor desconocido";  
      const paginas = info.pageCount || 150;  
      const descripcion = info.description ? info.description.slice(0, 250) + "..." : "";  
      const portada = info.imageLinks?.thumbnail?.replace("http://", "https://") || PORTADA_DEFAULT;  
  
      const divOpcion = document.createElement("div");  
      divOpcion.style.cssText = "padding: 8px; border-bottom: 1px solid #8b5a2b; cursor: pointer; display: flex; gap: 10px; align-items: center; background: #fff8e7; color: #3b2219;";  
      divOpcion.innerHTML = `  
        <img src="${portada}" style="width: 30px; height: 45px; object-fit: cover;">  
        <div>  
          <strong>${titulo}</strong><br><small>${autor} (${paginas} pág.)</small>  
        </div>  
      `;  
  
      divOpcion.addEventListener("click", () => {  
        document.getElementById("titulo-mision").value = titulo;  
        document.getElementById("autor-mision").value = autor;  
        document.getElementById("paginas-mision").value = paginas;  
        document.getElementById("proclama-mision").value = descripcion;  
        document.getElementById("portada-mision-url").value = portada;  
          
        const prev = document.getElementById("preview-portada-mision");  
        if (prev) {  
          prev.src = portada;  
          prev.style.display = "block";  
        }  
  
        contenedorResultados.style.display = "none";  
        contenedorResultados.innerHTML = "";  
      });  
  
      contenedorResultados.appendChild(divOpcion);  
    });  
  
  } catch (error) {  
    console.error("Error al consultar Google Books:", error);  
    contenedorResultados.innerHTML = "<div style='padding: 8px; color: #ff8080;'>Error al conectar con los tomos mágicos.</div>";  
  }  
}