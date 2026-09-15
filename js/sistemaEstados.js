/**
 * js/sistemaEstados.js
 * Sistema de evaluación de Estados del Aventurero.
 * Evalúa los 6 atributos de D&D, rasgos equipados y cicatrices activas.
 */

export function calcularEstadoAventurero(stats = {}, rasgosEquipados = [], cicatricesEquipadas = []) {
    // 1. Normalización de Atributos D&D
    const fue = Number(stats.fuerza || stats.FUE) || 0;
    const des = Number(stats.destreza || stats.DES) || 0;
    const con = Number(stats.constitucion || stats.CON) || 0;
    const int = Number(stats.inteligencia || stats.INT) || 0;
    const sab = Number(stats.sabiduria || stats.SAB) || 0;
    const car = Number(stats.carisma || stats.CAR) || 0;

    // Helper para verificar la presencia de rasgos o cicatrices por ID o palabras clave
    const tieneId = (lista, idBuscado) => lista.some(item => (item.id || item) === idBuscado);
    const tienePalabraClave = (lista, keyword) => 
        lista.some(item => (item.nombre || item.id || "").toLowerCase().includes(keyword.toLowerCase()));

    // ==========================================
    // 1. ARQUETIPOS DE SINERGIA Y TRAUMAS
    // ==========================================

    // Parálisis del Elegido (Cicatriz "espera_de_destino" o "paralisis_decision")
    if (tieneId(cicatricesEquipadas, "espera_de_destino") || tieneId(cicatricesEquipadas, "paralisis_decision")) {
        return {
            titulo: "Parálisis del Elegido",
            icono: "⏳",
            descripcion: "Aguardas una llamada trascendental o te pierdes en matices, postergando las acciones cotidianas.",
            claseCSS: "estado-paralisis"
        };
    }

    // Hipervigilancia / Paranoia del Detective (Terror / Novela Negra)
    if (tieneId(cicatricesEquipadas, "hipervigilancia") || tieneId(cicatricesEquipadas, "mirada_suspicaz")) {
        return {
            titulo: "Centinela Paranoico",
            icono: "👁️",
            descripcion: "Evalúas constantemente salidas, sombras y segundas intenciones. Tu mente rara vez descansa.",
            claseCSS: "estado-alerta"
        };
    }

    // Bestia Desbocada: Fuerza física/voluntad alta + Poca Inteligencia o Sabiduría
    if (fue >= 12 && (sab <= -8 || int <= -8)) {
        return {
            titulo: "Bestia Indómita",
            icono: "🧌",
            descripcion: "Una fuerza descomunal e impulsiva. Prefieres aplastar dilemas directos antes que filosofar.",
            claseCSS: "estado-bestia"
        };
    }

    // Erudito Frío / Analista Implacable: Alta INT + Bajo CAR
    if (int >= 14 && car <= -8) {
        return {
            titulo: "Erudito Frío",
            icono: "📐",
            descripcion: "Desmontas argumentos con frialdad matemática. Implacable con la verdad, distante con la gente.",
            claseCSS: "estado-erudito"
        };
    }

    // Loco del Cónclave / Abstracción Desconectada: Alta INT + Baja SAB o "crisis_existencial"
    if (int >= 14 && (sab <= -10 || tieneId(cicatricesEquipadas, "crisis_existencial"))) {
        return {
            titulo: "Teórico Extraviado",
            icono: "🌀",
            descripcion: "Tu mente domina sistemas y filosofías complejas, pero has perdido amarra con la realidad práctica.",
            claseCSS: "estado-loco"
        };
    }

    // Poeta Místico / Alma Sensible: Alto CAR + Alta SAB + Rasgos de Poesía
    if (car >= 10 && sab >= 10 && (tienePalabraClave(rasgosEquipados, "poéti") || tienePalabraClave(rasgosEquipados, "sensibilidad"))) {
        return {
            titulo: "Poeta Místico",
            icono: "🥀",
            descripcion: "Un espíritu contemplativo que transforma la vulnerabilidad y la tragedia en belleza conmovedora.",
            claseCSS: "estado-romantico"
        };
    }

    // Tanque de Archivo / Voluntad Inquebrantable: Alta CON + Alta FUE o "resiliencia_leyenda"
    if (con >= 12 && (fue >= 10 || tieneId(rasgosEquipados, "resiliencia_leyenda"))) {
        return {
            titulo: "Baluarte Inquebrantable",
            icono: "🛡️",
            descripcion: "Físico y convicción de hierro. Soportas la fatiga, el estrés y la adversidad sin dar un paso atrás.",
            claseCSS: "estado-tanque"
        };
    }

    // Prospectivo Futurista: Alta INT + Alta SAB + Rasgos de Ciencia Ficción
    if (int >= 12 && sab >= 10 && tienePalabraClave(rasgosEquipados, "prospectiv")) {
        return {
            titulo: "Visionario Prospectivo",
            icono: "🚀",
            descripcion: "Anticipas dilemas del mañana y ves la existencia humana dentro de la gran escala cósmica.",
            claseCSS: "estado-futurista"
        };
    }

    // ==========================================
    // 2. ATRIBUTO DOMINANTE PREDOMINANTE (-20 a +20)
    // ==========================================

    const mapaAtributos = [
        { 
            nombre: "Fuerza", val: fue, 
            max: { t: "Titan de Voluntad", i: "🔥", d: "Tu determinación e impacto físico se imponen sobre cualquier obstáculo." }, 
            min: { t: "Espíritu Frágil", i: "🪶", d: "Te agotas rápidamente ante el esfuerzo físico o la confrontación directa." } 
        },
        { 
            nombre: "Destreza", val: des, 
            max: { t: "Reflejo Relámpago", i: "⚡", d: "Agilidad mental y física milimétrica para reaccionar ante lo imprevisto." }, 
            min: { t: "Pasos Torpes", i: "🗿", d: "Dificultad para adaptarte rápido o moverte con fluidez bajo presión." } 
        },
        { 
            nombre: "Constitución", val: con, 
            max: { t: "Fortaleza Eterna", i: "🩺", d: "Inmune al cansancio; tu cuerpo y mente soportan largas jornadas de tensión." }, 
            min: { t: "Salud Quebradiza", i: "🥀", d: "Propenso al agotamiento, la ansiedad o la fatiga por sobrecarga." } 
        },
        { 
            nombre: "Inteligencia", val: int, 
            max: { t: "Mente Omnisciente", i: "🧠", d: "Procesas datos, estructuras y teorías a una velocidad asombrosa." }, 
            min: { t: "Pensamiento Enturbiado", i: "🌫️", d: "Te cuesta conectar conceptos complejos o mantener el rigor analítico." } 
        },
        { 
            nombre: "Sabiduría", val: sab, 
            max: { t: "Oráculo Perspicaz", i: "🔮", d: "Intuición profunda para descifrar verdades ocultas, matices y personas." }, 
            min: { t: "Criterio a la Deriva", i: "🎈", d: "Desconectado del sentido común, propenso a idealismos irrealizables." } 
        },
        { 
            nombre: "Carisma", val: car, 
            max: { t: "Musa Magnética", i: "✨", d: "Presencia y elocuencia fascinantes capaces de mover y convencer a cualquiera." }, 
            min: { t: "Sombra Aislada", i: "👤", d: "Tendencia a pasar desapercibido, recluirte o chocar socialmente." } 
        }
    ];

    // Ordenar por magnitud absoluta del valor (para evaluar el extremo más prominente)
    mapaAtributos.sort((a, b) => Math.abs(b.val) - Math.abs(a.val));
    const dominante = mapaAtributos[0];

    if (dominante.val >= 12) {
        return {
            titulo: dominante.max.t,
            icono: dominante.max.i,
            descripcion: dominante.max.d,
            claseCSS: "estado-extremo-alto"
        };
    }

    if (dominante.val <= -10) {
        return {
            titulo: dominante.min.t,
            icono: dominante.min.i,
            descripcion: dominante.min.d,
            claseCSS: "estado-extremo-bajo"
        };
    }

    // ==========================================
    // 3. ESTADO EQUILIBRADO
    // ==========================================
    return {
        titulo: "Aventurero Equilibrado",
        icono: "⚔️",
        descripcion: "Tus atributos se mantienen en armonía. Balanceas mente, emoción y fortaleza sin extremos dominantes.",
        claseCSS: "estado-equilibrado"
    };
}