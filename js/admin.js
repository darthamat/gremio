import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  writeBatch, 
  arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// 🔑 CONFIGURACIÓN
const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
const CLOUDINARY_UPLOAD_PRESET = "portadas";
const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";

// Configuración predeterminada de rasgos/cicatrices por género
const HUELLAS_POR_GENERO = {
  fantasia: { 
    rasgos: ["Mente Imaginativa", "Aura Maravillosa"], 
    cicatrices: ["Evasionista", "Voz de Leyenda"] 
  },
  terror: { 
    rasgos: ["Valentia Inquebrantable", "Sentidos Alerta"], 
    cicatrices: ["Trauma Oscuro", "Sombras Persistentes"] 
  },
  poesia: { 
    rasgos: ["Sensibilidad Profunda", "Espíritu Poético"], 
    cicatrices: ["Corazón Melancólico", "Anhelo Inconsolable"] 
  },
  clasicos: { 
    rasgos: ["Sabiduría Atemporal", "Pensamiento Noble"], 
    cicatrices: ["Carga del Pasado", "Rigidez Moral"] 
  },
  ficcion: { 
    rasgos: ["Imaginación", "Pensamiento Inocente"], 
    cicatrices: ["Carga del Pasado", "Rigidez Moral"] 
  },
  no_ficcion: { 
    rasgos: ["Conocimiento", "Pensamiento Crítico"], 
    cicatrices: ["Carga del Pasado", "Rigidez Moral"] 
  },
  filosofia: { 
    rasgos: ["Criterio Propio", "Mente Inquisitiva"], 
    cicatrices: ["Duda Existencial", "Espíritu Inquieto"] 
  },
  historica: { 
    rasgos: ["Perspectiva Épica", "Conciencia del Tiempo"], 
    cicatrices: ["Memoria Pesada", "Cicatriz de Eras"] 
  },
  ciencia_ficcion: { 
    rasgos: ["Visión Futurista", "Curiosidad Cósmica"], 
    cicatrices: ["Desconexión Humana", "Vértigo Digital"] 
  }
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

// Estado global para Géneros, Rasgos y Cicatrices
let generosSeleccionados = new Set();
let listaRasgos = [];
let listaCicatrices = [];

// Helper ID mes
function obtenerIdMesActual() {
  const fecha = new Date();
  const yy = String(fecha.getFullYear()).slice(-2);
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  return `reto${yy}_${mm}`;
}

// 1. Verificación de Seguridad e Inicialización
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
  
  // Cargar selector dinámico de géneros
  await inicializarSelectorGeneros();
});

// 2. Gestión Global y Dinámica de Géneros
async function obtenerGenerosGuardados() {
  try {
    const docRef = doc(db, "configuracion", "generos");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().lista || Object.keys(HUELLAS_POR_GENERO);
    } else {
      const listaBase = ["fantasia", "terror", "poesia", "clasicos", "ficcion", "no_ficcion", "filosofia", "historica", "ciencia_ficcion"];
      await setDoc(docRef, { lista: listaBase });
      return listaBase;
    }
  } catch (error) {
    console.error("Error al cargar lista de géneros:", error);
    return Object.keys(HUELLAS_POR_GENERO);
  }
}

async function guardarGenerosNuevos(nuevosGenerosArray) {
  if (!nuevosGenerosArray || nuevosGenerosArray.length === 0) return;
  try {
    const docRef = doc(db, "configuracion", "generos");
    for (const g of nuevosGenerosArray) {
      const generoFormateado = g.trim().toLowerCase();
      if (generoFormateado) {
        await setDoc(docRef, {
          lista: arrayUnion(generoFormateado)
        }, { merge: true });
      }
    }
  } catch (error) {
    console.error("Error al guardar géneros en Firestore:", error);
  }
}

async function inicializarSelectorGeneros() {
  const selectDisponibles = document.getElementById("select-generos-disponibles");
  const inputNuevoGenero = document.getElementById("input-nuevo-genero");
  const btnAgregarGenero = document.getElementById("btn-agregar-genero");

  if (!selectDisponibles) return;

  const generosGuardados = await obtenerGenerosGuardados();

  selectDisponibles.innerHTML = '<option value="">-- Selecciona un género existente --</option>';
  generosGuardados.forEach(g => {
    const opt = document.createElement("option");
    opt.value = g.toLowerCase();
    opt.textContent = g.charAt(0).toUpperCase() + g.slice(1).replace("_", " ");
    selectDisponibles.appendChild(opt);
  });

  selectDisponibles.addEventListener("change", (e) => {
    const val = e.target.value;
    if (val) {
      agregarGeneroASeleccion(val);
      e.target.value = "";
    }
  });

  const procesarNuevoGenero = () => {
    if (!inputNuevoGenero) return;
    const val = inputNuevoGenero.value.trim().toLowerCase();
    if (val) {
      agregarGeneroASeleccion(val);
      inputNuevoGenero.value = "";
    }
  };

  if (btnAgregarGenero) {
    btnAgregarGenero.onclick = (e) => {
      e.preventDefault();
      procesarNuevoGenero();
    };
  }

  if (inputNuevoGenero) {
    inputNuevoGenero.onkeypress = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        procesarNuevoGenero();
      }
    };
  }
}

function agregarGeneroASeleccion(genero) {
  generosSeleccionados.add(genero);
  renderizarTagsGeneros();
  actualizarHuellasPorGeneros();
}

function renderizarTagsGeneros() {
  const contenedorTags = document.getElementById("generos-tags-contenedor");
  if (!contenedorTags) return;

  contenedorTags.innerHTML = "";
  generosSeleccionados.forEach(genero => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.style.cssText = "background: #2a2d3d; color: #fff; padding: 4px 10px; border-radius: 16px; margin: 3px; display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem;";
    
    const nombreFormateado = genero.charAt(0).toUpperCase() + genero.slice(1).replace("_", " ");
    tag.innerHTML = `📚 ${nombreFormateado} <span style="cursor:pointer; color:#ff5555; font-weight:bold;">&times;</span>`;

    tag.querySelector("span").onclick = () => {
      generosSeleccionados.delete(genero);
      renderizarTagsGeneros();
      actualizarHuellasPorGeneros();
    };

    contenedorTags.appendChild(tag);
  });
}

function actualizarHuellasPorGeneros() {
  listaRasgos = [];
  listaCicatrices = [];

  generosSeleccionados.forEach(gen => {
    if (HUELLAS_POR_GENERO[gen]) {
      HUELLAS_POR_GENERO[gen].rasgos.forEach(r => {
        if (!listaRasgos.includes(r)) listaRasgos.push(r);
      });
      HUELLAS_POR_GENERO[gen].cicatrices.forEach(c => {
        if (!listaCicatrices.includes(c)) listaCicatrices.push(c);
      });
    }
  });

  renderizarTags();
}

// 3. Buscador de Google Books API
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
    console.error("Error al consultar Google Books API:", error);
    divResultadosGB.innerHTML = "<div class='item-resultado'>❌ Error al conectar con Google Books.</div>";
  }
}

function seleccionarLibroGB(info, urlImagen) {
  document.getElementById("titulo").value = info.title || "";
  document.getElementById("autor").value = info.authors ? info.authors.join(", ") : "";
  document.getElementById("paginas").value = info.pageCount || 100;
  
  if (info.description) {
    document.getElementById("descripcion").value = info.description.slice(0, 300) + "...";
  }

  if (urlImagen) {
    inputPortadaGB.value = urlImagen;
    previewPortada.src = urlImagen;
    previewPortada.style.display = "block";
  } else {
    inputPortadaGB.value = "";
    previewPortada.style.display = "none";
  }

  if (info.categories && info.categories.length > 0) {
    const cat = info.categories[0].toLowerCase();
    if (cat.includes("fiction") || cat.includes("fantasy")) agregarGeneroASeleccion("fantasia");
    else if (cat.includes("horror")) agregarGeneroASeleccion("terror");
    else if (cat.includes("history")) agregarGeneroASeleccion("historica");
    else if (cat.includes("philosophy")) agregarGeneroASeleccion("filosofia");
    else if (cat.includes("science fiction")) agregarGeneroASeleccion("ciencia_ficcion");
    else agregarGeneroASeleccion("clasicos");
  }

  divResultadosGB.style.display = "none";
}

// 4. Gestión Manual de Rasgos y Cicatrices
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

// 5. Funciones de subida a Cloudinary
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

async function subirUrlACloudinary(urlImagen) {
  const formData = new FormData();
  formData.append("file", urlImagen);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
  const respuesta = await fetch(url, { method: "POST", body: formData });

  if (!respuesta.ok) throw new Error("Error alojando la imagen en Cloudinary");
  const data = await respuesta.json();
  return data.secure_url;
}

// 6. Publicación en Firestore
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const paginas = Number(document.getElementById("paginas").value);
    const proponente = document.getElementById("proponente").value.trim() || "Aventurero Anónimo";
    const puntosPrestigio = Number(document.getElementById("puntosPrestigio").value);
    const descripcion = document.getElementById("descripcion").value.trim();
    const archivoImagen = document.getElementById("portadaFile")?.files[0];
    const urlPortadaGB = inputPortadaGB.value;

    const arrayGeneros = Array.from(generosSeleccionados);
    if (arrayGeneros.length === 0) {
      mensajeEstado.innerText = "⚠️ Por favor selecciona o añade al menos un género.";
      mensajeEstado.style.color = "red";
      return;
    }

    if (!archivoImagen && !urlPortadaGB) {
      mensajeEstado.innerText = "⚠️ Selecciona una imagen local o busca una portada con Google Books.";
      mensajeEstado.style.color = "red";
      return;
    }

    try {
      btnSubmit.disabled = true;
      mensajeEstado.innerText = "";

      let finalPortadaUrl = "";
      btnSubmit.innerText = "⏳ Procesando y subiendo portada...";

      if (archivoImagen) {
        finalPortadaUrl = await subirArchivoACloudinary(archivoImagen);
      } else if (urlPortadaGB) {
        finalPortadaUrl = await subirUrlACloudinary(urlPortadaGB);
      }

      btnSubmit.innerText = "⏳ Guardando géneros en la biblioteca...";
      await guardarGenerosNuevos(arrayGeneros);

      btnSubmit.innerText = "⏳ Guardando reto en Firestore...";

      const idHistorico = obtenerIdMesActual();

      const datosDelReto = {
        titulo,
        libro: titulo,
        autor,
        paginas,
        generos: arrayGeneros,
        genero: arrayGeneros[0], // Compatibilidad con vistas previas
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
      inputPortadaGB.value = "";
      if (previewPortada) previewPortada.style.display = "none";
      
      generosSeleccionados.clear();
      renderizarTagsGeneros();
      await inicializarSelectorGeneros();

    } catch (error) {
      console.error("Error al publicar:", error);
      mensajeEstado.innerText = "❌ Error al subir la imagen o guardar en Firestore.";
      mensajeEstado.style.color = "red";
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerText = "📜 Publicar Reto Mensual";
    }
  });
}