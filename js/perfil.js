// js/perfil.js
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, doc, getDoc, updateDoc, increment 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { renderizarEstadisticasAcordeon } from "./perfilEstadisticas.js";
import { procesarRecompensaPorGeneros } from "./sistemaGamificacion.js";
import { actualizarBarraNivelUI, comprobarYMostrarSubidaNivel } from "./controlNivel.js";

// Único buscador necesario para el modal del perfil
import { inicializarBuscadorGremio, abrirBuscadorGremio } from "./buscadorGremio.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
let currentUserDocRef = null;
let misionesLocales = [];

// Auth Listener
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUserId = user.uid;
  currentUserDocRef = doc(db, "aventureros", user.uid);

  await cargarDatosAventurero(currentUserDocRef);
  inicializarAcordeon();
  inicializarCerrarSesion();
  inicializarAvatar();
});

// Carga de datos del perfil
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
}

// Inicialización del DOM y los modales del Gremio
document.addEventListener("DOMContentLoaded", () => {
    // Inicializa los eventos del buscador de Google Books en el perfil
    inicializarBuscadorGremio();

    // Vincula el botón principal para abrir el modal de registro de lectura
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

// Renderizado de Misiones en Perfil
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

    mision.estado = "TERMINADA";

    const paginas = mision.paginas || 0;
    const gananciaXP = paginas + Math.floor(Math.random() * (paginas + 1));
    const gananciaMarcapaginas = Math.floor(Math.random() * (paginas || 1)) + 1;

    const userSnap = await getDoc(currentUserDocRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const nuevoNivel = comprobarYMostrarSubidaNivel(userData, gananciaXP);

    let bonusClanText = "";
    if (mision.esGrupal && userData.clanId) {
      const clanRef = doc(db, "clanes", userData.clanId);
      const puntosExtraClan = Math.ceil(paginas * 0.5);
      await updateDoc(clanRef, { puntosClan: increment(puntosExtraClan) });
      bonusClanText = `\n🛡️ ¡+${puntosExtraClan} Puntos aportados a tu Clan por lectura compartida!`;
    }

    // Actualizamos los contadores principales del aventurero y su lista de misiones
    await updateDoc(currentUserDocRef, {
      misionesSecundarias: misionesLocales,
      xp: increment(gananciaXP),
      nivel: nuevoNivel,
      marcapaginas: increment(gananciaMarcapaginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1)
    });

    // --- LLAMADA AL SISTEMA OFICIAL DE GAMIFICACIÓN ---
    // Esto se encarga de hacer las tiradas automáticas según las páginas,
    // aplicar los porcentajes oficiales del banco y guardarlo en 'estadisticas.rasgos/cicatrices'
    const listaGeneros = mision.generos || [mision.genero || "fantasia"];
    const resultadoRecompensa = await procesarRecompensaPorGeneros(currentUserId, listaGeneros, paginas);

    let infoRecompensas = "";
   if (resultadoRecompensa && resultadoRecompensa.recompensas.length > 0) {
      const nombresObtenidos = resultadoRecompensa.recompensas.map(r => `${r.item.icono || (r.tipo === 'rasgos' ? '✨' : '🩸')} ${r.item.nombre}`).join(", ");
      infoRecompensas = `\n🎁 Rasgos otorgados: ${nombresObtenidos}`;
    } else {
      infoRecompensas = `\n🍃 Esta vez los vientos de la lectura no dejaron nuevos rasgos.`;
    }

    alert(`🎉 ¡Portal del libro Explorado con Éxito!\n\n✨ +${gananciaXP} XP\n🔖 +${gananciaMarcapaginas} Marcapáginas${infoRecompensas}${bonusClanText}`);
    
    await cargarDatosAventurero(currentUserDocRef);

  } catch (error) {
    console.error("Error al completar la misión:", error);
    alert("❌ Error al procesar la recompensa de la misión.");
  }
}
async function eliminarMisionLocal(index) {
  if (!confirm("¿Deseas quitar esta misión de tu lista?")) return;
  misionesLocales.splice(index, 1);
  await updateDoc(currentUserDocRef, { misionesSecundarias: misionesLocales });
  renderizarMisiones(misionesLocales);
}

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