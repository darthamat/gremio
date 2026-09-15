import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  increment,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { completarRetoGremio, registrarLibroEnBibliotecaYAtlas } from "./gestorLibros.js";

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
  await cargarMisionesSecundariasGlobales();
});

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

function obtenerResumenGemini(tituloLibro) {
  if (!tituloLibro) return "Resumen no disponible en los pergaminos de la biblioteca.";
  const tituloNormalizado = tituloLibro.toLowerCase().trim();

  const resumenes = {
    "una novela de ajedrez": "Novela de ficción histórica escrita por Stefan Zweig. Ambientada en la Viena de principios del siglo XX, narra la historia de un joven prodigio del ajedrez.",
    "don quijote": "Obra cumbre de la literatura española. Sigue las aventuras de Alonso Quijano, un hidalgo que decide convertirse en caballero andante.",
    "el hobbit": "Novela fantástica de J.R.R. Tolkien sobre Bilbo Bolsón y un viaje extraordinario para recuperar un tesoro.",
    "1984": "Distopía política de George Orwell sobre una sociedad dominada por el Gran Hermano."
  };

  for (const [clave, resumen] of Object.entries(resumenes)) {
    if (tituloNormalizado.includes(clave)) return resumen;
  }

  return `Una notable obra titulada "${tituloLibro}" seleccionada por el Gremio para ser leída y analizada.`;
}

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

// ------------------------------------------------------------------
// 1. CARGA DE RETOS PRINCIPALES DEL GREMIO
// ------------------------------------------------------------------
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

    const contenedorActual = document.getElementById("contenedor-reto-actual");

    if (todosLosRetos.length === 0) {
      if (contenedorActual) {
        contenedorActual.innerHTML = `<p class="sin-datos">No hay misiones activas registradas en el Cónclave.</p>`;
      }
      return;
    }

    let retoActual = todosLosRetos.find(r => r.id === "actual" || r.esActual === true) || todosLosRetos[0];

    let retosHistoricos = todosLosRetos.filter(r => {
      if (r.id === retoActual.id) return false;
      if (r.id === "actual") return false;
      if (retoActual.titulo && r.titulo && retoActual.titulo.toLowerCase() === r.titulo.toLowerCase() && r.id.startsWith("reto")) {
        return false;
      }
      return true;
    });

    retosHistoricos.sort((a, b) => b.id.localeCompare(a.id));

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
    const portadaImagen = retoActual.portadaUrl || retoActual.portada || 'https://via.placeholder.com/150x220?text=Sin+Portada';

    const mensajeProponente = 
      retoActual.mensajeProponente || 
      retoActual.mensaje || 
      retoActual.proclama || 
      `Por orden del Archimago Aurelius Vane, yo, la gran Lectora Lady Elena Astralis, en nombre de ${proponenteNombre}, convoco a todos los miembros a explorar esta obra.`;

    const objetivoAdmin = retoActual.objetivoAdmin || 
      `Completar la lectura íntegra del tomo antes de que termine el ciclo mensual y compartir vuestras reflexiones en la Taberna de la Tinta.`;

    if (contenedorActual) {
      contenedorActual.innerHTML = `
        <div class="proclama-tematica-box">
          <div class="proclama-header">📜 Propuesto por ${proponenteNombre}</div>
          <p class="proclama-texto">«${mensajeProponente}»</p>
        </div>

        <div class="card-reto-actual">
          <div class="portada-frame">
            <img src="${portadaImagen}" 
                 alt="${retoActual.titulo}" 
                 onerror="this.onerror=null; this.src='https://via.placeholder.com/150x220?text=Sin+Portada';">
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

            <div class="bloque-objetivo-admin">
              <strong>🛡️ Mandato del Archimago:</strong>
              <p>${objetivoAdmin}</p>
            </div>

            <div class="meta-info">
              <span>📖 Tomo Asignado: <strong>${retoActual.libro || retoActual.titulo}</strong></span>
              <span>🏆 Recompensa Estimada: <strong>~${Math.round(recompensaPuntos * 1.5)} XP / Prestigio</strong></span>
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
          btnTerminar.addEventListener("click", (e) => terminarReto(retoActual.id, recompensaPuntos, e.target));
        }
      }
    }

    // Renderizar Retos Pasados
    const contenedorPasados = document.getElementById("contenedor-retos-pasados");
    if (contenedorPasados) {
      contenedorPasados.innerHTML = "";
      if (retosHistoricos.length === 0) {
        contenedorPasados.innerHTML = `<p class="sin-datos">No hay expediciones pasadas en el archivo del Cónclave.</p>`;
      } else {
        retosHistoricos.forEach((reto) => {
          const fueCompletado = retosCompletados.includes(reto.id);
          const puntosHistorico = Number(reto.paginas) || 0;
          const tituloFecha = formatearIdAMesYAno(reto.id, reto.fechaCreacion);

          const item = document.createElement("div");
          item.className = "card-reto-pasado";
          item.innerHTML = `
            <div class="portada-miniatura">
              <img src="${reto.portadaUrl || reto.portada || 'https://via.placeholder.com/150x220?text=Sin+Portada'}" 
                   alt="${reto.titulo}" 
                   onerror="this.onerror=null; this.src='https://via.placeholder.com/150x220?text=Sin+Portada';">
              ${fueCompletado ? `<div class="sello-completado mini">COMPLETADO</div>` : ''}
            </div>
            <div class="info-reto-pasado">
              <div class="fecha-reto-header">📅 Expedición de ${tituloFecha}</div>
              <h3>${reto.titulo || 'Reto Antiguo'}</h3>
              <span class="proponente-pasado">Autor: <strong>${reto.autor || 'Desconocido'}</strong></span>
              <span class="proponente-pasado">Páginas: <strong>${puntosHistorico} pág.</strong></span>
              
              <div class="acciones-reto-pasado">
                ${fueCompletado ? `
                  <a href="taberna.html?retoId=${reto.id}" class="btn-magico btn-taberna mini">
                    🍻 Comentar en la Taberna
                  </a>
                ` : `
                  <button class="btn-magico exito btn-completar-pasado" data-id="${reto.id}" data-puntos="${puntosHistorico}">
                    ✨ Completar (+${puntosHistorico} pág.)
                  </button>
                `}
              </div>
            </div>
          `;
          contenedorPasados.appendChild(item);
        });

        contenedorPasados.querySelectorAll(".btn-completar-pasado").forEach(btn => {
          btn.addEventListener("click", async (e) => {
            const boton = e.currentTarget;
            const idReto = boton.getAttribute("data-id");
            const puntos = Number(boton.getAttribute("data-puntos")) || 0;
            await terminarReto(idReto, puntos, boton);
          });
        });
      }
    }

  } catch (error) {
    console.error("Error al cargar las misiones del Gremio:", error);
  }
}

// ------------------------------------------------------------------
// 2. MISIONES SECUNDARIAS GLOBALES
// ------------------------------------------------------------------
async function cargarMisionesSecundariasGlobales() {
  const contenedor = document.getElementById("contenedor-retos-secundarios");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  try {
    const q = query(collection(db, "misionesSecundarias"), where("activa", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      contenedor.innerHTML = `<p class="sin-datos">No hay misiones secundarias activas en el tablero de anuncios.</p>`;
      return;
    }

    snapshot.forEach((docSnap) => {
      const mision = docSnap.data();
      const idMision = docSnap.id;

      const usuariosAceptaron = mision.usuariosAceptaron || [];
      const usuariosCompletaron = mision.usuariosCompletaron || [];

      const aceptadaPorMi = usuariosAceptaron.includes(usuarioSesionId);
      const completadaPorMi = usuariosCompletaron.includes(usuarioSesionId);

      const card = document.createElement("div");
      card.className = "card-reto-pasado reto-secundario";
      card.innerHTML = `
        <div class="portada-miniatura">
          <img src="${mision.portadaUrl || 'https://via.placeholder.com/150x220?text=Sin+Portada'}" 
               alt="${mision.titulo}"
               onerror="this.onerror=null; this.src='https://via.placeholder.com/150x220?text=Sin+Portada';">
          ${completadaPorMi ? `<div class="sello-completado mini">COMPLETADO</div>` : ''}
        </div>
        <div class="info-reto-pasado">
          <span class="badge-tipo">Misión Secundaria</span>
          <h3>${mision.titulo}</h3>
          <span class="proponente-pasado">Autor: <strong>${mision.autor || 'Desconocido'}</strong></span>
          <span class="proponente-pasado">Género: <strong>${mision.genero || 'Fantasía'}</strong></span>
          <span class="proponente-pasado">Páginas: <strong>${mision.paginas || 0} pág.</strong></span>
          <span class="proponente-pasado"><small>Creada por: ${mision.creadorNombre || 'Un Aventurero'}</small></span>

          <div class="acciones-reto-pasado" style="margin-top: 10px;">
            ${completadaPorMi ? `
              <span class="sello-completado mini">✨ Lectura Finalizada</span>
            ` : `
              ${!aceptadaPorMi ? `
                <button class="btn-magico btn-aceptar-secundaria" data-id="${idMision}">
                  🗡️ Unirme a la Misión
                </button>
              ` : `
                <button class="btn-magico exito btn-completar-secundaria" data-id="${idMision}">
                  ✨ Marcar como Leído
                </button>
              `}
            `}
          </div>
        </div>
      `;

      contenedor.appendChild(card);
    });

    // Eventos
    contenedor.querySelectorAll(".btn-aceptar-secundaria").forEach(btn => {
      btn.addEventListener("click", (e) => aceptarMisionSecundaria(e.currentTarget.getAttribute("data-id")));
    });

    contenedor.querySelectorAll(".btn-completar-secundaria").forEach(btn => {
      btn.addEventListener("click", (e) => completarMisionSecundaria(e.currentTarget.getAttribute("data-id"), e.currentTarget));
    });

  } catch (err) {
    console.error("Error al cargar misiones secundarias globales:", err);
  }
}

// Aceptar Misión Secundaria
async function aceptarMisionSecundaria(misionId) {
  try {
    const misionRef = doc(db, "misionesSecundarias", misionId);
    await updateDoc(misionRef, {
      usuariosAceptaron: arrayUnion(usuarioSesionId)
    });
    await cargarMisionesSecundariasGlobales();
  } catch (error) {
    console.error("Error al unirse a la misión secundaria:", error);
  }
}

// Completar Misión Secundaria
async function completarMisionSecundaria(misionId, elementoBoton) {
  if (elementoBoton) {
    elementoBoton.disabled = true;
    elementoBoton.textContent = "⌛ Registrando en el Atlas...";
  }

  try {
    const misionRef = doc(db, "misionesSecundarias", misionId);
    const misionSnap = await getDoc(misionRef);

    if (!misionSnap.exists()) return;

    const data = misionSnap.data();
    const esCreador = data.creadorId === usuarioSesionId;
    const paginas = Number(data.paginas) || 0;

    // 1. Extraer Rasgos y Cicatrices prometidos por la misión
    const rasgosObtenidos = data.rasgosPrometidos || data.rasgosOtorga || [];
    const cicatricesObtenidas = data.cicatricesPrometidas || data.cicatricesOtorga || [];

    // 2. Recompensas Generales
    const gananciaXP = paginas + Math.floor(Math.random() * (paginas + 1));
    const gananciaPrestigio = paginas + Math.floor(Math.random() * (paginas + 1));
    const gananciaMarcapaginas = Math.floor(Math.random() * (paginas || 1)) + 1;

    // 3. Objeto de actualización de perfil
    const updateData = {
      xp: increment(gananciaXP),
      prestigio: increment(gananciaPrestigio),
      marcapaginas: increment(gananciaMarcapaginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1)
    };

    // Añadir los rasgos/cicatrices si la misión los contenía
    if (rasgosObtenidos.length > 0) {
      updateData.rasgos = arrayUnion(...rasgosObtenidos);
    }
    if (cicatricesObtenidas.length > 0) {
      updateData.cicatrices = arrayUnion(...cicatricesObtenidas);
    }

    // Actualizar aventurero en Firestore
    const userRef = doc(db, "aventureros", usuarioSesionId);
    await updateDoc(userRef, updateData);

    // 4. REGISTRAR EN LA BIBLIOTECA Y DIBUJAR EN EL ATLAS
    const datosLibro = {
      id: misionId,
      titulo: data.titulo,
      autor: data.autor,
      genero: data.genero || "Fantasía",
      paginas: paginas,
      portadaUrl: data.portadaUrl || "https://via.placeholder.com/150x220?text=Sin+Portada",
      fechaTerminado: new Date().toISOString()
    };

    await registrarLibroEnBibliotecaYAtlas(usuarioSesionId, datosLibro);

    // Mensaje de feedback de rasgos obtenidos
    let msgHuellas = "";
    if (rasgosObtenidos.length > 0) msgHuellas += `\n✨ Rasgos Impregnados: ${rasgosObtenidos.join(", ")}`;
    if (cicatricesObtenidas.length > 0) msgHuellas += `\n👁️ Cicatrices Marcadas: ${cicatricesObtenidas.join(", ")}`;

    // 5. Marcar la misión como completada por el usuario actual
    if (esCreador) {
      await updateDoc(misionRef, {
        activa: false,
        usuariosCompletaron: arrayUnion(usuarioSesionId)
      });
      alert(`🎉 ¡Has completado tu Misión Secundaria!\n\nAl ser el creador, la misión ha quedado concluida para el Cónclave y el libro se ha incorporado a tu Biblioteca y Atlas.\n\n✨ +${gananciaXP} XP\n🏆 +${gananciaPrestigio} Prestigio\n🔖 +${gananciaMarcapaginas} Marcapáginas${msgHuellas}`);
    } else {
      await updateDoc(misionRef, {
        usuariosCompletaron: arrayUnion(usuarioSesionId)
      });
      alert(`🎉 ¡Misión Secundaria Completada!\n\nEl libro se ha sumado a tu Biblioteca y Atlas personal.\n\n✨ +${gananciaXP} XP\n🏆 +${gananciaPrestigio} Prestigio\n🔖 +${gananciaMarcapaginas} Marcapáginas${msgHuellas}`);
    }

    await cargarMisionesSecundariasGlobales();

  } catch (error) {
    console.error("Error al completar la misión secundaria:", error);
    alert("Ocurrió un error al registrar la misión.");
    if (elementoBoton) elementoBoton.disabled = false;
  }
}

// ------------------------------------------------------------------
// 3. MÉTODOS DE SOPORTE DE RETOS DEL GREMIO
// ------------------------------------------------------------------
async function aceptarReto(retoId) {
  try {
    const userRef = doc(db, "aventureros", usuarioSesionId);
    await updateDoc(userRef, { retosAceptados: arrayUnion(retoId) });
    await cargarYRenderizarRetos();
  } catch (error) {
    console.error("Error al aceptar la misión:", error);
  }
}

async function terminarReto(retoId, puntos, elementoBoton = null) {
  if (elementoBoton) {
    if (elementoBoton.disabled) return;
    elementoBoton.disabled = true;
    elementoBoton.dataset.textoOriginal = elementoBoton.textContent;
    elementoBoton.textContent = "⌛ Reclamando recompensas...";
  }

  try {
    const retoRef = doc(db, "retos", retoId);
    const retoSnap = await getDoc(retoRef);
    
    let datosReto = {
      id: retoId,
      titulo: "Misión del Gremio",
      autor: "Desconocido",
      portadaUrl: "https://via.placeholder.com/150x220?text=Sin+Portada",
      paginas: puntos || 0,
      genero: "Fantasía",
      rasgosOtorga: [],
      cicatricesOtorga: []
    };

    if (retoSnap.exists()) {
      const data = retoSnap.data();
      datosReto = {
        id: retoId,
        titulo: data.titulo || data.libro || "Misión del Gremio",
        autor: data.autor || "Desconocido",
        portadaUrl: data.portadaUrl || data.portada || "https://via.placeholder.com/150x220?text=Sin+Portada",
        paginas: Number(data.paginas) || puntos || 0,
        genero: data.genero || "Fantasía",
        rasgosOtorga: data.rasgosOtorga || [],
        cicatricesOtorga: data.cicatricesOtorga || []
      };
    }

    const paginas = datosReto.paginas;

    const gananciaXP = paginas + Math.floor(Math.random() * (paginas + 1));
    const gananciaPrestigio = paginas + Math.floor(Math.random() * (paginas + 1));
    const gananciaMarcapaginas = Math.floor(Math.random() * (paginas || 1)) + 1;

    const updateData = { 
      retosCompletados: arrayUnion(retoId),
      xp: increment(gananciaXP),
      prestigio: increment(gananciaPrestigio),
      marcapaginas: increment(gananciaMarcapaginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1)
    };

    // Impregnar rasgos si el reto principal también los incluye
    if (datosReto.rasgosOtorga.length > 0) {
      updateData.rasgos = arrayUnion(...datosReto.rasgosOtorga);
    }
    if (datosReto.cicatricesOtorga.length > 0) {
      updateData.cicatrices = arrayUnion(...datosReto.cicatricesOtorga);
    }

    const userRef = doc(db, "aventureros", usuarioSesionId);
    await updateDoc(userRef, updateData);

    await completarRetoGremio(usuarioSesionId, datosReto);

    let msgHuellas = "";
    if (datosReto.rasgosOtorga.length > 0) msgHuellas += `\n✨ Rasgos: ${datosReto.rasgosOtorga.join(", ")}`;
    if (datosReto.cicatricesOtorga.length > 0) msgHuellas += `\n👁️ Cicatrices: ${datosReto.cicatricesOtorga.join(", ")}`;

    alert(`🎉 ¡Misión Cumplida! Recompensas obtenidas:\n\n✨ +${gananciaXP} XP\n🏆 +${gananciaPrestigio} Prestigio\n🔖 +${gananciaMarcapaginas} Marcapáginas${msgHuellas}`);

    await cargarYRenderizarRetos();

  } catch (error) {
    console.error("Error al marcar la misión como completada:", error);
    alert("Ocurrió un error al completar la misión. Inténtalo de nuevo.");
    
    if (elementoBoton) {
      elementoBoton.disabled = false;
      elementoBoton.textContent = elementoBoton.dataset.textoOriginal || "✨ Marcar Misión Completada";
    }
  }
}