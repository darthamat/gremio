export const CLASES_GREMIO = {
    fantasia: {
        id: "fantasia",
        nombre: "Bardo Fantástico",
        icono: "🧙‍♂️",
        descripcion: "Especialista en mundos épicos, magia e historias de alta fantasía."
    },
    misterio: {
        id: "misterio",
        nombre: "Inquisidor del Misterio",
        icono: "🔍",
        descripcion: "Maestro del thriller, misterio, novela negra y deducción lógica."
    },
    cienciaFiccion: {
        id: "cienciaFiccion",
        nombre: "Navegante Estelar",
        icono: "🚀",
        descripcion: "Explorador del espacio, distopías y futurología de ciencia ficción."
    },
    guerreroFriki: {
        id: "guerreroFriki",
        nombre: "Guerrero Friki",
        icono: "🛡️",
        descripcion: "Defensor de la no ficción, ensayos e historia para ganar batallas dialécticas."
    },
    ladronLibros: {
        id: "ladronLibros",
        nombre: "Ladrón de Libros",
        icono: "🗡️",
        descripcion: "Pícaro ágil que devora giros de guión a la velocidad de las sombras."
    },

    nigromanteAbismo: {
        id: "nigromanteAbismo",
        nombre: "Nigromante del Abismo",
        icono: "💀",
        descripcion: "Especialista en literatura de terror, horror cósmico y relatos oscuros."
    },
    paladinRomantico: {
        id: "paladinRomantico",
        nombre: "Paladín Romántico",
        icono: "⚔️❤️",
        descripcion: "Guardián de novelas románticas, romantasy y grandes pasiones trágicas."
    },
    cronistaAncestral: {
        id: "cronistaAncestral",
        nombre: "Cronista Ancestral",
        icono: "🏛️",
        descripcion: "Viajero del tiempo apasionado de la novela histórica y antiguas civilizaciones."
    },
    guardianClasicos: {
        id: "guardianClasicos",
        nombre: "Guardián de Clásicos",
        icono: "📜",
        descripcion: "Custodio de las grandes obras de la literatura universal y tomos atemporales."
    },
    monjeFilosofo: {
        id: "monjeFilosofo",
        nombre: "Monje Filósofo",
        icono: "☯️",
        descripcion: "Buscador de iluminación a través del desarrollo personal, psicología y filosofía."
    },
    alquimistaGrafico: {
        id: "alquimistaGrafico",
        nombre: "Alquimista Gráfico",
        icono: "🎨",
        descripcion: "Maestro del arte secuencial: novelas gráficas, cómics e ilustración."
    },
    shinobiOtaku: {
        id: "shinobiOtaku",
        nombre: "Shinobi Otaku",
        icono: "🥷",
        descripcion: "Devorador velocísimo de tomos de manga y novelas ligeras orientales."
    },
    druidaCozy: {
        id: "druidaCozy",
        nombre: "Druida Cozy",
        icono: "🌿☕",
        descripcion: "Amante de las lecturas reconfortantes, fantasía acogedora y slice of life."
    },
    cazadorPoetico: {
        id: "cazadorPoetico",
        nombre: "Cazador/a Poético",
        icono: "🏹📖",
        descripcion: "Rastreador de métricas, lírica, prosas bellas y antologías de poesía."
    },
    tinterooCaminante: {
        id: "tinterooCaminante",
        nombre: "Caminante de Relatos",
        icono: "🧳",
        descripcion: "Especialista en relatos cortos, antologías y narrativa de viajes."
    }

};

// Listas ampliadas de nombres base para el generador del Códice
export const NOMBRES_BASE = [
    "Kvothe", "Vin", "Elminster", "Geralt", "Gandalf", 
    "Lyra", "Arya", "Sandor", "Kelsier", "Bilbo",
    "Shallan", "Kaladin", "Corvo", "Raistlin", "Yennefer",
    "Eowyn", "Drizzt", "Jaznah", "Locke", "Gideon","Atreides", "Severian", "Jorah", "Tess", "Morgana",
    "Faelar", "Vaelin", "Elric", "Beren", "Lúthien",
    "Nynaeve", "Matrim", "Ender", "Kathe", "Ciri",
    "Rincewind", "Arwen", "Fitz", "Tavi", "Belgarath"
];

// Listas ampliadas de títulos y epítetos del Gremio
export const TITULOS_EPICOS = [
    "el Buscador de Portales",
    "la Tejedora de Tinta",
    "el Devorador de Tomos",
    "la Guardiana del Códice",
    "del Valle de las Sombras",
    "el Inquisidor Silencioso",
    "la Exploradora de Universos",
    "el Cronista Olvidado",
    "la Dama de los Capítulos",
    "el Arquitecto de Relatos",
    "la Rastreadora de Mitos",
    "el Señor de las Leyendas",
    "la Cartógrafa de Ficciones",
    "el Cazador de Spoilers",
    "la Custodia de la Cripta",
    "el Bardo Nocturno",
    "la Erudita del Abismo",
    "el Pícaro del Margen",
    "la Guardiana del Círculo",
    "el Centinela del Tintero",
    "el Navegante del Éter",
    "la Susurradora de Páginas",
    "el Rompeencuadernaciones",
    "la Maestra del Prólogo",
    "el Forjador de Sagas",
    "la Tejedora del Destino",
    "el Centinela de la Tormenta",
    "la Alquimista de Historias",
    "el Habitante del Epílogo",
    "la Guardiana del Relato Prohibido",
    "el Guardián de la Noche Estrellada",
    "la Exploradora del Laberinto",
    "el Sabueso de la Verdad",
    "la Cronista Inmortal",
    "el Domador de Dragones",
    "la Centinela de los Volúmenes",
    "el Caballero de la Tinta Rúnica",
    "la Viajera del Canon",
    "el Coleccionista de Primeras Ediciones",
    "la Centinela del Manuscrito"
];

/**
 * Genera un nombre completo al azar
 */
export function generarNombreAleatorio() {
    const nombre = NOMBRES_BASE[Math.floor(Math.random() * NOMBRES_BASE.length)];
    const titulo = TITULOS_EPICOS[Math.floor(Math.random() * TITULOS_EPICOS.length)];
    return `${nombre} ${titulo}`;
}

/**
 * Selecciona una clase al azar
 */
export function obtenerClaseAleatoria() {
    const claves = Object.keys(CLASES_GREMIO);
    const claveAzar = claves[Math.floor(Math.random() * claves.length)];
    return CLASES_GREMIO[claveAzar];
}