// js/maestroCalabozo.js
import { BANCO_OBJETOS_MAGICOS, BANCO_SEGUIDORES } from "./objetosData.js";
import { CONFIG } from "../.gitignore/js/config.js";

const GEMINI_API_KEY = window.CONFIG_GEMINI_KEY || "";

export async function generarEnfrentamientoFinal(tituloLibro, autorLibro, generoLibro) {
  // 1. Decidir aleatoriamente si el encuentro es un "combate" contra un Final Boss o un "acertijo"
  const tipoEncuentroAleatorio = Math.random() < 0.5 ? "combate" : "acertijo";

  // 2. Generar la estructura del encuentro (por IA si hay clave, o local variado por defecto)
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
  // Si no hay API key configurada, tiramos del generador local con el banco masivo de 10+ variaciones
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
    console.warn("Aviso: No se pudo conectar con la IA. Usando generador local dinámico avanzado:", error);
    return generarEncuentroLocalVariado(tituloLibro, autorLibro, tipoDeseado);
  }
}

// 🛡️ BANCO MASIVO LOCAL DE 10 COMBATES Y 10 ACERTIJOS ÚNICOS
function generarEncuentroLocalVariado(tituloLibro, autorLibro, tipo) {
  if (tipo === "combate") {
    const combates = [
      {
        tituloEncuentro: `⚔️ Duelo contra el Titán de "${tituloLibro}"`,
        narracion: `Al cerrar la última página, el suelo tiembla. Las páginas del tomo cobran vida formando la silueta imponente del antagonista concebido por ${autorLibro}, dispuesto a aplastarte.`,
        opciones: [
          { texto: "Lanzarte a un choque de fuerza bruta.", esCorrecta: false, "resultado": "El titán te arrolla con su peso descomunal. ¡Tu guardia cede!" },
          { texto: "Esquivar su embestida y golpear su punto ciego.", esCorrecta: true, "resultado": "Deslizándote con agilidad, abres una brecha en su armadura y colapsa." },
          { texto: "Gritar un desafío mientras retrocedes.", esCorrecta: false, "resultado": "Tu valentía no frena su mazo; sales despedido contra los muros." }
        ]
      },
      {
        tituloEncuentro: `🩸 Emboscada de las Sombras en "${tituloLibro}"`,
        narracion: `La tinta de la historia se desborda del lomo, materializando asesinos y espectros enviados por el villano principal de ${autorLibro} para robarte el conocimiento adquirido.`,
        opciones: [
          { texto: "Apagar la luz y enfrentarte a ciegas.", esCorrecta: false, "resultado": "Las sombras te rodean en la oscuridad y te desarman." },
          { texto: "Usar el brillo de tu marca de lector para disipar la oscuridad.", esCorrecta: true, "resultado": "El resplandor incinera a los espectros, disolviéndolos en polvo estelar." },
          { texto: "Tratar de negociar con los sicarios oscuros.", esCorrecta: false, "resultado": "No conocen la piedad; te dejan aturdido en el suelo." }
        ]
      },
      {
        tituloEncuentro: `⚡ Juicio del Archienemigo de "${tituloLibro}"`,
        narracion: `El archivillano de ${autorLibro} materializa su presencia ante ti, bloqueando el acceso al siguiente estrato del Gremio con una barrera de energía letal.`,
        opciones: [
          { texto: "Atacar la barrera frontalmente con desesperación.", esCorrecta: false, "resultado": "El rebote de la energía arcana te fulmina y te hace retroceder." },
          { texto: "Desestabilizar su fuente de poder usando los giros argumentales leídos.", esCorrecta: true, "resultado": "La lógica de la trama destruye su escudo, dejándole a tu merced." },
          { texto: "Intentar rodear la zona por un risco invisible.", esCorrecta: false, "resultado": " caes por un precipicio ilusorio antes de tocar tierra." }
        ]
      },
      {
        tituloEncuentro: `🌪️ La Furia del Caos en "${tituloLibro}"`,
        narracion: `Una tormenta de páginas rasgadas y ceniza mágica convocada por el clímax de ${autorLibro} amenaza con desintegrar tus recuerdos de la lectura.`,
        opciones: [
          { texto: "Intentar atrapar las páginas voladoras con las manos.", esCorrecta: false, "resultado": "Te cortas con los bordes de papel afilado mientras el caos te vence." },
          { texto: "Anclar tu mente recitando el clímax y desenlace de la obra.", esCorrecta: true, "resultado": "Tu orden mental calma la tormenta, convirtiendo el torbellino en una suave brisa." },
          { texto: "Cerrar los ojos y aguantar el temporal.", esCorrecta: false, "resultado": "El huracán te arrastra y te deja exhausto." }
        ]
      },
      {
        tituloEncuentro: `🛡️ Duelo de Aceros contra el Campeón de "${tituloLibro}"`,
        narracion: `Un caballero acorazado invocado por la peor tragedia de ${autorLibro} desenvaina una espada humeante de odio y te desafía a duelo singular.`,
        opciones: [
          { texto: "Bloquear su golpe con fuerza bruta.", esCorrecta: false, "resultado": "Su hoja atraviesa tu defensa con facilidad pasmosa." },
          { texto: "Desviar su estocada aprovechando su propia inercia y contraatacar.", esCorrecta: true, "resultado": "Tu espada encuentra la junta de su armadura, derribándolo con honor." },
          { texto: "Rogar clemencia invocando las reglas del Gremio.", esCorrecta: false, "resultado": "El campeón ignora tus palabras y te inflige una herida profunda." }
        ]
      },
      {
        tituloEncuentro: `🔥 Bestiario Desatado de "${tituloLibro}"`,
        narracion: `La criatura mitológica que aterrorizaba las páginas de ${autorLibro} ha saltado al mundo real y te bloquea el paso con fauces abiertas.`,
        opciones: [
          { texto: "Intentar domar a la bestia con miradas severas.", esCorrecta: false, "resultado": "La bestia ruge y te lanza un zarpazo que te aparta del camino." },
          { texto: "Exponer su debilidad ancestral descubierta en el nudo de la novela.", esCorrecta: true, "resultado": "La criatura retrocede aterrorizada y se desvanece en vapor." },
          { texto: "Arrojarle tu mochila como distracción.", esCorrecta: false, "resultado": "Destroza tus pertenencias y te obliga a huir magullado." }
        ]
      },
      {
        tituloEncuentro: `👤 El Espejo Maligno en "${tituloLibro}"`,
        narracion: `Una réplica oscura de ti mismo, nacida de los dilemas morales planteados por ${autorLibro}, surge del suelo empuñando tus mismas armas.`,
        opciones: [
          { texto: "Copiar exactamente sus movimientos de ataque.", esCorrecta: false, "resultado": "El combate se estanca hasta que tu doble te supera por cansancio." },
          { texto: "Adoptar una estrategia inesperada que contradiga tu naturaleza inicial.", esCorrecta: true, "resultado": "Descolocas a tu reflejo y se disuelve en un charco de tinta." },
          { texto: "Insultar a tu doble para mermar su moral.", esCorrecta: false, "resultado": "Tu propio reflejo te devuelve un golpe el doble de fuerte." }
        ]
      },
      {
        tituloEncuentro: `💀 Asedio del Señor de las Fosas de "${tituloLibro}"`,
        narracion: `Las catacumbas del libro de ${autorLibro} se abren bajo tus pies y un señor de la guerra esquelético emerge reclamando tu alma lectora.`,
        opciones: [
          { texto: "Patear los huesos del esqueleto para desarmarlo.", esCorrecta: false, "resultado": "Sus piezas se recomponen al instante y te inmovilizan." },
          { texto: "Invocar la sabiduría del desenlace del libro para romper su maldición.", esCorrecta: true, "resultado": "La magia arcana desintegra el esqueleto en un destello blanco." },
          { texto: "Escapar corriendo sin mirar atrás.", esCorrecta: false, "resultado": "Una lanza ósea te alcanza en la huida, dejándote maltrecho." }
        ]
      },
      {
        tituloEncuentro: `👁️ La Mirada del Vigía de "${tituloLibro}"`,
        narracion: `Un ojo colosal flotante, testigo de todas las tragedias descritas por ${autorLibro}, fija su haz de petrificación directamente sobre ti.`,
        opciones: [
          { texto: "Mirar fijamente al ojo sin parpadear.", esCorrecta: false, "resultado": "Tu mente empieza a nublarse bajo su influjo hipnótico." },
          { texto: "Reflejar su rayo con un fragmento de cristal pulido.", esCorrecta: true, "resultado": "El haz rebota sobre sí mismo y el vigía estalla en mil pedazos." },
          { texto: "Cerrar los ojos y caminar a tientas.", esCorrecta: false, "resultado": "Tropiezas con los riscos y caes al vacío." }
        ]
      },
      {
        tituloEncuentro: `🗡️ Emboscada de Bandidos Literarios en "${tituloLibro}"`,
        narracion: `Forajidos salidos de los bajos fondos descritos en la obra de ${autorLibro} te rodean en un callejón sin salida del calabozo.`,
        opciones: [
          { texto: "Ofrecerles todo tu oro de golpe.", esCorrecta: false, "resultado": "Se quedan con el botín y además te propinan una paliza." },
          { texto: "Usar el terreno a tu favor para reducir al líder con astucia.", esCorrecta: true, "resultado": "El líder cae capturado y el resto de bandidos huye despavorido." },
          { texto: "Intentar abrirte paso a cabezazos.", esCorrecta: false, "resultado": "Te superan en número y te dejan inconsciente." }
        ]
      }
    ];
    return combates[Math.floor(Math.random() * combates.length)];

  } else {
    const acertijos = [
      {
        tituloEncuentro: `🔮 El Enigma del Oráculo en "${tituloLibro}"`,
        narracion: `Un monje anciano custodiado por runas ancestrales te bloquea el paso, exigiendo descifrar el verdadero dilema que planteó ${autorLibro} en su obra.`,
        opciones: [
          { texto: "Adivinar al azar mencionando un personaje secundario.", esCorrecta: false, "resultado": "El monje niega con tristeza y una carga mental te debilita." },
          { texto: "Responder con la tesis central y moraleja principal del libro.", esCorrecta: true, "resultado": "El monje sonríe, desactiva las runas y te concede su bendición." },
          { texto: "Intentar sobornarlo con marcapáginas.", esCorrecta: false, "resultado": "El sabio rechaza la ofrenda material con desdén." }
        ]
      },
      {
        tituloEncuentro: `📜 El Pergamino Prohibido de "${tituloLibro}"`,
        narracion: `Un pergamino flotante con escritura enigmática firmada por ${autorLibro} te reta a completar una frase clave para abrir el cofre del tesoro.`,
        opciones: [
          { texto: "Quemar el pergamino para evitar el problema.", esCorrecta: false, "resultado": "El papel se regenera y te consume una parte de tu energía." },
          { texto: "Completar el verso recordando el pasaje más célebre de la lectura.", esCorrecta: true, "resultado": "El pergamino brilla con intensidad y revela un mapa oculto." },
          { texto: "Inventar una frase bonita que suene culta.", esCorrecta: false, "resultado": "El texto se tiñe de rojo sangre indicando un fallo rotundo." }
        ]
      },
      {
        tituloEncuentro: `⏳ El Reloj de Arena del Destino en "${tituloLibro}"`,
        narracion: `El tiempo se congela en el calabozo. Una voz incorpórea inspirada en la atmósfera de ${autorLibro} te plantea un enigma sobre el transcurso de la trama.`,
        opciones: [
          { texto: "Gritar la primera fecha que se te ocurra.", esCorrecta: false, "resultado": "El reloj acelera su marcha y te agota espiritualmente." },
          { texto: "Identificar el punto de inflexión exacto donde cambió el destino de los protagonistas.", esCorrecta: true, "resultado": "El tiempo vuelve a fluir y el orbe del reloj se te entrega como trofeo." },
          { texto: "Romper el reloj de arena a golpes.", esCorrecta: false, "resultado": "Los cristales rotos te atrapan en un bucle temporal fallido." }
        ]
      },
      {
        tituloEncuentro: `🗝️ Las Tres Puertas de los Secretos de "${tituloLibro}"`,
        narracion: `Tres puertas idénticas se materializan frente a ti. Solo una de ellas conduce al botín legítimo de la obra de ${autorLibro}; las otras dos ocultan trampas mortales.`,
        opciones: [
          { texto: "Elegir la puerta de la izquierda por pura intuición.", esCorrecta: false, "resultado": "La puerta se abre revelando un foso de pinchos venenosos." },
          { texto: "Analizar las pistas sutiles dejadas por el autor a lo largo de los capítulos.", esCorrecta: true, "resultado": "Seleccionas la puerta correcta, la cual se abre ante un resplandor dorado." },
          { texto: "Patear las tres puertas a la vez.", esCorrecta: false, "resultado": "Activaste las trampas de las tres estancias simultáneamente." }
        ]
      },
      {
        tituloEncuentro: `⚖️ La Balanza de los Dilemas en "${tituloLibro}"`,
        narracion: `Una balanza espectral evalúa tus convicciones sobre los dilemas éticos presentados por ${autorLibro} en su universo narrativo.`,
        opciones: [
          { texto: "Colocar un peso pesado de metal en el plato.", esCorrecta: false, "resultado": "La balanza rechaza el metal; busca peso moral, no material." },
          { texto: "Reconocer la lección de empatía y justicia que emana de la lectura.", esCorrecta: true, "resultado": "Los platos se equilibran perfectamente y un haz de luz te baña." },
          { texto: "Tratar de desequilibrar la balanza a la fuerza.", esCorrecta: false, "resultado": "Un rayo de reproche ético te sacude con fuerza." }
        ]
      },
      {
        tituloEncuentro: `🌌 El Enigma de las Estrellas Caídas en "${tituloLibro}"`,
        narracion: `Una constelación artificial proyectada por la magia de ${autorLibro} en el techo del calabozo te exige conectar los puntos del misterio principal.`,
        opciones: [
          { texto: "Trazar líneas al azar formando figuras geométricas.", esCorrecta: false, "resultado": "Las estrellas se apagan dejándote en la penumbra más absoluta." },
          { texto: "Conectar las estrellas siguiendo el orden cronológico del viaje del héroe.", esCorrecta: true, "resultado": "La constelación brilla guiando tu camino hacia la recompensa." },
          { texto: "Esperar a que se disuelva sola.", esCorrecta: false, "resultado": "El frío cósmico penetra en tus huesos debilitando tu temple." }
        ]
      },
      {
        tituloEncuentro: `🎭 La Máscara de las Mil Caras de "${tituloLibro}"`,
        narracion: `Un autómata con una máscara cambiante inspirada en la psicología de los personajes de ${autorLibro} te pide identificar la verdadera máscara del traidor.`,
        opciones: [
          { texto: "Señalar la máscara más brillante y llamativa.", esCorrecta: false, "resultado": "Caíste en la trampa del camuflaje; el autómata te castiga." },
          { texto: "Señalar la máscara sobria que ocultaba las verdaderas intenciones desde el inicio.", esCorrecta: true, "resultado": "El autómata se inclina con respeto y te cede el paso." },
          { texto: "Intentar arrancar la máscara por la fuerza.", esCorrecta: false, "resultado": "La máscara explota en tinta corrosiva dañando tu equipo." }
        ]
      },
      {
        tituloEncuentro: `📚 El Laberinto de Páginas Infinitas de "${tituloLibro}"`,
        narracion: `Te has adentrado en un laberinto de pasillos formados por tomos gigantes escritos por ${autorLibro}. Debes hallar la salida lógica.`,
        opciones: [
          { texto: "Seguir siempre girando a la izquierda sin pensar.", esCorrecta: false, "resultado": "Das vueltas en círculos hasta quedar atrapado en un callejón sin salida." },
          { texto: "Seguir el hilo conductor del argumento principal hasta el clímax.", esCorrecta: true, "resultado": "Sales disparado al exterior justo donde aguarda el botín." },
          { texto: "Gritar pidiendo auxilio a los cuatro vientos.", esCorrecta: false, "resultado": "Tu eco despierta a guardianes menores que te hostigan." }
        ]
      },
      {
        tituloEncuentro: `🕯️ La Llama Eterna de la Verdad en "${tituloLibro}"`,
        narracion: `Tres velas de colores distintos parpadean frente a ti. Una de ellas representa la verdad de la obra de ${autorLibro}; las otras dos, interpretaciones erróneas.`,
        opciones: [
          { texto: "Soplar las tres velas para apagar el fuego.", esCorrecta: false, "resultado": "La oscuridad total te desorienta y te inflige fatiga mental." },
          { texto: "Encender la mecha de la vela que coincide con el mensaje del autor.", esCorrecta: true, "resultado": "La llama se estabiliza con un fulgor dorado y cálido." },
          { texto: "tocar la cera caliente con los dedos.", esCorrecta: false, "resultado": "Te quemas la mano y sufres un traspié." }
        ]
      },
      {
        tituloEncuentro: `🌊 El Pozo de los Recuerdos de "${tituloLibro}"`,
        narracion: `Un pozo mágico te muestra visiones fragmentadas del libro de ${autorLibro}. Debes ordenar mentalmente el flujo de los recuerdos.`,
        opciones: [
          { texto: "Beber el agua del pozo de un trago ansioso.", esCorrecta: false, "resultado": "Los recuerdos revueltos te provocan un fuerte mareo." },
          { texto: "Seleccionar el fragmento que resume el sacrificio final de la historia.", esCorrecta: true, "resultado": "El agua del pozo se vuelve cristalina y purifica tu espíritu." },
          { texto: "Lanzar una piedra al fondo para romper el hechizo.", esCorrecta: false, "resultado": "El pozo salpica agua ácida que corroe tus pertenencias." }
        ]
      }
    ];
    return acertijos[Math.floor(Math.random() * acertijos.length)];
  }
}