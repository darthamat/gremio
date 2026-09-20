// js/perfilEstadisticas.js

// Convierte Objetos o Arrays de Firestore en una lista uniforme
function normalizarListaEfectos(datos) {
  if (!datos) return [];

  if (Array.isArray(datos)) {
    return datos.map(item => {
      if (typeof item === 'string') return { nombre: item, acumulaciones: 1, modificadores: {} };
      const cant = Number(item.contador || item.acumulaciones || item.nivel || item.cantidad) || 1;
      return {
        nombre: item.nombre || item.titulo || item.rasgo || item.cicatriz || "Desconocido",
        acumulaciones: cant,
        modificadores: item.modificadores || item.stats || item.efectos || {}
      };
    });
  }

  if (typeof datos === 'object') {
    return Object.entries(datos).map(([clave, val]) => {
      if (typeof val === 'object' && val !== null) {
        const cant = Number(val.contador || val.acumulaciones || val.nivel || val.cantidad) || 1;
        return {
          nombre: val.nombre || val.titulo || clave,
          acumulaciones: cant,
          modificadores: val.modificadores || val.stats || val.efectos || {}
        };
      }
      return { 
        nombre: clave, 
        acumulaciones: typeof val === 'number' ? val : 1, 
        modificadores: {} 
      };
    });
  }

  return [];
}

// Busca bonificadores ignorando mayúsculas/minúsculas
function obtenerPuntosModificador(modificadores, statClave) {
  if (!modificadores || typeof modificadores !== 'object') return 0;
  
  const claveBuscada = statClave.toLowerCase();
  for (const [key, value] of Object.entries(modificadores)) {
    if (key.toLowerCase() === claveBuscada) {
      return Number(value) || 0;
    }
  }
  return 0;
}

// Genera la cuadrícula usando el diseño estilo Ficha D&D de tu CSS
export function renderizarAtributosAcordeon(contenedor, rasgos = {}, cicatrices = {}) {
  if (!contenedor) return;

  const listaAtributos = [
    { clave: "fuerza", nombre: "Fuerza", icono: "⚔️" },
    { clave: "destreza", nombre: "Destreza", icono: "🗡️" },
    { clave: "constitucion", nombre: "Constitución", icono: "🛡️" },
    { clave: "inteligencia", nombre: "Inteligencia", icono: "🧠" },
    { clave: "sabiduria", nombre: "Sabiduría", icono: "📜" },
    { clave: "carisma", nombre: "Carisma", icono: "👑" }
  ];

  const listaR = normalizarListaEfectos(rasgos);
  const listaC = normalizarListaEfectos(cicatrices);

  let htmlAtributos = `
    <h3 style="color:#ffd700; font-family:'Cinzel',serif; margin-bottom:1rem; text-align:center;">
      📊 Atributos Principales del Aventurero
    </h3>
    <div class="grid-dnd-atributos">
  `;

  listaAtributos.forEach(attr => {
    const base = 10;
    let modTotal = 0;
    let lineasDesglose = `<div class="tt-linea"><span>Puntuación Base:</span> <span>${base}</span></div>`;

    // Sumar bonificadores de rasgos multiplicados por el número de sumatorios/acumulaciones
    listaR.forEach(r => {
      const valBase = obtenerPuntosModificador(r.modificadores, attr.clave);
      const valTotal = valBase * r.acumulaciones;
      if (valTotal !== 0) {
        modTotal += valTotal;
        const signo = valTotal > 0 ? `+${valTotal}` : `${valTotal}`;
        const claseColor = valTotal > 0 ? "tt-positivo" : "tt-negativo";
        lineasDesglose += `<div class="tt-linea"><span>✨ ${r.nombre} (+${r.acumulaciones}):</span> <span class="${claseColor}">${signo}</span></div>`;
      }
    });

    // Sumar bonificadores de cicatrices
    listaC.forEach(c => {
      const valBase = obtenerPuntosModificador(c.modificadores, attr.clave);
      const valTotal = valBase * c.acumulaciones;
      if (valTotal !== 0) {
        modTotal += valTotal;
        const signo = valTotal > 0 ? `+${valTotal}` : `${valTotal}`;
        const claseColor = valTotal > 0 ? "tt-positivo" : "tt-negativo";
        lineasDesglose += `<div class="tt-linea"><span>🩸 ${c.nombre} (+${c.acumulaciones}):</span> <span class="${claseColor}">${signo}</span></div>`;
      }
    });

    const valorFinal = base + modTotal;
    const signoModVisual = modTotal >= 0 ? `+${modTotal}` : `${modTotal}`;

    let claseMod = "mod-neutro";
    if (modTotal > 0) claseMod = "mod-positivo";
    if (modTotal < 0) claseMod = "mod-negativo";

    let claseCardEspecial = "";
    if (modTotal < -2) claseCardEspecial = "atributo-locura";

htmlAtributos += `
      <div class="card-dnd ${claseCardEspecial}">
        <!-- Tooltip RPG (Se despliega en HOVER) -->
        <div class="tooltip-atributo">
          <div class="tt-titulo">${attr.icono} Desglose de ${attr.nombre}</div>
          ${lineasDesglose}
          <div class="tt-linea tt-total">
            <span>Valor Final:</span>
            <span class="${modTotal >= 0 ? 'tt-positivo' : 'tt-negativo'}">${valorFinal} (${signoModVisual})</span>
          </div>
        </div>

        <div class="card-header-dnd">
          <span>${attr.icono}</span>
          <span>${attr.nombre}</span>
        </div>
        
        <div class="valor-total ${modTotal > 0 ? 'texto-epico' : (modTotal < 0 ? 'texto-locura' : '')}">
          ${valorFinal}
        </div>
        
        <div class="desglose-attr">
          <span>Base: ${base}</span>
          <span class="badge-mod ${claseMod}">${signoModVisual}</span>
        </div>
      </div>
    `;
  });

  htmlAtributos += `</div>`;
  contenedor.innerHTML = htmlAtributos;
}

// Función principal exportada: Construye la estructura interna dentro de #acordeon-estadisticas
export function renderizarEstadisticasAcordeon(datos) {
  const contenedor = document.getElementById("acordeon-estadisticas");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const divAtributos = document.createElement("div");
  divAtributos.className = "seccion-atributos-acordeon";
  contenedor.appendChild(divAtributos);

  renderizarAtributosAcordeon(divAtributos, datos.rasgos, datos.cicatrices);

  const divBadges = document.createElement("div");
  divBadges.className = "seccion-badges-acordeon";
  divBadges.style.marginTop = "2rem";
  divBadges.innerHTML = `
    <h3 style="color:#ffd700; font-family:'Cinzel',serif; margin-bottom:0.8rem;">✨ Rasgos Adquiridos</h3>
    <div id="contenedor-rasgos" class="lista-huellas" style="margin-bottom:1.5rem;"></div>
    
    <h3 style="color:#ffd700; font-family:'Cinzel',serif; margin-bottom:0.8rem;">🩸 Cicatrices Emocionales</h3>
    <div id="contenedor-cicatrices" class="lista-huellas"></div>
  `;
  contenedor.appendChild(divBadges);
}