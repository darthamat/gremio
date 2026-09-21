// js/objetosData.js

export const BANCO_OBJETOS_MAGICOS = [
  {
    nombre: "Pluma de Cuervo de Tinta Eterna",
    efecto: "Aumenta ligeramente la inspiración al registrar nuevas páginas.",
    icono: "✒️",
    rareza: "Común"
  },
  {
    nombre: "Monóculo de los Mundos Perdidos",
    efecto: "Permite percibir secretos ocultos en los géneros de Ciencia Ficción.",
    icono: "🧐",
    rareza: "Rara"
  },
  {
    nombre: "Colgante de Lágrima de Dragón",
    efecto: "Otorga protección contra las sombras en lecturas de Fantasía oscura.",
    icono: "💎",
    rareza: "Épica"
  },
  {
    nombre: "Taza de Café humeante de la Taberna",
    efecto: "Mantiene la fatiga a raya durante maratones de lectura nocturnas.",
    icono: "☕",
    rareza: "Común"
  },
  {
    nombre: "Grimorio de Páginas Infinitas",
    efecto: "Duplica la satisfacción al completar tomos de más de 500 páginas.",
    icono: "📖",
    rareza: "Legendaria"
  },
  {
    id: "taza_cafe",
    titulo: "Taza de café mágico",
    descripcion: "Ganas XP extra en lecturas nocturnas.",
    rareza: "Común",
    tipo: "pasivo",
    icono: "☕",
    efecto: "Mantiene la fatiga a raya durante maratones nocturnas."
  },
  {
    id: "pluma_fenix",
    titulo: "Pluma de Fénix",
    descripcion: "Aumenta el prestigio obtenido durante las lecturas.",
    rareza: "Rara",
    tipo: "pasivo",
    duracion: 7,
    icono: "🪶",
    efecto: "Aumenta el prestigio x1.5"
  },
  {
    id: "marca_dragon",
    titulo: "Marcapáginas del Dragón",
    descripcion: "Otorga favor extra al terminar libros.",
    rareza: "Rara",
    tipo: "pasivo",
    icono: "🐉",
    efecto: "+100 monedas o favor al concluir tomos."
  },
  {
    id: "lupa_detective",
    titulo: "Lupa de detective",
    descripcion: "Aumenta la perspicacia ante misterios.",
    rareza: "Rara",
    tipo: "pasivo",
    icono: "🔍",
    efecto: "Mejora un 25% la percepción de detalles."
  },
  {
    id: "amuleto_suerte",
    titulo: "Amuleto de la suerte",
    descripcion: "Otorga fortuna en los dados del calabozo.",
    rareza: "Rara",
    tipo: "pasivo",
    icono: "🧿",
    efecto: "Bonus permanente de prestigio y XP."
  },

  // --- Legendarios ---
  {
    id: "capa_invisibilidad",
    titulo: "Capa de invisibilidad",
    descripcion: "Capa de mago experto en pasar desapercibido.",
    rareza: "Legendaria",
    tipo: "pasivo",
    icono: "🧥",
    efecto: "Multiplicador de XP x1.2"
  },
  {
    id: "grimorio_eterno",
    titulo: "Grimorio Eterno",
    descripcion: "Un compendio que resuena con la magia del Cónclave.",
    rareza: "Legendaria",
    tipo: "pasivo",
    icono: "📖",
    efecto: "Duplica la XP de los retos completados."
  },
  {
    id: "pipa_bilbo",
    titulo: "La pipa de Bilbo",
    descripcion: "Aumenta la mente y la sabiduría del lector.",
    rareza: "Legendaria",
    tipo: "pasivo",
    icono: "🚬",
    efecto: "Incrementa la característica de Mente."
  }
];

export const BANCO_SEGUIDORES = [
  {
    nombre: "Bartholomew, el Búho Bibliotecario",
    frase: "Hoo... Menos mal que este tomo tenía un índice decente.",
    icono: "🦉"
  },
  {
    nombre: "Ignis, el Pequeño Gárgola de Estantería",
    frase: "¡Ji, ji! El lomo de este libro crujía deliciosamente al cerrarse.",
    icono: "🗿"
  },
  {
    nombre: "Lyra, la Aprendiza de Cronista",
    frase: "¡Anotado en los registros del Gremio! ¿Cuál será nuestra próxima aventura?",
    icono: "📜"
  },
  {
    nombre: "Sir Pounce, el Gato Errante del Cónclave",
    frase: "Prrr... Dormir encima de este libro abierto ha mejorado mi sabiduría.",
    icono: "🐱"
  },
  {
    id: "orangutan",
    titulo: "Mascota: Orangután asesino",
    descripcion: "Ganas prestigio y notoriedad.",
    rareza: "Rara",
    tipo: "activo",
    categoria: "seguidor",
    icono: "🦧",
    frasesFinalLectura: [
      "¡Uh uh uhhhhh!"
    ],
    efectos: { prestigio: 2500, fuerza: 3 }
  },
  {
    id: "t_rex",
    titulo: "Mascota: T-Rex simpático",
    descripcion: "Un compañero prehistórico imponente.",
    rareza: "Rara",
    tipo: "activo",
    categoria: "seguidor",
    icono: "🦖",
    frasesFinalLectura: [
      "Grrrrrrrrrrrrr",
      "Sniff...",
      "Woooooooooooo",
      "Burrrrrrrrrrrr"
    ],
    efectos: { prestigio: 2500, fuerza: 3 }
  },
  {
    id: "racoon",
    titulo: "Mascota: Rocket Raccoon",
    descripcion: "Defensor galáctico de dudosa legalidad.",
    rareza: "Rara",
    tipo: "activo",
    categoria: "seguidor",
    icono: "🦝",
    frasesFinalLectura: [
      "¡Nosotros somos los malditos Guardianes de la Galaxia!",
      "¡NO SOY UN MAPACHE!",
      "¡Necesito el ojo de ese tipo!"
    ],
    efectos: { prestigio: 1500, fuerza: 3 }
  },
  {
    id: "robot",
    titulo: "Mascota: Maximus Prime",
    descripcion: "Líder mecánico de gran presencia.",
    rareza: "Rara",
    tipo: "activo",
    categoria: "seguidor",
    icono: "🤖",
    frasesFinalLectura: [
      "¡Soy Maximus Prime!",
      "¡Ch-ch-ch-ch-ch-k-k-k!",
      "Autobots, ¡avancen!",
      "El destino rara vez nos llama en el momento que elegimos."
    ],
    efectos: { prestigio: 1500, fuerza: 3 }
  },
  {
    id: "vampiro",
    titulo: "Seguidor: Drácula",
    descripcion: "Un noble oscuro amante de la noche.",
    rareza: "Rara",
    tipo: "activo",
    categoria: "seguidor",
    icono: "🧛",
    frasesFinalLectura: [
      "Interesante... aunque esperaba un poco más de sangre.",
      "Otra lectura terminada. Brindo por ti... yo pongo la sangre, digo el vino...",
      "Has sobrevivido a otro libro. Una habilidad admirable para un mortal.",
      "Yo habría leído más rápido, pero los vampiros tenemos horarios complicados."
    ],
    efectos: { prestigio: 1500, fuerza: 1, corazon: -2 }
  },
  {
    id: "elfo",
    titulo: "Seguidor: Legolas",
    descripcion: "Arquero élfico de agilidad legendaria.",
    rareza: "Rara",
    tipo: "activo",
    categoria: "seguidor",
    icono: "🧝",
    frasesFinalLectura: [
      "Una lectura digna de las canciones de los elfos.",
      "He visto muchas cosas en mis largos años... pero este final me sorprendió.",
      "Otro libro completado. Tus ojos son rápidos, humano."
    ],
    efectos: { prestigio: 1500, agilidad: 2 }
  },
  {
    id: "luis",
    titulo: "Seguidor: Luis (Pitufo Gruñón)",
    descripcion: "Nunca le gusta nada, pero te acompaña igual.",
    rareza: "Rara",
    tipo: "activo",
    categoria: "seguidor",
    icono: "🤬",
    frasesFinalLectura: [
      "Pues a mí no me ha gustado.",
      "¿Ya está? Menuda pérdida de tiempo.",
      "He leído cosas peores. Pero pocas.",
      "Otro libro terminado... fantástico. Qué emocionante."
    ],
    efectos: { prestigio: -1500, mente: -1 }
  }
];

// 🎲 Función auxiliar para obtener un objeto o seguidor aleatorio de tu banco local
export function obtenerRecompensaAleatoriaLocal() {
  const objetoAleatorio = BANCO_OBJETOS_MAGICOS[Math.floor(Math.random() * BANCO_OBJETOS_MAGICOS.length)];
  const seguidorAleatorio = BANCO_SEGUIDORES[Math.floor(Math.random() * BANCO_SEGUIDORES.length)];

  return {
    objeto: objetoAleatorio,
    seguidor: seguidorAleatorio
  };
}

// 🎲 Función auxiliar para obtener una frase aleatoria del seguidor activo o equipado
export function obtenerFraseSeguidor(seguidor) {
  if (!seguidor || !seguidor.frasesFinalLectura || seguidor.frasesFinalLectura.length === 0) {
    return null;
  }
  const indice = Math.floor(Math.random() * seguidor.frasesFinalLectura.length);
  return seguidor.frasesFinalLectura[indice];
}