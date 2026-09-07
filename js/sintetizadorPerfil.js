// sintetizadorPerfil.js

export function generarResumenEvolucion(huellasMap = {}) {
    const listaHuellas = Object.values(huellasMap);

    if (listaHuellas.length === 0) {
        return {
            tituloArquetipo: "Aventurero lector Neófito",
            resumenTextual: "Aún no has cruzado suficientes páginas para que los libros dejen marcas profundas en tu carácter. Tu viaje apenas comienza."
        };
    }

    // 1. Separar ganancias y cargas
    const ganancias = listaHuellas.filter(h => h.tipo === "ganancia").sort((a, b) => b.nivel - a.nivel);
    const cargas = listaHuellas.filter(h => h.tipo === "carga").sort((a, b) => b.nivel - a.nivel);

    // 2. Extraer las huellas más influyentes (mayor nivel)
    const topGanancias = ganancias.slice(0, 2);
    const topCargas = cargas.slice(0, 2);

    // 3. Determinar el Arquetipo según la combinación
    const tituloArquetipo = determinarArquetipo(topGanancias, topCargas);

    // 4. Construir el texto fluido estilo "Cronista"
    let texto = "Tras tus continuos viajes a través de las páginas, tu mente ha experimentado una transformación evidente. ";

    if (topGanancias.length > 0) {
        const nombresG = topGanancias.map(g => `<strong>${g.nombre.toLowerCase()}</strong> (Nivel +${g.nivel})`).join(" y ");
        texto += `La lectura constante ha cultivado en ti una notable ${nombresG}. Te has convertido en una persona mucho más reflexiva y capaz de comprender matices que a otros se les escapan. `;
    }

    if (topCargas.length > 0) {
        const nombresC = topCargas.map(c => `<strong>${c.nombre.toLowerCase()}</strong> (Nivel +${c.nivel})`).join(" y ");
        texto += `Sin embargo, cada viaje deja su huella: tantas historias complejas han traído consigo cierta inclinación hacia la ${nombresC}, haciéndote percibir el mundo cotidiano con una distancia o inquietud singular. `;
    }

    // Mensaje de cierre equilibrado
    texto += "No vuelves de un libro siendo la misma persona; te transformas en alguien más complejo, despierto y lleno de matices.";

    return {
        tituloArquetipo,
        resumenTextual: texto
    };
}

// Algoritmo para asignar un arquetipo dinámico
function determinarArquetipo(topGanancias, topCargas) {
    const principalG = topGanancias[0]?.id || "";
    const principalC = topCargas[0]?.id || "";

    if (principalG.includes("imaginativ") || principalG.includes("vision")) {
        if (principalC.includes("desconexion") || principalC.includes("melancolia")) return "El Soñador Distante";
        return "El Visionario Onírico";
    }

    if (principalG.includes("critico") || principalG.includes("rigor") || principalG.includes("cientifico")) {
        if (principalC.includes("cinismo") || principalC.includes("escepticismo")) return "El Filósofo Desilusionado";
        return "El Analista Perspicaz";
    }

    if (principalG.includes("valentia") || principalG.includes("resiliencia")) {
        if (principalC.includes("hipervigilancia") || principalC.includes("ansiedad")) return "El Estratega Alerta";
        return "El Guardián Inquebrantable";
    }

    if (principalG.includes("sensibilidad") || principalG.includes("empatia")) {
        return "El Místico Empático";
    }

    return "El Viajero de Mil Almas";
}