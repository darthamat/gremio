import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection,
  addDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

// 🔑 BANCO DE HUELLAS CENTRALIZADO
import { BANCO_HUELLAS } from "./rasgosData.js";

const auth = getAuth(app);
const db = getFirestore(app);

const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
const CLOUDINARY_UPLOAD_PRESET = "portadas";
const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
const PORTADA_DEFAULT = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400";

const form = document.getElementById("form-crear-mision-secundaria");
const mensajeEstado = document.getElementById("mensaje-estado");
const btnSubmit = document.getElementById("btn-submit");
const inputBuscarGB = document.getElementById("buscarLibro");
const btnBuscarGB = document.getElementById("btn-buscar-gb");
const divResultadosGB = document.getElementById("resultados-busqueda");
const previewPortada = document.getElementById("preview-portada");
const inputPortadaGB = document.getElementById("portadaUrlGB");
const inputPortadaFile = document.getElementById("portadaFile");

let generosSeleccionados = new Set();
let listaRasgos = [];
let listaCicatrices = [];
let mapaGenerosGlobal = {};

// 1. Verificación de sesión de usuario normal (Cualquier aventurero puede crear misiones secundarias)
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Debes iniciar sesión para colgar un contrato en el tablón.");
    window.location.href = "index.html";
    return;
  }
  // Autocompletar proponente si existe su perfil
  try {
    const userDoc = await getDoc(doc(db, "aventureros", user.uid));
    if (userDoc.exists() && userDoc.data().nombre) {
      const inputProp = document.getElementById("proponente");
      if (inputProp) inputProp.value = userDoc.data().nombre;
    }
  } catch (e) {
    console.error("Error cargando nombre de usuario:", e);
  }

  await inicializarSelectorGeneros();
});

// 2. Previsualización de imagen local
if (inputPortadaFile) {
  inputPortadaFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        previewPortada.src = event.target.result;
        previewPortada.style.display = "block";
        if (inputPortadaGB) inputPortadaGB.value = "";
      };
      reader.readAsDataURL(file);
    } else {
      previewPortada.style.display = "none";
    }
  });
}

// 3. Gestión de Géneros (Idéntica al admin)
async function obtenerGenerosGuardados() {
  try {
    const docRef = doc(db, "configuracion", "generos");
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().mapaGeneros) {
      return snap.data().mapaGeneros;
    } else {
      return {
        fantasia: { nombre: "Fantasía", padre: "fantasia" },
        terror: { nombre: "Terror", padre: "terror" },
        ciencia_ficcion: { nombre: "Ciencia Ficción", padre: "ciencia_ficcion" },
        romance: { nombre: "Romance", padre: "romance" }
      };
    }
  } catch (error) {
    console.error("Error al cargar géneros:", error);
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

  if (btnAgregarGenero) {
    btnAgregarGenero.onclick = (e) => {
      e.preventDefault();
      const nombreNuevo = inputNuevoGenero.value.trim();
      const idPadre = selectPadre ? selectPadre.value : "";
      if (!nombreNuevo || !idPadre) {
        alert("Escribe el nombre y selecciona una Categoría Padre.");
        return;
      }
      const idKey = nombreNuevo.toLowerCase().replace(/\s+/g, "_");
      mapaGenerosGlobal[idKey] = { nombre: nombreNuevo, padre: idPadre };
      agregarGeneroASeleccion(idKey);
      inputNuevoGenero.value = "";
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
    tag.innerHTML = `📚 ${info.nombre} <span style="cursor:pointer; color:#ff6b6b; font-weight:bold;">&times;</span>`;
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
    const huellas = BANCO_HUELLAS[key] || BANCO_HUELLAS[keyPadre] || BANCO_HUELLAS[key.toLowerCase()];
    if (huellas) {
      if (Array.isArray(huellas.rasgos)) {
        huellas.rasgos.forEach(r => {
          const nombre = typeof r === "object" ? (r.nombre || r.titulo || "") : r;
          if (nombre && !listaRasgos.includes(nombre)) listaRasgos.push(nombre);
        });
      }
      if (Array.isArray(huellas.cicatrices)) {
        huellas.cicatrices.forEach(c => {
          const nombre = typeof c === "object" ? (c.nombre || c.titulo || "") : c;
          if (nombre && !listaCicatrices.includes(nombre)) listaCicatrices.push(nombre);
        });
      }
    }
  });
  renderizarTagsHuellas();
}

// 4. Buscador Google Books
if (btnBuscarGB) {
  btnBuscarGB.addEventListener("click", (e) => {
    e.preventDefault();
    buscarEnGoogleBooks();
  });
}

async function buscarEnGoogleBooks() {
  const query = inputBuscarGB.value.trim();
  if (!query) return;
  divResultadosGB.style.display = "block";
  divResultadosGB.innerHTML = "<div class='item-resultado'>⏳ Buscando...</div>";

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`);
    const data = await res.json();
    if (!data.items) {
      divResultadosGB.innerHTML = "<div class='item-resultado'>No se encontraron tomos.</div>";
      return;
    }
    divResultadosGB.innerHTML = "";
    data.items.forEach(item => {
      const info = item.volumeInfo;
      const autores = info.authors ? info.authors.join(", ") : "Desconocido";
      const img = info.imageLinks?.thumbnail?.replace("http://", "https://") || "";
      const div = document.createElement("div");
      div.className = "item-resultado";
      div.innerHTML = `${img ? `<img src="${img}" style="width:35px;height:50px;object-fit:cover;">` : ""}` +
                      `<div><strong>${info.title}</strong><br><small>${autores}</small></div>`;
      div.onclick = () => {
        document.getElementById("titulo").value = info.title || "";
        document.getElementById("autor").value = autores;
        document.getElementById("paginas").value = info.pageCount || 100;
        if (info.description) document.getElementById("descripcion").value = info.description.slice(0, 300) + "...";
        if (img) {
          inputPortadaGB.value = img;
          previewPortada.src = img;
          previewPortada.style.display = "block";
        }
        divResultadosGB.style.display = "none";
      };
      divResultadosGB.appendChild(div);
    });
  } catch (err) {
    divResultadosGB.innerHTML = "<div class='item-resultado'>❌ Error de conexión.</div>";
  }
}

// 5. Rasgos personalizados
const btnAddHuella = document.getElementById("btn-add-huella");
if (btnAddHuella) {
  btnAddHuella.addEventListener("click", () => {
    const input = document.getElementById("nuevo-rasgo-input");
    const tipo = document.getElementById("tipo-huella-select").value;
    const texto = input.value.trim();
    if (!texto) return;
    if (tipo === "rasgo") listaRasgos.push(texto);
    else listaCicatrices.push(texto);
    input.value = "";
    renderizarTagsHuellas();
  });
}

function renderizarTagsHuellas() {
  const contR = document.getElementById("container-rasgos");
  const contC = document.getElementById("container-cicatrices");
  if (contR) contR.innerHTML = listaRasgos.map((r, i) => `<span class="tag">✨ ${r} <span onclick="window.delH('rasgo',${i})">&times;</span></span>`).join("");
  if (contC) contC.innerHTML = listaCicatrices.map((c, i) => `<span class="tag" style="background:#5a1a1a;">👁️ ${c} <span onclick="window.delH('cicatriz',${i})">&times;</span></span>`).join("");
}

window.delH = (tipo, idx) => {
  if (tipo === 'rasgo') listaRasgos.splice(idx, 1);
  else listaCicatrices.splice(idx, 1);
  renderizarTagsHuellas();
};

async function subirCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error("Fallo Cloudinary");
  const data = await res.json();
  return data.secure_url;
}

// 6. Publicar en el Tablón de Misiones Secundarias (Cero XP)
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const titulo = document.getElementById("titulo").value.trim();
    const autor = document.getElementById("autor").value.trim();
    const paginas = Number(document.getElementById("paginas").value) || 0;
    const proponente = document.getElementById("proponente").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const file = inputPortadaFile?.files[0];
    const urlGB = inputPortadaGB?.value || "";

    if (generosSeleccionados.size === 0) {
      mensajeEstado.innerText = "⚠️ Selecciona al menos un género.";
      mensajeEstado.style.color = "red";
      return;
    }

    try {
      btnSubmit.disabled = true;
      btnSubmit.innerText = "⏳ Procesando portada...";
      let portadaFinal = PORTADA_DEFAULT;
      if (file) portadaFinal = await subirCloudinary(file);
      else if (urlGB) portadaFinal = urlGB;

      btnSubmit.innerText = "⏳ Clavando contrato en el tablón...";

      // Estructura limpia para el Tablón de Misiones Secundarias (The Witcher Style)
      const nuevaMisionSecundaria = {
        titulo,
        autor,
        paginas,
        proponente,
        descripcion,
        generos: Array.from(generosSeleccionados),
        genero: Array.from(generosSeleccionados)[0] || "General",
        portadaUrl: portadaFinal,
        rasgosOtorga: listaRasgos,
        cicatricesOtorga: listaCicatrices,
        creadorId: user.uid,
        usuariosAceptaron: [user.uid], // El creador la acepta de entrada
        usuariosCompletaron: [],      // Nadie la ha terminado aún
        activa: true,
        fechaCreacion: serverTimestamp()
      };

      await addDoc(collection(db, "misionesSecundarias"), nuevaMisionSecundaria);

      mensajeEstado.innerText = "✅ ¡Contrato clavado con éxito en el tablón!";
      mensajeEstado.style.color = "#4CAF50";

      setTimeout(() => {
        window.location.href = "perfil.html"; // O a tu página de perfil/tablón
      }, 1500);

    } catch (err) {
      console.error("Error al publicar misión secundaria:", err);
      mensajeEstado.innerText = "❌ Error al guardar en el tablón.";
      mensajeEstado.style.color = "red";
      btnSubmit.disabled = false;
      btnSubmit.innerText = "📌 Clavar Pergamino en el Tablón";
    }
  });
}