import { calcularEstadoAventurero } from "./sistemaEstados.js";

export function comprobarYMostrarSubidaNivel(usuarioData, xpGanada) {
    const xpActual = usuarioData.xp || 0;
    const nivelActual = usuarioData.nivel || 1;
    
    // Ejemplo: Cada nivel requiere (Nivel * 1000) XP
    const xpNecesaria = nivelActual * 1000; 

    if (xpActual >= xpNecesaria) {
        const nuevoNivel = nivelActual + 1;
        
        // 1. Obtener el estado/arquetipo dinámico actual
        const estado = calcularEstadoAventurero(
            usuarioData.estadisticas, 
            usuarioData.rasgos, 
            usuarioData.cicatrices
        );

        // 2. Rellenar los datos en el Modal
        document.getElementById("modal-nuevo-nivel").textContent = `NIVEL ${nuevoNivel}`;
        document.getElementById("modal-icono-estado").textContent = estado.icono;
        document.getElementById("modal-titulo-estado").textContent = estado.titulo;
        document.getElementById("modal-desc-estado").textContent = `"${estado.descripcion}"`;

        // 3. Mostrar Modal
        const modal = document.getElementById("modal-subida-nivel");
        if (modal) modal.classList.remove("oculto");

        return nuevoNivel;
    }
    
    return nivelActual;
}

// Evento para cerrar el modal
document.getElementById("btn-cerrar-nivel")?.addEventListener("click", () => {
    document.getElementById("modal-subida-nivel").classList.add("oculto");
});