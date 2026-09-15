/**
 * js/sintetizadorPerfil.js
 * Genera resúmenes narrativos y arquetipos del perfil del lector
 * basándose en rasgos, cicatrices y atributos D&D acumulados.
 */

import { calcularEstadoAventurero, calcularStatsTotales } from "./sistemaGamificacion.js";

/**
 * Genera la narrativa de evolución del Aventurero Lector.
 * @param {Object} estadisticas - Objeto proveniente de Firestore: { rasgos: {}, cicatrices: {}, atributos: {} }
 * @returns {Object} { tituloArquetipo, resumenTextual, estadoActual, statsTotales }
 */
export function generarResumenEvolucion(estadisticas = {}) {
  const rasgosMap = estadisticas.rasgos || {};
  const cicatricesMap = estadisticas.cicatrices || {};
  const atributosBase = estadisticas.atributos || {};

  const listaRasgos = Object.entries(rasgosMap).map(([id, data]) => ({ id, ...data }));
  const listaCicatrices = Object.entries(cicatricesMap).map(([id, data]) => ({ id, ...data }));

  // Si no hay huellas ni cicatrices registradas
  if (listaRasgos.length === 0 && listaCicatrices.length === 0) {
    return {
      tituloArquetipo: "Neófito de las Letras",
      resumenTextual: "Aún no has cruzado suficientes páginas para que las lecturas dejen marcas en tu carácter. Tu viaje como aventurero apenas comienza.",
      estadoActual: calcularEstadoAventurero(atributosBase, [], [])
    };
  }

  // 1. Calcular stats totales acumuladas y estado actual
  const statsTotales = calcularStatsTotales(atributosBase, listaRasgos, listaCicatrices);
  const estadoActual = calcularEstadoAventurero(statsTotales, listaRasgos, listaCicatrices);

  // 2. Extraer los rasgos y cicatrices más destacados por contador
  const topRasgos = [...listaRasgos].sort((a, b) => (b.contador || 1) - (a.contador || 1)).slice(0, 2);
  const topCicatrices = [...listaCicatrices].sort((a, b) => (b.contador || 1) - (a.contador || 1)).slice(0, 2);

  // 3. Determinar el arquetipo basado en las huellas más influyentes (Corrige el error de parámetro)
  const tituloArquetipo = determinarArquetipoNarrativo(topRasgos, topCicatrices, estadoActual);

  // 4. Construcción del texto fluido estilo "Cronista"
  let texto = "Tras tus travesías a través de las páginas, tu mente ha experimentado una transformación evidente. ";

  if (topRasgos.length > 0) {
    const nombresR = topRasgos
      .map(r => `<strong>${r.nombre}</strong> (x${r.contador || 1})`)
      .join(" y ");
    texto += `La lectura constante ha forjado en ti rasgos como ${nombresR}, otorgándote una perspicacia y sensibilidad singulares ante el mundo. `;
  }

  if (topCicatrices.length > 0) {
    const nombresC = topCicatrices
      .map(c => `<strong>${c.nombre}</strong> (x${c.contador || 1})`)
      .join(" y ");
    texto += `Sin embargo, cada historia profunda exige su tributo: cargas con la marca de ${nombresC}, lo que añade matices de cautela, distancia o dilemas a tu carácter. `;
  }

  texto += `Actualmente, tu espíritu se manifiesta bajo la forma de un <strong>${estadoActual.titulo}</strong>. No vuelves de un libro siendo la misma persona: te transformas en un aventurero más despierto y complejo.`;

  return {
    tituloArquetipo,
    resumenTextual: texto,
    estadoActual,
    statsTotales
  };
}

/**
 * Algoritmo para determinar el arquetipo dinámico combinando
 * huellas dominantes y el estado actual del aventurero.
 */
function determinarArquetipoNarrativo(topRasgos = [], topCicatrices = [], estadoActual = {}) {
  const principalR = (topRasgos[0]?.id || "").toLowerCase();
  const principalC = (topCicatrices[0]?.id || "").toLowerCase();

  if (principalR.includes("imaginativ") || principalR.includes("vision") || principalR.includes("sueño")) {
    if (principalC.includes("paralisis") || principalC.includes("existencial")) return "El Soñador Distante";
    return "El Visionario Onírico";
  }

  if (principalR.includes("critico") || principalR.includes("analit") || principalR.includes("erudito")) {
    if (principalC.includes("cinismo") || principalC.includes("escepticismo") || principalC.includes("frialdad")) {
      return "El Filósofo Desilusionado";
    }
    return "El Analista Perspicaz";
  }

  if (principalR.includes("valentia") || principalR.includes("resiliencia") || principalR.includes("voluntad")) {
    if (principalC.includes("hipervigilancia") || principalC.includes("paranoia")) return "El Centinela Alerta";
    return "El Guardián Inquebrantable";
  }

  if (principalR.includes("sensibilidad") || principalR.includes("poeti") || principalR.includes("empatia")) {
    return "El Místico Empático";
  }

  // Fallback al título de estado dinámico si no hay coincidencia directa
  return estadoActual.titulo || "El Viajero de Mil Almas";
}