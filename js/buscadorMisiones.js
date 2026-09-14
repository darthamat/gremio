// js/buscadorMisiones.js
import { getFirestore, doc, updateDoc, arrayUnion, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);

// 🔑 CONFIGURACIÓN COMPARTIDA CON ADMIN
const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
const CLOUDINARY_UPLOAD_PRESET = "portadas";
const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
const PORTADA_DEFAULT = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400";

let libroSeleccionado = null;

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

// Resuelve la URL final de la portada (Cloudinary, Google Books o Default)
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
  libroSeleccionado = {
    titulo: info.title || "",
    autor: info.authors ? info.authors.join(", ") : "Autor Desconocido",
    paginas: info.pageCount || 100,
    descripcion: info.description ? info.description.slice(0, 300) + "..." : "",
    portadaUrl: imagenUrl
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

  if (formConfirmar) formConfirmar.classList.remove("oculto");
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
}

// Inicializador de eventos del formulario (Llamar desde perfil.js)
export function inicializarFormularioMisiones(userId, callbackExito) {
  const formConfirmar = document.getElementById('form-confirmar-mision');
  if (!formConfirmar) return;

  formConfirmar.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnSubmit = formConfirmar.querySelector('button[type="submit"]');
    if (btnSubmit) btnSubmit.disabled = true;

    try {
      // 1. Obtener géneros seleccionados
      const generosSeleccionados = Array.from(
        document.querySelectorAll('input[name="genero"]:checked')
      ).map(cb => cb.value);

      // 2. Obtener Rasgos y Cicatrices
      const rasgosInput = document.getElementById('mision-rasgos')?.value.trim() || "";
      const cicatricesInput = document.getElementById('mision-cicatrices')?.value.trim() || "";

      const rasgos = rasgosInput ? rasgosInput.split(',').map(r => r.trim()).filter(Boolean) : [];
      const cicatrices = cicatricesInput ? cicatricesInput.split(',').map(c => c.trim()).filter(Boolean) : [];

      // 3. Obtener archivo local de portada (si subió uno)
      const inputArchivo = document.getElementById('mision-portada-file');
      const archivoLocal = inputArchivo && inputArchivo.files.length > 0 ? inputArchivo.files[0] : null;

      // 4. Preparar payload
      const datosMision = {
        titulo: document.getElementById('mision-titulo').value,
        autor: document.getElementById('mision-autor').value,
        paginas: parseInt(document.getElementById('mision-paginas').value, 10) || 0,
        proclama: document.getElementById('mision-proclama').value,
        estado: document.getElementById('mision-estado').value,
        urlPortadaGB: document.getElementById('mision-portada-url').value,
        archivoLocal: archivoLocal,
        generos: generosSeleccionados,
        rasgos: rasgos,
        cicatrices: cicatrices
      };

      const misionGuardada = await registrarMisionAventurero(userId, datosMision);
      console.log('✅ Misión guardada con éxito:', misionGuardada);

      // Limpiar formulario
      formConfirmar.reset();
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