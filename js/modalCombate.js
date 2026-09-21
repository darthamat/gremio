// js/modalCombate.js

export function mostrarModalEncuentro(encuentroData) {
  return new Promise((resolve) => {
    // Eliminar modal anterior si existiera
    const modalAnterior = document.getElementById("modal-enfrentamiento-boss");
    if (modalAnterior) modalAnterior.remove();

    const overlay = document.createElement("div");
    overlay.id = "modal-enfrentamiento-boss";
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(10, 5, 2, 0.85); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      animation: fadeIn 0.3s ease;
    `;

    overlay.innerHTML = `
      <div style="
        background: #1e1510; border: 4px solid #d4af37; border-radius: 8px;
        max-width: 600px; width: 90%; padding: 25px; color: #f3e5ab;
        box-shadow: 0 0 30px rgba(212, 175, 55, 0.4); font-family: 'Cinzel', serif;
        position: relative; text-align: center;
      ">
        <h2 style="color: #ffcc00; margin-top: 0; border-bottom: 2px solid #8b5a2b; padding-bottom: 10px;">
          ⚔️ ENFRENTAMIENTO FINAL: ${encuentroData.tituloEncuentro}
        </h2>
        
        <p style="font-style: italic; font-size: 1.05rem; line-height: 1.6; margin: 20px 0; color: #e6ccb2;">
          «${encuentroData.narracion}»
        </p>

        <div id="contenedor-opciones-boss" style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
          ${encuentroData.opciones.map((op, index) => `
            <button class="btn-opcion-boss" data-index="${index}" style="
              background: #3b2219; color: #f3e5ab; border: 2px solid #8b5a2b;
              padding: 12px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;
              text-align: left; transition: all 0.2s;
            ">
              🗡️ ${op.texto}
            </button>
          `).join("")}
        </div>

        <div id="resultado-boss-texto" style="margin-top: 20px; font-weight: bold; display: none;"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    const botones = overlay.querySelectorAll(".btn-opcion-boss");
    const resultadoDiv = document.getElementById("resultado-boss-texto");

    botones.forEach(btn => {
      btn.addEventListener("click", (e) => {
        const idx = e.currentTarget.getAttribute("data-index");
        const opcionElegida = encuentroData.opciones[idx];

        // Desactivar todos los botones
        botones.forEach(b => b.style.pointerEvents = "none");

        resultadoDiv.style.display = "block";
        resultadoDiv.textContent = opcionElegida.resultado;
        resultadoDiv.style.color = opcionElegida.esCorrecta ? "#4CAF50" : "#ff6b6b";

        // Estilizar botón elegido
        e.currentTarget.style.background = opcionElegida.esCorrecta ? "#2e7d32" : "#c62828";

        // Esperar 3 segundos para que lea el resultado y cerrar con éxito
        setTimeout(() => {
          overlay.remove();
          resolve({
            victorioso: opcionElegida.esCorrecta,
            recompensa: encuentroData.recompensaObjeto,
            seguidor: encuentroData.seguidorDesbloqueado
          });
        }, 3500);
      });
    });
  });
}