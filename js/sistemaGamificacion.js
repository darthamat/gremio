// js/sistemaGamificacion.js
import { BANCO_HUELLAS } from "./rasgosData.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const db = getFirestore();

/**
 * Normaliza cualquier texto de género a la clave compatible en BANCO_HUELLAS
 */
export function normalizarGenero(genero) {
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
  if (g.includes("roman") || g.includes("amor")) return "romance";

  return "fantasia";
}

/**
 * Obtiene un pool unificado uniendo las huellas genéricas con las del género.
 * Mezcla libre para selección o asignación de recompensas.
 */
export function obtenerHuellasDisponibles(generoLibro) {
  const claveGenero = normalizarGenero(generoLibro);
  const genericas = BANCO_HUELLAS.generica || { rasgos: [], cicatrices: [] };
  const especificas = BANCO_HUELLAS[claveGenero] || { rasgos: [], cicatrices: [] };

  return {
    rasgos: [
      ...genericas.rasgos.map(r => ({ ...r, origen: "generica" })),
      ...especificas.rasgos.map(r => ({ ...r, origen: claveGenero }))
    ],
    cicatrices: [
      ...genericas.cicatrices.map(c => ({ ...c, origen: "generica" })),
      ...especificas.cicatrices.map(c => ({ ...c, origen: claveGenero }))
    ]
  };
}

/**
 * Procesa la recompensa de lectura usando el pool unificado (Genéricas + Género).
 * - 70% de probabilidad de ganar 1 Rasgo.
 * - 30% de probabilidad de ganar 1 Cicatriz.
 */
export async function procesarRecompensaLectura(userId, generoLibro) {
  const pool = obtenerHuellasDisponibles(generoLibro);

  // Tirada de dado (1 al 100)
  const tirada = Math.floor(Math.random() * 100) + 1;
  const esCicatriz = tirada <= 30; // 30% probabilidad

  let itemObtenido = null;
  let tipo = "";

  if (esCicatriz && pool.cicatrices.length > 0) {
    const idx = Math.floor(Math.random() * pool.cicatrices.length);
    itemObtenido = pool.cicatrices[idx];
    tipo = "cicatrices";
  } else {
    const idx = Math.floor(Math.random() * pool.rasgos.length);
    itemObtenido = pool.rasgos[idx];
    tipo = "rasgos";
  }

  // Actualizar en Firestore
  const userRef = doc(db, "aventureros", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const userData = userSnap.data();
  const estadisticas = userData.estadisticas || { rasgos: {}, cicatrices: {}, atributos: {} };

  if (!estadisticas[tipo]) estadisticas[tipo] = {};

  const itemId = itemObtenido.id;
  if (estadisticas[tipo][itemId]) {
    estadisticas[tipo][itemId].contador += 1;
  } else {
    estadisticas[tipo][itemId] = {
      nombre: itemObtenido.nombre,
      icono: itemObtenido.icono,
      desc: itemObtenido.desc,
      modificadores: itemObtenido.modificadores || {},
      contador: 1
    };
  }

  await updateDoc(userRef, { estadisticas });

  return { tipo, item: itemObtenido, contador: estadisticas[tipo][itemId].contador };
}

/**
 * Recalcula los atributos D&D base aplicando los modificadores
 * acumulados por los rasgos y cicatrices equipados/obtenidos.
 */
export function calcularStatsTotales(atributosBase = {}, rasgosEquipados = [], cicatricesEquipadas = []) {
  const statsFinales = {
    fuerza: Number(atributosBase.fuerza || atributosBase.FUE) || 0,
    destreza: Number(atributosBase.destreza || atributosBase.DES) || 0,
    constitucion: Number(atributosBase.constitucion || atributosBase.CON) || 0,
    inteligencia: Number(atributosBase.inteligencia || atributosBase.INT) || 0,
    sabiduria: Number(atributosBase.sabiduria || atributosBase.SAB) || 0,
    carisma: Number(atributosBase.carisma || atributosBase.CAR) || 0
  };

  const aplicarLista = (lista) => {
    lista.forEach(item => {
      if (item && item.modificadores) {
        Object.entries(item.modificadores).forEach(([stat, valor]) => {
          if (statsFinales[stat] !== undefined) {
            statsFinales[stat] += valor;
          }
        });
      }
    });
  };

  aplicarLista(rasgosEquipados);
  aplicarLista(cicatricesEquipadas);

  return statsFinales;
}

/**
 * Evalúa el Estado del Aventurero basándose en los stats totales,
 * rasgos y cicatrices.
 */
export function calcularEstadoAventurero(stats = {}, rasgosEquipados = [], cicatricesEquipadas = []) {
  const { fuerza: fue, destreza: des, constitucion: con, inteligencia: int, sabiduria: sab, carisma: car } = stats;

  const tieneId = (lista, idBuscado) => lista.some(item => (item.id || item) === idBuscado);
  const tienePalabraClave = (lista, kw) => 
    lista.some(item => (item.nombre || item.id || "").toLowerCase().includes(kw.toLowerCase()));

  // 1. Estados por Sinergias o Cicatrices Específicas
  if (tieneId(cicatricesEquipadas, "espera_de_destino") || tieneId(cicatricesEquipadas, "paralisis_decision")) {
    return {
      titulo: "Parálisis del Elegido",
      icono: "⏳",
      descripcion: "Aguardas una llamada trascendental o te pierdes en matices, postergando las acciones cotidianas.",
      claseCSS: "estado-paralisis"
    };
  }

  if (tieneId(cicatricesEquipadas, "hipervigilancia") || tieneId(cicatricesEquipadas, "mirada_suspicaz")) {
    return {
      titulo: "Centinela Paranoico",
      icono: "👁️",
      descripcion: "Evalúas constantemente salidas, sombras y segundas intenciones. Tu mente rara vez descansa.",
      claseCSS: "estado-alerta"
    };
  }

  if (fue >= 12 && (sab <= -8 || int <= -8)) {
    return {
      titulo: "Bestia Indómita",
      icono: "🧌",
      descripcion: "Fuerza descomunal e impulsiva. Prefieres aplastar dilemas directos antes que filosofar.",
      claseCSS: "estado-bestia"
    };
  }

  if (int >= 14 && car <= -8) {
    return {
      titulo: "Erudito Frío",
      icono: "📐",
      descripcion: "Desmontas argumentos con frialdad matemática. Implacable con la verdad, distante con la gente.",
      claseCSS: "estado-erudito"
    };
  }

  if (car >= 10 && sab >= 10 && (tienePalabraClave(rasgosEquipados, "poéti") || tienePalabraClave(rasgosEquipados, "sensibilidad"))) {
    return {
      titulo: "Poeta Místico",
      icono: "🥀",
      descripcion: "Un espíritu contemplativo que transforma la vulnerabilidad en belleza conmovedora.",
      claseCSS: "estado-romantico"
    };
  }

  // 2. Evaluador por Atributo Dominante
  const mapaAtributos = [
    { val: fue, max: { t: "Titán de Voluntad", i: "🔥", d: "Tu determinación e impacto físico se imponen a cualquier obstáculo." }, min: { t: "Espíritu Frágil", i: "🪶", d: "Te agotas rápidamente ante el esfuerzo o la confrontación." } },
    { val: des, max: { t: "Reflejo Relámpago", i: "⚡", d: "Agilidad mental y física milimétrica para reaccionar ante lo imprevisto." }, min: { t: "Pasos Torpes", i: "🗿", d: "Dificultad para adaptarte rápido o moverte con fluidez." } },
    { val: con, max: { t: "Fortaleza Eterna", i: "🛡️", d: "Inmune al cansancio; tu cuerpo y mente soportan largas jornadas de tensión." }, min: { t: "Salud Quebradiza", i: "🥀", d: "Propenso al agotamiento o la fatiga por sobrecarga." } },
    { val: int, max: { t: "Mente Omnisciente", i: "🧠", d: "Procesas datos, estructuras y teorías a una velocidad asombrosa." }, min: { t: "Pensamiento Enturbiado", i: "🌫️", d: "Te cuesta conectar conceptos complejos o mantener el rigor analítico." } },
    { val: sab, max: { t: "Oráculo Perspicaz", i: "🔮", d: "Intuición profunda para descifrar verdades ocultas y matices." }, min: { t: "Criterio a la Deriva", i: "🎈", d: "Desconectado del sentido común o con idealismos irrealizables." } },
    { val: car, max: { t: "Musa Magnética", i: "✨", d: "Presencia y elocuencia fascinantes capaces de mover a cualquiera." }, min: { t: "Sombra Aislada", i: "👤", d: "Tendencia a pasar desapercibido o recluirte." } }
  ];

  mapaAtributos.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
  const dominante = mapaAtributos[0];

  if (dominante.val >= 12) {
    return { titulo: dominante.max.t, icono: dominante.max.i, descripcion: dominante.max.d, claseCSS: "estado-extremo-alto" };
  }

  if (dominante.val <= -10) {
    return { titulo: dominante.min.t, icono: dominante.min.i, descripcion: dominante.min.d, claseCSS: "estado-extremo-bajo" };
  }

  // 3. Estado Neutro / Equilibrado
  return {
    titulo: "Aventurero Equilibrado",
    icono: "⚔️",
    descripcion: "Tus atributos se mantienen en armonía. Balanceas mente, emoción y fortaleza.",
    claseCSS: "estado-equilibrado"
  };
}