// js/atlas.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc,
  getDoc,
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Cache en memoria para evitar peticiones duplicadas de nombres
const cacheAventureros = {};

/**
 * Calcula dinámicamente el tamaño de la matriz (filas x columnas)
 * basándose en la cantidad total de libros leídos.
 */
function calcularDimensionesTablero(totalLibros) {
  let filas = 7;
  let cols = 9;

  // Mientras la cantidad de libros ocupe más del 65% de la capacidad del mapa, expandimos
  while (totalLibros >= (filas * cols) * 0.65) {
    filas += 2; // Añade filas en pares para mantener el patrón intercalado
    cols += 2;  // Añade columnas
  }

  return { filas, cols };
}

/**
 * Genera posiciones iniciales (semillas) proporcionales al tamaño del tablero.
 */
function obtenerSemillasIniciales(filas, cols) {
  const centroFila = Math.floor(filas / 2);
  const centroCol = Math.floor(cols / 2);

  return {
    fantasia: { f: 1, c: 1 },
    misterio: { f: 1, c: cols - 2 },
    ciencia:  { f: filas - 2, c: 1 },
    erudito:  { f: filas - 2, c: cols - 2 },
    ficcion:  { f: centroFila, c: centroCol }
  };
}

async function obtenerNombreAventurero(uid) {
  if (!uid) return "Aventurero Desconocido";
  if (cacheAventureros[uid]) return cacheAventureros[uid];

  try {
    const userSnap = await getDoc(doc(db, "aventureros", uid));
    if (userSnap.exists()) {
      const data = userSnap.data();
      const nombre = data.nombre || data.nombreUsuario || data.apodo || "Aventurero";
      cacheAventureros[uid] = nombre;
      return nombre;
    }
  } catch (err) {
    console.error("Error al obtener nombre del aventurero:", err);
  }
  return "Aventurero Anónimo";
}

function normalizarGenero(genero = "") {
  const g = String(genero).toLowerCase();
  if (g.includes("fantasía") || g.includes("fantasia")) return "fantasia";
  if (g.includes("misterio") || g.includes("terror") || g.includes("thriller")) return "misterio";
  if (g.includes("ciencia") || g.includes("ciencia-ficción") || g.includes("sci-fi")) return "ciencia";
  if (g.includes("ficcion") || g.includes("ficción") || g.includes("novela")) return "ficcion";
  return "erudito";
}

function obtenerVecinos(f, c, maxFilas, maxCols) {
  const esPar = f % 2 === 0;
  const desplazamientos = esPar ? [
    [-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]
  ] : [
    [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]
  ];

  return desplazamientos
    .map(([df, dc]) => ({ f: f + df, c: c + dc }))
    .filter(p => p.f >= 0 && p.f < maxFilas && p.c >= 0 && p.c < maxCols);
}

function buscarCasillaCrecimiento(matriz, genero, filas, cols) {
  const celdasReino = [];

  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      if (matriz[f][c] && matriz[f][c].generoKey === genero) {
        celdasReino.push({ f, c });
      }
    }
  }

  const semillas = obtenerSemillasIniciales(filas, cols);

  if (celdasReino.length === 0) {
    const semilla = semillas[genero] || semillas.ficcion;
    if (!matriz[semilla.f][semilla.c]) {
      return semilla;
    }
  }

  let candidatosLibres = [];
  celdasReino.forEach(celda => {
    const vecinos = obtenerVecinos(celda.f, celda.c, filas, cols);
    vecinos.forEach(v => {
      if (!matriz[v.f][v.c]) {
        candidatosLibres.push(v);
      }
    });
  });

  if (candidatosLibres.length > 0) {
    return candidatosLibres[Math.floor(Math.random() * candidatosLibres.length)];
  }

  let casillasVacias = [];
  for (let f = 0; f < filas; f++) {
    for (let c = 0; c < cols; c++) {
      if (!matriz[f][c]) casillasVacias.push({ f, c });
    }
  }
  return casillasVacias.length > 0 ? casillasVacias[Math.floor(Math.random() * casillasVacias.length)] : null;
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await renderizarMapaHex(user.uid);
  }
});

async function renderizarMapaHex(uid) {
  const contenedor = document.getElementById("hex-grid-contenedor");
  if (!contenedor) return;
  contenedor.innerHTML = "";

  try {
    const bibliotecaRef = collection(db, "biblioteca");
    
    // 1. Obtener libros leídos globales
    const snapshot = await getDocs(bibliotecaRef);

    let lecturasGlobales = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (Array.isArray(data.lectores) && data.lectores.length > 0) {
        lecturasGlobales.push(data);
      }
    });

    // 2. Calcular las dimensiones dinámicas según el número de lecturas
    const { filas, cols } = calcularDimensionesTablero(lecturasGlobales.length);
    let matriz = Array.from({ length: filas }, () => Array(cols).fill(null));

    // 3. Procesar y posicionar cada libro en la matriz expandible
    for (const libro of lecturasGlobales) {
      const generoTexto = libro.genero || "Ficción";
      const generoKey = normalizarGenero(generoTexto);
      const pos = buscarCasillaCrecimiento(matriz, generoKey, filas, cols);

      const primerLectorUid = libro.lectores[0] || libro.usuarioId;
      const nombrePrimerLector = await obtenerNombreAventurero(primerLectorUid);

      if (pos) {
        matriz[pos.f][pos.c] = {
          titulo: libro.titulo || "Tomo Leído",
          genero: generoTexto,
          generoKey,
          paginas: libro.paginas || 0,
          esReto: libro.esReto || false,
          autor: libro.autor || "Desconocido",
          primerLector: nombrePrimerLector
        };
      }
    }

    // 4. Renderizado del Grid Hexagonal según el nuevo tamaño
    for (let f = 0; f < filas; f++) {
      const filaDiv = document.createElement("div");
      filaDiv.classList.add("hex-fila");

      for (let c = 0; c < cols; c++) {
        const hexDiv = document.createElement("div");
        hexDiv.classList.add("hexagono");

        const datosCelda = matriz[f][c];

        if (datosCelda) {
          hexDiv.classList.add(`hex-${datosCelda.generoKey}`);
          if (datosCelda.esReto) hexDiv.classList.add("hex-es-reto");
          
          const nodoCentral = document.createElement("div");
          nodoCentral.classList.add("hex-nodo-central");

          const tooltip = document.createElement("div");
          tooltip.classList.add("tooltip-text");
          tooltip.innerHTML = `
            <strong>📖 ${datosCelda.titulo}</strong> ${datosCelda.esReto ? '🛡️ (Reto del Gremio)' : ''}<br>
            <em>Cronista: ${datosCelda.autor}</em><br>
            <em>Pionero: ${datosCelda.primerLector}</em><br>
            📄 <strong>${datosCelda.paginas} páginas</strong>
          `;

          hexDiv.appendChild(nodoCentral);
          hexDiv.appendChild(tooltip);

        } else {
          hexDiv.classList.add("hex-vacio");
          const tooltipVacio = document.createElement("div");
          tooltipVacio.classList.add("tooltip-text");
          tooltipVacio.textContent = "🗺️ Territorio sin explorar";
          
          hexDiv.appendChild(tooltipVacio);
        }

        filaDiv.appendChild(hexDiv);
      }
      contenedor.appendChild(filaDiv);
    }

  } catch (error) {
    console.error("Error al cargar el Atlas Hexagonal:", error);
  }
}