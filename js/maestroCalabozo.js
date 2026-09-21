// js/maestroCalabozo.js

// js/maestroCalabozo.js
import { BANCO_OBJETOS_MAGICOS, BANCO_SEGUIDORES } from "./objetosData.js";

// ⚠️ Cambia esto por tu clave real obtenida en Google AI Studio (o déjala vacía si prefieres tirar del banco local manual)
const GEMINI_API_KEY = "Ab8RN6LU5rD24sBnTEOg6kRlElaKq0mp3j"; 

export async function generarEnfrentamientoFinal(tituloLibro, autorLibro, generoLibro) {
  // 1. Generar el enfrentamiento (por IA si hay clave, o local por defecto)
  let encuentro = await obtenerEstructuraEncuentro(tituloLibro, autorLibro, generoLibro);

  // 2. 🎲 TRAMO DE PROBABILIDADES DE BOTÍN (LOOT TABLE)
  const tiradaBotin = Math.random() * 100; // Número entre 0 y 100
  let objetoRecompensa = null;

  if (tiradaBotin < 5) {
    // 🌟 5% Probabilidad: Objeto Único / Legendario (Generado por IA o exclusivo)
    objetoRecompensa = {
      id: Date.now(),
      nombre: `Reliquia Legendaria de ${tituloLibro}`,
      efecto: "Otorga una sabiduría arcana inigualable en el Cónclave.",
      icono: "👑",
      rareza: "Legendaria",
      origenLibro: tituloLibro
    };
  } else if (tiradaBotin < 20) {
    // ✨ 15% Probabilidad: Objeto Raro / Épico del banco local o IA
    const raros = BANCO_OBJETOS_MAGICOS.filter(o => o.rareza === "Rara" || o.rareza === "Épica");
    const seleccionado = raros.length > 0 ? raros[Math.floor(Math.random() * raros.length)] : BANCO_OBJETOS_MAGICOS[0];
    objetoRecompensa = { ...seleccionado, id: Date.now(), origenLibro: tituloLibro };
  } else if (tiradaBotin < 50) {
    // 📦 30% Probabilidad: Objeto Común (Sorteado del archivo objetosData.js para que se repita entre usuarios)
    const comunes = BANCO_OBJETOS_MAGICOS.filter(o => o.rareza === "Común");
    const seleccionado = comunes.length > 0 ? comunes[Math.floor(Math.random() * comunes.length)] : BANCO_OBJETOS_MAGICOS[0];
    objetoRecompensa = { ...seleccionado, id: Date.now(), origenLibro: tituloLibro };
  } else {
    // 🍃 50% de las veces: Sin objeto físico, solo la gloria de la lectura.
    objetoRecompensa = null;
  }

  // 3. 👥 TRAMO DE PROBABILIDAD DE SEGUIDORES (20% Independiente)
  const tiradaSeguidor = Math.random() * 100;
  let seguidorRecompensa = null;

  if (tiradaSeguidor < 20) {
    // 20% de probabilidad de que un seguidor o mascota se una
    const seguidorAleatorio = BANCO_SEGUIDORES[Math.floor(Math.random() * BANCO_SEGUIDORES.length)];
    seguidorRecompensa = {
      ...seguidorAleatorio,
      origen: tituloLibro
    };
  }

  return {
    ...encuentro,
    recompensaObjeto: objetoRecompensa,
    seguidorDesbloqueado: seguidorRecompensa
  };
}

async function obtenerEstructuraEncuentro(tituloLibro, autorLibro, generoLibro) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "GEMINI_API_KEY") {
    return {
      tipo: "acertijo",
      tituloEncuentro: `El Guardián del Tomo: "${tituloLibro}"`,
      narracion: `Las páginas finales del tomo de ${autorLibro} se cierran. Una proyección espectral bloquea el camino exigiendo una prueba antes de permitirte guardar la obra.`,
      opciones: [
        { texto: "Intentar doblegar al espectro por la fuerza.", esCorrecta: false, "resultado": "El espectro blande su escudo y te rechaza. ¡La fuerza bruta no basta!" },
        { texto: "Demostrar tu sabiduría recitando la esencia de la obra.", esCorrecta: true, "resultado": "El espectro asiente con respeto profundo y se desvanece en volutas doradas." },
        { texto: "Distraerlo arrojando un marcapáginas viejo.", esCorrecta: false, "resultado": "El fantasma devora el papel con desdén. La prueba continúa." }
      ]
    };
  }

  // Llamada estándar a Gemini si se dispone de clave...
  try {
    const prompt = `Actúa como narrador de rol. El aventurero terminó "${tituloLibro}" de "${autorLibro}". Genera un JSON con: tipo ("acertijo"), tituloEncuentro, narracion (2 frases), opciones (array de 3 con texto, esCorrecta boolean, resultado).`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    if (!response.ok) throw new Error();
    const data = await response.json();
    return JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json/g, "").replace(/```/g, "").trim());
  } catch (e) {
    return {
      tipo: "acertijo",
      tituloEncuentro: `El Desafío de ${tituloLibro}`,
      narracion: `Un eco místico de la obra de ${autorLibro} evalúa tu intelecto antes de sellar el lomo en la estantería.`,
      opciones: [
        { texto: "Ignorar la prueba", esCorrecta: false, "resultado": "El eco persiste." },
        { texto: "Comprender la enseñanza del libro", esCorrecta: true, "resultado": "Prueba superada con éxito." },
        { texto: "Dudar del proceso", esCorrecta: false, "resultado": "Fracasas en el intento." }
      ]
    };
  }
}

// 🛡️ Generador local basado en tus bancos de datos (para cuando no hay API Key)
function generarEncuentroLocal(tituloLibro, autorLibro) {
  const objetoAleatorio = BANCO_OBJETOS_MAGICOS[Math.floor(Math.random() * BANCO_OBJETOS_MAGICOS.length)];
  const seguidorAleatorio = BANCO_SEGUIDORES[Math.floor(Math.random() * BANCO_SEGUIDORES.length)];

  return {
    tipo: "acertijo",
    tituloEncuentro: `El Guardián del Tomo: "${tituloLibro}"`,
    narracion: `Las páginas finales de la obra escrita por ${autorLibro} se cierran con un destello místico. Una proyección espectral custodiada por los ecos de la historia se interpone en tu camino exigiendo demostrar tu comprensión.`,
    opciones: [
      { texto: "Cerrar los ojos e invocar la fuerza bruta de la lectura.", esCorrecta: false, "resultado": "El espectro blande su escudo y te rechaza. ¡Debes apelar al intelecto!" },
      { texto: "Recitar el propósito y moraleja principal extraída de la travesía.", esCorrecta: true, "resultado": "El espectro asiente con respeto profundo y se desvanece en volutas doradas." },
      { texto: "Arrojarle un marcapáginas viejo como distracción.", esCorrecta: false, "resultado": "El fantasma devora el papel con desdén. La prueba continúa." }
    ],
    recompensaObjeto: objetoAleatorio,
    seguidorDesbloqueado: seguidorAleatorio
  };
}
