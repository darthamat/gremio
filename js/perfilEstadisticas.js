// js/perfilEstadisticas.js

export function renderizarEstadisticasAcordeon(estadisticas = {}) {
  const contenedorAcordeon = document.getElementById("acordeon-estadisticas");
  if (!contenedorAcordeon) return;

  const { rasgos = {}, cicatrices = {}, atributosBase = {} } = estadisticas;

  // 1. Atributos D&D por defecto (Valor Base = 10)
  const atributos = {
    fuerza: atributosBase.fuerza || 10,
    destreza: atributosBase.destreza || 10,
    constitucion: atributosBase.constitucion || 10,
    inteligencia: atributosBase.inteligencia || 10,
    sabiduria: atributosBase.sabiduria || 10,
    carisma: atributosBase.carisma || 10
  };

  // 2. Acumuladores de modificadores totales por atributo
  const modificadores = { fuerza: 0, destreza: 0, constitucion: 0, inteligencia: 0, sabiduria: 0, carisma: 0 };

  // Sumar bonos de Rasgos (+X)
  Object.values(rasgos).forEach(r => {
    const contador = r.contador || 1;
    if (r.modificadores) {
      Object.entries(r.modificadores).forEach(([attr, mod]) => {
        if (modificadores[attr] !== undefined) modificadores[attr] += mod * contador;
      });
    }
  });

  // Sumar o restar penalizaciones de Cicatrices (-X)
  Object.values(cicatrices).forEach(c => {
    const contador = c.contador || 1;
    if (c.modificadores) {
      Object.entries(c.modificadores).forEach(([attr, mod]) => {
        if (modificadores[attr] !== undefined) modificadores[attr] += mod * contador;
      });
    }
  });

  // Configuración visual de atributos
  const listaAtributos = [
    { id: "fuerza", nombre: "Fuerza", icono: "⚔️" },
    { id: "destreza", nombre: "Destreza", icono: "🗡️" },
    { id: "constitucion", nombre: "Constitución", icono: "🛡️" },
    { id: "inteligencia", nombre: "Inteligencia", icono: "🧠" },
    { id: "sabiduria", nombre: "Sabiduría", icono: "📜" },
    { id: "carisma", nombre: "Carisma", icono: "👑" }
  ];

  contenedorAcordeon.innerHTML = `
    <!-- SECCIÓN 1: HOJA DE ATRIBUTOS ESTILO D&D -->
    <div class="seccion-acordeon">
      <button class="header-acordeon activo">📊 Atributos Principales del Aventurero</button>
      <div class="contenido-acordeon" style="display: block;">
        <div class="grid-dnd-atributos">
          ${listaAtributos.map(attr => {
            const base = atributos[attr.id];
            const mod = modificadores[attr.id];
            const total = base + mod;
            const esNegativo = total < 0;
            const esMaldito = mod < 0;
            const esPotenciado = mod > 0;

            let badgeClase = "mod-neutro";
            let textoMod = "0";
            if (mod > 0) { badgeClase = "mod-positivo"; textoMod = `+${mod}`; }
            if (mod < 0) { badgeClase = "mod-negativo"; textoMod = `${mod}`; }

            return `
              <div class="card-dnd ${esNegativo ? 'atributo-locura' : ''}">
                <div class="card-header-dnd">
                  <span class="icono-dnd">${attr.icono}</span>
                  <span class="nombre-attr">${attr.nombre}</span>
                </div>
                <div class="valor-total ${esNegativo ? 'texto-locura' : esPotenciado ? 'texto-epico' : ''}">
                  ${total}
                </div>
                <div class="desglose-attr">
                  <small>Base: ${base}</small>
                  <span class="badge-mod ${badgeClase}">${textoMod}</span>
                </div>
                ${esNegativo ? `<div class="alerta-estado">⚠️ Mente Fragmentada</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>

    <!-- SECCIÓN 2: RASGOS ACUMULADOS -->
    <div class="seccion-acordeon">
      <button class="header-acordeon">✨ Rasgos e Inclinaciones (${Object.keys(rasgos).length})</button>
      <div class="contenido-acordeon">
        ${Object.keys(rasgos).length === 0 
          ? `<p class="vacio">Aún no has forjado rasgos. Completa lecturas para moldear tu espíritu.</p>` 
          : `<div class="lista-huellas">
              ${Object.values(rasgos).map(r => `
                <div class="item-huella rasgo">
                  <span class="icono">${r.icono}</span>
                  <div class="detalles">
                    <strong>${r.nombre} <span class="badge-multiplicador">+${r.contador}</span></strong>
                    <p>${r.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>`
        }
      </div>
    </div>

    <!-- SECCIÓN 3: CICATRICES Y MARCAS -->
    <div class="seccion-acordeon">
      <button class="header-acordeon">🩸 Cicatrices de Lectura (${Object.keys(cicatrices).length})</button>
      <div class="contenido-acordeon">
        ${Object.keys(cicatrices).length === 0 
          ? `<p class="vacio">Tu mente se mantiene ilesa. No posees traumas ni cicatrices aún.</p>` 
          : `<div class="lista-huellas">
              ${Object.values(cicatrices).map(c => `
                <div class="item-huella cicatriz">
                  <span class="icono">${c.icono}</span>
                  <div class="detalles">
                    <strong>${c.nombre} <span class="badge-multiplicador">+${c.contador}</span></strong>
                    <p>${c.desc}</p>
                  </div>
                </div>
              `).join('')}
            </div>`
        }
      </div>
    </div>
  `;

  // Listener para colapsar/desplegar acordeón
  const botones = contenedorAcordeon.querySelectorAll(".header-acordeon");
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("activo");
      const contenido = btn.nextElementSibling;
      contenido.style.display = contenido.style.display === "block" ? "none" : "block";
    });
  });
}