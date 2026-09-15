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

  // Normalizar datos a arrays
  const listaRasgos = Array.isArray(rasgos) ? rasgos : Object.entries(rasgos).map(([key, val]) => {
    return (typeof val === 'object' && val !== null) ? { ...val, _key: key } : { nombre: key, val };
  });

  const listaCicatrices = Array.isArray(cicatrices) ? cicatrices : Object.entries(cicatrices).map(([key, val]) => {
    return (typeof val === 'object' && val !== null) ? { ...val, _key: key } : { nombre: key, val };
  });

  // Sumar bonos de Rasgos (+X)
  listaRasgos.forEach(r => {
    if (typeof r === 'object' && r.modificadores) {
      const contador = r.contador || 1;
      Object.entries(r.modificadores).forEach(([attr, mod]) => {
        if (modificadores[attr] !== undefined) modificadores[attr] += mod * contador;
      });
    }
  });

  // Sumar/restar penalizaciones de Cicatrices (-X)
  listaCicatrices.forEach(c => {
    if (typeof c === 'object' && c.modificadores) {
      const contador = c.contador || 1;
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

  // Función auxiliar para obtener el texto del rasgo o cicatriz sin importar la propiedad usada
  const obtenerTextoElemento = (item, defaultTexto) => {
    if (!item) return defaultTexto;
    if (typeof item === 'string') return item;
    return item.nombre || item.titulo || item.rasgo || item.cicatriz || item.texto || item.valor || item._key || defaultTexto;
  };

  contenedorAcordeon.innerHTML = `
    <!-- SECCIÓN 1: HOJA DE ATRIBUTOS ESTILO D&D -->
    <div class="seccion-acordeon">
      <button class="header-acordeon activo" type="button">📊 Atributos Principales del Aventurero</button>
      <div class="contenido-acordeon" style="display: block;">
        <div class="grid-dnd-atributos">
          ${listaAtributos.map(attr => {
            const base = atributos[attr.id];
            const mod = modificadores[attr.id];
            const total = base + mod;
            const esNegativo = total < 0;
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
      <button class="header-acordeon" type="button">✨ Rasgos e Inclinaciones (${listaRasgos.length})</button>
      <div class="contenido-acordeon" style="display: none;">
        <div id="contenedor-rasgos" class="lista-huellas">
          ${listaRasgos.length === 0 
            ? `<p class="vacio">Aún no has forjado rasgos. Completa lecturas para moldear tu espíritu.</p>` 
            : listaRasgos.map(r => {
                const nombre = obtenerTextoElemento(r, 'Rasgo Adquirido');
                const icono = (typeof r === 'object' && r.icono) ? r.icono : '✨';
                const desc = (typeof r === 'object' && (r.desc || r.descripcion)) ? (r.desc || r.descripcion) : '';
                const contador = (typeof r === 'object' && r.contador) ? r.contador : 1;

                return `
                  <div class="item-huella rasgo">
                    <span class="icono">${icono}</span>
                    <div class="detalles">
                      <strong>${nombre} ${contador > 1 ? `<span class="badge-multiplicador">x${contador}</span>` : ''}</strong>
                      ${desc ? `<p>${desc}</p>` : ''}
                    </div>
                  </div>
                `;
              }).join('')
          }
        </div>
      </div>
    </div>

    <!-- SECCIÓN 3: CICATRICES Y MARCAS -->
    <div class="seccion-acordeon">
      <button class="header-acordeon" type="button">🩸 Cicatrices de Lectura (${listaCicatrices.length})</button>
      <div class="contenido-acordeon" style="display: none;">
        <div id="contenedor-cicatrices" class="lista-huellas">
          ${listaCicatrices.length === 0 
            ? `<p class="vacio">Tu mente se mantiene ilesa. No posees traumas ni cicatrices aún.</p>` 
            : listaCicatrices.map(c => {
                const nombre = obtenerTextoElemento(c, 'Cicatriz de Lectura');
                const icono = (typeof c === 'object' && c.icono) ? c.icono : '💥';
                const desc = (typeof c === 'object' && (c.desc || c.descripcion)) ? (c.desc || c.descripcion) : '';
                const contador = (typeof c === 'object' && c.contador) ? c.contador : 1;

                return `
                  <div class="item-huella cicatriz">
                    <span class="icono">${icono}</span>
                    <div class="detalles">
                      <strong>${nombre} ${contador > 1 ? `<span class="badge-multiplicador">x${contador}</span>` : ''}</strong>
                      ${desc ? `<p>${desc}</p>` : ''}
                    </div>
                  </div>
                `;
              }).join('')
          }
        </div>
      </div>
    </div>
  `;

  // Listener para colapsar/desplegar los paneles del acordeón
  const botones = contenedorAcordeon.querySelectorAll(".header-acordeon");
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("activo");
      const contenido = btn.nextElementSibling;
      if (contenido) {
        contenido.style.display = (contenido.style.display === "none" || !contenido.style.display) ? "block" : "none";
      }
    });
  });
}