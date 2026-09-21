// js/maestroCalabozo.js
import { BANCO_OBJETOS_MAGICOS, BANCO_SEGUIDORES } from "./objetosData.js";

const GEMINI_API_KEY = ""; // Tu clave de Google AI Studio (o déjala vacía para usar el sistema local)

export async function generarEnfrentamientoFinal(tituloLibro, autorLibro, generoLibro) {
  // 1. Decidir aleatoriamente si el encuentro es un "combate" contra un Final Boss o un "acertijo"
  const tipoEncuentroAleatorio = Math.random() < 0.5 ? "combate" : "acertijo";

  // 2. Generar la estructura del encuentro (por IA si hay clave, o local por defecto)
  let encuentro = await obtenerEstructuraEncuentro(tituloLibro, autorLibro, generoLibro, tipoEncuentroAleatorio);

  // 3. 🎲 TRAMO DE PROBABILIDADES DE BOTÍN (LOOT TABLE)
  const tiradaBotin = Math.random() * 100;
  let objetoRecompensa = null;

  if (tiradaBotin < 5) {
    // 🌟 5% Probabilidad: Objeto Legendario
    const legendarios = BANCO_OBJETOS_MAGICOS.filter(o => o.rareza === "Legendaria");
    objetoRecompensa = legendarios[Math.floor(Math.random() * legendarios.length)] || null;
  } else if (tiradaBotin < 20) {
    // ✨ 15% Probabilidad: Objeto Raro
    const raros = BANCO_OBJETOS_MAGICOS.filter(o => o.rareza === "Rara");
    objetoRecompensa = raros[Math.floor(Math.random() * raros.length)] || null;
  } else if (tiradaBotin < 50) {
    // 📦 30% Probabilidad: Objeto Común
    const comunes = BANCO_OBJETOS_MAGICOS.filter(o => o.rareza === "Común");
    objetoRecompensa = comunes[Math.floor(Math.random() * comunes.length)] || null;
  }

  // 4. 👥 TRAMO DE PROBABILIDAD DE SEGUIDORES (20% Independiente)
  const tiradaSeguidor = Math.random() * 100;
  let seguidorRecompensa = null;

  if (tiradaSeguidor < 20) {
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

async function obtenerEstructuraEncuentro(tituloLibro, autorLibro, generoLibro, tipoDeseado) {
  // Si no hay API key configurada, tiramos del generador local inteligente y variado
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "TU_API_KEY_DE_GEMINI") {
    return generarEncuentroLocalVariado(tituloLibro, autorLibro, tipoDeseado);
  }

  // Prompt avanzado para forzar a la IA a crear un Final Boss o un Acertijo temático
  const prompt = `
    Actúa como un maestro del calabozo oscuro de rol medieval. 
    El aventurero acaba de terminar de leer el libro "${tituloLibro}" de "${autorLibro}" (género: ${generoLibro}).
    El tipo de desafío que debes generar es de tipo: "${tipoDeseado}" (si es "combate", debe ser un enfrentamiento directo a espada/magia contra el villano principal o amenaza de este libro exacto; si es "acertijo", una prueba mental contra su esencia).
    
    Devuelve ÚNICAMENTE un objeto JSON válido (sin formato markdown) con esta estructura exacta:
    {
      "tipo": "${tipoDeseado}",
      "tituloEncuentro": "Título épico (ej: Duelo final contra el Señor Oscuro o El Acertijo de la Esfinge)",
      "narracion": "Descripción de 2 o 3 frases muy atmosféricas donde el enemigo o la prueba se manifiesta ante el lector.",
      "opciones": [
        {"texto": "Acción táctica o respuesta 1", "esCorrecta": false, "resultado": "Consecuencia de fallar."},
        {"texto": "Acción táctica o respuesta 2", "esCorrecta": true, "resultado": "Victoria magistral."},
        {"texto": "Acción táctica o respuesta 3", "esCorrecta": false, "resultado": "Consecuencia de fallar."}
      ]
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) throw new Error("Error en API de Gemini");

    const data = await response.json();
    const textoRespuesta = data.candidates[0].content.parts[0].text;
    const jsonLimpiado = textoRespuesta.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonLimpiado);

  } catch (error) {
    console.warn("Aviso: No se pudo conectar con la IA. Usando generador local dinámico:", error);
    return generarEncuentroLocalVariado(tituloLibro, autorLibro, tipoDeseado);
  }
}

// 🛡️ Generador local dinámico que distingue entre Combate con Final Boss y Acertijo
function generarEncuentroLocalVariado(tituloLibro, autorLibro, tipo) {
  if (tipo === "combate") {
    return {
      tipo: "combate",
      tituloEncuentro: `⚔️ Duelo contra la Amenaza de "${tituloLibro}"`,
      narracion: `Las últimas páginas se desvanecen y la atmósfera se gela. El antagonista principal y fuerza oscura inspirada en la obra de ${autorLibro} materializa su forma ante ti bloqueando tu salida. ¡Debes luchar!`,
      opciones: [
        { texto: "Atacar frontalmente con furia ciega sin mirar sus puntos débiles.", esCorrecta: false, "resultado": "El villano esquiva tu embestida y te contraataca con dureza. ¡Has fracasado en el asalto!" },
        { texto: "Exponer su debilidad argumental y contraatacar con precisión táctica.", esCorrecta: true, "resultado": "Tu golpe acierta en su punto crítico; el villano se desmorona en cenizas reconociendo tu valía." },
        { texto: "Intentar huir despavorido por el pasillo lateral.", esCorrecta: false, "resultado": "Las sombras te cortan la retirada. El combate se vuelve inevitable y sucumbes." }
      ]
    };
  } else {
    return {
      tipo: "acertijo",
      tituloEncuentro: `🔮 El Enigma de los Ecos de "${tituloLibro}"`,
      narracion: `Un guardián espectral invocado por el espíritu de ${autorLibro} surge de las páginas cerradas, exigiendo resolver su acertijo antes de registrar el tomo en la estantería.`,
      opciones: [
        { texto: "Forzar el paso ignorando las advertencias del espectro.", esCorrecta: false, "resultado": "Una barrera mística te rechaza con fuerza. La mente debe prevalecer sobre la fuerza." },
        { texto: "Recitar el verdadero significado y moraleja oculta de la obra.", esCorrecta: true, "resultado": "El espectro asiente solemnemente, disolviéndose en una lluvia de polvos de oro." },
        { texto: "Ofrecerle un objeto al azar para sobornarlo.", esCorrecta: false, "resultado": "El guardian rechaza tu ofrenda con desprecio absoluto." }
      ]
    };
  }
}