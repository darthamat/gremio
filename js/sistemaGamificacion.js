// js/sistemaGamificacion.js
import { BANCO_HUELLAS } from "./rasgosData.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();

// Obtiene la clave de género compatible con BANCO_HUELLAS
function normalizarGenero(genero) {
  if (!genero) return "fantasia";
  const g = genero.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  if (g.includes("fantas") || g.includes("epica")) return "fantasia";
  if (g.includes("poes") || g.includes("poet")) return "poesia";
  if (g.includes("terror") || g.includes("horror") || g.includes("mister")) return "terror";
  if (g.includes("histor")) return "historia";
  if (g.includes("filos")) return "filosofia";
  if (g.includes("cienc") || g.includes("scifi") || g.includes("ficcion")) return "ciencia_ficcion";
  if (g.includes("negr") || g.includes("polic") || g.includes("thriller")) return "novela_negra";
  if (g.includes("ensa") || g.includes("divulg")) return "ensayo";
  if (g.includes("biogr") || g.includes("memor")) return "biografia";

  return "fantasia";
}

/**
 * Procesa la recompensa de lectura:
 * - 70% de probabilidad de ganar 1 Rasgo.
 * - 30% de probabilidad de ganar 1 Cicatriz.
 */
export async function procesarRecompensaLectura(userId, generoLibro) {
  const claveGenero = normalizarGenero(generoLibro);
  const poolGenero = BANCO_HUELLAS[claveGenero] || BANCO_HUELLAS.fantasia;

  // Tirada de dado (1 al 100)
  const tirada = Math.floor(Math.random() * 100) + 1;
  const esCicatriz = tirada <= 30; // 30% probabilidad (1-30)

  let itemObtenido = null;
  let tipo = "";

  if (esCicatriz && poolGenero.cicatrices.length > 0) {
    const idx = Math.floor(Math.random() * poolGenero.cicatrices.length);
    itemObtenido = poolGenero.cicatrices[idx];
    tipo = "cicatrices";
  } else {
    const idx = Math.floor(Math.random() * poolGenero.rasgos.length);
    itemObtenido = poolGenero.rasgos[idx];
    tipo = "rasgos";
  }

  // Actualizar estadísticas del usuario en Firestore
  const userRef = doc(db, "aventureros", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const estadisticas = userData.estadisticas || { rasgos: {}, cicatrices: {}, atributos: {} };

  if (!estadisticas[tipo]) estadisticas[tipo] = {};

  // Acumular o incrementar el rasgo/cicatriz (e.g. { "sensibilidad_linguistica": { contador: 3, ... } })
  const itemId = itemObtenido.id;
  if (estadisticas[tipo][itemId]) {
    estadisticas[tipo][itemId].contador += 1;
  } else {
    estadisticas[tipo][itemId] = {
      nombre: itemObtenido.nombre,
      icono: itemObtenido.icono,
      desc: itemObtenido.desc,
      contador: 1
    };
  }

  // Guardar en Firestore
  await updateDoc(userRef, { estadisticas });

  return { tipo, item: itemObtenido, contador: estadisticas[tipo][itemId].contador };
}