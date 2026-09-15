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
 * Comprueba si el aventurero sube de nivel con la nueva XP acumulada.
 */
export function comprobarYMostrarSubidaNivel(usuarioData = {}, xpGanada = 0) {
    const xpActual = (usuarioData.xp || 0) + xpGanada;
    let nivelActual = usuarioData.nivel || 1;
    let subioDeNivel = false;

    // Bucle para permitir subir múltiples niveles si gana mucha XP de golpe
    while (xpActual >= calcularXPNecesaria(nivelActual + 1)) {
        nivelActual++;
        subioDeNivel = true;
    }

    if (subioDeNivel) {
        // Extraer y transformar rasgos, cicatrices y atributos
        const estadisticas = usuarioData.estadisticas || {};
        const atributosBase = usuarioData.atributos || estadisticas.atributos || {};
        
        const rasgosMap = usuarioData.rasgos || estadisticas.rasgos || {};
        const cicatricesMap = usuarioData.cicatrices || estadisticas.cicatrices || {};

        const listaRasgos = Object.entries(rasgosMap).map(([id, data]) => ({ id, ...data }));
        const listaCicatrices = Object.entries(cicatricesMap).map(([id, data]) => ({ id, ...data }));

        // Recalcular stats finales y estado dinámico
        const statsTotales = calcularStatsTotales(atributosBase, listaRasgos, listaCicatrices);
        const estado = calcularEstadoAventurero(statsTotales, listaRasgos, listaCicatrices);

        // Actualizar Modal HTML
        const elNuevoNivel = document.getElementById("modal-nuevo-nivel");
        const elIcono = document.getElementById("modal-icono-estado");
        const elTitulo = document.getElementById("modal-titulo-estado");
        const elDesc = document.getElementById("modal-desc-estado");

        if (elNuevoNivel) elNuevoNivel.textContent = `NIVEL ${nivelActual}`;
        if (elIcono) elIcono.textContent = estado.icono;
        if (elTitulo) elTitulo.textContent = estado.titulo;
        if (elDesc) elDesc.textContent = `"${estado.descripcion}"`;

        // Mostrar Modal
        const modal = document.getElementById("modal-subida-nivel");
        if (modal) modal.classList.remove("oculto");
    }
    
    return nivelActual;
}

// Event Listener para cerrar el modal
document.getElementById("btn-cerrar-nivel")?.addEventListener("click", () => {
    const modal = document.getElementById("modal-subida-nivel");
    if (modal) modal.classList.add("oculto");
});