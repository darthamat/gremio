// rasgosData.js - Banco ampliado de habilidades y huellas intelectuales por género

export const BANCO_HUELLAS = {
    poesia: {
        rasgos: [
            { id: "sensibilidad_linguistica", nombre: "Sensibilidad Lingüística", icono: "✍️", desc: "Aprecio agudo por el ritmo, la métrica y las sutilezas del lenguaje." },
            { id: "inteligencia_emocional", nombre: "Inteligencia Emocional", icono: "🖤", desc: "Capacidad para descifrar estados de ánimo complejos y matices no verbales." },
            { id: "pensamiento_metaforico", nombre: "Pensamiento Metafórico", icono: "🌙", desc: "Facilidad para trazar analogías entre conceptos abstractos y la realidad." },
            { id: "sintesis_expresiva", nombre: "Síntesis Expresiva", icono: "✒️", desc: "Habilidad para transmitir grandes ideas utilizando las palabras precisas." },
            { id: "atencion_estetica", nombre: "Atención Estética", icono: "🎨", desc: "Capacidad para encontrar valor poético y belleza en detalles cotidianos." },
            { id: "escucha_profunda", nombre: "Escucha Empática", icono: "🕊️", desc: "Receptividad aumentada ante la vulnerabilidad y el discurso ajeno." },
            { id: "riqueza_lexica", nombre: "Vocabulario Evocador", icono: "📖", desc: "Dominio de términos connotativos y precisión verbal al expresarte." },
            { id: "intuicion_simbolica", nombre: "Intuición Simbólica", icono: "🔮", desc: "Habilidad para interpretar alegorías e imágenes en la cultura y el arte." },
            { id: "paciencia_contemplativa", nombre: "Paciencia Contemplativa", icono: "⏳", desc: "Tolerancia a la pausa y a la observación pausada del entorno." },
            { id: "resonancia_humana", nombre: "Resonancia Humana", icono: "🕯️", desc: "Comprensión intuitiva del sufrimiento y la alegría universal." }
        ],
        cicatrices: [
            { id: "melancolia_reflexiva", nombre: "Tendencia Melancólica", icono: "🌧️", desc: "Propensión a la nostalgia injustificada por momentos e ideas del pasado." },
            { id: "vulnerabilidad_expuesta", nombre: "Sensibilidad Aumentada", icono: "🥀", desc: "Mayor susceptibilidad a la rudeza, la prisa o el cinismo del entorno." },
            { id: "idealismo_inviable", nombre: "Idealismo Estético", icono: "🫧", desc: "Frustración recurrente cuando la realidad prosaica rompe tus expectativas." },
            { id: "introversion_severa", nombre: "Refugio Interior", icono: "🗝️", desc: "Tendencia a aislarte en tus propios pensamientos ante la saturación social." },
            { id: "sobrepensamiento_afectivo", nombre: "Sobreanálisis Emocional", icono: "🕸️", desc: "Dificultad para vivir las relaciones sin desarmar intelectualmente cada gesto." }
        ]
    },

    terror: {
        rasgos: [
            { id: "tolerancia_tension", nombre: "Tolerancia al Estrés", icono: "🧠", desc: "Serenidad y temple ante situaciones impredecibles o de alta presión." },
            { id: "atencion_detalles", nombre: "Observación Aguda", icono: "🔍", desc: "Capacidad para detectar incoherencias o pequeños peligros en tu entorno." },
            { id: "imaginacion_sin_limites", nombre: "Apertura a lo Inusitado", icono: "👁️", desc: "Mente dispuesta a considerar hipótesis poco convencionales." },
            { id: "desmitificacion_miedo", nombre: "Análisis del Miedo", icono: "🛡️", desc: "Comprensión de los mecanismos psicológicos de las fobias y la histeria." },
            { id: "discernimiento_amenazas", nombre: "Evaluación de Riesgos", icono: "⚖️", desc: "Habilidad para distinguir amenazas reales de sugestiones infundadas." },
            { id: "resiliencia_psicologica", nombre: "Resiliencia Mental", icono: "🧱", desc: "Capacidad para asimilar narrativa impactante sin desestabilizarte." },
            { id: "foco_bajo_presion", nombre: "Foco Mantenido", icono: "🎯", desc: "Capacidad para concentrarte aun en entornos hostiles o incómodos." },
            { id: "empatia_oscura", nombre: "Comprensión de la Sombras", icono: "♟️", desc: "Entendimiento de las motivaciones perversas o desesperadas del ser humano." },
            { id: "control_impulso", nombre: "Autorregulación Emocional", icono: "⚓", desc: "Freno consciente a las reacciones de pánico ante lo desconocido." },
            { id: "catarsis_narrativa", nombre: "Procesamiento Catártico", icono: "🌊", desc: "Facilidad para canalizar inquietudes reales a través del análisis de la ficción." }
        ],
        cicatrices: [
            { id: "hipervigilancia", nombre: "Hipervigilancia Alerta", icono: "👀", desc: "Inquietud inconsciente al apagar las luces o ante ruidos inesperados." },
            { id: "escepticismo_entorno", nombre: "Desconfianza Ambiental", icono: "🚪", desc: "Tendencia a revisar cerrojos y evaluar salidas al entrar a un lugar nuevo." },
            { id: "sugestion_nocturna", nombre: "Sugestión Nocturna", icono: "🕷️", desc: "Dificultad ocasional para conciliar el sueño tras lecturas densas." },
            { id: "pesimismo_psicologico", nombre: "Visión Sombría", icono: "🌫️", desc: "Inclinación a asumir los peores escenarios en decisiones de incertidumbre." },
            { id: "desgaste_empatia", nombre: "Cansancio de la Alarma", icono: "🕯️", desc: "Sensación de fatiga mental producto de la tensión sostenida." }
        ]
    },

    historia: {
        rasgos: [
            { id: "pensamiento_critico", nombre: "Pensamiento Crítico", icono: "🏛️", desc: "Capacidad para contrastar versiones y detectar sesgos en discursos actuales." },
            { id: "perspectiva_temporal", nombre: "Perspectiva Temporal", icono: "⏳", desc: "Entendimiento de que los problemas del presente son parte de ciclos largos." },
            { id: "bagaje_sociocultural", nombre: "Cultura General", icono: "📚", desc: "Dominio de contextos geopolíticos, acontecimientos y transformaciones humanas." },
            { id: "analisis_causal", nombre: "Análisis de Causa y Efecto", icono: "⚙️", desc: "Habilidad para rastrear el origen distante de situaciones complejas." },
            { id: "rigor_documental", nombre: "Exigencia de Fuentes", icono: "📜", desc: "Inclinación a verificar datos antes de dar por cierta una afirmación." },
            { id: "comprensión_geopolitica", nombre: "Visión Sistémica", icono: "🌐", desc: "Habilidad para conectar decisiones de gobernantes con impacto en la población." },
            { id: "empatia_anacronica", nombre: "Contextualización Cultural", icono: "🕯️", desc: "Capacidad para juzgar sucesos pasados bajo sus propias reglas morales." },
            { id: "memoria_estructurada", nombre: "Memoria de Hechos", icono: "🗂️", desc: "Facilidad para estructurar cronológicamente datos y grandes periodos de tiempo." },
            { id: "desmitificacion_presente", nombre: "Objetividad Historica", icono: "⚖️", desc: "Reconocimiento de que la sociedad actual no es el pináculo de la civilización." },
            { id: "oratoria_argumentada", nombre: "Argumentación Fundada", icono: "🎙️", desc: "Habilidad para sostener opiniones basadas en precedentes concretos." }
        ],
        cicatrices: [
            { id: "cinismo_historico", nombre: "Cinismo de la Era", icono: "🥀", desc: "Apatía hacia las grandes promesas políticas al ver repetir los mismos errores." },
            { id: "incredulidad_progreso", nombre: "Escéptico del Progreso", icono: "🔄", desc: "Duda constante sobre si la humanidad evoluciona moralmente con el tiempo." },
            { id: "fatalismo_social", nombre: "Fatalismo Social", icono: "📉", desc: "Resignación ante la caída o decadencia inevitable de instituciones y sistemas." },
            { id: "sensacion_impotencia", nombre: "Impotencia del Espectador", icono: "⛓️", desc: "Sensación de frustración al observar fallos sociales predichos por la historia." },
            { id: "saturacion_datos", nombre: "Parálisis por Análisis", icono: "🌫️", desc: "Dificultad para tomar postura rápida ante la enorme complejidad de variables." }
        ]
    },

    filosofia: {
        rasgos: [
            { id: "rigor_argumentativo", nombre: "Lógica Argumentativa", icono: "⚖️", desc: "Destreza para identificar falacias lógicas en debates o textos." },
            { id: "desapego_dogmatico", nombre: "Flexibilidad Mental", icono: "🧩", desc: "Disposición para cuestionar las propias convicciones ante argumentos sólidos." },
            { id: "abstraccion_conceptual", nombre: "Abstracción Teórica", icono: "🌌", desc: "Facilidad para manejar conceptos ontológicos, éticos y epistemológicos." },
            { id: "cuestionamiento_etico", nombre: "Criterio Ético", icono: "🧭", desc: "Marco moral reflexivo aplicable a dilemas prácticos del día a día." },
            { id: "autonomia_pensamiento", nombre: "Criterio Propio", icono: "💡", desc: "Resistencia a la presión de grupo y a los dogmas de moda." },
            { id: "tolerancia_ambiguedad", nombre: "Tolerancia a la Incertidumbre", icono: "🌫️", desc: "Comodidad conviviendo con preguntas que no poseen respuestas definitivas." },
            { id: "claridad_conceptual", nombre: "Precisión Conceptual", icono: "🔍", desc: "Habilidad para definir términos con exactitud antes de discutir sobre ellos." },
            { id: "analisis_premisas", nombre: "Desmontaje de Premisas", icono: "🧱", desc: "Habilidad para ir a la base oculta sobre la que se sostiene una afirmación." },
            { id: "metacognicion", nombre: "Metacognición", icono: "🪞", desc: "Capacidad para reflexionar sobre tus propios procesos de pensamiento." },
            { id: "discernimiento_valores", nombre: "Jerarquía de Valores", icono: "💎", desc: "Claridad respecto a qué principios priorizar en situaciones complejas." }
        ],
        cicatrices: [
            { id: "crisis_existencial", nombre: "Duda Existencial", icono: "❓", desc: "Cuestionamiento constante del propósito, el sentido y el libre albedrío." },
            { id: "alienacion_prosaica", nombre: "Desconexión Cotidiana", icono: "🪨", desc: "Sensación de aburrimiento frente a las conversaciones triviales del día a día." },
            { id: "solipsismo_inquietante", nombre: "Aislamiento Intelectual", icono: "🏝️", desc: "Sensación de que es complejo compartir tu marco mental con tu entorno." },
            { id: "paralisis_decision", nombre: "Parálisis Reflexiva", icono: "⏸️", desc: "Dificultad para actuar al ver demasiados ángulos y matices en cada decisión." },
            { id: "desilusión_absolutos", nombre: "Pérdida de Absolutos", icono: "🏜️", desc: "Incomodidad por no poder apoyarte en certezas simples o verdades cerradas." }
        ]
    },

    ciencia_ficcion: {
        rasgos: [
            { id: "vision_prospectiva", nombre: "Pensamiento Prospectivo", icono: "🚀", desc: "Capacidad para anticipar consecuencias sociales derivadas de la tecnología." },
            { id: "pensamiento_sistemico", nombre: "Comprensión Tecnológica", icono: "💻", desc: "Inteligencia para adaptar conceptos éticos al avance científico." },
            { id: "flexibilidad_paradigma", nombre: "Apertura de Paradigma", icono: "🪐", desc: "Mente dispuesta a asimilar normas, ecologías y modelos de vida alternativos." },
            { id: "imaginacion_estructurada", nombre: "Diseño Especulativo", icono: "📐", desc: "Habilidad para construir escenarios hipotéticos con coherencia interna." },
            { id: "ecologia_global", nombre: "Conciencia Planetaria", icono: "🌍", desc: "Comprensión de la fragilidad del hábitat humano a escala cósmica." },
            { id: "adaptabilidad_cambio", nombre: "Adaptabilidad al Cambio", icono: "⚡", desc: "Menor resistencia cognitiva ante innovaciones radicales." },
            { id: "analisis_socio_tecnico", nombre: "Criterio Tecnocrático", icono: "📡", desc: "Capacidad para analizar cómo la técnica transforma el comportamiento humano." },
            { id: "curiosidad_cientifica", nombre: "Curiosidad Científica", icono: "🔬", desc: "Interés por disciplinas como la física, la astronomía o la biotecnología." },
            { id: "desapego_antropocentrico", nombre: "Perspectiva Cósmica", icono: "✨", desc: "Humildad intelectual al dimensionar el papel humano en el universo." },
            { id: "resolución_de_problemas", nombre: "Criterio Técnico", icono: "🛠️", desc: "Enfoque metodológico para desglosar problemas complejos en partes." }
        ],
        cicatrices: [
            { id: "distopia_anticipada", nombre: "Ansiedad Prospectiva", icono: "🤖", desc: "Preocupación constante por los riesgos éticos de la inteligencia y el control." },
            { id: "insignificancia_cosmica", nombre: "Sensación de Pequeñez", icono: "🌌", desc: "Vértigo al considerar las escalas de tiempo y espacio en el cosmos." },
            { id: "deshumanizacion_critica", nombre: "Apatía por lo Artificial", icono: "🔌", desc: "Incomodidad o recelo ante la mediación digital en las relaciones humanas." },
            { id: "anhelo_futurista", nombre: "Impaciencia Temporal", icono: "⌛", desc: "Frustración con las limitaciones técnicas y sociales del presente." },
            { id: "furia_ecologica", nombre: "Ecoansiedad", icono: "🥀", desc: "Preocupación profunda por el destino del planeta y sus recursos." }
        ]
    },

    novela_negra: {
        rasgos: [
            { id: "deduccion_logica", nombre: "Razonamiento Deductivo", icono: "🕵️", desc: "Inferencia ágil de intenciones o verdades implícitas a partir de pistas." },
            { id: "psicologia_criminal", nombre: "Perspicacia Psicológica", icono: "🚬", desc: "Entendimiento de las debilidades humanas, la codicia y el engaño." },
            { id: "atencion_incoherencias", nombre: "Detección de Incoherencias", icono: "🧩", desc: "Capacidad para notar detalles que no cuadran en una versión dada." },
            { id: "paciencia_investigadora", nombre: "Persistencia Metódica", icono: "📁", desc: "Habilidad para recolectar información sistemáticamente antes de concluir." },
            { id: "sangre_fria", nombre: "Imparcialidad Analítica", icono: "❄️", desc: "Capacidad para evaluar hechos perturbadores sin sesgos emocionales." },
            { id: "lectura_microexpresiones", nombre: "Observación Conductual", icono: "👁️", desc: "Atención a gestos y contradicciones en el comportamiento de las personas." },
            { id: "navegacion_sombra", nombre: "Pragmatismo Social", icono: "🌆", desc: "Comprensión de los mecanismos menos éticos que mueven ciertas instituciones." },
            { id: "prudencia_comunicativa", nombre: "Reserva Verbal", icono: "🤐", desc: "Saber qué información compartir y cuál mantener en reserva." },
            { id: "evaluacion_motivaciones", nombre: "Análisis de Intereses", icono: "💰", desc: "Habilidad para preguntarse siempre cuál es el beneficio oculto tras una acción." },
            { id: "resiliencia_urbana", nombre: "Callejero Intelectual", icono: "🌧️", desc: "Familiaridad con la complejidad social sin idealizar la naturaleza humana." }
        ],
        cicatrices: [
            { id: "escepticismo_interpersonal", nombre: "Escepticismo Social", icono: "🔒", desc: "Tendencia a dudar de las intenciones altruistas de desconocidos." },
            { id: "mirada_suspicaz", nombre: "Sospecha Sistemática", icono: "🕵️‍♂️", desc: "Evaluar espontáneamente las segundas intenciones de la gente." },
            { id: "desilusion_moral", nombre: "Desilusión Institucional", icono: "🏛️", desc: "Certeza de que la justicia perfecta no existe en los sistemas humanos." },
            { id: "distanciamiento_afectivo", nombre: "Frialdad Defensiva", icono: "🛡️", desc: "Escudo emocional para no involucrarte fácilmente en conflictos ajenos." },
            { id: "peticion_de_pruebas", nombre: "Obsesión por la Evidencia", icono: "📄", desc: "Incapacidad para aceptar promesas o afirmaciones sin pruebas tangibles." }
        ]
    },

    ensayo: {
        rasgos: [
            { id: "estructuracion_ideas", nombre: "Estructuración de Pensamiento", icono: "📐", desc: "Capacidad para organizar argumentos de forma clara, ordenada y convincente." },
            { id: "curiosidad_transversal", nombre: "Interdisciplinariedad", icono: "🔄", desc: "Habilidad para conectar datos de sociología, economía, arte y ciencia." },
            { id: "pensamiento_sintetico", nombre: "Capacidad de Síntesis", icono: "✍️", desc: "Facilidad para condensar textos complejos en sus tesis principales." },
            { id: "exigencia_de_fuentes", nombre: "Rigor Metodológico", icono: "📚", desc: "Búsqueda activa de autores, referencias y bibliografía verificable." },
            { id: "claridad_expositiva", nombre: "Pedagogía Verbal", icono: "🎙️", desc: "Habilidad para explicar conceptos densos a cualquier tipo de audiencia." },
            { id: "analisis_de_discurso", nombre: "Análisis de Discurso", icono: "📢", desc: "Capacidad para desarmar la retórica y la propaganda mediática." },
            { id: "apertura_intelectual", nombre: "Curiosidad Multidisciplinar", icono: "🌐", desc: "Interés permanente por explorar áreas fuera de tu zona de confort." },
            { id: "foco_conceptual", nombre: "Foco en la Tesis", icono: "🎯", desc: "Facilidad para no perder el hilo conductor en discusiones complejas." },
            { id: "cuestionamiento_normalidad", nombre: "Problematización de lo Cotidiano", icono: "❓", desc: "Atención a normas culturales aceptadas sin justificación aparente." },
            { id: "asimilacion_densidad", nombre: "Resistencia a la Densidad", icono: "📖", desc: "Tolerancia para leer textos complejos sin perder la concentración." }
        ],
        cicatrices: [
            { id: "intelectualizacion_excesiva", nombre: "Intelectualización Excesiva", icono: "🧠", desc: "Dificultad para experimentar emociones o vivencias sin teorizar sobre ellas." },
            { id: "pedanteria_involuntaria", nombre: "Distancia Pedagógica", icono: "🗣️", desc: "Tendencia involuntaria a corregir imprecisiones en conversaciones informales." },
            { id: "fatiga_de_información", nombre: "Infotoxicidad", icono: "📥", desc: "Sensación de abrumamiento por la cantidad de lecturas pendientes." },
            { id: "hipercritica_creativa", nombre: "Perfeccionismo Crítico", icono: "✂️", desc: "Dificultad para disfrutar de obras sencillas sin señalar sus fallos conceptuales." },
            { id: "soledad_debate", nombre: "Aislamiento de Debate", icono: "💬", desc: "Frustración por no encontrar interlocutores con tu misma profundidad de análisis." }
        ]
    },

    biografia: {
        rasgos: [
            { id: "empatia_vital", nombre: "Comprensión de Trayectorias", icono: "👤", desc: "Entendimiento de que las decisiones humanas se explican por toda una vida." },
            { id: "realismo_humano", nombre: "Desmitificación del Éxito", icono: "🎖️", desc: "Reconocimiento de que las grandes figuras tuvieron contradicciones y fallos." },
            { id: "aprendizaje_experiencia", nombre: "Aprendizaje Vicario", icono: "💡", desc: "Capacidad para extraer lecciones prácticas del triunfo o error ajeno." },
            { id: "humildad_historica", nombre: "Humildad de Vida", icono: "🌱", desc: "Conciencia de las limitaciones biológicas, de época y de salud en cualquier meta." },
            { id: "resiliencia_biografica", nombre: "Perspectiva de Crisis", icono: "🌦️", desc: "Comprensión de que los momentos oscuros suelen ser etapas transitivas." },
            { id: "valoracion_contexto", nombre: "Atención al Contexto", icono: "🏡", desc: "Reconocimiento de la importancia del entorno en el desarrollo del talento." },
            { id: "discernimiento_legado", nombre: "Pensamiento de Legado", icono: "🪵", desc: "Reflexión sobre qué huella personal o profesional deseas construir a largo plazo." },
            { id: "paciencia_procesos", nombre: "Tolerancia a los Tiempos", icono: "⏳", desc: "Comprensión de que los grandes logros requieren décadas de trabajo." },
            { id: "analisis_caracter", nombre: "Evaluación de Carácter", icono: "👥", desc: "Habilidad para evaluar fortalezas y sesgos de personalidad en otros." },
            { id: "superacion_adversidad", nombre: "Inspiración Práctica", icono: "⛰️", desc: "Adopción de hábitos y enfoques que sirvieron a otras personas en crisis." }
        ],
        cicatrices: [
            { id: "comparacion_inadecuada", nombre: "Comparación Paralizante", icono: "📏", desc: "Incomodidad al medir tus logros personales contra las grandes vidas leídas." },
            { id: "mitificacion_involuntaria", nombre: "Nostalgia de Grandes Figuras", icono: "🗿", desc: "Sensación de que el presente carece de personalidades de la altura del pasado." },
            { id: "presion_por_el_tiempo", nombre: "Urgencia Biográfica", icono: "⏱️", desc: "Ansiedad por el paso del tiempo y la cantidad de metas aún no alcanzadas." },
            { id: "voyeurismo_existencial", nombre: "Voyeurismo Existencial", icono: "🪟", desc: "Preferencia por analizar las vidas ajenas en lugar de tomar riesgos en la propia." },
            { id: "desilusión_idolos", nombre: "Pérdida de Mitos", icono: "💔", desc: "Decepción al descubrir las fallas éticas de figuras que admirabas." }
        ]
    },

    romance: {
        rasgos: [
            { id: "inteligencia_relacional", nombre: "Inteligencia Relacional", icono: "❤️", desc: "Mayor comprensión de la comunicación, los límites y las dinámicas de pareja." },
            { id: "empatia_vinculativa", nombre: "Sensibilidad Afectiva", icono: "🤝", desc: "Habilidad para validar los sentimientos y las vulnerabilidades ajenas." },
            { id: "expresion_emocional", nombre: "Elocuencia Afectiva", icono: "💌", desc: "Facilidad para verbalizar lo que sientes de forma clara y sin vergüenza." },
            { id: "autoconocimiento_deseos", nombre: "Claridad de Necesidades", icono: "🪞", desc: "Reconocimiento de tus propios estándares y necesidades afectivas." },
            { id: "gestion_conflictos", nombre: "Resolución de Fricciones", icono: "🕊️", desc: "Habilidad para abordar desacuerdos personales desde la comprensión." },
            { id: "generosidad_afectiva", nombre: "Disposición al Cuidado", icono: "🌸", desc: "Inclinación a realizar gestos significativos por las personas que valoras." },
            { id: "tolerancia_vulnerabilidad", nombre: "Valentía Afectiva", icono: "🔓", desc: "Disposición a correr el riesgo de abrirte emocionalmente a otros." },
            { id: "atencion_detalles_humanos", nombre: "Memoria Afectiva", icono: "🎁", desc: "Recordar gustos, fechas y detalles importantes de tus allegados." },
            { id: "revalorizacion_intimidad", nombre: "Aprecio de la Intimidad", icono: "🕯️", desc: "Priorización de la conexión profunda por encima de interacciones superficiales." },
            { id: "optimo_relacional", nombre: "Esperanza Vinculante", icono: "✨", desc: "Fe en la capacidad humana para reparar vínculos y construir entendimiento." }
        ],
        cicatrices: [
            { id: "expectativa_irreal", nombre: "Expectativas Románticas", icono: "🫧", desc: "Dificultad para aceptar la rutina y la imperfección en las relaciones reales." },
            { id: "vulnerabilidad_dolorosa", nombre: "Temor al Desamor", icono: "💔", desc: "Aumento de la aprensión ante el rechazo o la distancia de personas queridas." },
            { id: "sobreanalisis_gestos", nombre: "Sobreinterpretación Afectiva", icono: "🕸️", desc: "Buscar significados ocultos en cambios mínimos de tono o comunicación." },
            { id: "añoranza_intensidad", nombre: "Adicción a la Intensidad", icono: "🔥", desc: "Aburrimiento ante vínculos estables pero poco dramáticos." },
            { id: "idealización_ajena", nombre: "Proyección Ideada", icono: "🎭", desc: "Atribuir virtudes ficticias a personas reales basándote en modelos de ficción." }
        ]
    },

    clasicos: {
        rasgos: [
            { id: "universalidad_humana", nombre: "Comprensión Universal", icono: "🏛️", desc: "Entendimiento de las pasiones y dilemas eternos de la condición humana." },
            { id: "resistencia_lectora", nombre: "Atención Sostenida", icono: "📖", desc: "Capacidad para mantener el foco en prosas complejas y estructuras lentas." },
            { id: "riqueza_estilistica", nombre: "Dominio del Lenguaje", icono: "✒️", desc: "Asimilación de estructuras sintácticas elegantes y vocabulario rico." },
            { id: "criterio_temporal", nombre: "Criterio de Permanencia", icono: "⏳", desc: "Habilidad para discernir entre modas pasajeras y valor duradero." },
            { id: "empatia_epocas", nombre: "Atemporalidad Intelectual", icono: "🌍", desc: "Facilidad para conectar con mentes que vivieron en siglos o culturas lejanas." },
            { id: "sensibilidad_dramatica", nombre: "Análisis de la Tragedia", icono: "🎭", desc: "Comprensión de los errores trágicos y las fallas de carácter inevitables." },
            { id: "profundidad_psicologica", nombre: "Observación de la Naturaleza Humana", icono: "👁️", desc: "Lectura profunda de la ambición, la culpa y la virtud." },
            { id: "autonomia_estetica", nombre: "Gusto Formado", icono: "🍷", desc: "Criterio propio e independiente frente a las tendencias comerciales." },
            { id: "paciencia_narrativa", nombre: "Tolerancia al Ritmo Lento", icono: "🕯️", desc: "Aprecio por el desarrollo pausado de arcos y descripciones." },
            { id: "asentamiento_cultural", nombre: "Apertura a la Tradición", icono: "📜", desc: "Conciencia de las raíces literarias sobre las que se apoya la cultura actual." }
        ],
        cicatrices: [
            { id: "elitismo_involuntario", nombre: "Esnobismo Estético", icono: "🏰", desc: "Tendencia involuntaria a desestimar obras contemporáneas o populares." },
            { id: "cansancio_arcaico", nombre: "Fatiga Estilística", icono: "⌛", desc: "Sensación de saturación frente a prosas densas o construcciones obsoletas." },
            { id: "distancia_contemporanea", nombre: "Desconexión del Presente", icono: "🪟", desc: "Dificultad para encontrar la misma calidad en la literatura de hoy." },
            { id: "peso_tradicion", nombre: "Inhibición Creativa", icono: "🗿", desc: "Sentimiento de que todo lo genial ya ha sido dicho por mentes del pasado." },
            { id: "rigidez_criterio", nombre: "Exigencia Inflexible", icono: "📐", desc: "Poco margen de tolerancia ante errores de forma o falta de profundidad." }
        ]
    }
};
// Huellas genéricas, básicas y prosaicas aplicables a cualquier tipo de lectura
export const HUELLAS_GENERICAS = {
    rasgos: [
        { id: "observador", nombre: "Observador/a", icono: "👁️", desc: "Te fijas más en los detalles del entorno y en lo que la gente no dice." },
        { id: "valentia", nombre: "Valentía", icono: "🦁", desc: "Afrontas los momentos de tensión cotidiana con mayor entereza." },
        { id: "detallista", nombre: "Detallista", icono: "🔍", desc: "Prestas atención a los pequeños matices en tareas y conversaciones." },
        { id: "imaginativo", nombre: "Imaginativo/a", icono: "🎨", desc: "Tu mente genera soluciones e historias con mayor facilidad." },
        { id: "cientifico", nombre: "Mente Científica", icono: "🧪", desc: "Te sale de forma natural buscar explicaciones lógicas y probar hipótesis." },
        { id: "historiador", nombre: "Espíritu de Historiador", icono: "📜", desc: "Buscas el origen de las cosas y te interesa cómo se llegó hasta aquí." },
        { id: "paciente", nombre: "Paciencia", icono: "⌛", desc: "Soportas mejor las esperas y los procesos que requieren tiempo." },
        { id: "curioso", nombre: "Curiosidad", icono: "💡", desc: "Sientes ganas de investigar temas nuevos por tu propia cuenta." },
        { id: "organizado", nombre: "Mente Organizada", icono: "🗂️", desc: "Estructuras mejor tus ideas, notas y tareas del día a día." },
        { id: "pragmatico", nombre: "Pragmatismo", icono: "🛠️", desc: "Buscas soluciones prácticas directas en lugar de dar vueltas." }
    ],
    cicatrices: [
        { id: "miedoso", nombre: "Miedoso/a", icono: "😨", desc: "Te sobresaltas con más facilidad o dudas antes de tomar riesgos." },
        { id: "ansiedad", nombre: "Ansiedad", icono: "SW", desc: "Sensación de prisa o inquietud anticipada ante el futuro." },
        { id: "nerviosismo", nombre: "Nerviosismo", icono: "😬", desc: "Ligera intranquilidad o inquietud motora en situaciones inciertas." },
        { id: "egoismo", nombre: "Cierta Inclinación al Egoísmo", icono: "🌵", desc: "Priorizas tus propios recursos y tiempo por encima de las peticiones ajenas." },
        { id: "desconfiado", nombre: "Desconfianza", icono: "🔒", desc: "Miras con cierto recelo las promesas o intenciones de los demás." },
        { id: "distraido", nombre: "Despiste / Distracción", icono: "💭", desc: "Te quedas ensimismado/a en tus pensamientos durante tareas cotidianas." },
        { id: "impaciente", nombre: "Impaciencia", icono: "⏱️", desc: "Te cuesta tolera ritmos lentos o personas que tardan en explicarse." },
        { id: "testarudo", nombre: "Testarudez", icono: "🧱", desc: "Te cuesta dar tu brazo a torcer cuando estás convencido/a de algo." },
        { id: "cansancio_mental", nombre: "Cansancio Mental", icono: "🔋", desc: "Sensación de fatiga intelectual al acumular demasiada información." },
        { id: "pesimista", nombre: "Toque Pesimista", icono: "☁️", desc: "Inclinación a pensar primero en lo que puede salir mal." }
    ]
};