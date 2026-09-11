import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { completarRetoGremio } from "./gestorLibros.js";

const auth = getAuth(app);
const db = getFirestore(app);

let usuarioSesionId = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  usuarioSesionId = user.uid;
  await cargarYRenderizarRetos();
});

// Convierte 'reto26_01' o 'reto25_12' a 'Enero 2026'
function formatearIdAMesYAno(idDocumento, fechaCreacion) {
  const patron = /^reto(\d{2})_(\d{2})$/i;
  const coincidencia = idDocumento.match(patron);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", 
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  if (coincidencia) {
    const ano = `20${coincidencia[1]}`;
    const mesIndex = parseInt(coincidencia[2], 10) - 1;
    if (mesIndex >= 0 && mesIndex < 12) {
      return `${meses[mesIndex]} ${ano}`;
    }
  }

  if (fechaCreacion) {
    const fecha = new Date(fechaCreacion);
    const mesNombre = meses[fecha.getMonth()];
    return `${mesNombre} ${fecha.getFullYear()}`;
  }

  return "Reto del Gremio";
}

// Resumen temático
function obtenerResumenGemini(tituloLibro) {
  if (!tituloLibro) return "Resumen no disponible en los pergaminos de la biblioteca.";
  const tituloNormalizado = tituloLibro.toLowerCase().trim();

  const resumenes = {
    "una novela de ajedrez": "Novela de ficción histórica escrita por Stefan Zweig. Ambientada en la Viena de principios del siglo XX, narra la historia de un joven prodigio del ajedrez que lucha contra la opresión y la soledad mientras se enfrenta a desafíos tanto en el tablero como en su vida personal.",
    "don quijote": "Obra cumbre de la literatura española. Sigue las aventuras de Alonso Quijano, un hidalgo que decide convertirse en caballero andante para impartir justicia.",
    "el hobbit": "Novela fantástica de J.R.R. Tolkien sobre Bilbo Bolsón y un viaje extraordinario para recuperar un tesoro custodiado por un dragón.",
    "1984": "Distopía política de George Orwell sobre una sociedad dominada por el Gran Hermano donde el pensamiento libre está reprimido."
  };

  for (const [clave, resumen] of Object.entries(resumenes)) {
    if (tituloNormalizado.includes(clave)) return resumen;
  }

  return `Una notable obra titulada "${tituloLibro}" seleccionada por el Gremio para ser leída y analizada en este ciclo de exploración.`;
}

// Biografía breve del autor desde Wikipedia
async function obtenerBiografiaAutor(nombreAutor) {
  if (!nombreAutor || nombreAutor === "Desconocido") return "No hay registro en la gran biblioteca sobre este autor.";
  try {
    const respuesta = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(nombreAutor)}`);
    if (!respuesta.ok) return `Información sobre ${nombreAutor} no encontrada en los archivos de la biblioteca.`;
    const datos = await respuesta.json();
    return datos.extract || `Biografía de ${nombreAutor} no disponible.`;
  } catch (err) {
    return `No se pudo consultar el oráculo para obtener la biografía de ${nombreAutor}.`;
  }
}

async function cargarYRenderizarRetos() {
  try {
    const userRef = doc(db, "aventureros", usuarioSesionId);
    const userSnap = await getDoc(userRef);
    const usuarioData = userSnap.exists() ? userSnap.data() : {};

    const retosAceptados = (usuarioData.retosAceptados || []).map(id => String(id).trim());
    const retosCompletados = (usuarioData.retosCompletados || []).map(id => String(id).trim());

    const snapshot = await getDocs(collection(db, "retos"));
    let todosLosRetos = [];

    snapshot.forEach((docSnap) => {
      todosLosRetos.push({
        id: String(docSnap.id).trim(),
        ...docSnap.data()
      });
    });

    if (todosLosRetos.length === 0) {
      document.getElementById("contenedor-reto-actual").innerHTML = `<p class="sin-datos">No hay misiones activas registradas en el Cónclave.</p>`;
      return;
    }

    // 1. SELECCIONAR RETO ACTUAL
    let retoActual = todosLosRetos.find(r => r.id === "actual" || r.esActual === true) || todosLosRetos[0];

    // 2. FILTRAR HISTÓRICOS DESDUPLICADOS
    let retosHistoricos = todosLosRetos.filter(r => {
      if (r.id === retoActual.id) return false;
      if (r.id === "actual") return false;
      if (retoActual.titulo && r.titulo && retoActual.titulo.toLowerCase() === r.titulo.toLowerCase() && r.id.startsWith("reto")) {
        return false;
      }
      return true;
    });

    retosHistoricos.sort((a, b) => b.id.localeCompare(a.id));

    // Renderizar Header y Reto Actual
    const contenedorActual = document.getElementById("contenedor-reto-actual");
    const elProponente = document.getElementById("proponente-reto");

    const proponenteNombre = retoActual.proponente || "un misterioso aventurero del Cónclave";

    if (elProponente) {
      elProponente.textContent = proponenteNombre;
    }

    const esAceptadoActual = retosAceptados.includes(retoActual.id) || retosAceptados.includes("actual");
    const esCompletadoActual = retosCompletados.includes(retoActual.id) || retosCompletados.includes("actual");

    const resumenFinal = retoActual.resumenObra || obtenerResumenGemini(retoActual.libro || retoActual.titulo);
    const autor = retoActual.autor || "Desconocido";
    const genero = retoActual.genero || "No especificado";
    const paginas = retoActual.paginas || "N/A";
    const fechaPublicacion = retoActual.fechaPublicacion || "Desconocida";
    const recompensaPuntos = Number(paginas) || 0;
    const portadaImagen = retoActual.portadaUrl || retoActual.portada || 'img/placeholder-book.jpg';

    // DETECCIÓN DEL MENSAJE DE LA LECTORA Y PROPONENTE
    const mensajeProponente = 
      retoActual.mensajeProponente || 
      retoActual.mensaje || 
      retoActual.proclama || 
      (typeof retoActual.proponente === 'object' ? retoActual.proponente.mensaje : null) ||
      `Por orden del Archimago y gran Bibliotecario Aurelius Vane, yo la gran Lectora Lady Elena Astralis en nombre de ${proponenteNombre}, convoco a todos los miembros del Gremio a explorar el portal mágico que esconde esta obra.`;

    // Proclama/Indicaciones del Archimago
    const objetivoAdmin = retoActual.objetivoAdmin || 
      `Completar la lectura íntegra del tomo antes de que termine el ciclo mensual y compartir vuestras reflexiones en la Taberna de la Tinta para recibir vuestra justa recompensa de prestigio.`;

    if (contenedorActual) {
      contenedorActual.innerHTML = `
        <!-- PROCLAMA MÁGICA / DECRETO TEMÁTICO DE ENCABEZADO -->
        <div class="proclama-tematica-box">
          <div class="proclama-header">📜 Propuesto por ${proponenteNombre}</div>
          <p class="proclama-texto">«${mensajeProponente}»</p>
        </div>

        <div class="card-reto-actual">
          <div class="portada-frame">
            <img src="${portadaImagen}" alt="${retoActual.titulo}" onerror="this.onerror=null; this.src='img/placeholder-book.jpg';">
            ${esCompletadoActual ? `<div class="sello-cera-css">COMPLETADO</div>` : ''}
          </div>
          <div class="info-reto-actual">
            <h2>${retoActual.titulo || "Misión del Mes"}</h2>
            
            <div class="bloque-resumen">
              <strong>📖 Resumen de la Obra:</strong>
              <p>${resumenFinal}</p>
            </div>

            <div class="ficha-tecnica">
              <div class="ficha-item">
                <span>✍️ Cronista:</span> 
                <div class="ficha-item-autor">
                  <strong class="autor-hover" id="autor-link">${autor}</strong>
                  <div class="tooltip-autor" id="tooltip-autor">
                    <div class="tooltip-header">🔮 Biografía del Autor</div>
                    <div class="tooltip-body" id="tooltip-body">Cargando biografía...</div>
                  </div>
                </div>
              </div>
              <div class="ficha-item"><span>🏷️ Reino:</span> <strong>${genero}</strong></div>
              <div class="ficha-item"><span>📄 Páginas:</span> <strong>${paginas} pág.</strong></div>
              <div class="ficha-item"><span>📅 Publicación:</span> <strong>${fechaPublicacion}</strong></div>
            </div>

            <!-- PROCLAMA Y OBJETIVO DEL ARCHIMAGO / ADMIN -->
            <div class="bloque-objetivo-admin">
              <strong>🛡️ Mandato del Archimago:</strong>
              <p>${objetivoAdmin}</p>
            </div>

            <div class="meta-info">
              <span>📖 Tomo Asignado: <strong>${retoActual.libro || retoActual.titulo}</strong></span>
              <span>🏆 Recompensa: <strong>+${recompensaPuntos} Prestigio</strong></span>
            </div>

            <div class="acciones-reto">
              ${esCompletadoActual ? `
                <div class="bloque-completado">
                  <div class="sello-completado">📜 MISIÓN CUMPLIDA</div>
                  <a href="taberna.html?retoId=${retoActual.id}" class="btn-magico btn-taberna">
                    🍻 Comentar en la Taberna
                  </a>
                </div>
              ` : `
                <button id="btn-aceptar" class="btn-magico ${esAceptadoActual ? 'aceptado' : ''}" ${esAceptadoActual ? 'disabled' : ''}>
                  ${esAceptadoActual ? '⚔️ Misión Aceptada' : '🗡️ Aceptar Misión'}
                </button>
                <button id="btn-terminar" class="btn-magico exito">
                  ✨ Marcar Misión Completada
                </button>
              `}
            </div>
          </div>
        </div>
      `;

      // Evento Hover para Biografía
      const autorLink = document.getElementById("autor-link");
      const tooltipBody = document.getElementById("tooltip-body");
      let biografiaCargada = false;

      if (autorLink && tooltipBody) {
        autorLink.addEventListener("mouseenter", async () => {
          if (!biografiaCargada && autor !== "Desconocido") {
            tooltipBody.textContent = await obtenerBiografiaAutor(autor);
            biografiaCargada = true;
          }
        });
      }

      if (!esCompletadoActual) {
        const btnAceptar = document.getElementById("btn-aceptar");
        const btnTerminar = document.getElementById("btn-terminar");

        if (btnAceptar && !esAceptadoActual) {
          btnAceptar.addEventListener("click", () => aceptarReto(retoActual.id));
        }
        if (btnTerminar) {
          btnTerminar.addEventListener("click", () => terminarReto(retoActual.id, recompensaPuntos));
        }
      }
    }

    // Renderizar Retos Pasados
    const contenedorPasados = document.getElementById("contenedor-retos-pasados");
    if (contenedorPasados) {
      contenedorPasados.innerHTML = "";
      if (retosHistoricos.length === 0) {
        contenedorPasados.innerHTML = `<p class="sin-datos">No hay expediciones pasadas en el archivo del Cónclave.</p>`;
        return;
      }

      retosHistoricos.forEach((reto) => {
        const fueCompletado = retosCompletados.includes(reto.id);
        const puntosHistorico = Number(reto.paginas) || 0;
        const tituloFecha = formatearIdAMesYAno(reto.id, reto.fechaCreacion);

        const item = document.createElement("div");
        item.className = "card-reto-pasado";
        item.innerHTML = `
          <div class="portada-miniatura">
            <img src="${reto.portadaUrl || reto.portada || 'img/placeholder-book.jpg'}" alt="${reto.titulo}" onerror="this.onerror=null; this.src='img/placeholder-book.jpg';">
            ${fueCompletado ? `<div class="sello-completado mini">COMPLETADO</div>` : ''}
          </div>
          <div class="info-reto-pasado">
            <div class="fecha-reto-header">📅 Expedición de ${tituloFecha}</div>
            <h3>${reto.titulo || 'Reto Antiguo'}</h3>
            <span class="proponente-pasado">Autor: <strong>${reto.autor || 'Desconocido'}</strong></span>
            <span class="proponente-pasado">Recompensa: <strong>+${puntosHistorico} Prestigio</strong></span>
            
            <div class="acciones-reto-pasado">
              ${fueCompletado ? `
                <a href="taberna.html?retoId=${reto.id}" class="btn-magico btn-taberna mini">
                  🍻 Comentar en la Taberna
                </a>
              ` : `
                <button class="btn-magico exito btn-completar-pasado" data-id="${reto.id}" data-puntos="${puntosHistorico}">
                  ✨ Completar (+${puntosHistorico} pts)
                </button>
              `}
            </div>
          </div>
        `;
        contenedorPasados.appendChild(item);
      });

      // Delegación de eventos para completar retos antiguos
      contenedorPasados.querySelectorAll(".btn-completar-pasado").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const idReto = e.currentTarget.getAttribute("data-id");
          const puntos = Number(e.currentTarget.getAttribute("data-puntos")) || 0;
          await terminarReto(idReto, puntos);
        });
      });
    }

  } catch (error) {
    console.error("Error al cargar las misiones del Gremio:", error);
  }
}

async function aceptarReto(retoId) {
  try {
    const userRef = doc(db, "aventureros", usuarioSesionId);
    await updateDoc(userRef, { retosAceptados: arrayUnion(retoId) });
    await cargarYRenderizarRetos();
  } catch (error) {
    console.error("Error al aceptar la misión:", error);
  }
}

// Marca la misión como completada y añade el tomo a la biblioteca del aventurero
async function terminarReto(retoId, puntos) {
  try {
    const retoRef = doc(db, "retos", retoId);
    const retoSnap = await getDoc(retoRef);
    
    let datosReto = {
      id: retoId,
      titulo: "Misión del Gremio",
      autor: "Desconocido",
      portadaUrl: "img/placeholder-book.jpg",
      paginas: puntos || 0,
      genero: "Fantasía"
    };

    if (retoSnap.exists()) {
      const data = retoSnap.data();
      datosReto = {
        id: retoId,
        titulo: data.titulo || data.libro || "Misión del Gremio",
        autor: data.autor || "Desconocido",
        portadaUrl: data.portadaUrl || data.portada || "img/placeholder-book.jpg",
        paginas: Number(data.paginas) || puntos || 0,
        genero: data.genero || "Fantasía"
      };
    }

    // Llamamos al gestor central para actualizar Firestore y otorgar recompensas
    const resultado = await completarRetoGremio(usuarioSesionId, datosReto);

    if (resultado && resultado.exito) {
      await cargarYRenderizarRetos();
    }
  } catch (error) {
    console.error("Error al marcar la misión como completada:", error);
  }
}