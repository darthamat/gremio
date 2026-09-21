// js/adminOGestorLibros.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  writeBatch 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { BANCO_HUELLAS } from "./rasgosData.js";

const auth = getAuth(app);
const db = getFirestore(app);

const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
const CLOUDINARY_UPLOAD_PRESET = "portadas";
const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
const PORTADA_DEFAULT = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400";

// Elementos DOM comunes
const form = document.getElementById("form-crear-reto") || document.getElementById("form-registrar-mision-libre");
const mensajeEstado = document.getElementById("mensaje-estado");
const btnSubmit = document.getElementById("btn-submit");
const inputBuscarGB = document.getElementById("buscarLibro") || document.getElementById("input-buscar-libro");
const btnBuscarGB = document.getElementById("btn-buscar-gb") || document.getElementById("btn-ejecutar-busqueda");
const divResultadosGB = document.getElementById("resultados-busqueda") || document.getElementById("resultados-busqueda-libros");
const previewPortada = document.getElementById("preview-portada") || document.getElementById("preview-portada-mision");
const inputPortadaGB = document.getElementById("portadaUrlGB") || document.getElementById("portada-mision-url");
const inputPortadaFile = document.getElementById("portadaFile") || document.getElementById("portada-mision-file");

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

function generarLibroId(titulo) {
  return titulo
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Inicializador universal del formulario.
 * @param {string} modo - Puede ser 'admin' (para crear retos) o 'aventurero' (para misiones secundarias).
 * @param {string} currentUserId - ID del usuario actual (necesario si es 'aventurero').
 * @param {Function} onCompletado - Callback opcional al finalizar con éxito.
 */
export async function inicializarFormularioLibro(modo = 'admin', currentUserId = null, onCompletado = null) {
  // Verificación de seguridad básica según el modo
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "index.html";
      return;
    }

    const userDoc = await getDoc(doc(db, "aventureros", user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (modo === 'admin' && userData.rol !== "admin" && userData.rol !== "Archimago") {
        alert("No tienes permisos de administrador.");
        window.location.href = "retos.html";
        return;
      }
    }
    await inicializarSelectorGeneros();
  });

  configurarEventosDOM(modo, currentUserId, onCompletado);
}

// 2. Previsualización de archivo local
if (inputPortadaFile) {
  inputPortadaFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file && previewPortada) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewPortada.src = event.target.result;
        previewPortada.style.display = "block";
        if (inputPortadaGB) inputPortadaGB.value = ""; 
      };
      reader.readAsDataURL(file);
    } else if (previewPortada) {
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
  const selectDisponibles = document.getElementById("select-generos-disponibles") || document.getElementById("select-generos-mision");
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
    const nombreNuevo = inputNuevoGenero?.value.trim();
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
    if (inputNuevoGenero) inputNuevoGenero.value = "";
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
  const contenedorTags = document.getElementById("generos-tags-contenedor") || document.getElementById("generos-tags-contenedor-mision");
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

    const huellas = BANCO_HUELLAS[key] 
                 || BANCO_HUELLAS[keyPadre]
                 || BANCO_HUELLAS[key.toLowerCase()]
                 || (keyPadre ? BANCO_HUELLAS[keyPadre.toLowerCase()] : null);

    if (huellas) {
      if (Array.isArray(huellas.rasgos)) {
        huellas.rasgos.forEach(r => {
          const nombreRasgo = typeof r === "object" ? (r.nombre || r.titulo || r.nombreRasgo) : r;
          if (nombreRasgo && !listaRasgos.includes(nombreRasgo)) listaRasgos.push(nombreRasgo);
        });
      }
      if (Array.isArray(huellas.cicatrices)) {
        huellas.cicatrices.forEach(c => {
          const nombreCicatriz = typeof c === "object" ? (c.nombre || c.titulo || c.nombreCicatriz) : c;
          if (nombreCicatriz && !listaCicatrices.includes(nombreCicatriz)) listaCicatrices.push(nombreCicatriz);
        });
      }
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

// 4. Buscador de Google Books
function configurarEventosDOM(modo, currentUserId, onCompletado) {
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

  const btnAddHuella = document.getElementById("btn-add-huella") || document.getElementById("btn-add-huella-mision");
  if (btnAddHuella) {
    btnAddHuella.addEventListener("click", () => {
      const input = document.getElementById("nuevo-rasgo-input") || document.getElementById("input-nueva-huella-mision");
      const tipo = document.getElementById("tipo-huella-select") || document.getElementById("select-tipo-huella-mision");
      const texto = input?.value.trim();
      const tipoValor = tipo ? tipo.value : "rasgo";

      if (!texto) return;

      if (tipoValor === "rasgo") {
        if (!listaRasgos.includes(texto)) listaRasgos.push(texto);
      } else {
        if (!listaCicatrices.includes(texto)) listaCicatrices.push(texto);
      }

      if (input) input.value = "";
      renderizarTags();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      await manejarEnvioFormulario(modo, currentUserId, onCompletado);
    });
  }
}

async function buscarEnGoogleBooks() {
  const query = inputBuscarGB?.value.trim();
  if (!query || !divResultadosGB) return;

  divResultadosGB.style.display = "block";
  divResultadosGB.innerHTML = "<div class='item-resultado' style='padding:8px; color:#d4af37;'>⏳ Buscando tomos en la gran biblioteca...</div>";

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`);
    if (!response.ok) throw new Error(`Respuesta HTTP no válida: ${response.status}`);

    const data = await response.json();
    if (!data.items || data.items.length === 0) {
      divResultadosGB.innerHTML = "<div class='item-resultado' style='padding:8px;'>No se encontraron libros.</div>";
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
      div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid #444; background: rgba(0,0,0,0.2);";
      
      div.innerHTML = `
        ${imagenUrl ? `<img src="${imagenUrl}" style="width: 35px; height: 50px; object-fit: cover; border-radius: 3px;">` : `<div style="width: 35px; height: 50px; background: #333; display: flex; align-items: center; justify-content: center; font-size: 10px;">Sin foto</div>`}
        <div>
          <div style="font-weight: bold; color: #ffd700; font-size:0.9rem;">${info.title}</div>
          <div style="font-size: 0.8em; color: #ccc;">${autores}</div>
        </div>
      `;

      div.addEventListener("click", () => seleccionarLibroGB(info, imagenUrl));
      divResultadosGB.appendChild(div);
    });
  } catch (error) {
    console.error("Error al conectar con Google Books:", error);
    divResultadosGB.innerHTML = "<div class='item-resultado' style='padding:8px; color:red;'>❌ Error al conectar con Google Books.</div>";
  }
}

function seleccionarLibroGB(info, urlImagen) {
  const inputTitulo = document.getElementById("titulo") || document.getElementById("titulo-mision");
  const inputAutor = document.getElementById("autor") || document.getElementById("autor-mision");
  const inputPaginas = document.getElementById("paginas") || document.getElementById("paginas-mision");
  const descElem = document.getElementById("descripcion") || document.getElementById("proclama-mision");

  if (inputTitulo) inputTitulo.value = info.title || "";
  if (inputAutor) inputAutor.value = info.authors ? info.authors.join(", ") : "";
  if (inputPaginas) inputPaginas.value = info.pageCount || 100;
  
  if (descElem && info.description) {
    descElem.value = info.description.slice(0, 300) + "...";
  }

  if (urlImagen && inputPortadaGB) {
    inputPortadaGB.value = urlImagen;
    if (previewPortada) {
      previewPortada.src = urlImagen;
      previewPortada.style.display = "block";
    }
    if (inputPortadaFile) inputPortadaFile.value = "";
  } else if (inputPortadaGB) {
    inputPortadaGB.value = "";
    if (previewPortada) previewPortada.style.display = "none";
  }

  if (divResultadosGB) divResultadosGB.style.display = "none";
}

function renderizarTags() {
  const contRasgos = document.getElementById("container-rasgos") || document.getElementById("container-rasgos-mision");
  const contCicatrices = document.getElementById("container-cicatrices") || document.getElementById("container-cicatrices-mision");

  if (contRasgos) {
    contRasgos.innerHTML = listaRasgos.map((r, i) => {
      const texto = typeof r === "object" ? (r.nombre || r.titulo || "") : r;
      return `<span class="tag" style="background:#2d3748; color:#63b3ed; padding:3px 8px; border-radius:12px; font-size:0.8rem;">✨ ${texto} <span style="cursor:pointer; color:#fc8181;" onclick="window.eliminarTag('rasgo', ${i})">&times;</span></span>`;
    }).join("");
  }

  if (contCicatrices) {
    contCicatrices.innerHTML = listaCicatrices.map((c, i) => {
      const texto = typeof c === "object" ? (c.nombre || c.titulo || "") : c;
      return `<span class="tag" style="background:#4a1515; color:#feb2b2; padding:3px 8px; border-radius:12px; font-size:0.8rem;">🩸 ${texto} <span style="cursor:pointer; color:#fc8181;" onclick="window.eliminarTag('cicatriz', ${i})">&times;</span></span>`;
    }).join("");
  }
}

window.eliminarTag = function(tipo, index) {
  if (tipo === 'rasgo') listaRasgos.splice(index, 1);
  else listaCicatrices.splice(index, 1);
  renderizarTags();
};

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
      console.warn("Fallo al subir archivo local, usando fallback:", err);
      return PORTADA_DEFAULT;
    }
  }
  if (urlGB) return urlGB;
  return PORTADA_DEFAULT;
}

// 7. Enrutador de Guardado (Admin vs Aventurero)
async function manejarEnvioFormulario(modo, currentUserId, onCompletado) {
  const titulo = document.getElementById("titulo")?.value.trim() || document.getElementById("titulo-mision")?.value.trim() || "";
  const autor = document.getElementById("autor")?.value.trim() || document.getElementById("autor-mision")?.value.trim() || "";
  const paginas = Number(document.getElementById("paginas")?.value || document.getElementById("paginas-mision")?.value) || 0;
  
  const descripcion = document.getElementById("descripcion")?.value.trim() || document.getElementById("proclama-mision")?.value.trim() || "";
  const archivoImagen = inputPortadaFile?.files[0];
  const urlPortadaGB = inputPortadaGB ? inputPortadaGB.value : "";
  
  const arrayGeneros = Array.from(generosSeleccionados);
  if (arrayGeneros.length === 0) {
    if (mensajeEstado) {
      mensajeEstado.innerText = "⚠️ Por favor selecciona al menos un género.";
      mensajeEstado.style.color = "red";
    } else {
      alert("⚠️ Por favor selecciona al menos un género.");
    }
    return;
  }

  try {
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerText = "⏳ Procesando...";
    }
    if (mensajeEstado) mensajeEstado.innerText = "";

    const finalPortadaUrl = await obtenerUrlPortadaValida(archivoImagen, urlPortadaGB);
    await guardarGenerosEnFirestore();

    const libroId = generarLibroId(titulo);

    // Mapear rasgos y cicatrices con formato de objeto estricto
    const rasgosObj = {};
    listaRasgos.forEach(r => {
      const nombreR = typeof r === "object" ? r.nombre : r;
      rasgosObj[nombreR] = { id: nombreR.toLowerCase().replace(/\s+/g, '_'), nombre: nombreR, acumulaciones: 1, icono: '✨' };
    });

    const cicatricesObj = {};
    listaCicatrices.forEach(c => {
      const nombreC = typeof c === "object" ? c.nombre : c;
      cicatricesObj[nombreC] = { id: nombreC.toLowerCase().replace(/\s+/g, '_'), nombre: nombreC, acumulaciones: 1, icono: '🩸' };
    });

    if (modo === 'admin') {
      // 👑 LÓGICA DE ADMINISTRADOR (Crear Reto Mensual y Biblioteca Global)
      const elemProponente = document.getElementById("proponente") || document.getElementById("reto-proponente");
      const proponente = elemProponente ? elemProponente.value.trim() : "Archimago";
      const puntosPrestigio = Number(document.getElementById("puntosPrestigio")?.value) || 0;
      const elemFecha = document.getElementById("reto-fecha-publicacion") || document.getElementById("fecha-publicacion");
      const fechaPublicacion = elemFecha ? elemFecha.value.trim() : "";
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

      const datosBiblioteca = {
        titulo,
        autor,
        paginas,
        genero: arrayGeneros[0] || "general",
        generos: arrayGeneros,
        portadaUrl: finalPortadaUrl,
        portada: finalPortadaUrl,
        descripcion,
        colorLomo: "#8b263e",
        esReto: true,
        tipoOrigen: "RETO_GREMIO",
        proponente,
        retoId: idHistorico,
        conteoLectores: 0,
        lectores: []
      };

      const batch = writeBatch(db);
      batch.set(doc(db, "retos", "actual"), datosDelReto);
      batch.set(doc(db, "retos", idHistorico), datosDelReto);
      batch.set(doc(db, "biblioteca", libroId), datosBiblioteca, { merge: true });
      await batch.commit();

      if (mensajeEstado) {
        mensajeEstado.innerText = `✅ ¡Reto y libro publicados con éxito!`;
        mensajeEstado.style.color = "#4CAF50";
      }

    } else {
      // 🛡️ LÓGICA DE AVENTURERO (Crear Misión Secundaria / Lectura Libre)
      const estadoMision = document.getElementById("estado-mision")?.value || "en_progreso";
      
      const nuevaMision = {
        id: `mision_${Date.now()}`,
        libroId,
        titulo,
        autor,
        paginas,
        estado: estadoMision === 'completada' || estadoMision === 'TERMINADA' ? 'TERMINADA' : 'EN_PROGRESO',
        proclama: descripcion,
        portadaUrl: finalPortadaUrl,
        portada: finalPortadaUrl,
        generos: arrayGeneros,
        genero: arrayGeneros[0] || "Fantasía",
        rasgos: rasgosObj,
        cicatrices: cicatricesObj,
        fechaCreacion: new Date().toISOString()
      };

      // Registrar también en la biblioteca global para que pinte el lomo en la estantería
      const datosBiblioteca = {
        titulo,
        autor,
        paginas,
        genero: arrayGeneros[0] || "Fantasía",
        generos: arrayGeneros,
        rasgos: rasgosObj,
        cicatrices: cicatricesObj,
        portadaUrl: finalPortadaUrl,
        portada: finalPortadaUrl,
        colorLomo: "#8b263e",
        esReto: false,
        tipoOrigen: "LECTURA_LIBRE",
        proponente: currentUserId,
        fechaCreacion: Date.now()
      };
      await setDoc(doc(db, "biblioteca", libroId), datosBiblioteca, { merge: true });

      // Añadir al array del aventurero
      const userRef = doc(db, "aventureros", currentUserId);
      await updateDoc(userRef, {
        misionesSecundarias: arrayUnion(nuevaMision)
      });

      if (mensajeEstado) {
        mensajeEstado.innerText = `✅ ¡Misión secundaria registrada con éxito!`;
        mensajeEstado.style.color = "#4CAF50";
      }

      // Ocultar modal si existe
      const modal = document.getElementById("modal-buscador-mision");
      if (modal) {
        modal.classList.add("oculto");
        modal.style.display = "none";
      }

      if (typeof onCompletado === 'function') {
        onCompletado(nuevaMision);
      }
    }

    form.reset();
    if (inputPortadaGB) inputPortadaGB.value = "";
    if (previewPortada) previewPortada.style.display = "none";
    generosSeleccionados.clear();
    listaRasgos = [];
    listaCicatrices = [];
    renderizarTagsGeneros();
    renderizarTags();
    await inicializarSelectorGeneros();

  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    if (mensajeEstado) {
      mensajeEstado.innerText = "❌ Error al guardar en Firestore.";
      mensajeEstado.style.color = "red";
    } else {
      alert("❌ Error al guardar en Firestore.");
    }
  } finally {
    if (btnSubmit) {
      btnSubmit.disabled = false;
      btnSubmit.innerText = modo === 'admin' ? "📜 Publicar Reto Mensual" : "⚔️ Aceptar Misión";
    }
  }
}