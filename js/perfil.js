import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  increment 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { renderizarEstadisticasAcordeon } from "./perfilEstadisticas.js";
import { procesarRecompensaPorGeneros } from "./sistemaGamificacion.js";
import { actualizarBarraNivelUI, comprobarYMostrarSubidaNivel } from "./controlNivel.js";

// Módulos del Gremio
import { inicializarBuscadorGremio, abrirBuscadorGremio } from "./buscadorGremio.js";
import { registrarLibroEnBibliotecaYAtlas } from "./gestorLibros.js";
import { generarEnfrentamientoFinal } from "./maestroCalabozo.js";
import { mostrarModalEncuentro } from "./modalCombate.js";
import { asegurarHiloTaberna } from "./taberna.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
let currentUserDocRef = null;
let misionesLocales = [];

// Auth Listener principal
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUserId = user.uid;
  currentUserDocRef = doc(db, "aventureros", user.uid);

  await cargarDatosAventurero(currentUserDocRef);
  await cargarMisionesSecundariasPerfil(user.uid); 
  inicializarAcordeon();
  inicializarCerrarSesion();
  inicializarAvatar();
});

// Carga de datos del perfil general del aventurero
async function cargarDatosAventurero(docRef) {
  const snap = await getDoc(docRef);
  if (!snap.exists()) return;

  const data = snap.data();
  misionesLocales = data.misionesSecundarias || [];

  if (document.getElementById("char-name")) {
    document.getElementById("char-name").textContent = data.nombre || "Aventurero";
  }

  actualizarBarraNivelUI(data.xp || 0);

  const elMarcapaginas = document.getElementById("char-marcapaginas") || document.getElementById("contador-marcapaginas");
  if (elMarcapaginas) {
    elMarcapaginas.textContent = data.marcapaginas || 0;
  }

  const elPaginas = document.getElementById("char-paginas");
  if (elPaginas) {
    elPaginas.textContent = data.paginasLeidas || data.paginas || 0;
  }

  const elLibros = document.getElementById("char-libros");
  if (elLibros) {
    const librosTerminados = data.librosCompletados || misionesLocales.filter(m => m.estado === 'TERMINADA').length;
    elLibros.textContent = librosTerminados;
  }

  const avatarImg = document.getElementById("char-avatar") || document.querySelector(".avatar-img");
  if (avatarImg) {
    const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200";
    avatarImg.src = data.avatarUrl || data.avatar || defaultAvatar;
  }

  const rasgosOrigen = data.estadisticas?.rasgos || data.rasgos || {};
  const cicatricesOrigen = data.estadisticas?.cicatrices || data.cicatrices || {};

  renderizarEstadisticasAcordeon({
    ...data.estadisticas,
    rasgos: rasgosOrigen,
    cicatrices: cicatricesOrigen
  });

  renderizarRasgosYCicatrices(rasgosOrigen, cicatricesOrigen);
  renderizarMisiones(misionesLocales);
  
  renderizarMochilaYSeguidores(data);
}

// Inicialización del DOM y los modales del Gremio
document.addEventListener("DOMContentLoaded", () => {
    inicializarBuscadorGremio();

    const btnAbrirModal = document.getElementById("btn-abrir-buscador-mision");
    if (btnAbrirModal) {
        btnAbrirModal.addEventListener("click", () => {
            abrirBuscadorGremio();
        });
    }
});

// Visualización de Badges
function renderizarRasgosYCicatrices(rasgos = {}, cicatrices = {}) {
  const contenedorRasgos = document.getElementById("contenedor-rasgos");
  const contenedorCicatrices = document.getElementById("contenedor-cicatrices");

  const procesarLista = (datos) => {
    if (!datos) return [];
    if (Array.isArray(datos)) {
      return datos.map(item => typeof item === 'string' 
        ? { nombre: item, acumulaciones: 1, icono: '✨' }
        : {
            nombre: item.nombre || item.titulo || "Desconocido",
            acumulaciones: Number(item.contador || item.acumulaciones || 1),
            icono: item.icono || '✨',
            desc: item.desc || item.descripcion || ''
          }
      );
    }
    return Object.entries(datos).map(([key, val]) => {
      if (typeof val === 'object' && val !== null) {
        return {
          nombre: val.nombre || key,
          acumulaciones: Number(val.contador || val.acumulaciones || 1),
          icono: val.icono || '✨',
          desc: val.desc || ''
        };
      }
      return { nombre: key, acumulaciones: typeof val === 'number' ? val : 1, icono: '✨', desc: '' };
    });
  };

  if (contenedorRasgos) {
    const lista = procesarLista(rasgos);
    contenedorRasgos.innerHTML = lista.length === 0 
      ? `<p style="color:#718096; font-size:0.9rem;">Ningún rasgo obtenido aún.</p>`
      : lista.map(r => `<div class="item-huella rasgo" title="${r.desc}"><span>${r.icono}</span><strong>${r.nombre} +${r.acumulaciones}</strong></div>`).join('');
  }

  if (contenedorCicatrices) {
    const lista = procesarLista(cicatrices);
    contenedorCicatrices.innerHTML = lista.length === 0 
      ? `<p style="color:#718096; font-size:0.9rem;">Tu historial está limpio de cicatrices.</p>`
      : lista.map(c => `<div class="item-huella cicatriz" title="${c.desc}"><span>${c.icono || '🩸'}</span><strong>${c.nombre} +${c.acumulaciones}</strong></div>`).join('');
  }
}

// Control de Acordeón
function inicializarAcordeon() {
  const botones = document.querySelectorAll(".acordeon-botones .btn-tab:not(.btn-enlace)");
  const panelContenido = document.getElementById("panel-contenido");

  botones.forEach(boton => {
    boton.addEventListener("click", () => {
      const tabNombre = boton.getAttribute("data-tab");
      const tabObjetivo = document.getElementById(`tab-${tabNombre}`);

      if (!tabObjetivo) return;

      if (boton.classList.contains("activo")) {
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

// Renderizado de Misiones Locales en Perfil
function renderizarMisiones(misiones) {
  const contenedor = document.getElementById("contenedor-misiones");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  if (!misiones || misiones.length === 0) {
    contenedor.innerHTML = `
      <div class="sin-misiones-box">
        <p class="sin-datos">No tienes exploraciones de portales activas.</p>
        <a href="misiones.html" class="btn-ir-tablon">⚔️ Explorar Portales Comunitarios</a>
      </div>`;
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
        <p>📖 ${mision.paginas} págs | Estado: <strong>${mision.estado}</strong></p>
        ${mision.esGrupal ? `<p class="badge-grupo">👥 Exploración en Grupo (+Puntos Clan)</p>` : ''}
      </div>
      <div class="mision-acciones-btn">
        ${!esTerminada ? `<button class="btn-accion btn-completar" data-index="${index}">✅ Completar Lectura</button>` : ''}
        <button class="btn-accion btn-cancelar" data-index="${index}">❌ ${esTerminada ? 'Eliminar' : 'Abandonar'}</button>
      </div>
    `;

    const btnCompletar = tarjeta.querySelector(".btn-completar");
    if (btnCompletar) {
      btnCompletar.addEventListener("click", () => completarMisionLocal(index));
    }

    const btnCancelar = tarjeta.querySelector(".btn-cancelar");
    if (btnCancelar) {
      btnCancelar.addEventListener("click", () => eliminarMisionLocal(index));
    }

    contenedor.appendChild(tarjeta);
  });
}

async function completarMisionLocal(index) {
  try {
    const mision = misionesLocales[index];
    if (!mision) return;

    const paginas = mision.paginas || 0;
    const generoLibro = mision.genero || (Array.isArray(mision.generos) ? mision.generos[0] : "Fantasía");
    const tituloLibro = mision.titulo || "Exploración Personal";
    const autorLibro = mision.autor || "Desconocido";

    // ⚔️ 1. INVOCAR ENFRENTAMIENTO FINAL DEL MAESTRO DEL CALABOZO
    const avisoCarga = document.createElement("div");
    avisoCarga.style.cssText = "position:fixed; top:20px; right:20px; background:#2a221b; color:#ffd700; border:2px solid #8b5a2b; padding:12px 20px; border-radius:6px; z-index:10000; font-family:'Cinzel',serif;";
    avisoCarga.textContent = "🔮 Invocando el desafío final de la obra...";
    document.body.appendChild(avisoCarga);

    const encuentro = await generarEnfrentamientoFinal(tituloLibro, autorLibro, generoLibro);
    avisoCarga.remove();

    await mostrarModalEncuentro(encuentro);

    mision.estado = "TERMINADA";

    // Recompensas (SIN XP, solo Prestigio, Marcapáginas y Botín)
    const gananciaPrestigio = paginas + Math.floor(Math.random() * (paginas + 1));
    const gananciaMarcapaginas = Math.floor(Math.random() * (paginas || 1)) + 1;

    const userSnap = await getDoc(currentUserDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    let mochilaActual = userData.mochila || userData.objetosMagicos || [];
    let seguidoresActuales = userData.seguidores || [];

    // Procesar tirada estocástica de objeto mágico
    const mochilaActualizada = [...mochilaActual];
    let mensajeObjeto = "";
    if (encuentro.recompensaObjeto) {
      mochilaActualizada.push(encuentro.recompensaObjeto);
      mensajeObjeto = `\n🎁 ¡Objeto obtenido! "${encuentro.recompensaObjeto.nombre}"`;
    } else {
      mensajeObjeto = `\n🍃 Esta vez el calabozo no reveló ningún objeto material.`;
    }

    // Procesar seguidores independientes (20%)
    let nuevosSeguidores = [...seguidoresActuales];
    let mensajeSeguidor = "";
    if (encuentro.seguidorDesbloqueado) {
      const yaExiste = seguidoresActuales.some(s => s.nombre === encuentro.seguidorDesbloqueado.nombre);
      if (!yaExiste) {
        nuevosSeguidores.push({
          nombre: encuentro.seguidorDesbloqueado.nombre,
          frase: encuentro.seguidorDesbloqueado.frase,
          origen: tituloLibro
        });
        mensajeSeguidor = `\n👥 ¡Nuevo compañero! "${encuentro.seguidorDesbloqueado.nombre}" se ha unido a tus viajes.`;
      }
    }

    let bonusClanText = "";
    if (mision.esGrupal && userData.clanId) {
      const clanRef = doc(db, "clanes", userData.clanId);
      const puntosExtraClan = Math.ceil(paginas * 0.5);
      await updateDoc(clanRef, { puntosClan: increment(puntosExtraClan) });
      bonusClanText = `\n🛡️ ¡+${puntosExtraClan} Puntos aportados a tu Clan por lectura compartida!`;
    }

    // Actualizar Firestore con Prestigio, Marcapáginas y Mochila (sin tocar XP)
    await updateDoc(currentUserDocRef, {
      misionesSecundarias: misionesLocales,
      prestigio: increment(gananciaPrestigio),
      marcapaginas: increment(gananciaMarcapaginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1),
      mochila: mochilaActualizada,
      seguidores: nuevosSeguidores
    });

    // 🎲 Tirada estocástica de Rasgos / Cicatrices por género
    const listaGeneros = mision.generos || [generoLibro];
    const resultadoRecompensa = await procesarRecompensaPorGeneros(currentUserId, listaGeneros, paginas);

    let infoRecompensas = "";
    if (resultadoRecompensa && resultadoRecompensa.recompensas.length > 0) {
      const nombresObtenidos = resultadoRecompensa.recompensas.map(r => `${r.item.icono || (r.tipo === 'rasgos' ? '✨' : '🩸')} ${r.item.nombre}`).join(", ");
      infoRecompensas = `\n✨ Rasgos/Cicatrices: ${nombresObtenidos}`;
    }

    // 📚 GUARDAR EN BIBLIOTECA GLOBAL, ESTANTERÍA Y ATLAS
    const idUnicoLibro = tituloLibro.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-') + "_" + index;
    const datosLibroParaAtlas = {
      id: idUnicoLibro,
      titulo: tituloLibro,
      autor: autorLibro,
      paginas: paginas,
      genero: generoLibro,
      portadaUrl: mision.portadaUrl || "https://via.placeholder.com/150x220?text=Sin+Portada",
      fechaTerminado: new Date().toISOString()
    };

    await registrarLibroEnBibliotecaYAtlas(currentUserId, datosLibroParaAtlas);

    // 🍺 ASEGURAR HILO EN LA TABERNA
    await asegurarHiloTaberna(currentUserId, datosLibroParaAtlas, 'misiones');

    alert(`🎉 ¡Portal del libro Explorado con Éxito!\n\n🏆 +${gananciaPrestigio} Prestigio\n🔖 +${gananciaMarcapaginas} Marcapáginas${mensajeObjeto}${mensajeSeguidor}${infoRecompensas}${bonusClanText}\n📚 El lomo luce en tu Estantería, el Atlas ha sido iluminado y ¡se ha abierto su debate en la Taberna!`);
    
    await cargarDatosAventurero(currentUserDocRef);

  } catch (error) {
    console.error("Error al completar la misión local:", error);
    alert("❌ Error al procesar la recompensa de la misión.");
  }
}

async function eliminarMisionLocal(index) {
  if (!confirm("¿Deseas quitar esta misión de tu lista?")) return;
  misionesLocales.splice(index, 1);
  await updateDoc(currentUserDocRef, { misionesSecundarias: misionesLocales });
  renderizarMisiones(misionesLocales);
}

// ==========================================
// SECCIÓN: MISIONES SECUNDARIAS / TABLÓN COOPERATIVO
// ==========================================

async function cargarMisionesSecundariasPerfil(userId) {
  const contenedor = document.getElementById("lista-misiones-usuario");
  if (!contenedor) return;

  try {
    contenedor.innerHTML = "<small>Buscando tus contratos activos...</small>";
    
    const q = query(collection(db, "misionesSecundarias"), where("usuariosAceptaron", "array-contains", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      contenedor.innerHTML = `<p style="font-size: 0.85rem; font-style: italic;">No estás participando en ninguna misión secundaria actualmente. ¡Visita el tablón o crea una nueva!</p>`;
      return;
    }

    contenedor.innerHTML = "";
    querySnapshot.forEach((misionDoc) => {
      const data = misionDoc.data();
      const id = misionDoc.id;
      const esCreador = data.creadorId === userId;
      const yaCompleto = data.usuariosCompletaron && data.usuariosCompletaron.includes(userId);

      const divItem = document.createElement("div");
      divItem.style.cssText = "background: rgba(255,248,231,0.6); border: 1px solid #8b5a2b; padding: 10px; border-radius: 4px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; gap: 10px;";

      divItem.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${data.portadaUrl || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'}" style="width: 40px; height: 55px; object-fit: cover; border-radius: 3px;">
          <div>
            <strong style="font-size: 0.95rem; color: #2a150c;">${data.titulo}</strong><br>
            <small style="color: #5c4033;">Autor: ${data.autor} | ${yaCompleto ? '✅ <span style="color:green;">Completado</span>' : '⏳ <span style="color:#b26a00;">En curso</span>'}</small>
          </div>
        </div>
        <div style="display: flex; gap: 5px; align-items: center;" id="acciones-perfil-${id}">
          <!-- Botones dinámicos -->
        </div>
      `;

      contenedor.appendChild(divItem);

      const divAcciones = document.getElementById(`acciones-perfil-${id}`);
      
      if (!yaCompleto) {
        const btnTerminar = document.createElement("button");
        btnTerminar.className = "btn-secundario";
        btnTerminar.style.background = "#2e7d32";
        btnTerminar.style.fontSize = "0.75rem";
        btnTerminar.style.padding = "5px 8px";
        btnTerminar.textContent = "🏁 Terminar";
        btnTerminar.onclick = () => completarMisionDesdePerfil(id, data, userId);
        divAcciones.appendChild(btnTerminar);
      }

      if (esCreador) {
        const btnEliminar = document.createElement("button");
        btnEliminar.className = "btn-secundario";
        btnEliminar.style.background = "#c62828";
        btnEliminar.style.fontSize = "0.75rem";
        btnEliminar.style.padding = "5px 8px";
        btnEliminar.textContent = "🗑️ Borrar";
        btnEliminar.onclick = () => eliminarMisionSecundariaPerfil(id);
        divAcciones.appendChild(btnEliminar);
      }
    });

  } catch (err) {
    console.error("Error al cargar misiones secundarias del perfil:", err);
    contenedor.innerHTML = "<small style='color:red;'>Error al cargar tus misiones secundarias.</small>";
  }
}

async function completarMisionDesdePerfil(id, data, userId) {
  if (!confirm(`¿Deseas dar por terminado el libro "${data.titulo}"? ¡Te enfrentarás a su prueba final antes de reclamar tu gloria!`)) return;
  
  try {
    const generoLibro = data.genero || (Array.isArray(data.generos) ? data.generos[0] : "Fantasía");
    
    const avisoCarga = document.createElement("div");
    avisoCarga.style.cssText = "position:fixed; top:20px; right:20px; background:#2a221b; color:#ffd700; border:2px solid #8b5a2b; padding:12px 20px; border-radius:6px; z-index:10000; font-family:'Cinzel',serif;";
    avisoCarga.textContent = "🔮 Invocando el desafío final de la obra...";
    document.body.appendChild(avisoCarga);

    const encuentro = await generarEnfrentamientoFinal(data.titulo, data.autor || "Desconocido", generoLibro);
    avisoCarga.remove();

    await mostrarModalEncuentro(encuentro);

    const misionRef = doc(db, "misionesSecundarias", id);
    const userRef = doc(db, "aventureros", userId);

    const updates = { usuariosCompletaron: arrayUnion(userId) };
    if (data.creadorId === userId) {
      updates.activa = false; 
    }
    await updateDoc(misionRef, updates);

    const paginas = Number(data.paginas) || 100;
    const prestigioBase = paginas * 0.5;
    const prestigioTotal = Math.round(prestigioBase + 100);

    const userDocSnap = await getDoc(userRef);
    let rasgActuales = [];
    let cicatActuales = [];
    let mochilaActual = [];
    let seguidoresActuales = [];

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      rasgActuales = userData.rasgos || [];
      cicatActuales = userData.cicatrices || [];
      mochilaActual = userData.mochila || userData.objetosMagicos || [];
      seguidoresActuales = userData.seguidores || [];
    }

    const nuevosRasgos = [...new Set([...rasgActuales, ...(data.rasgosOtorga || [])])];
    const nuevasCicatrices = [...new Set([...cicatActuales, ...(data.cicatricesOtorga || [])])];

    const mochilaActualizada = [...mochilaActual];
    let mensajeObjeto = "";
    if (encuentro.recompensaObjeto) {
      mochilaActualizada.push(encuentro.recompensaObjeto);
      mensajeObjeto = `\n🎁 ¡Objeto obtenido! "${encuentro.recompensaObjeto.nombre}" (${encuentro.recompensaObjeto.rareza}: ${encuentro.recompensaObjeto.efecto})`;
    } else {
      mensajeObjeto = `\n🍃 Esta vez el calabozo no reveló ningún objeto material.`;
    }

    let nuevosSeguidores = [...seguidoresActuales];
    let mensajeSeguidor = "";
    if (encuentro.seguidorDesbloqueado) {
      const yaExiste = seguidoresActuales.some(s => s.nombre === encuentro.seguidorDesbloqueado.nombre);
      if (!yaExiste) {
        nuevosSeguidores.push({
          nombre: encuentro.seguidorDesbloqueado.nombre,
          frase: encuentro.seguidorDesbloqueado.frase,
          origen: data.titulo
        });
        mensajeSeguidor = `\n👥 ¡Nuevo compañero! "${encuentro.seguidorDesbloqueado.nombre}" se ha unido a tus viajes.`;
      }
    }

    await updateDoc(userRef, {
      prestigio: increment(prestigioTotal),
      rasgos: nuevosRasgos,
      cicatrices: nuevasCicatrices,
      mochila: mochilaActualizada,
      seguidores: nuevosSeguidores,
      librosCompletados: increment(1),
      paginasLeidas: increment(paginas)
    });

    const datosLibroParaAtlas = {
      id: id,
      titulo: data.titulo,
      autor: data.autor || "Desconocido",
      paginas: paginas,
      genero: generoLibro,
      portadaUrl: data.portadaUrl || data.portada || "https://via.placeholder.com/150x220?text=Sin+Portada",
      fechaTerminado: new Date().toISOString()
    };

    await registrarLibroEnBibliotecaYAtlas(userId, datosLibroParaAtlas);

    // 🍺 ASEGURAR HILO EN LA TABERNA
    await asegurarHiloTaberna(userId, datosLibroParaAtlas, 'misiones');

    alert(`🎉 ¡Desafío superado y misión completada!\n\n🏆 +${prestigioTotal} Puntos de Prestigio${mensajeObjeto}${mensajeSeguidor}\n📚 El lomo ya luce en tu Estantería, el Atlas ha sido iluminado y ¡se ha abierto su debate en la Taberna!`);
    
    location.reload();

  } catch (err) {
    console.error("Error al completar misión desde perfil con enfrentamiento:", err);
    alert("Hubo un error al procesar el combate final o registrar la obra.");
  }
}

async function eliminarMisionSecundariaPerfil(id) {
  if (!confirm("¿Estás seguro de querer eliminar este contrato del tablón gremial? Esta acción no se puede deshacer.")) return;
  try {
    await deleteDoc(doc(db, "misionesSecundarias", id));
    alert("Encargo eliminado del tablón.");
    location.reload();
  } catch (err) {
    console.error("Error al eliminar misión:", err);
    alert("No se pudo eliminar el encargo.");
  }
}

// Inicializadores Generales
function inicializarCerrarSesion() {
  const btnLogout = document.getElementById("btn-logout");
  if (btnLogout) {
    btnLogout.addEventListener("click", () => signOut(auth).then(() => window.location.href = "index.html"));
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

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "avatar_users");

      const res = await fetch(`https://api.cloudinary.com/v1_1/dwuokewzr/image/upload`, {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Error en subida de avatar");
      const data = await res.json();
      await updateDoc(currentUserDocRef, { avatarUrl: data.secure_url });
      alert("✨ Avatar actualizado");
      await cargarDatosAventurero(currentUserDocRef);
    } catch (err) {
      console.error(err);
      alert("❌ Fallo al cambiar el avatar");
    }
  });
}

function renderizarMochilaYSeguidores(dataAventurero) {
  const contenedorObjetos = document.getElementById("contenedor-objetos-mochila");
  const contenedorSeguidores = document.getElementById("contenedor-seguidores-perfil");

  const objetos = dataAventurero.mochila || dataAventurero.objetosMagicos || [];
  if (contenedorObjetos) {
    if (objetos.length === 0) {
      contenedorObjetos.innerHTML = `<p style="font-style: italic; color: #718096; font-size: 0.9rem;">Ningún artefacto mágico guardado.</p>`;
    } else {
      contenedorObjetos.innerHTML = objetos.map(obj => `
        <div style="background: rgba(255,248,231,0.7); border: 1px solid #8b5a2b; border-radius: 4px; padding: 10px; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.8rem;">${obj.icono || '🎁'}</span>
          <div>
            <strong style="font-size: 0.9rem; color: #2a150c; display: block;">${obj.nombre}</strong>
            <small style="color: #5c4033; font-size: 0.75rem;">${obj.efecto}</small>
          </div>
        </div>
      `).join("");
    }
  }

  const seguidores = dataAventurero.seguidores || [];
  if (contenedorSeguidores) {
    if (seguidores.length === 0) {
      contenedorSeguidores.innerHTML = `<p style="font-style: italic; color: #718096; font-size: 0.9rem;">Aún viajas en solitario por las tierras del Gremio.</p>`;
    } else {
      contenedorSeguidores.innerHTML = seguidores.map(seg => `
        <div style="background: rgba(139, 90, 43, 0.1); border-left: 4px solid #8b5a2b; padding: 8px 12px; border-radius: 0 4px 4px 0;">
          <strong style="color: #3b2219; font-size: 0.9rem;">${seg.nombre}</strong>
          <p style="margin: 4px 0 0 0; font-size: 0.85rem; font-style: italic; color: #5c4033;">«${seg.frase}»</p>
        </div>
      `).join("");
    }
  }
}