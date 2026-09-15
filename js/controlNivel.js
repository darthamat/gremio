// js/controlNivel.js
import { calcularEstadoAventurero, calcularStatsTotales } from "./sistemaGamificacion.js";

/**
 * Comprueba si el aventurero sube de nivel tras ganar XP y muestra el modal con su nuevo estado.
 * @param {Object} usuarioData - Datos completos del usuario en Firestore.
 * @param {number} xpGanada - Cantidad de XP obtenida recientemente.
 * @returns {number} Nuevo nivel del usuario (o el actual si no subió).
 */
export function comprobarYMostrarSubidaNivel(usuarioData = {}, xpGanada = 0) {
    const xpActual = (usuarioData.xp || 0) + xpGanada;
    const nivelActual = usuarioData.nivel || 1;
    
    // Umbral de XP: Nivel * 1000
    const xpNecesaria = nivelActual * 1000; 

    if (xpActual >= xpNecesaria) {
        const nuevoNivel = nivelActual + 1;

        // Extraer y transformar rasgos, cicatrices y atributos
        const estadisticas = usuarioData.estadisticas || {};
        const atributosBase = usuarioData.atributos || estadisticas.atributos || {};
        
        const rasgosMap = usuarioData.rasgos || estadisticas.rasgos || {};
        const cicatricesMap = usuarioData.cicatrices || estadisticas.cicatrices || {};

        const listaRasgos = Object.entries(rasgosMap).map(([id, data]) => ({ id, ...data }));
        const listaCicatrices = Object.entries(cicatricesMap).map(([id, data]) => ({ id, ...data }));

        // 1. Recalcular stats finales y estado dinámico
        const statsTotales = calcularStatsTotales(atributosBase, listaRasgos, listaCicatrices);
        const estado = calcularEstadoAventurero(statsTotales, listaRasgos, listaCicatrices);

        // 2. Rellenar los datos en el Modal HTML
        const elNuevoNivel = document.getElementById("modal-nuevo-nivel");
        const elIcono = document.getElementById("modal-icono-estado");
        const elTitulo = document.getElementById("modal-titulo-estado");
        const elDesc = document.getElementById("modal-desc-estado");

        if (elNuevoNivel) elNuevoNivel.textContent = `NIVEL ${nuevoNivel}`;
        if (elIcono) elIcono.textContent = estado.icono;
        if (elTitulo) elTitulo.textContent = estado.titulo;
        if (elDesc) elDesc.textContent = `"${estado.descripcion}"`;

        // 3. Mostrar el Modal
        const modal = document.getElementById("modal-subida-nivel");
        if (modal) modal.classList.remove("oculto");

        return nuevoNivel;
    }
    
    return nivelActual;
}

// Event Listener para cerrar el modal de nivel
document.getElementById("btn-cerrar-nivel")?.addEventListener("click", () => {
    const modal = document.getElementById("modal-subida-nivel");
    if (modal) modal.classList.add("oculto");
});