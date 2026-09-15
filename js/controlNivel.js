// js/controlNivel.js
import { calcularEstadoAventurero, calcularStatsTotales } from "./sistemaGamificacion.js";


/**
 * Calcula la XP acumulada requerida para alcanzar un nivel dado.
 * Fórmula cuadrática suavizada: 200 * (N - 1)^1.4
 */
export function calcularXPNecesaria(nivel) {
  if (nivel <= 1) return 0;
  return Math.floor(200 * Math.pow(nivel - 1, 1.4));
}

/**
 * Comprueba si el aventurero sube de nivel con la nueva XP acumulada y muestra el modal.
 */
export function comprobarYMostrarSubidaNivel(usuarioData = {}, xpGanada = 0) {
  const xpActual = (usuarioData.xp || 0) + xpGanada;
  let nivelActual = usuarioData.nivel || 1;
  let subioDeNivel = false;

  while (xpActual >= calcularXPNecesaria(nivelActual + 1)) {
    nivelActual++;
    subioDeNivel = true;
  }

  if (subioDeNivel) {
    const estadisticas = usuarioData.estadisticas || {};
    const atributosBase = usuarioData.atributos || estadisticas.atributos || {};
    
    const rasgosMap = usuarioData.rasgos || estadisticas.rasgos || {};
    const cicatricesMap = usuarioData.cicatrices || estadisticas.cicatrices || {};

    const listaRasgos = Array.isArray(rasgosMap) ? rasgosMap : Object.entries(rasgosMap).map(([id, data]) => ({ id, ...data }));
    const listaCicatrices = Array.isArray(cicatricesMap) ? cicatricesMap : Object.entries(cicatricesMap).map(([id, data]) => ({ id, ...data }));

    const statsTotales = calcularStatsTotales(atributosBase, listaRasgos, listaCicatrices);
    const estado = calcularEstadoAventurero(statsTotales, listaRasgos, listaCicatrices);

    const elNuevoNivel = document.getElementById("modal-nuevo-nivel");
    const elIcono = document.getElementById("modal-icono-estado");
    const elTitulo = document.getElementById("modal-titulo-estado");
    const elDesc = document.getElementById("modal-desc-estado");

    if (elNuevoNivel) elNuevoNivel.textContent = `NIVEL ${nivelActual}`;
    if (elIcono) elIcono.textContent = estado.icono;
    if (elTitulo) elTitulo.textContent = estado.titulo;
    if (elDesc) elDesc.textContent = `"${estado.descripcion}"`;

    const modal = document.getElementById("modal-subida-nivel");
    if (modal) modal.classList.remove("oculto");
  }
  
  return nivelActual;
}

// Event Listener global para cerrar el modal
document.getElementById("btn-cerrar-nivel")?.addEventListener("click", () => {
  const modal = document.getElementById("modal-subida-nivel");
  if (modal) modal.classList.add("oculto");
});



export function obtenerProgresoNivel(xpTotal) {
  let nivel = 1;

  while (xpTotal >= calcularXPNecesaria(nivel + 1)) {
    nivel++;
  }

  const xpNivelActual = calcularXPNecesaria(nivel);
  const xpSiguienteNivel = calcularXPNecesaria(nivel + 1);

  const xpEnEsteNivel = xpTotal - xpNivelActual;
  const xpNecesariaEnEsteNivel = xpSiguienteNivel - xpNivelActual;
  const porcentaje = Math.min(Math.floor((xpEnEsteNivel / xpNecesariaEnEsteNivel) * 100), 100);

  return {
    nivel,
    xpActual: xpTotal,
    xpEnEsteNivel,
    xpNecesariaEnEsteNivel,
    porcentaje
  };
}

/**
 * Actualiza los elementos DOM de la barra de nivel usando la fórmula global del sistema.
 */
export function actualizarBarraNivelUI(xpTotal) {
  const progreso = obtenerProgresoNivel(xpTotal);

  // Actualizar Nivel
  const elNivel = document.getElementById("char-level") || document.getElementById("nivel-usuario");
  if (elNivel) elNivel.textContent = progreso.nivel;

  // Actualizar XP Total o texto de progreso
  const elXP = document.getElementById("char-xp");
  if (elXP) elXP.textContent = `${progreso.xpActual} XP`;

  // Actualizar Barra de Progreso
  const barraProgreso = document.getElementById("char-xp-bar") 
    || document.getElementById("barra-xp") 
    || document.querySelector(".xp-bar-fill") 
    || document.querySelector(".progress-bar");

  if (barraProgreso) {
    barraProgreso.style.width = `${progreso.porcentaje}%`;
  }

  // Actualizar Texto de progreso relativo ("350 / 800 XP")
 const xpSiguienteNivel = calcularXPNecesaria(progreso.nivel + 1);
const textoProgreso = document.getElementById("char-xp-next") || document.getElementById("xp-progreso-texto");
if (textoProgreso) {
  textoProgreso.textContent = `${progreso.xpActual} / ${xpSiguienteNivel} XP`;
}

  return progreso;
}