import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, writeBatch } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "js/firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// 🔑 CONFIGURACIÓN
const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0"; // Coloca tu clave aquí
const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
const CLOUDINARY_UPLOAD_PRESET = "portadas";

// Configuración predeterminada de rasgos/cicatrices por género
const HUELLAS_POR_GENERO = {
  fantasia: { rasgos: ["Visión Esotérica", "Voluntad Inquebrantable"], cicatrices: ["Fascinación Prohibida"] },
  terror: { rasgos: ["Coraje Templado"], cicatrices: ["Susurro de la Cordura", "Miedo Ancestral"] },
  clasicos: { rasgos: ["Elocuencia Antigua", "Sabiduría Epistolar"], cicatrices: ["Melancolía Crónica"] },
  filosofia: { rasgos: ["Lógica Afilada", "Pensamiento Crítico"], cicatrices: ["Parálisis Duda"] },
  historica: { rasgos: ["Estrategia Militar", "Memoria de Eras"], cicatrices: ["Fatiga de Guerra"] },
  ciencia_ficcion: { rasgos: ["Ingeniería Mental", "Mente Tecnológica"], cicatrices: ["Disonancia Futurista"] }
};

// Elementos DOM
const form = document.getElementById("form-crear-reto");
const mensajeEstado = document.getElementById("mensaje-estado");
const btnSubmit = document.getElementById("btn-submit");
const inputBuscarGB = document.getElementById("buscarLibro");
const btnBuscarGB = document.getElementById("btn-buscar-gb");
const divResultadosGB = document.getElementById("resultados-busqueda");
const previewPortada = document.getElementById("preview-portada");
const inputPortadaGB = document.getElementById("portadaUrlGB");
const selectGenero = document.getElementById("genero");

// Arreglos de estado para rasgos/cicatrices
let listaRasgos = [];
let listaCicatrices = [];

// Helper ID mes
function obtenerIdMesActual() {
  const fecha = new Date();
  const yy = String(fecha.getFullYear()).slice(-2);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  return `reto${yy}_${mm}`;
}

// 1. Verificación de Seguridad
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  const userDoc = await getDoc(doc(db, "aventureros", user.uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    if (userData.rol !== "admin" && userData.rol !== "Archimago") {
      alert("No tienes permisos de administrador.");
      window.location.href = "retos.html";
    }
  }
});

// 2. Buscador de Google Books API
btnBuscarGB.addEventListener("click", buscarEnGoogleBooks);
inputBuscarGB.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    buscarEnGoogleBooks();
  }
});

async function buscarEnGoogleBooks() {
  const query = inputBuscarGB.value.trim();
  if (!query) return;

  divResultadosGB.style.display = "block";
  divResultadosGB.innerHTML = "<div class='item-resultado'>⏳ Buscando libros...</div>";

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      divResultadosGB.innerHTML = "<div class='item-resultado'>No se encontraron resultados.</div>";
      return;
    }

    divResultadosGB.innerHTML = "";
    data.items.forEach(item => {
      const info = item.volumeInfo;
      const div = document.createElement("div");
      div.className = "item-resultado";
      div.innerHTML = `<strong>${info.title}</strong> - ${info.authors ? info.authors.join(", ") : "Autor desconocido"}`;
      div.addEventListener("click", () => seleccionarLibroGB(info));
      divResultadosGB.appendChild(div);
    });
  } catch (error) {
    console.error("Error al consultar Google Books API:", error);
    divResultadosGB.innerHTML = "<div class='item-resultado'>❌ Error en la búsqueda.</div>";
  }
}

// 3. Autocompletar Formulario desde Google Books
function seleccionarLibroGB(info) {
  document.getElementById("titulo").value = info.title || "";
  document.getElementById("autor").value = info.authors ? info.authors.join(", ") : "";
  document.getElementById("paginas").value = info.pageCount || 100;
  
  if (info.description) {
    document.getElementById("descripcion").value = info.description.slice(0, 300) + "...";
  }

  // Cargar Portada de Google Books
  if (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) {
    const urlImagen = (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail).replace("http://", "https://");
    inputPortadaGB.value = urlImagen;
    previewPortada.src = urlImagen;
    previewPortada.style.display = "block";
  } else {
    inputPortadaGB.value = "";
    previewPortada.style.display = "none";
  }

  // Detección aproximada de género
  if (info.categories && info.categories.length > 0) {
    const cat = info.categories[0].toLowerCase();
    if (cat.includes("fiction") || cat.includes("fantasy")) selectGenero.value = "fantasia";
    else if (cat.includes("horror")) selectGenero.value = "terror";
    else if (cat.includes("history")) selectGenero.value = "historica";
    else if (cat.includes("philosophy")) selectGenero.value = "filosofia";
    else if (cat.includes("science fiction")) selectGenero.value = "ciencia_ficcion";
    else selectGenero.value = "clasicos";
    
    actualizarHuellasPorGenero();
  }

  divResultadosGB.style.display = "none";
}

// 4. Gestión de Rasgos y Cicatrices
selectGenero.addEventListener("change", actualizarHuellasPorGenero);

function actualizarHuellasPorGenero() {
  const gen = selectGenero.value;
  if (HUELLAS_POR_GENERO[gen]) {
    listaRasgos = [...HUELLAS_POR_GENERO[gen].rasgos];
    listaCicatrices = [...HUELLAS_POR_GENERO[gen].cicatrices];
  } else {
    listaRasgos = [];
    listaCicatrices = [];
  }
  renderizarTags();
}

document.getElementById("btn-add-huella").addEventListener("click", () => {
  const input = document.getElementById("nuevo-rasgo-input");
  const tipo = document.getElementById("tipo-huella-select").value;
  const texto = input.value.trim();

  if (!texto) return;

  if (tipo === "rasgo") {
    if (!listaRasgos.includes(texto)) listaRasgos.push(texto);
  } else {
    if (!listaCicatrices.includes(texto)) listaCicatrices.push(texto);
  }

  input.value = "";
  renderizarTags();
});

function renderizarTags() {
  const contRasgos = document.getElementById("container-rasgos");
  const contCicatrices = document.getElementById("container-cicatrices");

  contRasgos.innerHTML = listaRasgos.map((r, i) => 
    `<span class="tag">✨ ${r} <span onclick="eliminarTag('rasgo', ${i})">&times;</span></span>`
  ).join("");

  contCicatrices.innerHTML = listaCicatrices.map((c, i) => 
    `<span class="tag" style="background:#5a1a1a;">👁️ ${c} <span onclick="eliminarTag('cicatriz', ${i})">&times;</span></span>`
  ).join("");
}

window.eliminarTag = function(tipo, index) {
  if (tipo === 'rasgo') listaRasgos.splice(index, 1);
  else listaCicatrices.splice(index, 1);
  renderizarTags();
};

// 5. FUNCIONES DE SUBIDA A CLOUDINARY (Archivo Local o URL externa)

// Subir un archivo local seleccionado desde el equipo
async function subirArchivoACloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const respuesta = await fetch(url, { method: "POST", body: formData });

  if (!respuesta.ok) throw new Error("Error subiendo el archivo a Cloudinary");
  const data = await respuesta.json();
  return data.secure_url;
}

// Subir una imagen pasando directamente la URL traída de Google Books
async function subirUrlACloudinary(urlImagen) {
  const formData = new FormData();
  formData.append("file", urlImagen); // Cloudinary acepta URLs directas en el campo 'file'
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const respuesta = await fetch(url, { method: "POST", body: formData });

  if (!respuesta.ok) throw new Error("Error alojando la imagen de Google Books en Cloudinary");
  const data = await respuesta.json();
  return data.secure_url;
}

// 6. Publicación en Firestore
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const autor = document.getElementById("autor").value.trim();
  const paginas = Number(document.getElementById("paginas").value);
  const genero = selectGenero.value;
  const puntosPrestigio = Number(document.getElementById("puntosPrestigio").value);
  const descripcion = document.getElementById("descripcion").value.trim();
  const archivoImagen = document.getElementById("portadaFile").files[0];
  const urlPortadaGB = inputPortadaGB.value;

  if (!archivoImagen && !urlPortadaGB) {
    mensajeEstado.innerText = "⚠️ Selecciona una imagen local o busca una portada con Google Books.";
    mensajeEstado.style.color = "red";
    return;
  }

  try {
    btnSubmit.disabled = true;
    mensajeEstado.innerText = "";

    let finalPortadaUrl = "";

    btnSubmit.innerText = "⏳ Procesando y subiendo portada a Cloudinary...";

    // Prioridad 1: Subir archivo adjunto manualmente
    if (archivoImagen) {
      finalPortadaUrl = await subirArchivoACloudinary(archivoImagen);
    } 
    // Prioridad 2: Guardar en Cloudinary la portada obtenida desde Google Books
    else if (urlPortadaGB) {
      finalPortadaUrl = await subirUrlACloudinary(urlPortadaGB);
    }

    btnSubmit.innerText = "⏳ Guardando reto en Firestore...";

    const idHistorico = obtenerIdMesActual();

    const datosDelReto = {
      titulo,
      autor,
      paginas,
      genero,
      puntosPrestigio,
      descripcion,
      portadaUrl: finalPortadaUrl, // Esta URL SIEMPRE apuntará a tu CDN de Cloudinary
      rasgosOtorga: listaRasgos,
      cicatricesOtorga: listaCicatrices,
      idMes: idHistorico,
      fechaCreacion: new Date()
    };

    const batch = writeBatch(db);
    batch.set(doc(db, "retos", "actual"), datosDelReto);
    batch.set(doc(db, "retos", idHistorico), datosDelReto);

    await batch.commit();

    mensajeEstado.innerText = `✅ ¡Reto publicado con éxito en Cloudinary y Firestore!`;
    mensajeEstado.style.color = "green";
    
    // Limpieza
    form.reset();
    inputPortadaGB.value = "";
    previewPortada.style.display = "none";
    listaRasgos = [];
    listaCicatrices = [];
    renderizarTags();

  } catch (error) {
    console.error("Error al publicar:", error);
    mensajeEstado.innerText = "❌ Error al subir la imagen a Cloudinary o guardar en Firestore.";
    mensajeEstado.style.color = "red";
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerText = "📜 Publicar Reto Mensual";
  }
});