
export const BANCO_HUELLAS = {
    fantasia: {
        rasgos: [
            { id: "worldbuilding_mental", nombre: "Pensamiento Cósmico", icono: "🌌", desc: "Capacidad para conceptualizar sistemas complejos, mitologías y reglas internas.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "imaginacion_epica", nombre: "Visión Épica", icono: "⚔️", desc: "Facilidad para proyectar escenarios a gran escala y metas trascendentales.", modificadores: { carisma: 2, fuerza: 1 } },
            { id: "reconocimiento_arquetipos", nombre: "Comprensión Arquetípica", icono: "👑", desc: "Habilidad para identificar roles, patrones morales y arcos de viaje en las personas.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "pensamiento_magico", nombre: "Asombro Activo", icono: "✨", desc: "Disposición a encontrar maravilla y misterio en lo cotidiano.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "simbolismo_mitico", nombre: "Intuición Mítica", icono: "🐉", desc: "Decodificación natural de símbolos, leyendas y alegorías históricas.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "moral_heroica", nombre: "Criterio Heroico", icono: "🛡️", desc: "Inclinación por mantener ideales de honor, lealtad y rectitud frente a la adversidad.", modificadores: { constitucion: 2, carisma: 1 } },
            { id: "flexibilidad_ontologica", nombre: "Mente Maleable", icono: "🌀", desc: "Facilidad para asimilar reglas de existencia totalmente distintas a las reales.", modificadores: { inteligencia: 2, destreza: 1 } },
            { id: "empatia_especie", nombre: "Empatía Universal", icono: "🌿", desc: "Capacidad para conectar con perspectivas verdaderamente ajenas o no humanas.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "estrategia_narrativa", nombre: "Estrategia Mítica", icono: "♟️", desc: "Anticipación de giros y profecías basadas en el comportamiento de los acontecimientos.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "resiliencia_leyenda", nombre: "Voluntad Inquebrantable", icono: "🔥", desc: "Convicción de que los obstáculos insuperables pueden vencerse con perseverancia.", modificadores: { constitucion: 2, fuerza: 1 } }
        ],
        cicatrices: [
            { id: "evasion_fantastica", nombre: "Evasionismo", icono: "🏰", desc: "Tendencia a retirarte a mundos imaginarios cuando la realidad se vuelve gris.", modificadores: { sabiduria: -2, constitucion: -1 } },
            { id: "nostalgia_por_lo_inexistente", nombre: "Anhelo Irreal", icono: "🌙", desc: "Sentimiento de añoranza por lugares, épocas o reinos que nunca existieron.", modificadores: { carisma: -1, destreza: -1 } },
            { id: "maniqueismo_moral", nombre: "Dualismo Rígido", icono: "☯️", desc: "Dificultad para procesar la amoralidad o los grises éticos del mundo real.", modificadores: { sabiduria: -2, inteligencia: -1 } },
            { id: "espera_de_destino", nombre: "Parálisis del Elegido", icono: "⏳", desc: "Sensación de estar esperando una llamada trascendental mientras descuidas lo cotidiano.", modificadores: { fuerza: -1, constitucion: -2 } },
            { id: "desconexión_prosaica", nombre: "Rechazo a lo Mundano", icono: "🌪️", desc: "Frustración o desinterés ante las tareas rutinarias y burocráticas.", modificadores: { carisma: -2, destreza: -1 } }
        ]
    },

    poesia: {
        rasgos: [
            { id: "sensibilidad_linguistica", nombre: "Sensibilidad Lingüística", icono: "✍️", desc: "Aprecio agudo por el ritmo, la métrica y las sutilezas del lenguaje.", modificadores: { carisma: 2, inteligencia: 1 } },
            { id: "inteligencia_emocional", nombre: "Inteligencia Emocional", icono: "🖤", desc: "Capacidad para descifrar estados de ánimo complejos y matices no verbales.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "pensamiento_metaforico", nombre: "Pensamiento Metafórico", icono: "🌙", desc: "Facilidad para trazar analogías entre conceptos abstractos y la realidad.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "sintesis_expresiva", nombre: "Síntesis Expresiva", icono: "✒️", desc: "Habilidad para transmitir grandes ideas utilizando las palabras precisas.", modificadores: { carisma: 2, inteligencia: 1 } },
            { id: "atencion_estetica", nombre: "Atención Estética", icono: "🎨", desc: "Capacidad para encontrar valor poético y belleza en detalles cotidianos.", modificadores: { sabiduria: 1, destreza: 1 } },
            { id: "escucha_profunda", nombre: "Escucha Empática", icono: "🕊️", desc: "Receptividad aumentada ante la vulnerabilidad y el discurso ajeno.", modificadores: { carisma: 2, sabiduria: 1 } },
            { id: "riqueza_lexica", nombre: "Vocabulario Evocador", icono: "📖", desc: "Dominio de términos connotativos y precisión verbal al expresarte.", modificadores: { inteligencia: 2, carisma: 1 } },
            { id: "intuicion_simbolica", nombre: "Intuición Simbólica", icono: "🔮", desc: "Habilidad para interpretar alegorías e imágenes en la cultura y el arte.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "paciencia_contemplativa", nombre: "Paciencia Contemplativa", icono: "⏳", desc: "Tolerancia a la pausa y a la observación pausada del entorno.", modificadores: { constitucion: 1, sabiduria: 2 } },
            { id: "resonancia_humana", nombre: "Resonancia Humana", icono: "🕯️", desc: "Comprensión intuitiva del sufrimiento y la alegría universal.", modificadores: { sabiduria: 2, carisma: 1 } }
        ],
        cicatrices: [
            { id: "melancolia_reflexiva", nombre: "Tendencia Melancólica", icono: "🌧️", desc: "Propensión a la nostalgia injustificada por momentos e ideas del pasado.", modificadores: { fuerza: -1, constitucion: -2 } },
            { id: "vulnerabilidad_expuesta", nombre: "Sensibilidad Aumentada", icono: "🥀", desc: "Mayor susceptibilidad a la rudeza, la prisa o el cinismo del entorno.", modificadores: { constitucion: -2, carisma: -1 } },
            { id: "idealismo_inviable", nombre: "Idealismo Estético", icono: "🫧", desc: "Frustración recurrente cuando la realidad prosaica rompe tus expectativas.", modificadores: { sabiduria: -2, destreza: -1 } },
            { id: "introversion_severa", nombre: "Refugio Interior", icono: "🗝️", desc: "Tendencia a aislarte en tus propios pensamientos ante la saturación social.", modificadores: { carisma: -2, fuerza: -1 } },
            { id: "sobrepensamiento_afectivo", nombre: "Sobreanálisis Emocional", icono: "🕸️", desc: "Dificultad para vivir las relaciones sin desarmar intelectualmente cada gesto.", modificadores: { sabiduria: -1, constitucion: -1 } }
        ]
    },

    terror: {
        rasgos: [
            { id: "tolerancia_tension", nombre: "Tolerancia al Estrés", icono: "🧠", desc: "Serenidad y temple ante situaciones impredecibles o de alta presión.", modificadores: { constitucion: 2, sabiduria: 1 } },
            { id: "atencion_detalles", nombre: "Observación Aguda", icono: "🔍", desc: "Capacidad para detectar incoherencias o pequeños peligros en tu entorno.", modificadores: { destreza: 2, sabiduria: 1 } },
            { id: "imaginacion_sin_limites", nombre: "Apertura a lo Inusitado", icono: "👁️", desc: "Mente dispuesta a considerar hipótesis poco convencionales.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "desmitificacion_miedo", nombre: "Análisis del Miedo", icono: "🛡️", desc: "Comprensión de los mecanismos psicológicos de las fobias y la histeria.", modificadores: { inteligencia: 2, constitucion: 1 } },
            { id: "discernimiento_amenazas", nombre: "Evaluación de Riesgos", icono: "⚖️", desc: "Habilidad para distinguir amenazas reales de sugestiones infundadas.", modificadores: { sabiduria: 2, destreza: 1 } },
            { id: "resiliencia_psicologica", nombre: "Resiliencia Mental", icono: "🧱", desc: "Capacidad para asimilar narrativa impactante sin desestabilizarte.", modificadores: { constitucion: 2, fuerza: 1 } },
            { id: "foco_bajo_presion", nombre: "Foco Mantenido", icono: "🎯", desc: "Capacidad para concentrarte aun en entornos hostiles o incómodos.", modificadores: { destreza: 1, inteligencia: 2 } },
            { id: "empatia_oscura", nombre: "Comprensión de las Sombras", icono: "♟️", desc: "Entendimiento de las motivaciones perversas o desesperadas del ser humano.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "control_impulso", nombre: "Autorregulación Emocional", icono: "⚓", desc: "Freno consciente a las reacciones de pánico ante lo desconocido.", modificadores: { constitucion: 2, sabiduria: 1 } },
            { id: "catarsis_narrativa", nombre: "Procesamiento Catártico", icono: "🌊", desc: "Facilidad para canalizar inquietudes reales a través del análisis de la ficción.", modificadores: { inteligencia: 1, carisma: 2 } }
        ],
        cicatrices: [
            { id: "hipervigilancia", nombre: "Hipervigilancia Alerta", icono: "👀", desc: "Inquietud inconsciente al apagar las luces o ante ruidos inesperados.", modificadores: { constitucion: -2, destreza: 1 } },
            { id: "escepticismo_entorno", nombre: "Desconfianza Ambiental", icono: "🚪", desc: "Tendencia a revisar cerrojos y evaluar salidas al entrar a un lugar nuevo.", modificadores: { carisma: -2, sabiduria: -1 } },
            { id: "sugestion_nocturna", nombre: "Sugestión Nocturna", icono: "🕷️", desc: "Dificultad ocasional para conciliar el sueño tras lecturas densas.", modificadores: { constitucion: -2, fuerza: -1 } },
            { id: "pesimismo_psicologico", nombre: "Visión Sombría", icono: "🌫️", desc: "Inclinación a asumir los peores escenarios en decisiones de incertidumbre.", modificadores: { carisma: -2, sabiduria: -1 } },
            { id: "desgaste_empatia", nombre: "Cansancio de la Alarma", icono: "🕯️", desc: "Sensación de fatiga mental producto de la tensión sostenida.", modificadores: { fuerza: -1, constitucion: -2 } }
        ]
    },

    historica: {
        rasgos: [
            { id: "pensamiento_critico", nombre: "Pensamiento Crítico", icono: "🏛️", desc: "Capacidad para contrastar versiones y detectar sesgos en discursos actuales.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "perspectiva_temporal", nombre: "Perspectiva Temporal", icono: "⏳", desc: "Entendimiento de que los problemas del presente son parte de ciclos largos.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "bagaje_sociocultural", nombre: "Cultura General", icono: "📚", desc: "Dominio de contextos geopolíticos, acontecimientos y transformaciones humanas.", modificadores: { inteligencia: 2, carisma: 1 } },
            { id: "analisis_causal", nombre: "Análisis de Causa y Efecto", icono: "⚙️", desc: "Habilidad para rastrear el origen distante de situaciones complejas.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "rigor_documental", nombre: "Exigencia de Fuentes", icono: "📜", desc: "Inclinación a verificar datos antes de dar por cierta una afirmación.", modificadores: { inteligencia: 2, destreza: 1 } },
            { id: "comprensión_geopolitica", nombre: "Visión Sistémica", icono: "🌐", desc: "Habilidad para conectar decisiones de gobernantes con impacto en la población.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "empatia_anacronica", nombre: "Contextualización Cultural", icono: "🕯️", desc: "Capacidad para juzgar sucesos pasados bajo sus propias reglas morales.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "memoria_estructurada", nombre: "Memoria de Hechos", icono: "🗂️", desc: "Facilidad para estructurar cronológicamente datos y grandes periodos de tiempo.", modificadores: { inteligencia: 3 } },
            { id: "desmitificacion_presente", nombre: "Objetividad Histórica", icono: "⚖️", desc: "Reconocimiento de que la sociedad actual no es el pináculo de la civilización.", modificadores: { sabiduria: 2, constitucion: 1 } },
            { id: "oratoria_argumentada", nombre: "Argumentación Fundada", icono: "🎙️", desc: "Habilidad para sostener opiniones basadas en precedentes concretos.", modificadores: { carisma: 2, inteligencia: 1 } }
        ],
        cicatrices: [
            { id: "cinismo_historico", nombre: "Cinismo de la Era", icono: "🥀", desc: "Apatía hacia las grandes promesas políticas al ver repetir los mismos errores.", modificadores: { carisma: -2, sabiduria: -1 } },
            { id: "incredulidad_progreso", nombre: "Escéptico del Progreso", icono: "🔄", desc: "Duda constante sobre si la humanidad evoluciona moralmente con el tiempo.", modificadores: { sabiduria: -2, carisma: -1 } },
            { id: "fatalismo_social", nombre: "Fatalismo Social", icono: "📉", desc: "Resignación ante la caída o decadencia inevitable de instituciones y sistemas.", modificadores: { fuerza: -1, constitucion: -2 } },
            { id: "sensacion_impotencia", nombre: "Impotencia del Espectador", icono: "⛓️", desc: "Sensación de frustración al observar fallos sociales predichos por la historia.", modificadores: { constitucion: -2, carisma: -1 } },
            { id: "saturacion_datos", nombre: "Parálisis por Análisis", icono: "🌫️", desc: "Dificultad para tomar postura rápida ante la enorme complejidad de variables.", modificadores: { destreza: -2, inteligencia: -1 } }
        ]
    },

    filosofia: {
        rasgos: [
            { id: "rigor_argumentativo", nombre: "Lógica Argumentativa", icono: "⚖️", desc: "Destreza para identificar falacias lógicas en debates o textos.", modificadores: { inteligencia: 2, carisma: 1 } },
            { id: "desapego_dogmatico", nombre: "Flexibilidad Mental", icono: "🧩", desc: "Disposición para cuestionar las propias convicciones ante argumentos sólidos.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "abstraccion_conceptual", nombre: "Abstracción Teórica", icono: "🌌", desc: "Facilidad para manejar conceptos ontológicos, éticos y epistemológicos.", modificadores: { inteligencia: 3 } },
            { id: "cuestionamiento_etico", nombre: "Criterio Ético", icono: "🧭", desc: "Marco moral reflexivo aplicable a dilemas prácticos del día a día.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "autonomia_pensamiento", nombre: "Criterio Propio", icono: "💡", desc: "Resistencia a la presión de grupo y a los dogmas de moda.", modificadores: { constitucion: 1, sabiduria: 2 } },
            { id: "tolerancia_ambiguedad", nombre: "Tolerancia a la Incertidumbre", icono: "🌫️", desc: "Comodidad conviviendo con preguntas que no poseen respuestas definitivas.", modificadores: { sabiduria: 2, constitucion: 1 } },
            { id: "claridad_conceptual", nombre: "Precisión Conceptual", icono: "🔍", desc: "Habilidad para definir términos con exactitud antes de discutir sobre ellos.", modificadores: { inteligencia: 2, carisma: 1 } },
            { id: "analisis_premisas", nombre: "Desmontaje de Premisas", icono: "🧱", desc: "Habilidad para ir a la base oculta sobre la que se sostiene una afirmación.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "metacognicion", nombre: "Metacognición", icono: "🪞", desc: "Capacidad para reflexionar sobre tus propios procesos de pensamiento.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "discernimiento_valores", nombre: "Jerarquía de Valores", icono: "💎", desc: "Claridad respecto a qué principios priorizar en situaciones complejas.", modificadores: { sabiduria: 2, carisma: 1 } }
        ],
        cicatrices: [
            { id: "crisis_existencial", nombre: "Duda Existencial", icono: "❓", desc: "Cuestionamiento constante del propósito, el sentido y el libre albedrío.", modificadores: { sabiduria: -2, constitucion: -1 } },
            { id: "alienacion_prosaica", nombre: "Desconexión Cotidiana", icono: "🪨", desc: "Sensación de aburrimiento frente a las conversaciones triviales del día a día.", modificadores: { carisma: -2, destreza: -1 } },
            { id: "solipsismo_inquietante", nombre: "Aislamiento Intelectual", icono: "🏝️", desc: "Sensación de que es complejo compartir tu marco mental con tu entorno.", modificadores: { carisma: -3 } },
            { id: "paralisis_decision", nombre: "Parálisis Reflexiva", icono: "⏸️", desc: "Dificultad para actuar al ver demasiados ángulos y matices en cada decisión.", modificadores: { destreza: -2, fuerza: -1 } },
            { id: "desilusión_absolutos", nombre: "Pérdida de Absolutos", icono: "🏜️", desc: "Incomodidad por no poder apoyarte en certezas simples o verdades cerradas.", modificadores: { constitucion: -2, sabiduria: -1 } }
        ]
    },

    ciencia_ficcion: {
        rasgos: [
            { id: "vision_prospectiva", nombre: "Pensamiento Prospectivo", icono: "🚀", desc: "Capacidad para anticipar consecuencias sociales derivadas de la tecnología.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "pensamiento_sistemico", nombre: "Comprensión Tecnológica", icono: "💻", desc: "Inteligencia para adaptar conceptos éticos al avance científico.", modificadores: { inteligencia: 2, destreza: 1 } },
            { id: "flexibilidad_paradigma", nombre: "Apertura de Paradigma", icono: "🪐", desc: "Mente dispuesta a asimilar normas, ecologías y modelos de vida alternativos.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "imaginacion_estructurada", nombre: "Diseño Especulativo", icono: "📐", desc: "Habilidad para construir escenarios hipotéticos con coherencia interna.", modificadores: { inteligencia: 3 } },
            { id: "ecologia_global", nombre: "Conciencia Planetaria", icono: "🌍", desc: "Comprensión de la fragilidad del hábitat humano a escala cósmica.", modificadores: { sabiduria: 2, constitucion: 1 } },
            { id: "adaptabilidad_cambio", nombre: "Adaptabilidad al Cambio", icono: "⚡", desc: "Menor resistencia cognitiva ante innovaciones radicales.", modificadores: { destreza: 2, inteligencia: 1 } },
            { id: "analisis_socio_tecnico", nombre: "Criterio Tecnocrático", icono: "📡", desc: "Capacidad para analizar cómo la técnica transforma el comportamiento humano.", modificadores: { inteligencia: 2, carisma: 1 } },
            { id: "curiosidad_cientifica", nombre: "Curiosidad Científica", icono: "🔬", desc: "Interés por disciplinas como la física, la astronomía o la biotecnología.", modificadores: { inteligencia: 3 } },
            { id: "desapego_antropocentrico", nombre: "Perspectiva Cósmica", icono: "✨", desc: "Humildad intelectual al dimensionar el papel humano en el universo.", modificadores: { sabiduria: 2, constitucion: 1 } },
            { id: "resolución_de_problemas", nombre: "Criterio Técnico", icono: "🛠️", desc: "Enfoque metodológico para desglosar problemas complejos en partes.", modificadores: { inteligencia: 2, fuerza: 1 } }
        ],
        cicatrices: [
            { id: "distopia_anticipada", nombre: "Ansiedad Prospectiva", icono: "🤖", desc: "Preocupación constante por los riesgos éticos de la inteligencia y el control.", modificadores: { constitucion: -2, sabiduria: -1 } },
            { id: "insignificancia_cosmica", nombre: "Sensación de Pequeñez", icono: "🌌", desc: "Vértigo al considerar las escalas de tiempo y espacio en el cosmos.", modificadores: { fuerza: -1, carisma: -2 } },
            { id: "deshumanizacion_critica", nombre: "Apatía por lo Artificial", icono: "🔌", desc: "Incomodidad o recelo ante la mediación digital en las relaciones humanas.", modificadores: { carisma: -2, sabiduria: -1 } },
            { id: "anhelo_futurista", nombre: "Impaciencia Temporal", icono: "⌛", desc: "Frustración con las limitaciones técnicas y sociales del presente.", modificadores: { destreza: -1, constitucion: -2 } },
            { id: "furia_ecologica", nombre: "Ecoansiedad", icono: "🥀", desc: "Preocupación profunda por el destino del planeta y sus recursos.", modificadores: { constitucion: -2, sabiduria: -1 } }
        ]
    },

    novela_negra: {
        rasgos: [
            { id: "deduccion_logica", nombre: "Razonamiento Deductivo", icono: "🕵️", desc: "Inferencia ágil de intenciones o verdades implícitas a partir de pistas.", modificadores: { inteligencia: 2, destreza: 1 } },
            { id: "psicologia_criminal", nombre: "Perspicacia Psicológica", icono: "🚬", desc: "Entendimiento de las debilidades humanas, la codicia y el engaño.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "atencion_incoherencias", nombre: "Detección de Incoherencias", icono: "🧩", desc: "Capacidad para notar detalles que no cuadran en una versión dada.", modificadores: { destreza: 2, inteligencia: 1 } },
            { id: "paciencia_investigadora", nombre: "Persistencia Metódica", icono: "📁", desc: "Habilidad para recolectar información sistemáticamente antes de concluir.", modificadores: { constitucion: 1, inteligencia: 2 } },
            { id: "sangre_fria", nombre: "Imparcialidad Analítica", icono: "❄️", desc: "Capacidad para evaluar hechos perturbadores sin sesgos emocionales.", modificadores: { constitucion: 2, sabiduria: 1 } },
            { id: "lectura_microexpresiones", nombre: "Observación Conductual", icono: "👁️", desc: "Atención a gestos y contradicciones en el comportamiento de las personas.", modificadores: { sabiduria: 2, destreza: 1 } },
            { id: "navegacion_sombra", nombre: "Pragmatismo Social", icono: "🌆", desc: "Comprensión de los mecanismos menos éticos que mueven ciertas instituciones.", modificadores: { carisma: 2, inteligencia: 1 } },
            { id: "prudencia_comunicativa", nombre: "Reserva Verbal", icono: "🤐", desc: "Saber qué información compartir y cuál mantener en reserva.", modificadores: { sabiduria: 2, destreza: 1 } },
            { id: "evaluacion_motivaciones", nombre: "Análisis de Intereses", icono: "💰", desc: "Habilidad para preguntarse siempre cuál es el beneficio oculto tras una acción.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "resiliencia_urbana", nombre: "Callejero Intelectual", icono: "🌧️", desc: "Familiaridad con la complejidad social sin idealizar la naturaleza humana.", modificadores: { constitucion: 2, fuerza: 1 } }
        ],
        cicatrices: [
            { id: "escepticismo_interpersonal", nombre: "Escepticismo Social", icono: "🔒", desc: "Tendencia a dudar de las intenciones altruistas de desconocidos.", modificadores: { carisma: -2, sabiduria: -1 } },
            { id: "mirada_suspicaz", nombre: "Sospecha Sistemática", icono: "🕵️‍♂️", desc: "Evaluar espontáneamente las segundas intenciones de la gente.", modificadores: { carisma: -2, destreza: 1 } },
            { id: "desilusion_moral", nombre: "Desilusión Institucional", icono: "🏛️", desc: "Certeza de que la justicia perfecta no existe en los sistemas humanos.", modificadores: { sabiduria: -2, constitucion: -1 } },
            { id: "distanciamiento_afectivo", nombre: "Frialdad Defensiva", icono: "🛡️", desc: "Escudo emocional para no involucrarte fácilmente en conflictos ajenos.", modificadores: { carisma: -3 } },
            { id: "peticion_de_pruebas", nombre: "Obsesión por la Evidencia", icono: "📄", desc: "Incapacidad para aceptar promesas o afirmaciones sin pruebas tangibles.", modificadores: { carisma: -2, inteligencia: 1 } }
        ]
    },

    ensayo: {
        rasgos: [
            { id: "estructuracion_ideas", nombre: "Estructuración de Pensamiento", icono: "📐", desc: "Capacidad para organizar argumentos de forma clara, ordenada y convincente.", modificadores: { inteligencia: 3 } },
            { id: "curiosidad_transversal", nombre: "Interdisciplinar", icono: "🔄", desc: "Habilidad para conectar datos de sociología, economía, arte y ciencia.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "pensamiento_sintetico", nombre: "Capacidad de Síntesis", icono: "✍️", desc: "Facilidad para condensar textos complejos en sus tesis principales.", modificadores: { inteligencia: 2, carisma: 1 } },
            { id: "exigencia_de_fuentes", nombre: "Rigor Metodológico", icono: "📚", desc: "Búsqueda activa de autores, referencias y bibliografía verificable.", modificadores: { inteligencia: 2, destreza: 1 } },
            { id: "claridad_expositiva", nombre: "Pedagogía Verbal", icono: "🎙️", desc: "Habilidad para explicar conceptos densos a cualquier tipo de audiencia.", modificadores: { carisma: 2, inteligencia: 1 } },
            { id: "analisis_de_discurso", nombre: "Análisis de Discurso", icono: "📢", desc: "Capacidad para desarmar la retórica y la propaganda mediática.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "apertura_intelectual", nombre: "Curiosidad Multidisciplinar", icono: "🌐", desc: "Interés permanente por explorar áreas fuera de tu zona de confort.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "foco_conceptual", nombre: "Foco en la Tesis", icono: "🎯", desc: "Facilidad para no perder el hilo conductor en discusiones complejas.", modificadores: { inteligencia: 2, constitucion: 1 } },
            { id: "cuestionamiento_normalidad", nombre: "Problematización de lo Cotidiano", icono: "❓", desc: "Atención a normas culturales aceptadas sin justificación aparente.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "asimilacion_densidad", nombre: "Resistencia a la Densidad", icono: "📖", desc: "Tolerancia para leer textos complejos sin perder la concentración.", modificadores: { constitucion: 2, inteligencia: 1 } }
        ],
        cicatrices: [
            { id: "intelectualizacion_excesiva", nombre: "Intelectualización Excesiva", icono: "🧠", desc: "Dificultad para experimentar emociones o vivencias sin teorizar sobre ellas.", modificadores: { sabiduria: -2, carisma: -1 } },
            { id: "pedanteria_involuntaria", nombre: "Distancia Pedagógica", icono: "🗣️", desc: "Tendencia involuntaria a corregir imprecisiones en conversaciones informales.", modificadores: { carisma: -3 } },
            { id: "fatiga_de_información", nombre: "Infotoxicidad", icono: "📥", desc: "Sensación de abrumamiento por la cantidad de lecturas pendientes.", modificadores: { constitucion: -2, destreza: -1 } },
            { id: "hipercritica_creativa", nombre: "Perfeccionismo Crítico", icono: "✂️", desc: "Dificultad para disfrutar de obras sencillas sin señalar sus fallos conceptuales.", modificadores: { carisma: -2, sabiduria: -1 } },
            { id: "soledad_debate", nombre: "Aislamiento de Debate", icono: "💬", desc: "Frustración por no encontrar interlocutores con tu misma profundidad de análisis.", modificadores: { carisma: -2, constitucion: -1 } }
        ]
    },

    biografia: {
        rasgos: [
            { id: "empatia_vital", nombre: "Comprensión de Trayectorias", icono: "👤", desc: "Entendimiento de que las decisiones humanas se explican por toda una vida.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "realismo_humano", nombre: "Desmitificación del Éxito", icono: "🎖️", desc: "Reconocimiento de que las grandes figuras tuvieron contradicciones y fallos.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "aprendizaje_experiencia", nombre: "Aprendizaje Vicario", icono: "💡", desc: "Capacidad para extraer lecciones prácticas del triunfo o error ajeno.", modificadores: { inteligencia: 2, sabiduria: 1 } },
            { id: "humildad_historica", nombre: "Humildad de Vida", icono: "🌱", desc: "Conciencia de las limitaciones biológicas, de época y de salud en cualquier meta.", modificadores: { constitucion: 1, sabiduria: 2 } },
            { id: "resiliencia_biografica", nombre: "Perspectiva de Crisis", icono: "🌦️", desc: "Comprensión de que los momentos oscuros suelen ser etapas transitivas.", modificadores: { constitucion: 2, fuerza: 1 } },
            { id: "valoracion_contexto", nombre: "Atención al Contexto", icono: "🏡", desc: "Reconocimiento de la importancia del entorno en el desarrollo del talento.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "discernimiento_legado", nombre: "Pensamiento de Legado", icono: "🪵", desc: "Reflexión sobre qué huella personal o profesional deseas construir a largo plazo.", modificadores: { carisma: 2, sabiduria: 1 } },
            { id: "paciencia_procesos", nombre: "Tolerancia a los Tiempos", icono: "⏳", desc: "Comprensión de que los grandes logros requieren décadas de trabajo.", modificadores: { constitucion: 2, sabiduria: 1 } },
            { id: "analisis_caracter", nombre: "Evaluación de Carácter", icono: "👥", desc: "Habilidad para evaluar fortalezas y sesgos de personalidad en otros.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "superacion_adversidad", nombre: "Inspiración Práctica", icono: "⛰️", desc: "Adopción de hábitos y enfoques que sirvieron a otras personas en crisis.", modificadores: { fuerza: 2, constitucion: 1 } }
        ],
        cicatrices: [
            { id: "comparacion_inadecuada", nombre: "Comparación Paralizante", icono: "📏", desc: "Incomodidad al medir tus logros personales contra las grandes vidas leídas.", modificadores: { carisma: -2, fuerza: -1 } },
            { id: "mitificacion_involuntaria", nombre: "Nostalgia de Grandes Figuras", icono: "🗿", desc: "Sensación de que el presente carece de personalidades de la altura del pasado.", modificadores: { sabiduria: -2, carisma: -1 } },
            { id: "presion_por_el_tiempo", nombre: "Urgencia Biográfica", icono: "⏱️", desc: "Ansiedad por el paso del tiempo y la cantidad de metas aún no alcanzadas.", modificadores: { constitucion: -2, destreza: -1 } },
            { id: "voyeurismo_existencial", nombre: "Voyeurismo Existencial", icono: "🪟", desc: "Preferencia por analizar las vidas ajenas en lugar de tomar riesgos en la propia.", modificadores: { fuerza: -2, destreza: -1 } },
            { id: "desilusión_idolos", nombre: "Pérdida de Mitos", icono: "💔", desc: "Decepción al descubrir las fallas éticas de figuras que admirabas.", modificadores: { sabiduria: -2, carisma: -1 } }
        ]
    },

    romance: {
        rasgos: [
            { id: "inteligencia_relacional", nombre: "Inteligencia Relacional", icono: "❤️", desc: "Mayor comprensión de la comunicación, los límites y las dinámicas de pareja.", modificadores: { carisma: 2, sabiduria: 1 } },
            { id: "empatia_vinculativa", nombre: "Sensibilidad Afectiva", icono: "🤝", desc: "Habilidad para validar los sentimientos y las vulnerabilidades ajenas.", modificadores: { carisma: 2, sabiduria: 1 } },
            { id: "expresion_emocional", nombre: "Elocuencia Afectiva", icono: "💌", desc: "Facilidad para verbalizar lo que sientes de forma clara y sin vergüenza.", modificadores: { carisma: 3 } },
            { id: "autoconocimiento_deseos", nombre: "Claridad de Necesidades", icono: "🪞", desc: "Reconocimiento de tus propios estándares y necesidades afectivas.", modificadores: { sabiduria: 2, constitucion: 1 } },
            { id: "gestion_conflictos", nombre: "Resolución de Fricciones", icono: "🕊️", desc: "Habilidad para abordar desacuerdos personales desde la comprensión.", modificadores: { carisma: 2, sabiduria: 1 } },
            { id: "generosidad_afectiva", nombre: "Disposición al Cuidado", icono: "🌸", desc: "Inclinación a realizar gestos significativos por las personas que valoras.", modificadores: { carisma: 2, constitucion: 1 } },
            { id: "tolerancia_vulnerabilidad", nombre: "Valentía Afectiva", icono: "🔓", desc: "Disposición a correr el riesgo de abrirte emocionalmente a otros.", modificadores: { constitucion: 2, carisma: 1 } },
            { id: "atencion_detalles_humanos", nombre: "Memoria Afectiva", icono: "🎁", desc: "Recordar gustos, fechas y detalles importantes de tus allegados.", modificadores: { inteligencia: 1, carisma: 2 } },
            { id: "revalorizacion_intimidad", nombre: "Aprecio de la Intimidad", icono: "🕯️", desc: "Priorización de la conexión profunda por encima de interacciones superficiales.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "optimo_relacional", nombre: "Esperanza Vinculante", icono: "✨", desc: "Fe en la capacidad humana para reparar vínculos y construir entendimiento.", modificadores: { carisma: 2, constitucion: 1 } }
        ],
        cicatrices: [
            { id: "expectativa_irreal", nombre: "Expectativas Románticas", icono: "🫧", desc: "Dificultad para aceptar la rutina y la imperfección en las relaciones reales.", modificadores: { sabiduria: -2, carisma: -1 } },
            { id: "vulnerabilidad_dolorosa", nombre: "Temor al Desamor", icono: "💔", desc: "Aumento de la aprensión ante el rechazo o la distancia de personas queridas.", modificadores: { constitucion: -2, fuerza: -1 } },
            { id: "sobreanalisis_gestos", nombre: "Sobreinterpretación Afectiva", icono: "🕸️", desc: "Buscar significados ocultos en cambios mínimos de tono o comunicación.", modificadores: { sabiduria: -1, inteligencia: -1 } },
            { id: "añoranza_intensidad", nombre: "Adicción a la Intensidad", icono: "🔥", desc: "Aburrimiento ante vínculos estables pero poco dramáticos.", modificadores: { constitucion: -2, sabiduria: -1 } },
            { id: "idealización_ajena", nombre: "Proyección Ideada", icono: "🎭", desc: "Atribuir virtudes ficticias a personas reales basándote en modelos de ficción.", modificadores: { sabiduria: -2, inteligencia: -1 } }
        ]
    },

    clasicos: {
        rasgos: [
            { id: "universalidad_humana", nombre: "Comprensión Universal", icono: "🏛️", desc: "Entendimiento de las pasiones y dilemas eternos de la condición humana.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "resistencia_lectora", nombre: "Atención Sostenida", icono: "📖", desc: "Capacidad para mantener el foco en prosas complejas y estructuras lentas.", modificadores: { constitucion: 2, inteligencia: 1 } },
            { id: "riqueza_estilistica", nombre: "Dominio del Lenguaje", icono: "✒️", desc: "Asimilación de estructuras sintácticas elegantes y vocabulario rico.", modificadores: { carisma: 2, inteligencia: 1 } },
            { id: "criterio_temporal", nombre: "Criterio de Permanencia", icono: "⏳", desc: "Habilidad para discernir entre modas pasajeras y valor duradero.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "empatia_epocas", nombre: "Atemporalidad Intelectual", icono: "🌍", desc: "Facilidad para conectar con mentes que vivieron en siglos o culturas lejanas.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "sensibilidad_dramatica", nombre: "Análisis de la Tragedia", icono: "🎭", desc: "Comprensión de los errores trágicos y las fallas de carácter inevitables.", modificadores: { sabiduria: 2, carisma: 1 } },
            { id: "profundidad_psicologica", nombre: "Observación de la Naturaleza Humana", icono: "👁️", desc: "Lectura profunda de la ambición, la culpa y la virtud.", modificadores: { sabiduria: 2, inteligencia: 1 } },
            { id: "autonomia_estetica", nombre: "Gusto Formado", icono: "🍷", desc: "Criterio propio e independiente frente a las tendencias comerciales.", modificadores: { sabiduria: 2, constitucion: 1 } },
            { id: "paciencia_narrativa", nombre: "Tolerancia al Ritmo Lento", icono: "🕯️", desc: "Aprecio por el desarrollo pausado de arcos y descripciones.", modificadores: { constitucion: 2, sabiduria: 1 } },
            { id: "asentamiento_cultural", nombre: "Apertura a la Tradición", icono: "📜", desc: "Conciencia de las raíces literarias sobre las que se apoya la cultura actual.", modificadores: { inteligencia: 2, sabiduria: 1 } }
        ],
        cicatrices: [
            { id: "elitismo_involuntario", nombre: "Esnobismo Estético", icono: "🏰", desc: "Tendencia involuntaria a desestimar obras contemporáneas o populares.", modificadores: { carisma: -2, sabiduria: -1 } },
            { id: "cansancio_arcaico", nombre: "Fatiga Estilística", icono: "⌛", desc: "Sensación de saturación frente a prosas densas o construcciones obsoletas.", modificadores: { constitucion: -2, destreza: -1 } },
            { id: "distancia_contemporanea", nombre: "Desconexión del Presente", icono: "🪟", desc: "Dificultad para encontrar la misma calidad en la literatura de hoy.", modificadores: { carisma: -2, sabiduria: -1 } },
            { id: "peso_tradicion", nombre: "Inhibición Creativa", icono: "🗿", desc: "Sentimiento de que todo lo genial ya ha sido dicho por mentes del pasado.", modificadores: { fuerza: -1, constitucion: -2 } },
            { id: "rigidez_criterio", nombre: "Exigencia Inflexible", icono: "📐", desc: "Poco margen de tolerancia ante errores de forma o falta de profundidad.", modificadores: { carisma: -2, inteligencia: -1 } }
        ]
    },

    ficcion: {
    rasgos: [
        { id: "empatia_narrativa", nombre: "Empatía Narrativa", icono: "🎭", desc: "Comprendes mejor las emociones y motivos de las personas a tu alrededor.", modificadores: { carisma: 1 } },
        { id: "pensamiento_simbolico", nombre: "Pensamiento Simbólico", icono: "🔮", desc: "Ves metáforas y significados profundos en acontecimientos cotidianos.", modificadores: { sabiduria: 1 } },
        { id: "creador_escenarios", nombre: "Creador de Escenarios", icono: "🎬", desc: "Tu mente anticipa múltiples formas en que puede desarrollarse una situación.", modificadores: { inteligencia: 1 } },
        { id: "intuicion_dramatica", nombre: "Intuición Dramática", icono: "⚡", desc: "Detectas tensiones subyacentes e intenciones ocultas en una conversación.", modificadores: { sabiduria: 1 } },
        { id: "camaleon_social", nombre: "Camaleón Social", icono: "🦎", desc: "Te adaptas con facilidad a distintos ambientes y grupos de personas.", modificadores: { carisma: 1 } },
        { id: "resiliencia_heroica", nombre: "Resiliencia Heroica", icono: "🛡️", desc: "Encuentras motivación interna para seguir adelante tras un contratiempo.", modificadores: { constitucion: 1 } },
        { id: "meticuloso_trama", nombre: "Ojo para la Trama", icono: "🧩", desc: "Encuentras coherencia y patrones en situaciones caóticas.", modificadores: { destreza: 1 } },
        { id: "espiritu_aventurero", nombre: "Espíritu Aventurero", icono: "🗺️", desc: "Sientes impulso por explorar nuevos lugares y salir de tu zona de confort.", modificadores: { fuerza: 1 } },
        { id: "narrador_nato", nombre: "Narrador Nato", icono: "🗣️", desc: "Expresas tus ideas e historias de forma envolvente y persuasiva.", modificadores: { carisma: 1 } },
        { id: "agudeza_moral", nombre: "Agudeza Moral", icono: "⚖️", desc: "Evalúas los dilemas éticos con matices y sin caer en absolutos.", modificadores: { sabiduria: 1 } }
    ],
    cicatrices: [
        { id: "evasion_realidad", nombre: "Evasión de la Realidad", icono: "☁️", desc: "Prefieres refugiarte en tus pensamientos antes que afrontar problemas reales.", modificadores: { constitucion: -1 } },
        { id: "dramatismo", nombre: "Tendencia al Dramatismo", icono: "🎭", desc: "Magnificas pequeños inconvenientes como si fueran tragedias mayores.", modificadores: { carisma: -1 } },
        { id: "idealismo_ingenuo", nombre: "Idealismo Ingenuo", icono: "🕊️", desc: "Esperas resoluciones perfectas y sufres desencantos al chocar con la realidad.", modificadores: { sabiduria: -1 } },
        { id: "nostalgia_amarga", nombre: "Nostalgia Amarga", icono: "🥀", desc: "Te quedas anclado/a en momentos del pasado añorando lo que ya fue.", modificadores: { fuerza: -1 } },
        { id: "sobrepensamiento", nombre: "Sobrepensamiento", icono: "🌀", desc: "Analizas en exceso interacciones pasadas buscando segundas intenciones.", modificadores: { inteligencia: -1 } },
        { id: "inconstancia", nombre: "Inconstancia", icono: "🍃", desc: "Te entusiasmas rápido con nuevas ideas pero te cuesta mantener la disciplina.", modificadores: { destreza: -1 } },
        { id: "procrastinacion_creativa", nombre: "Procrastinación Creativa", icono: "🛋️", desc: "Pospones responsabilidades pendientes imaginando otros proyectos.", modificadores: { constitucion: -1 } },
        { id: "paralisis_dilema", nombre: "Parálisis por Dilema", icono: "❓", desc: "Te cuesta tomar decisiones firmes cuando hay varias opciones atractivas.", modificadores: { sabiduria: -1 } },
        { id: "idealizacion_personas", nombre: "Idealización de Personas", icono: "⭐", desc: "Proyectas expectativas irreales sobre los demás y te decepcionas fácilmente.", modificadores: { carisma: -1 } },
        { id: "desconexion_entorno", nombre: "Desconexión del Entorno", icono: "🌫️", desc: "Te abstraes tanto que pierdes la noción de los detalles prácticos inmediatos.", modificadores: { destreza: -1 } }
    ]
},

no_ficcion: {
    rasgos: [
        { id: "pensamiento_critico", nombre: "Pensamiento Crítico", icono: "🧐", desc: "Cuestionas la información antes de darla por sentada.", modificadores: { inteligencia: 1 } },
        { id: "rigor_analitico", nombre: "Rigor Analítico", icono: "📊", desc: "Desglosas problemas complejos en partes manejables con método.", modificadores: { inteligencia: 1 } },
        { id: "autodidacta", nombre: "Espíritu Autodidacta", icono: "📚", desc: "Tienes facilidad y disciplina para aprender habilidades nuevas por tu cuenta.", modificadores: { sabiduria: 1 } },
        { id: "autoconciencia", nombre: "Autoconciencia", icono: "🪞", desc: "Reconoces tus propias fortalezas, sesgos y puntos de mejora.", modificadores: { sabiduria: 1 } },
        { id: "pensamiento_sistemico", nombre: "Visión Sistemática", icono: "⚙️", desc: "Entiendes cómo interactúan las piezas de un proceso o comunidad.", modificadores: { destreza: 1 } },
        { id: "disciplina_focal", nombre: "Disciplina Focal", icono: "🎯", desc: "Mantienes el foco en tus metas a largo plazo sin distreerte.", modificadores: { constitucion: 1 } },
        { id: "comunicacion_clara", nombre: "Claridad Expositiva", icono: "📢", desc: "Explicas conceptos complejos de manera sencilla y directa.", modificadores: { carisma: 1 } },
        { id: "mentalidad_empirica", nombre: "Mentalidad Empírica", icono: "🔬", desc: "Valoras las evidencias observables y la experiencia práctica sobre las opiniones.", modificadores: { fuerza: 1 } },
        { id: "resiliencia_realista", nombre: "Realismo Resiliente", icono: "⛰️", desc: "Aceptas los hechos difíciles tal como son y actúas para adaptarte.", modificadores: { constitucion: 1 } },
        { id: "sintesis_informacion", nombre: "Capacidad de Síntesis", icono: "✂️", desc: "Extraes lo esencial de grandes volúmenes de datos o lecturas.", modificadores: { inteligencia: 1 } }
    ],
    cicatrices: [
        { id: "escepticismo_rigido", nombre: "Escepticismo Rígido", icono: "🧱", desc: "Te cuesta aceptar ideas innovadoras si no vienen con pruebas inmediatas.", modificadores: { sabiduria: -1 } },
        { id: "paralisis_analisis", nombre: "Parálisis por Análisis", icono: "⏳", desc: "Investigas tanto antes de actuar que pierdes la oportunidad de ejecutar.", modificadores: { fuerza: -1 } },
        { id: "perfeccionismo_bloqueante", nombre: "Perfeccionismo Bloqueante", icono: "📐", desc: "Te exiges estándares tan altos que te cuesta dar por terminado un trabajo.", modificadores: { constitucion: -1 } },
        { id: "frialdad_argumentativa", nombre: "Frialdad Argumentativa", icono: "❄️", desc: "Priorizas la lógica estricta descuidando la sensibilidad de los demás.", modificadores: { carisma: -1 } },
        { id: "saturacion_datos", nombre: "Saturación de Datos", icono: "🤯", desc: "Sensación de abrumamiento por intentar abarcar demasiada información.", modificadores: { inteligencia: -1 } },
        { id: "sabelotodo", nombre: "Actitud Académica", icono: "🎓", desc: "Tendencia a corregir a otros en detalles menores creando fricción social.", modificadores: { carisma: -1 } },
        { id: "cinismo", nombre: "Cierto Cinismo", icono: "🖤", desc: "Dudas de la buena fe tras bastidores en proyectos u organizaciones.", modificadores: { sabiduria: -1 } },
        { id: "rigidez_metodologica", nombre: "Rigidez Metodológica", icono: "📏", desc: "Te estresas cuando los planes improvisados se salen del esquema inicial.", modificadores: { destreza: -1 } },
        { id: "fatiga_cognitiva", nombre: "Fatiga Cognitiva", icono: "💤", desc: "Agotamiento derivado de mantener una concentración mental prolongada.", modificadores: { constitucion: -1 } },
        { id: "obsesión_control", nombre: "Necesidad de Control", icono: "🎛️", desc: "Dificultad para delegar tareas por temor a que no sigan las pautas exactas.", modificadores: { destreza: -1 } }
    ]
},

    generica: {
    rasgos: [
        { id: "observador", nombre: "Observador/a", icono: "👁️", desc: "Te fijas más en los detalles del entorno y en lo que la gente no dice.", modificadores: { sabiduria: 1 } },
        { id: "valentia", nombre: "Valentía", icono: "🦁", desc: "Afrontas los momentos de tensión cotidiana con mayor entereza.", modificadores: { fuerza: 1 } },
        { id: "detallista", nombre: "Detallista", icono: "🔍", desc: "Prestas atención a los pequeños matices en tareas y conversaciones.", modificadores: { destreza: 1 } },
        { id: "imaginativo", nombre: "Imaginativo/a", icono: "🎨", desc: "Tu mente genera soluciones e historias con mayor facilidad.", modificadores: { inteligencia: 1 } },
        { id: "cientifico", nombre: "Mente Científica", icono: "🧪", desc: "Te sale de forma natural buscar explicaciones lógicas y probar hipótesis.", modificadores: { inteligencia: 1 } },
        { id: "historiador", nombre: "Espíritu de Historiador", icono: "📜", desc: "Buscas el origen de las cosas y te interesa cómo se llegó hasta aquí.", modificadores: { sabiduria: 1 } },
        { id: "paciente", nombre: "Paciencia", icono: "⌛", desc: "Soportas mejor las esperas y los procesos que requieren tiempo.", modificadores: { constitucion: 1 } },
        { id: "curioso", nombre: "Curiosidad", icono: "💡", desc: "Sientes ganas de investigar temas nuevos por tu propia cuenta.", modificadores: { inteligencia: 1 } },
        { id: "organizado", nombre: "Mente Organizada", icono: "🗂️", desc: "Estructuras mejor tus ideas, notas y tareas del día a día.", modificadores: { destreza: 1 } },
        { id: "pragmatico", nombre: "Pragmatismo", icono: "🛠️", desc: "Buscas soluciones prácticas directas en lugar de dar vueltas.", modificadores: { fuerza: 1 } }
    ],
    cicatrices: [
        { id: "miedoso", nombre: "Miedoso/a", icono: "😨", desc: "Te sobresaltas con más facilidad o dudas antes de tomar riesgos.", modificadores: { fuerza: -1 } },
        { id: "ansiedad", nombre: "Ansiedad Anticipatoria", icono: "🌊", desc: "Sensación de prisa o inquietud anticipada ante el futuro.", modificadores: { constitucion: -1 } },
        { id: "nerviosismo", nombre: "Nerviosismo", icono: "😬", desc: "Ligera intranquilidad o inquietud motora en situaciones inciertas.", modificadores: { destreza: -1 } },
        { id: "egoismo", nombre: "Cierta Inclinación al Egoísmo", icono: "🌵", desc: "Priorizas tus propios recursos y tiempo por encima de las peticiones ajenas.", modificadores: { carisma: -1 } },
        { id: "desconfiado", nombre: "Desconfianza", icono: "🔒", desc: "Miras con cierto recelo las promesas o intenciones de los demás.", modificadores: { carisma: -1 } },
        { id: "distraido", nombre: "Despiste / Distracción", icono: "💭", desc: "Te quedas ensimismado/a en tus pensamientos durante tareas cotidianas.", modificadores: { destreza: -1 } },
        { id: "impaciente", nombre: "Impaciencia", icono: "⏱️", desc: "Te cuesta tolerar ritmos lentos o personas que tardan en explicarse.", modificadores: { constitucion: -1 } },
        { id: "testarudo", nombre: "Testarudez", icono: "🛡️", desc: "Te aferras firmemente a tus opiniones iniciales aun cuando surgen dudas.", modificadores: { sabiduria: -1 } },
        { id: "cansancio_mental", nombre: "Cansancio Mental", icono: "🔋", desc: "Sensación de fatiga intelectual al acumular demasiada información." , modificadores: { inteligencia: -1 } },
        { id: "pesimista", nombre: "Toque Pesimista", icono: "☁️", desc: "Inclinación a pensar primero en lo que puede salir mal." , modificadores: { carisma: -1 } },
    
    ]
}
}
