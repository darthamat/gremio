import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, updateDoc, increment, collection, addDoc 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { 
  buscarEnGoogleBooks, 
  limpiarSeleccionBuscador 
} from "./buscadorMisiones.js";
import { registrarLibroEnBibliotecaYAtlas } from "./gestorLibros.js";

// 1. Inicialización de Firebase
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
let currentUserDocRef = null;
let misionesLocales = [];

// 2. Control de Estado de Autenticación
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUserId = user.uid;
  currentUserDocRef = doc(db, "aventureros", user.uid);

  await cargarDatosAventurero(currentUserDocRef);
  inicializarAcordeon();
  inicializarModalMisiones();
  inicializarCerrarSesion();
  inicializarAvatar();
});

// Carga y renderiza los datos del usuario desde Firestore
async function cargarDatosAventurero(docRef) {
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const data = snap.data();
  misionesLocales = data.misionesSecundarias || [];

  // Datos de texto
  if (document.getElementById("char-name")) document.getElementById("char-name").textContent = data.nombre || "Aventurero";
  if (document.getElementById("char-level")) document.getElementById("char-level").textContent = data.nivel || 1;
  if (document.getElementById("char-xp")) document.getElementById("char-xp").textContent = `${data.xp || 0} XP`;

  // Renderizar Avatar
  const avatarImg = document.getElementById("char-avatar") || document.querySelector(".avatar-img");
  if (avatarImg) {
    const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200";
    avatarImg.src = data.avatarUrl || data.avatar || defaultAvatar;
  }

  // Renderizar Lista de Misiones Secundarias
  renderizarMisiones(misionesLocales);
}

// Lógica de pestañas / acordeón
function inicializarAcordeon() {
  const botones = document.querySelectorAll(".acordeon-botones .btn-tab:not(.btn-enlace)");
  const panelContenido = document.getElementById("panel-contenido");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const tabNombre = boton.getAttribute("data-tab");
      const tabObjetivo = document.getElementById(`tab-${tabNombre}`);

      if (!tabObjetivo) return;

      const yaEstaActivo = boton.classList.contains("activo");

      if (yaEstaActivo) {
        boton.classList.remove("activo");
        panelContenido.classList.add("oculto");
        document.querySelectorAll(".tab-contenido").forEach(tc => tc.classList.add("oculto"));
        return;
      }

      document.querySelectorAll(".tab-contenido").forEach(tc => tc.classList.add("oculto"));
      botones.forEach(b => b.classList.remove("activo"));

      boton.classList.add("activo");
      panelContenido.classList.remove("oculto");
      tabObjetivo.classList.remove("oculto");
    });
  });
}

// Renderiza las misiones con botones de Completar / Cancelar
function renderizarMisiones(misiones) {
  const contenedor = document.getElementById("contenedor-misiones");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!misiones || misiones.length === 0) {
    contenedor.innerHTML = `<p class="sin-datos">No tienes misiones registradas actualmente.</p>`;
    return;
  }

  misiones.forEach((mision, index) => {
    const tarjeta = document.createElement("div");
    const esTerminada = mision.estado === 'TERMINADA';
    tarjeta.className = `mision-card ${esTerminada ? 'mision-completada' : 'mision-en-progreso'}`;

    tarjeta.innerHTML = `
      ${mision.portada ? `<img src="${mision.portada}" class="mision-portada-thumb" alt="Portada">` : ''}
      <div class="mision-info">
        <strong>${mision.titulo}</strong>
        <small>${mision.autor}</small>
        <p>📖 ${mision.paginas} páginas | Estado: <strong>${mision.estado}</strong></p>
        ${mision.proclama ? `<p class="proclama">"${mision.proclama}"</p>` : ''}
        ${mision.generos && mision.generos.length ? `<p><small>🏷️ ${mision.generos.join(', ')}</small></p>` : ''}
      </div>
      <div class="mision-acciones-btn">
        ${!esTerminada ? `
          <button class="btn-accion btn-completar" data-index="${index}">
            ✅ Terminar
          </button>
        ` : ''}
        <button class="btn-accion btn-cancelar" data-index="${index}">
          ❌ ${esTerminada ? 'Eliminar' : 'Cancelar'}
        </button>
      </div>
    `;

    const btnCompletar = tarjeta.querySelector(".btn-completar");
    if (btnCompletar) {
      btnCompletar.addEventListener("click", () => actualizarEstadoMision(index, "TERMINADA"));
    }

    const btnCancelar = tarjeta.querySelector(".btn-cancelar");
    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => eliminarMisionSecundaria(index));
    }

    contenedor.appendChild(tarjeta);
  });
}

// Cambia el estado de la misión
async function actualizarEstadoMision(index, nuevoEstado) {
  try {
    misionesLocales[index].estado = nuevoEstado;
    await updateDoc(currentUserDocRef, {
      misionesSecundarias: misionesLocales
    });
    renderizarMisiones(misionesLocales);
  } catch (error) {
    console.error("Error al actualizar la misión:", error);
    alert("❌ No se pudo actualizar el estado de la misión.");
  }
}

// Cancela o elimina la misión secundaria
async function eliminarMisionSecundaria(index) {
  if (!confirm("¿Deseas quitar esta misión de tu lista?")) return;

  try {
    misionesLocales.splice(index, 1);
    await updateDoc(currentUserDocRef, {
      misionesSecundarias: misionesLocales
    });
    renderizarMisiones(misionesLocales);
  } catch (error) {
    console.error("Error al eliminar la misión:", error);
    alert("❌ Ocurrió un error al intentar eliminar la misión.");
  }
}

// Inicializa todos los eventos del modal de búsqueda y guardado de misiones
function inicializarModalMisiones() {
  const btnAbrir = document.getElementById("btn-abrir-buscador-mision");
  const btnCerrar = document.getElementById("btn-cerrar-modal-mision");
  const modal = document.getElementById("modal-buscador-mision");

  const inputBuscar = document.getElementById("input-buscar-libro");
  const btnBuscar = document.getElementById("btn-ejecutar-busqueda");
  const contenedorResultados = document.getElementById("resultados-busqueda-libros");

  const inputPortadaFile = document.getElementById("mision-portada-file");
  const previewPortada = document.getElementById("mision-preview-portada");
  const formConfirmar = document.getElementById("form-confirmar-mision");
  const btnGuardar = document.getElementById("btn-guardar-mision");

  if (btnAbrir && modal) {
    btnAbrir.addEventListener("click", () => modal.classList.remove("oculto"));
  }

  if (btnCerrar && modal) {
    btnCerrar.addEventListener("click", () => {
      modal.classList.add("oculto");
      limpiarFormularioLocal();
    });
  }

  if (btnBuscar && inputBuscar) {
    btnBuscar.addEventListener("click", (e) => {
      e.preventDefault();
      buscarEnGoogleBooks(inputBuscar.value, contenedorResultados);
    });

    inputBuscar.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        buscarEnGoogleBooks(inputBuscar.value, contenedorResultados);
      }
    });
  }

  if (inputPortadaFile) {
    inputPortadaFile.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (previewPortada) {
            previewPortada.src = event.target.result;
            previewPortada.style.display = "block";
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (formConfirmar) {
    formConfirmar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      if (!user) {
        alert("Debes estar autenticado para registrar una misión.");
        return;
      }

      if (btnGuardar) {
        btnGuardar.disabled = true;
        btnGuardar.textContent = "⌛ Guardando Misión...";
      }

      try {
        // 1. Obtener datos del aventurero
        const userRef = doc(db, "aventureros", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        const nombreAventurero = userData.nombre || user.displayName || "Un Aventurero";

        // 2. Extraer datos del formulario
        const titulo = document.getElementById("mision-titulo").value.trim();
        const autor = document.getElementById("mision-autor").value.trim();
        const paginas = parseInt(document.getElementById("mision-paginas").value, 10) || 0;
        const proclama = document.getElementById("mision-proclama").value.trim();
        const estado = document.getElementById("mision-estado").value;
        
        const inputPortadaUrl = document.getElementById("mision-portada-url")?.value || "";
        const previewSrc = previewPortada?.src || "";
        const portadaUrl = inputPortadaUrl || (previewSrc !== window.location.href ? previewSrc : "https://via.placeholder.com/150x220?text=Sin+Portada");

        const generosChecked = Array.from(document.querySelectorAll('input[name="genero"]:checked')).map(cb => cb.value);
        const generoPrincipal = generosChecked.length > 0 ? generosChecked[0] : "Fantasía";

        const estaCompletada = (estado === "TERMINADA");

        // 3. Crear documento global en 'misionesSecundarias'
        const nuevaMisionData = {
          titulo: titulo,
          autor: autor,
          paginas: paginas,
          proclama: proclama,
          genero: generoPrincipal,
          generos: generosChecked,
          portadaUrl: portadaUrl,
          creadorId: user.uid,
          creadorNombre: nombreAventurero,
          activa: !estaCompletada,
          usuariosAceptaron: [user.uid],
          usuariosCompletaron: estaCompletada ? [user.uid] : [],
          fechaCreacion: new Date().toISOString()
        };

        const docMisionRef = await addDoc(collection(db, "misionesSecundarias"), nuevaMisionData);

        // 4. Si la misión nace completada, se otorgan recompensas y se actualiza la biblioteca/atlas
        if (estaCompletada) {
          const gananciaXP = paginas + Math.floor(Math.random() * (paginas + 1));
          const gananciaPrestigio = paginas + Math.floor(Math.random() * (paginas + 1));
          const gananciaMarcapaginas = Math.floor(Math.random() * (paginas || 1)) + 1;

          await updateDoc(userRef, {
            xp: increment(gananciaXP),
            prestigio: increment(gananciaPrestigio),
            marcapaginas: increment(gananciaMarcapaginas),
            paginasLeidas: increment(paginas),
            librosCompletados: increment(1)
          });

          const datosLibro = {
            id: docMisionRef.id,
            titulo: titulo,
            autor: autor,
            genero: generoPrincipal,
            paginas: paginas,
            portadaUrl: portadaUrl,
            fechaTerminado: new Date().toISOString()
          };

          await registrarLibroEnBibliotecaYAtlas(user.uid, datosLibro);

          alert(`🎉 ¡Lectura Finalizada y Registrada!\n\n✨ +${gananciaXP} XP\n🏆 +${gananciaPrestigio} Prestigio\n🔖 +${gananciaMarcapaginas} Marcapáginas\n\n📖 Se ha añadido el lomo a tu Biblioteca y se ha explorado el Atlas.`);
        } else {
          alert("⚔️ Misión Secundaria registrada con éxito. ¡Aparecerá en la sección de Retos!");
        }

        if (modal) modal.classList.add("oculto");
        limpiarFormularioLocal();
        await cargarDatosAventurero(currentUserDocRef);

      } catch (error) {
        console.error("Error al registrar la misión en el perfil:", error);
        alert("❌ Hubo un fallo al registrar la misión secundaria.");
      } finally {
        if (btnGuardar) {
          btnGuardar.disabled = false;
          btnGuardar.textContent = "💾 Registrar Misión";
        }
      }
    });
  }
}

function limpiarFormularioLocal() {
  limpiarSeleccionBuscador();
  const formConfirmar = document.getElementById("form-confirmar-mision");
  const contenedorResultados = document.getElementById("resultados-busqueda-libros");
  const previewPortada = document.getElementById("mision-preview-portada");

  if (formConfirmar) {
    formConfirmar.reset();
    formConfirmar.classList.add("oculto");
  }
  if (contenedorResultados) contenedorResultados.style.display = "none";
  if (previewPortada) previewPortada.style.display = "none";
}

function inicializarCerrarSesion() {
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      signOut(auth).then(() => window.location.href = "index.html");
    });
  }
}

// Manejo de cambio de avatar
function inicializarAvatar() {
  const btnAvatar = document.getElementById("btn-cambiar-avatar") || document.getElementById("char-avatar");
  const inputAvatar = document.getElementById("input-avatar-file");

  if (!btnAvatar || !inputAvatar) return;

  btnAvatar.addEventListener("click", () => {
    inputAvatar.click();
  });

  inputAvatar.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const avatarImg = document.getElementById("char-avatar") || document.querySelector(".avatar-img");

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (avatarImg) avatarImg.src = event.target.result;
      };
      reader.readAsDataURL(file);

      const cloudName = "dwuokewzr";
      const uploadPreset = "avatar_users";

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Error al subir la imagen a Cloudinary");

      const data = await res.json();
      const nuevaUrlAvatar = data.secure_url;

      await updateDoc(currentUserDocRef, {
        avatarUrl: nuevaUrlAvatar
      });

      alert("✨ ¡Avatar actualizado con éxito!");

    } catch (error) {
      console.error("Error al actualizar el avatar:", error);
      alert("❌ No se pudo subir el avatar. Revisa la configuración de Cloudinary.");
    }
  });
}