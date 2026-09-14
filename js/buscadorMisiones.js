// js/buscadorMisiones.js
import { getFirestore, doc, updateDoc, arrayUnion, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { BANCO_HUELLAS } from "./rasgosData.js";

const db = getFirestore(app);

// 🔑 CONFIGURACIÓN COMPARTIDA CON ADMIN
const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
const CLOUDINARY_UPLOAD_PRESET = "portadas";
const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
const PORTADA_DEFAULT = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400";

let libroSeleccionado = null;
let rasgosSeleccionadosLocal = [];
let cicatricesSeleccionadasLocal = [];

// Normaliza el título para crear un ID de documento limpio para la colección biblioteca
export function generarLibroId(titulo) {
  return titulo
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Mapeador auxiliar de claves de género a BANCO_HUELLAS
function obtenerClaveGenero(genero) {
  if (!genero) return "fantasia";
  const g = genero.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (g.includes("fantas") || g.includes("epica")) return "fantasia";
  if (g.includes("poes") || g.includes("poet")) return "poesia";
  if (g.includes("terror") || g.includes("horror") || g.includes("mister")) return "terror";
  if (g.includes("histor")) return "historia";
  if (g.includes("filos")) return "filosofia";
  if (g.includes("cienc") || g.includes("scifi") || g.includes("ficcion")) return "ciencia_ficcion";
  if (g.includes("negr") || g.includes("polic") || g.includes("thriller")) return "novela_negra";
  if (g.includes("ensa") || g.includes("divulg")) return "ensayo";
  if (g.includes("biogr") || g.includes("memor")) return "biografia";

  return "fantasia"; // fallback
}

// Obtiene lista de rasgos y cicatrices filtrados por género
export function obtenerHuellasPorGenero(genero) {
  const clave = obtenerClaveGenero(genero);
  return BANCO_HUELLAS[clave] || BANCO_HUELLAS.fantasia;
}

// Subida a Cloudinary de la portada si el usuario subió archivo
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

// Resuelve la URL final de la portada
async function obtenerUrlPortadaValida(archivoLocal, urlGB) {
  if (archivoLocal) {
    try {
      return await subirArchivoACloudinary(archivoLocal);
    } catch (err) {
      console.warn("Fallo la subida local, utilizando portada por defecto:", err);
      return PORTADA_DEFAULT;
    }
  }
  if (urlGB) return urlGB;
  return PORTADA_DEFAULT;
}

// 🔍 Función principal de búsqueda en Google Books
export async function buscarEnGoogleBooks(query, contenedorResultados) {
  if (!query.trim()) return;

  contenedorResultados.style.display = "block";
  contenedorResultados.innerHTML = "<div class='item-resultado'>⏳ Buscando tomos en la gran biblioteca...</div>";

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&key=${GOOGLE_BOOKS_API_KEY}`
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      contenedorResultados.innerHTML = "<div class='item-resultado'>No se encontraron tomos.</div>";
      return;
    }

    contenedorResultados.innerHTML = "";

    data.items.forEach(item => {
      const info = item.volumeInfo;
      const autores = info.authors ? info.authors.join(", ") : "Autor desconocido";
      const imagenUrl = (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail))
        ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail).replace("http://", "https://")
        : "";

      const div = document.createElement("div");
      div.className = "item-resultado-gb";
      div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.1);";

      div.innerHTML = `
        ${imagenUrl 
          ? `<img src="${imagenUrl}" style="width: 40px; height: 55px; object-fit: cover; border-radius: 4px;">` 
          : `<div style="width: 40px; height: 55px; background: #333; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #ccc;">Sin foto</div>`
        }
        <div>
          <div style="font-weight: bold; color: #ffd700; font-size: 0.95rem;">${info.title}</div>
          <div style="font-size: 0.85rem; color: #bbb;">${autores}</div>
          <small style="color: #888;">📖 ${info.pageCount || '???'} páginas</small>
        </div>
      `;

      div.addEventListener("click", () => {
        seleccionarLibroGB(info, imagenUrl);
        contenedorResultados.style.display = "none";
      });

      contenedorResultados.appendChild(div);
    });

  } catch (error) {
    console.error("Error al conectar con Google Books:", error);
    contenedorResultados.innerHTML = "<div class='item-resultado'>❌ Error al conectar con la gran biblioteca.</div>";
  }
}

// Selecciona un libro y rellena el formulario de la UI
function seleccionarLibroGB(info, imagenUrl) {
  const generosGB = info.categories ? info.categories[0] : "Fantasía";

  libroSeleccionado = {
    titulo: info.title || "",
    autor: info.authors ? info.authors.join(", ") : "Autor Desconocido",
    paginas: info.pageCount || 100,
    descripcion: info.description ? info.description.slice(0, 300) + "..." : "",
    portadaUrl: imagenUrl,
    genero: generosGB
  };

  const elemTitulo = document.getElementById("mision-titulo");
  const elemAutor = document.getElementById("mision-autor");
  const elemPaginas = document.getElementById("mision-paginas");
  const elemDesc = document.getElementById("mision-descripcion");
  const elemPortadaUrl = document.getElementById("mision-portada-url");
  const imgPreview = document.getElementById("mision-preview-portada");
  const formConfirmar = document.getElementById("form-confirmar-mision");

  if (elemTitulo) elemTitulo.value = libroSeleccionado.titulo;
  if (elemAutor) elemAutor.value = libroSeleccionado.autor;
  if (elemPaginas) elemPaginas.value = libroSeleccionado.paginas;
  if (elemDesc) elemDesc.value = libroSeleccionado.descripcion;
  if (elemPortadaUrl) elemPortadaUrl.value = libroSeleccionado.portadaUrl;

  if (imgPreview) {
    imgPreview.src = imagenUrl || PORTADA_DEFAULT;
    imgPreview.style.display = "block";
  }

  // Renderizar las huellas (rasgos y cicatrices) según el género detectado o por defecto
  renderizarOpcionesHuellas(generosGB);

  if (formConfirmar) formConfirmar.classList.remove("oculto");
}

// 🎨 Renderiza visualmente las opciones de Rasgos y Cicatrices según el género en el DOM
export function renderizarOpcionesHuellas(generoNombre) {
  const huellas = obtenerHuellasPorGenero(generoNombre);
  const contenedorRasgos = document.getElementById("mision-opciones-rasgos");
  const contenedorCicatrices = document.getElementById("mision-opciones-cicatrices");

  rasgosSeleccionadosLocal = [];
  cicatricesSeleccionadasLocal = [];

  if (contenedorRasgos) {
    contenedorRasgos.innerHTML = "";
    huellas.rasgos.forEach(rasgo => {
      const chip = document.createElement("div");
      chip.className = "chip-huella chip-rasgo";
      chip.style.cssText = "display:inline-flex; align-items:center; gap:5px; padding:4px 8px; margin:3px; background:#1b2838; border:1px solid #4a90e2; border-radius:12px; cursor:pointer; font-size:0.8rem; color:#fff;";
      chip.innerHTML = `<span>${rasgo.icono}</span> <span>${rasgo.nombre}</span>`;

      chip.addEventListener("click", () => {
        const index = rasgosSeleccionadosLocal.findIndex(r => r.id === rasgo.id);
        if (index > -1) {
          rasgosSeleccionadosLocal.splice(index, 1);
          chip.style.background = "#1b2838";
          chip.style.borderColor = "#4a90e2";
        } else {
          rasgosSeleccionadosLocal.push(rasgo);
          chip.style.background = "#2d5a88";
          chip.style.borderColor = "#71b2ff";
        }
        sincronizarInputsHuellas();
      });
      contenedorRasgos.appendChild(chip);
    });
  }

  if (contenedorCicatrices) {
    contenedorCicatrices.innerHTML = "";
    huellas.cicatrices.forEach(cicatriz => {
      const chip = document.createElement("div");
      chip.className = "chip-huella chip-cicatriz";
      chip.style.cssText = "display:inline-flex; align-items:center; gap:5px; padding:4px 8px; margin:3px; background:#2a1b1b; border:1px solid #e24a4a; border-radius:12px; cursor:pointer; font-size:0.8rem; color:#fff;";
      chip.innerHTML = `<span>${cicatriz.icono}</span> <span>${cicatriz.nombre}</span>`;

      chip.addEventListener("click", () => {
        const index = cicatricesSeleccionadasLocal.findIndex(c => c.id === cicatriz.id);
        if (index > -1) {
          cicatricesSeleccionadasLocal.splice(index, 1);
          chip.style.background = "#2a1b1b";
          chip.style.borderColor = "#e24a4a";
        } else {
          cicatricesSeleccionadasLocal.push(cicatriz);
          chip.style.background = "#5a2d2d";
          chip.style.borderColor = "#ff7171";
        }
        sincronizarInputsHuellas();
      });
      contenedorCicatrices.appendChild(chip);
    });
  }
}

// Sincroniza los chips seleccionados con los campos ocultos o inputs de texto si existen
function sincronizarInputsHuellas() {
  const inputRasgos = document.getElementById("mision-rasgos");
  const inputCicatrices = document.getElementById("mision-cicatrices");

  if (inputRasgos) {
    inputRasgos.value = rasgosSeleccionadosLocal.map(r => r.nombre).join(", ");
  }
  if (inputCicatrices) {
    inputCicatrices.value = cicatricesSeleccionadasLocal.map(c => c.nombre).join(", ");
  }
}

// 💾 Guardado definitivo en la colección 'biblioteca' y en el Aventurero
export async function registrarMisionAventurero(userId, datosFormulario) {
  const { 
    titulo, 
    autor, 
    paginas, 
    proclama, 
    estado, 
    archivoLocal, 
    urlPortadaGB,
    generos = [], 
    rasgos = [], 
    cicatrices = [] 
  } = datosFormulario;

  const urlFinalPortada = await obtenerUrlPortadaValida(archivoLocal, urlPortadaGB);
  const libroId = generarLibroId(titulo);

  // 1. Registro en la biblioteca global de la app
  const datosBiblioteca = {
    titulo,
    autor,
    paginas,
    generos,
    rasgos,
    cicatrices,
    portadaUrl: urlFinalPortada,
    portada: urlFinalPortada,
    esReto: false,
    tipoOrigen: "LECTURA_LIBRE",
    proponente: userId,
    fechaCreacion: Date.now()
  };

  const docBibliotecaRef = doc(db, "biblioteca", libroId);
  await setDoc(docBibliotecaRef, datosBiblioteca, { merge: true });

  // 2. Misión/Lectura individual del Aventurero
  const nuevaMision = {
    id: `mision_${Date.now()}`,
    libroId: libroId,
    titulo,
    autor,
    paginas,
    proclama,
    estado,
    generos,
    rasgos,
    cicatrices,
    portada: urlFinalPortada,
    fechaRegistro: new Date().toISOString()
  };

  const userRef = doc(db, "aventureros", userId);
  await updateDoc(userRef, {
    misionesSecundarias: arrayUnion(nuevaMision)
  });

  return nuevaMision;
}

export function limpiarSeleccionBuscador() {
  libroSeleccionado = null;
  rasgosSeleccionadosLocal = [];
  cicatricesSeleccionadasLocal = [];
}

// Inicializador de eventos del formulario (Llamar desde perfil.js)
export function inicializarFormularioMisiones(userId, callbackExito) {
  const formConfirmar = document.getElementById('form-confirmar-mision');
  if (!formConfirmar) return;

  // Escuchar cambios de géneros para actualizar las sugerencias de rasgos/cicatrices
  const checkboxesGenero = document.querySelectorAll('input[name="genero"]');
  checkboxesGenero.forEach(cb => {
    cb.addEventListener('change', () => {
      const primerSeleccionado = document.querySelector('input[name="genero"]:checked');
      if (primerSeleccionado) {
        renderizarOpcionesHuellas(primerSeleccionado.value);
      }
    });
  });

  formConfirmar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSubmit = formConfirmar.querySelector('button[type="submit"]');
    if (btnSubmit) btnSubmit.disabled = true;

    try {
      // 1. Obtener géneros seleccionados
      const generosSeleccionados = Array.from(
        document.querySelectorAll('input[name="genero"]:checked')
      ).map(cb => cb.value);

      // 2. Obtener Rasgos y Cicatrices (combina los chips seleccionados y el texto manual si lo hay)
      const rasgosInputStr = document.getElementById('mision-rasgos')?.value.trim() || "";
      const cicatricesInputStr = document.getElementById('mision-cicatrices')?.value.trim() || "";

      let rasgosFinales = rasgosSeleccionadosLocal.length > 0 
        ? rasgosSeleccionadosLocal 
        : rasgosInputStr.split(',').map(r => ({ nombre: r.trim() })).filter(r => r.nombre);

      let cicatricesFinales = cicatricesSeleccionadasLocal.length > 0 
        ? cicatricesSeleccionadasLocal 
        : cicatricesInputStr.split(',').map(c => ({ nombre: c.trim() })).filter(c => c.nombre);

      // 3. Obtener archivo local de portada
      const inputArchivo = document.getElementById('mision-portada-file');
      const archivoLocal = inputArchivo && inputArchivo.files.length > 0 ? inputArchivo.files[0] : null;

      // 4. Preparar payload
      const datosMision = {
        titulo: document.getElementById('mision-titulo').value,
        autor: document.getElementById('mision-autor').value,
        paginas: parseInt(document.getElementById('mision-paginas').value, 10) || 0,
        proclama: document.getElementById('mision-proclama').value,
        estado: document.getElementById('mision-estado').value,
        urlPortadaGB: document.getElementById('mision-portada-url')?.value || "",
        archivoLocal: archivoLocal,
        generos: generosSeleccionados,
        rasgos: rasgosFinales,
        cicatrices: cicatricesFinales
      };

      const misionGuardada = await registrarMisionAventurero(userId, datosMision);
      console.log('✅ Misión guardada con éxito:', misionGuardada);

      // Limpiar formulario y cerrar modal
      formConfirmar.reset();
      limpiarSeleccionBuscador();
      const modal = document.getElementById('modal-buscador-mision');
      if (modal) modal.classList.add('oculto');

      if (callbackExito) callbackExito(misionGuardada);

    } catch (err) {
      console.error('❌ Error al registrar la misión:', err);
      alert('Ocurrió un error al guardar la misión. Revisa la consola.');
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
  });
}