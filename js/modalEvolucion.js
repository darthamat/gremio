export function mostrarModalEvolucion(ganancias = []) {
    // Si no obtuvo ningún rasgo en la tirada aleatoria
    if (ganancias.length === 0) {
        alert("📖 Has concluido la lectura. Esta obra ha servido como asentamiento de tus conocimientos actuales.");
        return;
    }

    // Crear el overlay del modal en el DOM
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const tarjetasHTML = ganancias.map(g => `
        <div class="tarjeta-ganancia ${g.tipo}">
            <div class="icono-ganancia">${g.icono}</div>
            <div class="info-ganancia">
                <div class="cabecera-ganancia">
                    <strong>${g.nombre}</strong>
                    <span class="badge-incremento">+${g.nivel}</span>
                </div>
                <p>${g.desc}</p>
                <small class="tipo-tag">${g.tipo === 'ganancia' ? 'Habilidad Adquirida / Fortalecida' : 'Huella / Carga MENTAL'}</small>
            </div>
        </div>
    `).join("");

    overlay.innerHTML = `
        <div class="modal-pergamino">
            <h2>📜 Transformación del Lector</h2>
            <p class="subtitulo-modal">Ningún libro nos deja exactamente igual que antes de abrirlo. Tras este viaje has desarrollado:</p>
            
            <div class="lista-ganancias">
                ${tarjetasHTML}
            </div>

            <button class="btn-reto btn-cerrar-modal" id="btn-cerrar-modal">Aceptar y Registrar</button>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("btn-cerrar-modal").addEventListener("click", () => {
        overlay.remove();
    });
}