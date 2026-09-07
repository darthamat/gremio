// js/atlas.js

// 1. Importar la instancia del SDK de Firebase y Firestore de tu proyecto
import { db } from './firebase-config.js'; // Ajusta la ruta a tu archivo de configuración de Firebase
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// 🎯 Configuración de Metas del Gremio (Ajusta según la escala de tu comunidad)
const META_GLOBAL_PAGINAS = 100000;
const META_REINO_PAGINAS = 25000; // Meta por cada reino individual

//  DOM Elements: Mapa y Etiquetas
const regiones = {
  fantasia: document.getElementById('region-fantasia'),
  misterio: document.getElementById('region-misterio'),
  ciencia: document.getElementById('region-ciencia'),
  erudito: document.getElementById('region-erudito')
};

const porcentajesTexto = {
  fantasia: document.getElementById('porcentaje-fantasia'),
  misterio: document.getElementById('porcentaje-misterio'),
  ciencia: document.getElementById('porcentaje-ciencia'),
  erudito: document.getElementById('porcentaje-erudito')
};

// DOM Elements: Panel de Barras de Progreso
const elTotalPaginasComunidad = document.getElementById('total-paginas-comunidad');
const elBarraGlobal = document.getElementById('barra-global');
const elTextoMetaGlobal = document.getElementById('texto-meta-global');

const barrasProgreso = {
  fantasia: document.getElementById('barra-fantasia'),
  misterio: document.getElementById('barra-misterio'),
  ciencia: document.getElementById('barra-ciencia'),
  erudito: document.getElementById('barra-erudito')
};

const textosPaginas = {
  fantasia: document.getElementById('paginas-fantasia'),
  misterio: document.getElementById('paginas-misterio'),
  ciencia: document.getElementById('paginas-ciencia'),
  erudito: document.getElementById('paginas-erudito')
};

const listaAportes = document.getElementById('lista-ultimos-aportes');

/**
 * 📡 Escuchar cambios en vivo en la colección del Gremio
 */
function inicializarAtlas() {
  const atlasRef = doc(db, 'gremio', 'atlas');

  onSnapshot(atlasRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.warn('El documento de Firestore /gremio/atlas aún no ha sido creado.');
      renderizarEstadoVacio();
      return;
    }

    const data = snapshot.data();
    actualizarPantallaAtlas(data);
  }, (error) => {
    console.error('Error al escuchar cambios en el Atlas:', error);
    listaAportes.innerHTML = `<li class="aporte-item error">⚠️ Error al conectar con el Códice.</li>`;
  });
}

/**
 * 🎨 Actualiza los elementos del DOM con los datos sincronizados
 */
function actualizarPantallaAtlas(data) {
  const paginasTotales = data.paginasTotales || 0;
  
  // 1. Contador Global de Páginas y Barra General
  elTotalPaginasComunidad.innerText = paginasTotales.toLocaleString();
  const porcentajeGlobal = Math.min((paginasTotales / META_GLOBAL_PAGINAS) * 100, 100);
  elBarraGlobal.style.width = `${porcentajeGlobal}%`;
  elTextoMetaGlobal.innerText = `Meta del Gremio: ${paginasTotales.toLocaleString()} / ${META_GLOBAL_PAGINAS.toLocaleString()} págs (${porcentajeGlobal.toFixed(1)}%)`;

  // 2. Progreso por Género / Reino
  const generos = ['fantasia', 'misterio', 'ciencia', 'erudito'];

  generos.forEach(genero => {
    // Convierte el nombre de género a la propiedad de Firestore (ej. puntosFantasia)
    const claveFirestore = `puntos${genero.charAt(0).toUpperCase() + genero.slice(1)}`;
    const paginasReino = data[claveFirestore] || 0;

    // Calcular porcentaje respecto a la meta del reino
    const porcentajeReino = Math.min((paginasReino / META_REINO_PAGINAS) * 100, 100);

    // Actualizar Texto de Páginas
    if (textosPaginas[genero]) {
      textosPaginas[genero].innerText = `${paginasReino.toLocaleString()} págs`;
    }

    // Actualizar Barra de Progreso Lateral
    if (barrasProgreso[genero]) {
      barrasProgreso[genero].style.width = `${porcentajeReino}%`;
    }

    // Actualizar Porcentaje dentro del Mapa
    if (porcentajesTexto[genero]) {
      porcentajesTexto[genero].innerText = `${porcentajeReino.toFixed(1)}% Explorado`;
    }

    // 🌌 Revelar el territorio en el Mapa (Niebla de Guerra)
    if (regiones[genero]) {
      // La opacidad y brillo aumentan conforme el gremio lee más
      const brillo = 0.3 + (porcentajeReino / 100) * 0.7; // Va de 0.3 a 1.0
      const escalaGris = 100 - porcentajeReino; // Va de 100% (gris) a 0% (color completo)

      regiones[genero].style.filter = `grayscale(${escalaGris}%) brightness(${brillo})`;
      
      // Marca el reino como completado visualmente si llega al 100%
      if (porcentajeReino >= 100) {
        regiones[genero].classList.add('reino-conquistado');
      }
    }
  });

  // 3. Renderizar Últimos Descubrimientos (Feed)
  if (data.ultimosDescubrimientos && Array.isArray(data.ultimosDescubrimientos)) {
    renderizarUltimosAportes(data.ultimosDescubrimientos);
  }
}

/**
 * 📜 Imprime el historial de los últimos aportes en el feed lateral
 */
function renderizarUltimosAportes(aportes) {
  if (aportes.length === 0) {
    listaAportes.innerHTML = `<li class="aporte-item">Ningún explorador ha registrado lecturas todavía.</li>`;
    return;
  }

  listaAportes.innerHTML = aportes.slice(0, 5).map(item => `
    <li class="aporte-item">
      <strong>${item.usuario}</strong> sumó <span>${item.paginas} págs</span> al Reino de <em>${item.region}</em> con <i>"${item.libro}"</i>.
    </li>
  `).join('');
}

/**
 * Estado por defecto si aún no existen datos
 */
function renderizarEstadoVacio() {
  elTotalPaginasComunidad.innerText = '0';
  listaAportes.innerHTML = `<li class="aporte-item">El Códice se encuentra a la espera de sus primeros aventureros...</li>`;
}

// 🚀 Iniciar la escuchas al cargar el script
document.addEventListener('DOMContentLoaded', inicializarAtlas);