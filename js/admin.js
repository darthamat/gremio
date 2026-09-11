import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  writeBatch 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// 🔑 CONFIGURACIÓN
const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
const CLOUDINARY_UPLOAD_PRESET = "portadas";
const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
const PORTADA_DEFAULT = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400"; // Imagen por defecto si falla la subida

// Configuración de rasgos/cicatrices por género base
const HUELLAS_POR_GENERO = {
  fantasia: { rasgos: ["Mente Imaginativa", "Aura Maravillosa"], cicatrices: ["Evasionista", "Voz de Leyenda"] },
  terror: { rasgos: ["Valentia Inquebrantable", "Sentidos Alerta"], cicatrices: ["Trauma Oscuro", "Sombras Persistentes"] },
  poesia: { rasgos: ["Sensibilidad Profunda", "Espíritu Poético"], cicatrices: ["Corazón Melancólico", "Anhelo Inconsolable"] },
  clasicos: { rasgos: ["Sabiduría Atemporal", "Pensamiento Noble"], cicatrices: ["Carga del Pasado", "Rigidez Moral"] },
  ficcion: { rasgos: ["Imaginación", "Pensamiento Inocente"], cicatrices: ["Carga del Pasado", "Rigidez Moral"] },
  no_ficcion: { rasgos: ["Conocimiento", "Pensamiento Crítico"], cicatrices: ["Carga del Pasado", "Rigidez Moral"] },
  filosofia: { rasgos: ["Criterio Propio", "Mente Inquisitiva"], cicatrices: ["Duda Existencial", "Espíritu Inquieto"] },
  historica: { rasgos: ["Perspectiva Épica", "Conciencia del Tiempo"], cicatrices: ["Memoria Pesada", "Cicatriz de Eras"] },
  ciencia_ficcion: { rasgos: ["Visión Futurista", "Curiosidad Cósmica"], cicatrices: ["Desconexión Humana", "Vértigo Digital"] },
  romance: { rasgos: ["Empatía Profunda", "Lazos Affectivos"], cicatrices: ["Corazón Frágil", "Melancolía Amarga"] }
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
const inputPortadaFile = document.getElementById("portadaFile");

// Estado global
let generosSeleccionados = new Set();
let listaRasgos = [];
let listaCicatrices = [];
let mapaGenerosGlobal = {};

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
      return;
    }
  }
  await inicializarSelectorGeneros();
});

// 2. Previsualización de archivo local
if (inputPortadaFile) {
  inputPortadaFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewPortada.src = event.target.result;
        previewPortada.style.display = "block";
        if (inputPortadaGB) inputPortadaGB.value = ""; // Limpiar URL de Google Books si sube archivo
      };
      reader.readAsDataURL(file);
    } else {
      previewPortada.style.display = "none";
    }
  });
}

// 3. Gestión de Géneros
async function obtenerGenerosGuardados() {
  try {
    const docRef = doc(db, "configuracion", "generos");
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().mapaGeneros) {
      return snap.data().mapaGeneros;
    } else {
      const mapaBase = {
        fantasia: { nombre: "Fantasía", padre: "fantasia" },
        terror: { nombre: "Terror", padre: "terror" },
        poesia: { nombre: "Poesía", padre: "poesia" },
        clasicos: { nombre: "Clásicos", padre: "clasicos" },
        ficcion: { nombre: "Ficción", padre: "ficcion" },
        no_ficcion: { nombre: "No Ficción", padre: "no_ficcion" },
        filosofia: { nombre: "Filosofía", padre: "filosofia" },
        historica: { nombre: "Histórica", padre: "historica" },
        ciencia_ficcion: { nombre: "Ciencia Ficción", padre: "ciencia_ficcion" },
        romance: { nombre: "Romance", padre: "romance" }
      };
      await setDoc(docRef, { mapaGeneros: mapaBase }, { merge: true });
      return mapaBase;
    }
  } catch (error) {
    console.error("Error al cargar mapa de géneros:", error);
    return {};
  }
}

async function inicializarSelectorGeneros() {
  const selectDisponibles = document.getElementById("select-generos-disponibles");
  const inputNuevoGenero = document.getElementById("input-nuevo-genero");
  const selectPadre = document.getElementById("select-genero-padre");
  const btnAgregarGenero = document.getElementById("btn-agregar-genero");

  if (!selectDisponibles) return;

  mapaGenerosGlobal = await obtenerGenerosGuardados();

  selectDisponibles.innerHTML = '<option value="">-- Selecciona un género existente --</option>';
  Object.keys(mapaGenerosGlobal).forEach(key => {
    const gen = mapaGenerosGlobal[key];
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = `${gen.nombre} (Padre: ${gen.padre})`;
    selectDisponibles.appendChild(opt);
  });

  selectDisponibles.onchange = (e) => {
    const val = e.target.value;
    if (val) {
      agregarGeneroASeleccion(val);
      e.target.value = "";
    }
  };

  const procesarNuevoGenero = () => {
    const nombreNuevo = inputNuevoGenero.value.trim();
    const idPadre = selectPadre ? selectPadre.value : "";

    if (!nombreNuevo) {
      alert("Por favor, escribe el nombre del nuevo género.");
      return;
    }
    if (!idPadre) {
      alert("Por favor, selecciona una Categoría Padre.");
      return;
    }

    const idKey = nombreNuevo.toLowerCase().replace(/\s+/g, "_");
    mapaGenerosGlobal[idKey] = { nombre: nombreNuevo, padre: idPadre };

    agregarGeneroASeleccion(idKey);
    inputNuevoGenero.value = "";
    if (selectPadre) selectPadre.value = "";
  };

  if (btnAgregarGenero) {
    btnAgregarGenero.onclick = (e) => { 
      e.preventDefault(); 
      procesarNuevoGenero(); 
    };
  }
}

function agregarGeneroASeleccion(keyGenero) {
  generosSeleccionados.add(keyGenero);
  renderizarTagsGeneros();
  actualizarHuellasPorGeneros();
}

function renderizarTagsGeneros() {
  const contenedorTags = document.getElementById("generos-tags-contenedor");
  if (!contenedorTags) return;

  contenedorTags.innerHTML = "";
  generosSeleccionados.forEach(key => {
    const info = mapaGenerosGlobal[key] || { nombre: key, padre: key };
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.style.cssText = "background: #3b2219; color: #f3e5ab; padding: 4px 10px; border-radius: 15px; margin: 3px; display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem;";
    
    tag.innerHTML = `📚 ${info.nombre} <small style="opacity: 0.7;">(${info.padre})</small> <span style="cursor:pointer; color:#ff6b6b; font-weight:bold;">&times;</span>`;

    tag.querySelector("span").onclick = () => {
      generosSeleccionados.delete(key);
      renderizarTagsGeneros();
      actualizarHuellasPorGeneros();
    };

    contenedorTags.appendChild(tag);
  });
}

function actualizarHuellasPorGeneros() {
  listaRasgos = [];
  listaCicatrices = [];

  generosSeleccionados.forEach(key => {
    const info = mapaGenerosGlobal[key];
    const keyPadre = info ? info.padre : key;

    if (HUELLAS_POR_GENERO[keyPadre]) {
      HUELLAS_POR_GENERO[keyPadre].rasgos.forEach(r => {
        if (!listaRasgos.includes(r)) listaRasgos.push(r);
      });
      HUELLAS_POR_GENERO[keyPadre].cicatrices.forEach(c => {
        if (!listaCicatrices.includes(c)) listaCicatrices.push(c);
      });
    }
  });

  renderizarTags();
}

async function guardarGenerosEnFirestore() {
  try {
    const docRef = doc(db, "configuracion", "generos");
    await setDoc(docRef, { mapaGeneros: mapaGenerosGlobal }, { merge: true });
  } catch (error) {
    console.error("Error al guardar géneros en Firestore:", error);
  }
}

// 4. Buscador de Google Books API
if (btnBuscarGB) {
  btnBuscarGB.addEventListener("click", (e) => {
    e.preventDefault();
    buscarEnGoogleBooks();
  });
}

if (inputBuscarGB) {
  inputBuscarGB.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      buscarEnGoogleBooks();
    }
  });
}

document.addEventListener("click", (e) => {
  if (divResultadosGB && !divResultadosGB.contains(e.target) && e.target !== inputBuscarGB && e.target !== btnBuscarGB) {
    divResultadosGB.style.display = "none";
  }
});

async function buscarEnGoogleBooks() {
  const query = inputBuscarGB.value.trim();
  if (!query) return;

  divResultadosGB.style.display = "block";
  divResultadosGB.innerHTML = "<div class='item-resultado'>⏳ Buscando tomos en la gran biblioteca...</div>";

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`);
    if (!response.ok) throw new Error(`Respuesta HTTP no válida: ${response.status}`);

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      divResultadosGB.innerHTML = "<div class='item-resultado'>No se encontraron libros.</div>";
      return;
    }

    divResultadosGB.innerHTML = "";
    data.items.forEach(item => {
      const info = item.volumeInfo;
      const autores = info.authors ? info.authors.join(", ") : "Autor desconocido";
      const imagenUrl = (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) 
        ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail).replace("http://", "https://") 
        : "";

      const div = document.createElement("div");
      div.className = "item-resultado";
      div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #444;";
      
      div.innerHTML = `
        ${imagenUrl ? `<img src="${imagenUrl}" style="width: 35px; height: 50px; object-fit: cover; border-radius: 3px;">` : `<div style="width: 35px; height: 50px; background: #333; display: flex; align-items: center; justify-content: center; font-size: 10px;">Sin foto</div>`}
        <div>
          <div style="font-weight: bold; color: #ffd700;">${info.title}</div>
          <div style="font-size: 0.85em; color: #ccc;">${autores}</div>
        </div>
      `;

      div.addEventListener("click", () => seleccionarLibroGB(info, imagenUrl));
      divResultadosGB.appendChild(div);
    });
  } catch (error) {
    console.error("Error al conectar con Google Books:", error);
    divResultadosGB.innerHTML = "<div class='item-resultado'>❌ Error al conectar con Google Books.</div>";
  }
}

function seleccionarLibroGB(info, urlImagen) {
  document.getElementById("titulo").value = info.title || "";
  document.getElementById("autor").value = info.authors ? info.authors.join(", ") : "";
  document.getElementById("paginas").value = info.pageCount || 100;
  
  const descElem = document.getElementById("descripcion");
  if (descElem && info.description) {
    descElem.value = info.description.slice(0, 300) + "...";
  }

  if (urlImagen) {
    inputPortadaGB.value = urlImagen;
    previewPortada.src = urlImagen;
    previewPortada.style.display = "block";
    if (inputPortadaFile) inputPortadaFile.value = ""; // Limpiar input file
  } else {
    inputPortadaGB.value = "";
    previewPortada.style.display = "none";
  }

  divResultadosGB.style.display = "none";
}

// 5. Gestión de Rasgos y Cicatrices
const btnAddHuella = document.getElementById("btn-add-huella");
if (btnAddHuella) {
  btnAddHuella.addEventListener("click", () => {
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
}

function renderizarTags() {
  const contRasgos = document.getElementById("container-rasgos");
  const contCicatrices = document.getElementById("container-cicatrices");

  if (contRasgos) {
    contRasgos.innerHTML = listaRasgos.map((r, i) => 
      `<span class="tag">✨ ${r} <span onclick="eliminarTag('rasgo', ${i})">&times;</span></span>`
    ).join("");
  }

  if (contCicatrices) {
    contCicatrices.innerHTML = listaCicatrices.map((c, i) => 
      `<span class="tag" style="background:#5a1a1a;">👁️ ${c} <span onclick="eliminarTag('cicatriz', ${i})">&times;</span></span>`
    ).join("");
  }
}

window.eliminarTag = function(tipo, index) {
  if (tipo === 'rasgo') listaRasgos.splice(index, 1);
  else listaCicatrices.splice(index, 1);
  renderizarTags();
};

// 6. Subida de Imágenes
async function subirArchivoACloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const respuesta = await fetch(url, { method: "POST", body: formData });

  if (!respuesta.ok) throw new Error("Error subiendo el archivo local a Cloudinary");
  const data = await respuesta.json();
  return data.secure_url;
}

async function obtenerUrlPortadaValida(archivo, urlGB) {
  if (archivo) {
    try {
      return await subirArchivoACloudinary(archivo);
    } catch (err) {
      console.warn("Fallo al subir archivo local a Cloudinary, usando fallback:", err);
      return PORTADA_DEFAULT;
    }
  }

  if (urlGB) {
    // Para imágenes de Google Books, usamos directamente la URL HTTPS limpia
    return urlGB;
  }

  return PORTADA_DEFAULT;
}

// 7. Enviar Formulario a Firestore
// 7. Enviar Formulario a Firestore
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo")?.value.trim() || "";
    const autor = document.getElementById("autor")?.value.trim() || "";
    const paginas = Number(document.getElementById("paginas")?.value) || 0;
    
    // Proponente (Busca proponente o reto-proponente según lo tengas en HTML)
    const elemProponente = document.getElementById("proponente") || document.getElementById("reto-proponente");
    const proponente = elemProponente ? elemProponente.value.trim() : "Aventurero Anónimo";

    const puntosPrestigio = Number(document.getElementById("puntosPrestigio")?.value) || 0;
    const descripcion = document.getElementById("descripcion") ? document.getElementById("descripcion").value.trim() : "";
    const archivoImagen = inputPortadaFile?.files[0];
    const urlPortadaGB = inputPortadaGB ? inputPortadaGB.value : "";
    
    // Año de publicación con comprobación de existencia
    const elemFecha = document.getElementById("reto-fecha-publicacion") || document.getElementById("fecha-publicacion");
    const fechaPublicacion = elemFecha ? elemFecha.value.trim() : "";

    const arrayGeneros = Array.from(generosSeleccionados);
    if (arrayGeneros.length === 0) {
      mensajeEstado.innerText = "⚠️ Por favor selecciona o añade al menos un género.";
      mensajeEstado.style.color = "red";
      return;
    }

    try {
      btnSubmit.disabled = true;
      mensajeEstado.innerText = "";
      btnSubmit.innerText = "⏳ Procesando portada del libro...";

      const finalPortadaUrl = await obtenerUrlPortadaValida(archivoImagen, urlPortadaGB);

      btnSubmit.innerText = "⏳ Guardando géneros en la biblioteca...";
      await guardarGenerosEnFirestore();

      btnSubmit.innerText = "⏳ Guardando reto en Firestore...";

      const idHistorico = obtenerIdMesActual();

      const datosDelReto = {
        titulo,
        libro: titulo,
        autor,
        paginas,
        fechaPublicacion: fechaPublicacion || "Desconocida",
        generos: arrayGeneros,
        genero: arrayGeneros[0] || "general",
        proponente,
        puntos: puntosPrestigio,
        puntosPrestigio,
        descripcion,
        portada: finalPortadaUrl,
        portadaUrl: finalPortadaUrl,
        rasgosOtorga: listaRasgos,
        cicatricesOtorga: listaCicatrices,
        idMes: idHistorico,
        fechaCreacion: Date.now()
      };

      const batch = writeBatch(db);
      batch.set(doc(db, "retos", "actual"), datosDelReto);
      batch.set(doc(db, "retos", idHistorico), datosDelReto);

      await batch.commit();

      mensajeEstado.innerText = `✅ ¡Reto publicado con éxito!`;
      mensajeEstado.style.color = "#4CAF50";
      
      form.reset();
      if (inputPortadaGB) inputPortadaGB.value = "";
      if (previewPortada) previewPortada.style.display = "none";
      
      generosSeleccionados.clear();
      renderizarTagsGeneros();
      await inicializarSelectorGeneros();

    } catch (error) {
      console.error("Error al publicar:", error);
      mensajeEstado.innerText = "❌ Error al publicar el reto en Firestore.";
      mensajeEstado.style.color = "red";
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "📜 Publicar Reto Mensual";
    }
  });
}