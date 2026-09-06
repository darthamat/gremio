import { BANCO_HUELLAS, HUELLAS_GENERICAS } from "js/rasgosData.js";

export function procesarEvolucionLectura(generoLibro, habilidadesActuales = {}) {
    const generoNorm = generoLibro.toLowerCase();
    const bancoGenero = BANCO_HUELLAS[generoNorm] || BANCO_HUELLAS["clasicos"];

    const gananciasDelViaje = [];
    const mapaActualizado = { ...habilidadesActuales };

    // 1. Tirada de Habilidad por Género (70% probabilidad)
    if (Math.random() <= 0.70) {
        const rasgoGenero = bancoGenero.rasgos[Math.floor(Math.random() * bancoGenero.rasgos.length)];
        actualizarNivelHabilidad(rasgoGenero, "ganancia", mapaActualizado, gananciasDelViaje);
    }

    // 2. Tirada de Habilidad BÁSICA / PROSAICA (Ej: Valentía, Observador, Científico) (50% probabilidad)
    if (Math.random() <= 0.50) {
        const rasgoBasico = HUELLAS_GENERICAS.rasgos[Math.floor(Math.random() * HUELLAS_GENERICAS.rasgos.length)];
        actualizarNivelHabilidad(rasgoBasico, "ganancia", mapaActualizado, gananciasDelViaje);
    }

    // 3. Tirada de Carga por Género (30% probabilidad)
    if (Math.random() <= 0.30) {
        const cicatrizGenero = bancoGenero.cicatrices[Math.floor(Math.random() * bancoGenero.cicatrices.length)];
        actualizarNivelHabilidad(cicatrizGenero, "carga", mapaActualizado, gananciasDelViaje);
    }

    // 4. Tirada de Carga BÁSICA / PROSAICA (Ej: Ansiedad, Nerviosismo, Egoísmo) (30% probabilidad)
    if (Math.random() <= 0.30) {
        const cicatrizBasica = HUELLAS_GENERICAS.cicatrices[Math.floor(Math.random() * HUELLAS_GENERICAS.cicatrices.length)];
        actualizarNivelHabilidad(cicatrizBasica, "carga", mapaActualizado, gananciasDelViaje);
    }

    return {
        mapaActualizado,
        gananciasDelViaje
    };
}

function actualizarNivelHabilidad(item, tipo, mapa, registroGanancias) {
    const id = item.id;

    if (mapa[id]) {
        mapa[id].nivel += 1; // Suma +1 al nivel existente
    } else {
        mapa[id] = {
            id: id,
            nombre: item.nombre,
            icono: item.icono,
            desc: item.desc,
            tipo: tipo,
            nivel: 1
        };
    }

    // Evita duplicar en la lista de notificación si la misma habilidad sale dos veces en la misma tirada
    const yaRegistrada = registroGanancias.find(g => g.id === id);
    if (!yaRegistrada) {
        registroGanancias.push({
            ...mapa[id]
        });
    }
}