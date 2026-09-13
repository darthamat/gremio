import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

const FILAS = 7;
const COLS = 9;

const SEMILLAS_INICIALES = {
  fantasia: { f: 1, c: 1 },
  misterio: { f: 1, c: 7 },
  ciencia:  { f: 5, c: 1 },
  erudito:  { f: 5, c: 7 },
  ficcion:  { f: 3, c: 4 }
};

function normalizarGenero(genero = "") {
  const g = String(genero).toLowerCase();
  if (g.includes("fantasía") || g.includes("fantasia")) return "fantasia";
  if (g.includes("misterio") || g.includes("terror") || g.includes("thriller")) return "misterio";
  if (g.includes("ciencia") || g.includes("ciencia-ficción") || g.includes("sci-fi")) return "ciencia";
  if (g.includes("ficcion") || g.includes("ficción") || g.includes("novela")) return "ficcion";
  return "erudito";
}

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

function buscarCasillaCrecimiento(matriz, genero) {
  const celdasReino = [];

  for (let f = 0; f < FILAS; f++) {
    for (let c = 0; c < COLS; c++) {
      if (matriz[f][c] && matriz[f][c].generoKey === genero) {
        celdasReino.push({ f, c });
      }
    }
  }

  if (celdasReino.length === 0) {
    const semilla = SEMILLAS_INICIALES[genero] || SEMILLAS_INICIALES.ficcion;
    if (!matriz[semilla.f][semilla.c]) {
      return semilla;
    }
  }

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
    return candidatosLibres[Math.floor(Math.random() * candidatosLibres.length)];
  }

  let casillasVacias = [];
  for (let f = 0; f < FILAS; f++) {
    for (let c = 0; c < COLS; c++) {
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

  let matriz = Array.from({ length: FILAS }, () => Array(COLS).fill(null));

  try {
    const userDocRef = doc(db, "aventureros", uid);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) return;

    const data = snap.data();

    // 🎯 RECOPILAR DESDE TODAS LAS FUENTES POSIBLES DE LIBROS LEÍDOS
    let lecturas = [];

    if (Array.isArray(data.lecturas)) {
      lecturas = lecturas.concat(data.lecturas);
    }
    if (Array.isArray(data.librosLeidos)) {
      lecturas = lecturas.concat(data.librosLeidos);
    }
    if (Array.isArray(data.biblioteca)) {
      lecturas = lecturas.concat(data.biblioteca);
    }

    // Desduplicar libros por ID o Título
    const mapaUnico = new Map();
    lecturas.forEach(libro => {
      const clave = libro.id || libro.titulo;
      if (clave && !mapaUnico.has(clave)) {
        mapaUnico.set(clave, libro);
      }
    });
    const listaFinalLecturas = Array.from(mapaUnico.values());

    listaFinalLecturas.forEach(libro => {
      const generoTexto = libro.genero || "Ficción";
      const generoKey = normalizarGenero(generoTexto);
      const pos = buscarCasillaCrecimiento(matriz, generoKey);

      if (pos) {
        matriz[pos.f][pos.c] = {
          titulo: libro.titulo || libro.nombre || "Tomo Leído",
          genero: generoTexto,
          generoKey,
          paginas: libro.paginas || libro.puntos || 0,
          esReto: libro.esReto || false
        };
      }
    });

    for (let f = 0; f < FILAS; f++) {
      const filaDiv = document.createElement("div");
      filaDiv.classList.add("hex-fila");

      for (let c = 0; c < COLS; c++) {
        const hexDiv = document.createElement("div");
        hexDiv.classList.add("hexagono");

        const datosCelda = matriz[f][c];

        if (datosCelda) {
          hexDiv.classList.add(`hex-${datosCelda.generoKey}`);
          if (datosCelda.esReto) hexDiv.classList.add("hex-es-reto");
          
          const puntoCentro = document.createElement("div");
          puntoCentro.classList.add("hex-centro-punto");
          hexDiv.appendChild(puntoCentro);

          const tooltip = document.createElement("div");
          tooltip.classList.add("tooltip-text");
          tooltip.style.display = "none"; // Ocultar inicialmente
          tooltip.innerHTML = `
            <strong>📖 ${datosCelda.titulo}</strong> ${datosCelda.esReto ? '🛡️' : ''}<br>
            <em>Gén: ${datosCelda.genero}</em><br>
            📄 <strong>${datosCelda.paginas} págs</strong>
          `;
          hexDiv.appendChild(tooltip);

          // 🖱️ MOSTRAR TOOLTIP AL PASAR EL RATÓN
          hexDiv.addEventListener("mouseenter", () => {
            tooltip.style.display = "block";
          });
          hexDiv.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
          });

        } else {
          hexDiv.classList.add("hex-vacio");
          const tooltip = document.createElement("div");
          tooltip.classList.add("tooltip-text");
          tooltip.style.display = "none";
          tooltip.textContent = "🗺️ Territorio Niebla de Guerra";
          hexDiv.appendChild(tooltip);

          hexDiv.addEventListener("mouseenter", () => {
            tooltip.style.display = "block";
          });
          hexDiv.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
          });
        }

        filaDiv.appendChild(hexDiv);
      }
      contenedor.appendChild(filaDiv);
    }

  } catch (error) {
    console.error("Error al cargar el Atlas Hexagonal:", error);
  }
}