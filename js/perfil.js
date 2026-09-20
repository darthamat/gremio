// js/perfil.js
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
import { renderizarEstadisticasAcordeon } from "./perfilEstadisticas.js";
import { procesarRecompensaLectura } from "./sistemaGamificacion.js";
import { actualizarBarraNivelUI, comprobarYMostrarSubidaNivel } from "./controlNivel.js";

// Inicialización de Firebase
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
let currentUserDocRef = null;
let misionesLocales = [];

// Control de Estado de Autenticación
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

  const xpActual = data.xp || 0;

  if (document.getElementById("char-name")) {
    document.getElementById("char-name").textContent = data.nombre || "Aventurero";
  }

  // Actualización de Nivel y Barra
  actualizarBarraNivelUI(xpActual);

  // Marcapáginas
  const elMarcapaginas = document.getElementById("char-marcapaginas") || document.getElementById("contador-marcapaginas");
  if (elMarcapaginas) {
    elMarcapaginas.textContent = data.marcapaginas || 0;
  }

  // Avatar
  const avatarImg = document.getElementById("char-avatar") || document.querySelector(".avatar-img");
  if (avatarImg) {
    const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200";
    avatarImg.src = data.avatarUrl || data.avatar || defaultAvatar;
  }

  // Carga de Rasgos y Cicatrices
  const rasgosOrigen = data.estadisticas?.rasgos || data.rasgos || {};
  const cicatricesOrigen = data.estadisticas?.cicatrices || data.cicatrices || {};

  const objetoEstadisticasCompleto = {
    ...data.estadisticas,
    rasgos: rasgosOrigen,
    cicatrices: cicatricesOrigen
  };

  // 1. Inyecta los Atributos, Tooltips, Rasgos y Cicatrices dentro del Acordeón
  renderizarEstadisticasAcordeon(objetoEstadisticasCompleto);

  // 2. Dibuja los Badges dentro de sus contenedores
  renderizarRasgosYCicatrices(rasgosOrigen, cicatricesOrigen);

  // 3. Renderiza las misiones secundarias
  renderizarMisiones(misionesLocales);
}

// Muestra los Badges de Rasgos y Cicatrices
// 🩸✨ Función auxiliar para mostrar Rasgos y Cicatrices con formato de Sumatorio (+X)
function renderizarRasgosYCicatrices(rasgos = {}, cicatrices = {}) {
  const contenedorRasgos = document.getElementById("contenedor-rasgos");
  const contenedorCicatrices = document.getElementById("contenedor-cicatrices");

  const procesarLista = (datos) => {
    if (!datos) return [];
    
    if (Array.isArray(datos)) {
      return datos.map(item => {
        if (typeof item === 'string') {
          return { nombre: item, acumulaciones: 1, icono: '✨' };
        }
        const cant = Number(item.contador || item.acumulaciones || item.nivel || item.cantidad) || 1;
        return {
          nombre: item.nombre || item.titulo || item.rasgo || item.cicatriz || "Desconocido",
          acumulaciones: cant,
          icono: item.icono,
          desc: item.desc || item.descripcion || ''
        };
      });
    }

    if (typeof datos === 'object') {
      return Object.entries(datos).map(([key, val]) => {
        if (typeof val === 'object' && val !== null) {
          const cant = Number(val.contador || val.acumulaciones || val.nivel || val.cantidad) || 1;
          return {
            nombre: val.nombre || val.titulo || key,
            acumulaciones: cant,
            icono: val.icono,
            desc: val.desc || val.descripcion || ''
          };
        }
        return {
          nombre: key,
          acumulaciones: typeof val === 'number' ? val : 1,
          icono: null,
          desc: ''
        };
      });
    }

    return [];
  };

  const listaRasgos = procesarLista(rasgos);
  const listaCicatrices = procesarLista(cicatrices);

  // Renderizado de Rasgos (+X)
  if (contenedorRasgos) {
    if (listaRasgos.length === 0) {
      contenedorRasgos.innerHTML = `<p style="color:#718096; font-size:0.9rem;">Ningún rasgo obtenido aún.</p>`;
    } else {
      contenedorRasgos.innerHTML = listaRasgos.map(r => {
        const sumatorio = r.acumulaciones >= 0 ? `+${r.acumulaciones}` : `${r.acumulaciones}`;
        return `
          <div class="item-huella rasgo" title="${r.desc}">
            <span>${r.icono || '✨'}</span>
            <strong>${r.nombre} ${sumatorio}</strong>
          </div>
        `;
      }).join('');
    }
  }

  // Renderizado de Cicatrices (+X)
  if (contenedorCicatrices) {
    if (listaCicatrices.length === 0) {
      contenedorCicatrices.innerHTML = `<p style="color:#718096; font-size:0.9rem;">Tu historial está limpio de cicatrices.</p>`;
    } else {
      contenedorCicatrices.innerHTML = listaCicatrices.map(c => {
        const sumatorio = c.acumulaciones >= 0 ? `+${c.acumulaciones}` : `${c.acumulaciones}`;
        return `
          <div class="item-huella cicatriz" title="${c.desc}">
            <span>${c.icono || '🩸'}</span>
            <strong>${c.nombre} ${sumatorio}</strong>
          </div>
        `;
      }).join('');
    }
  }
}

// Control del Acordeón y Pestañas
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

// Misiones Secundarias
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
      ${mision.portadaUrl ? `<img src="${mision.portadaUrl}" class="mision-portada-thumb" alt="Portada">` : ''}
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

async function actualizarEstadoMision(index, nuevoEstado) {
  try {
    const mision = misionesLocales[index];
    mision.estado = nuevoEstado;

    const paginas = mision.paginas || 0;
    const gananciaXP = paginas + Math.floor(Math.random() * (paginas + 1));
    const gananciaMarcapaginas = Math.floor(Math.random() * (paginas || 1)) + 1;

    const userSnap = await getDoc(currentUserDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const nuevoNivel = comprobarYMostrarSubidaNivel(userData, gananciaXP);

    await updateDoc(currentUserDocRef, {
      misionesSecundarias: misionesLocales,
      xp: increment(gananciaXP),
      nivel: nuevoNivel,
      marcapaginas: increment(gananciaMarcapaginas)
    });

    if (nuevoEstado === "TERMINADA") {
      const listaGeneros = (mision.generos && mision.generos.length) ? mision.generos : [(mision.genero || "Fantasía")];
      const resultadoRecompensa = await procesarRecompensaLectura(currentUserId, listaGeneros, paginas);

      if (resultadoRecompensa && resultadoRecompensa.recompensas.length > 0) {
        let textoPremios = resultadoRecompensa.recompensas.map(r => {
          const tipoIcono = r.tipo === "rasgos" ? "✨" : "🩸";
          return `${tipoIcono} ${r.item.nombre} (+${r.contador})`;
        }).join("\n");

        alert(`🎉 ¡Misión Terminada!\n\n✨ +${gananciaXP} XP\n🔖 +${gananciaMarcapaginas} Marcapáginas\n\nSe realizaron ${resultadoRecompensa.totalTiradas} tiradas de huellas:\n${textoPremios}`);
      } else {
        alert(`🎉 ¡Misión Terminada!\n\n✨ +${gananciaXP} XP\n🔖 +${gananciaMarcapaginas} Marcapáginas`);
      }
    }

    await cargarDatosAventurero(currentUserDocRef);

  } catch (error) {
    console.error("Error al actualizar la misión:", error);
    alert("❌ No se pudo actualizar el estado de la misión.");
  }
}

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
        const userRef = doc(db, "aventureros", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.exists() ? userSnap.data() : {};
        const nombreAventurero = userData.nombre || user.displayName || "Un Aventurero";

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

        const nuevaMisionData = {
          titulo: titulo,
          autor: autor,
          paginas: paginas,
          proclama: proclama,
          genero: generoPrincipal,
          generos: generosChecked.length > 0 ? generosChecked : [generoPrincipal],
          portadaUrl: portadaUrl,
          creadorId: user.uid,
          creadorNombre: nombreAventurero,
          activa: !estaCompletada,
          usuariosAceptaron: [user.uid],
          usuariosCompletaron: estaCompletada ? [user.uid] : [],
          fechaCreacion: new Date().toISOString()
        };

        const docMisionRef = await addDoc(collection(db, "misionesSecundarias"), nuevaMisionData);

        if (estaCompletada) {
          const gananciaXP = paginas + Math.floor(Math.random() * (paginas + 1));
          const gananciaPrestigio = paginas + Math.floor(Math.random() * (paginas + 1));
          const gananciaMarcapaginas = Math.floor(Math.random() * (paginas || 1)) + 1;

          const nuevoNivel = comprobarYMostrarSubidaNivel(userData, gananciaXP);

          await updateDoc(userRef, {
            xp: increment(gananciaXP),
            nivel: nuevoNivel,
            prestigio: increment(gananciaPrestigio),
            marcapaginas: increment(gananciaMarcapaginas)
          });

          const datosLibro = {
            id: docMisionRef.id,
            titulo: titulo,
            autor: autor,
            genero: generoPrincipal,
            generos: nuevaMisionData.generos,
            paginas: paginas,
            portadaUrl: portadaUrl,
            fechaTerminado: new Date().toISOString()
          };

          await registrarLibroEnBibliotecaYAtlas(user.uid, datosLibro);

          const recompensa = await procesarRecompensaLectura(user.uid, nuevaMisionData.generos, paginas);
          let mensajeRecompensa = "";
          
          if (recompensa && recompensa.recompensas.length > 0) {
            mensajeRecompensa = "\n\n✨ Recompensas obtenidas:\n" + 
              recompensa.recompensas.map(r => `${r.tipo === "rasgos" ? "✨" : "🩸"} ${r.item.nombre} (+${r.contador})`).join("\n");
          }

          alert(`🎉 ¡Lectura Finalizada y Registrada!\n\n✨ +${gananciaXP} XP\n🏆 +${gananciaPrestigio} Prestigio\n🔖 +${gananciaMarcapaginas} Marcapáginas${mensajeRecompensa}\n\n📖 Se ha añadido el lomo a tu Biblioteca.`);
        } else {
          alert("⚔️ Misión Secundaria registrada con éxito.");
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

function inicializarAvatar() {
  const btnAvatar = document.getElementById("btn-cambiar-avatar") || document.getElementById("char-avatar");
  const inputAvatar = document.getElementById("input-avatar-file");

  if (!btnAvatar || !inputAvatar) return;

  btnAvatar.addEventListener("click", () => inputAvatar.click());

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
      await updateDoc(currentUserDocRef, { avatarUrl: data.secure_url });

      alert("✨ ¡Avatar actualizado con éxito!");

    } catch (error) {
      console.error("Error al actualizar el avatar:", error);
      alert("❌ No se pudo subir el avatar.");
    }
  });
}