import { getFirestore, collection, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);

// Dimensiones de la rejilla (7 filas x 9 columnas = 63 casillas)
const FILAS = 3;
const COLS = 3;

// Semillas iniciales (Donde comienza a crecer cada reino)
const SEMILLAS_INICIALES = {
  fantasia: { f: 1, c: 1 },  // Esquina Noroeste
  misterio: { f: 1, c: 7 },  // Esquina Noreste
  ciencia:  { f: 5, c: 1 },  // Esquina Suroeste
  erudito:  { f: 5, c: 7 }   // Esquina Sureste
};

function normalizarGenero(genero = "") {
  const g = genero.toLowerCase();
  if (g.includes("fantasía") || g.includes("fantasia")) return "fantasia";
  if (g.includes("misterio") || g.includes("terror")) return "misterio";
  if (g.includes("ciencia") || g.includes("ciencia-ficción")) return "ciencia";
  if (g.includes("ficcion") || g.includes("novela")) return "ficcion";
  return "erudito";
}

// Devuelve los vecinos adyacentes de un hexágono en una rejilla hexagonal
function obtenerVecinos(f, c) {
  const esPar = f % 2 === 0;
  const desplazamientos = esPar ? [
    [-1, -1], [-1, 0], [0, -1], [0, 1], [1, -1], [1, 0]
  ] : [
    [-1, 0], [-1, 1], [0, -1], [0, 1], [1, 0], [1, 1]
  ];

  return desplazamientos
    .map(([df, dc]) => ({ f: f + df, c: c + dc }))
    .filter(p => p.f >= 0 && p.f < FILAS && p.c >= 0 && p.c < COLS);
}

// Encuentra una casilla libre colindante al reino para crecer
function buscarCasillaCrecimiento(matriz, genero) {
  const celdasReino = [];
  
  for (let f = 0; f < FILAS; f++) {
    for (let c = 0; c < COLS; c++) {
      if (matriz[f][c] && matriz[f][c].generoKey === genero) {
        celdasReino.push({ f, c });
      }
    }
  }

  // Buscar vecinos libres de esas celdas
  let candidatosLibres = [];
  celdasReino.forEach(celda => {
    const vecinos = obtenerVecinos(celda.f, celda.c);
    vecinos.forEach(v => {
      if (!matriz[v.f][v.c]) {
        candidatosLibres.push(v);
      }
    });
  });

  if (candidatosLibres.length > 0) {
    // Selección aleatoria entre los candidatos colindantes para variabilidad orgánica
    return candidatosLibres[Math.floor(Math.random() * candidatosLibres.length)];
  }

  // Si no hay candidatos contiguos, buscar cualquier casilla libre aleatoria
  let casillasVacias = [];
  for (let f = 0; f < FILAS; f++) {
    for (let c = 0; c < COLS; c++) {
      if (!matriz[f][c]) casillasVacias.push({ f, c });
    }
  }
  return casillasVacias.length > 0 ? casillasVacias[Math.floor(Math.random() * casillasVacias.length)] : null;
}

async function renderizarMapaHex() {
  const contenedor = document.getElementById("hex-grid-contenedor");
  contenedor.innerHTML = "";

  // Matriz de ocupación [Filas][Columnas]
  let matriz = Array.from({ length: FILAS }, () => Array(COLS).fill(null));

  try {
    const q = query(collection(db, "retos"), where("completado", "==", true));
    const snapshot = await getDocs(q);
    
    let libros = [];
    snapshot.forEach(docSnap => libros.push(docSnap.data()));

    // Colocar las semillas iniciales libres si no hay ocupación previa
    Object.keys(SEMILLAS_INICIALES).forEach(key => {
      const sem = SEMILLAS_INICIALES[key];
      // Se reservan como centros neurálgicos de cada reino
    });

    // Anexar cada libro de manera contigua al reino de su mismo color
    libros.forEach(libro => {
      const generoKey = normalizarGenero(libro.genero);
      const pos = buscarCasillaCrecimiento(matriz, generoKey);

      if (pos) {
        matriz[pos.f][pos.c] = {
          ...libro,
          generoKey
        };
      }
    });

    // Renderizar la rejilla completa en el HTML
    for (let f = 0; f < FILAS; f++) {
      const filaDiv = document.createElement("div");
      filaDiv.classList.add("hex-fila");

      for (let c = 0; c < COLS; c++) {
        const hexDiv = document.createElement("div");
        hexDiv.classList.add("hexagono");

        const datosCelda = matriz[f][c];

        if (datosCelda) {
          hexDiv.classList.add(`hex-${datosCelda.generoKey}`);
          
          const puntoCentro = document.createElement("div");
          puntoCentro.classList.add("hex-centro-punto");
          hexDiv.appendChild(puntoCentro);

          const tooltip = document.createElement("div");
          tooltip.classList.add("tooltip-text");
          tooltip.innerHTML = `
            <strong>📖 ${datosCelda.titulo || "Título Códice"}</strong><br>
            <em>Gén: ${datosCelda.genero || "General"}</em><br>
            📄 <strong>${datosCelda.paginas || 0} págs</strong> exploradas
          `;
          hexDiv.appendChild(tooltip);
        } else {
          hexDiv.classList.add("hex-vacio");
          const tooltip = document.createElement("div");
          tooltip.classList.add("tooltip-text");
          tooltip.textContent = "🗺️ Territorio Niebla de Guerra";
          hexDiv.appendChild(tooltip);
        }

        filaDiv.appendChild(hexDiv);
      }
      contenedor.appendChild(filaDiv);
    }

  } catch (error) {
    console.error("Error cargando el Atlas Hexagonal:", error);
  }
}

renderizarMapaHex();

// Obtener los libros para dibujarlos en el Atlas por su Género o Popularidad:
async function obtenerDatosParaElAtlas() {
  const db = getFirestore();
  const librosRef = collection(db, "libros");
  const snapshot = await getDocs(librosRef);

  snapshot.forEach(docSnap => {
    const libro = docSnap.data();
    console.log(`Libro: ${libro.titulo} | Género: ${libro.genero} | Lectores totales: ${libro.totalLectores}`);
    // Aquí puedes asignar automáticamente qué hexágono del mapa ocupa según su género.
  });
}