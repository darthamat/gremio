// js/gestorLibros.js
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  arrayUnion, 
  increment, 
  collection, 
  addDoc, 
  getDoc,
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);

/**
 * 📚 1. REGISTRO RÁPIDO DE LECTURA LIBRE (Desde la Biblioteca)
 */
export async function registrarLecturaLibre(userId, datosLibro) {
  try {
    const paginas = Number(datosLibro.paginas) || 0;

    // Fórmulas de Recompensas
    // Prestigio: Paginas + Número Aleatorio entre 1 y Paginas
    const bonusPrestigio = paginas > 0 ? Math.floor(Math.random() * paginas) + 1 : 0;
    const prestigioGanado = paginas + bonusPrestigio;

    // Marcapáginas: Número Aleatorio entre 1 y Paginas
    const marcapaginasGanados = paginas > 0 ? Math.floor(Math.random() * paginas) + 1 : 1;

    // 1. Guardar o actualizar en la colección global 'biblioteca'
    const libroRef = await addDoc(collection(db, "biblioteca"), {
      titulo: datosLibro.titulo,
      autor: datosLibro.autor || "Desconocido",
      paginas: paginas,
      colorLomo: datosLibro.colorLomo || "#8b263e",
      usuarioId: userId,
      lectores: [userId],
      prestigioGanado: prestigioGanado,
      tipoOrigen: "LECTURA_LIBRE",
      fechaCompletado: serverTimestamp()
    });

    // 2. Actualizar el perfil del aventurero
    const userRef = doc(db, "aventureros", userId);
    await updateDoc(userRef, {
      xp: increment(paginas), // XP base = Páginas
      prestigio: increment(prestigioGanado),
      marcapaginas: increment(marcapaginasGanados),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1),
      estanteria: arrayUnion({
        id: libroRef.id,
        titulo: datosLibro.titulo,
        autor: datosLibro.autor,
        paginas: paginas,
        colorLomo: datosLibro.colorLomo
      })
    });

    return { 
      exito: true, 
      prestigio: prestigioGanado, 
      marcapaginas: marcapaginasGanados, 
      xp: paginas 
    };
  } catch (error) {
    console.error("Error al registrar lectura libre:", error);
    return { exito: false, error };
  }
}

/**
 * ⚔️ 2. REGISTRO DE MISIÓN SECUNDARIA (Desde Perfil/Misiones)
 */
export async function crearMisionSecundaria(userId, datosMision) {
  try {
    const paginas = Number(datosMision.paginas) || 0;
    const esCompletadaDirecta = datosMision.estado === "TERMINADA";

    // Recompensas base
    const bonusPrestigio = paginas > 0 ? Math.floor(Math.random() * paginas) + 1 : 0;
    const prestigioGanado = paginas + bonusPrestigio;
    const marcapaginasGanados = paginas > 0 ? Math.floor(Math.random() * paginas) + 1 : 1;

    // OBTENER NOMBRE DEL CREADOR
    const userSnap = await getDoc(doc(db, "aventureros", userId));
    const nombreCreador = userSnap.exists() ? (userSnap.data().nombre || "Un Aventurero") : "Un Aventurero";

    // 1. Crear documento de Misión Secundaria en la colección 'retos'
    const nuevaMisionRef = await addDoc(collection(db, "retos"), {
      titulo: datosMision.titulo,
      libro: datosMision.titulo,
      autor: datosMision.autor || "Desconocido",
      paginas: paginas,
      genero: datosMision.genero || "Fantasía",
      proponente: nombreCreador,
      creadorId: userId,
      esSecundaria: true,
      mensajeProponente: datosMision.proclama || `¡Aventureros! Os convoco a explorar el reino de ${datosMision.titulo}.`,
      participantes: [userId], // El creador entra como primer aventurero
      completadosPor: esCompletadaDirecta ? [userId] : [],
      fechaCreacion: serverTimestamp()
    });

    // 2. Si la marca como terminada de inmediato
    if (esCompletadaDirecta) {
      await registrarLecturaLibre(userId, {
        titulo: datosMision.titulo,
        autor: datosMision.autor,
        paginas: paginas,
        colorLomo: datosMision.colorLomo || "#27ae60"
      });

      const userRef = doc(db, "aventureros", userId);
      await updateDoc(userRef, {
        retosCompletados: arrayUnion(nuevaMisionRef.id)
      });
    } else {
      // Si entra como ACEPTADA (Misión Pendiente)
      const userRef = doc(db, "aventureros", userId);
      await updateDoc(userRef, {
        retosAceptados: arrayUnion(nuevaMisionRef.id)
      });
    }

    return { exito: true, id: nuevaMisionRef.id };
  } catch (error) {
    console.error("Error al crear la misión secundaria:", error);
    return { exito: false, error };
  }
}

/**
 * 🛡️ 3. UNIRSE A UNA MISIÓN SECUNDARIA EN GRUPO / CLAN
 */
export async function unirseAMisionSecundaria(userId, retoId) {
  try {
    const retoRef = doc(db, "retos", retoId);
    const retoSnap = await getDoc(retoRef);

    if (!retoSnap.exists()) return { exito: false, mensaje: "La misión no existe." };

    const datosReto = retoSnap.data();
    const participantes = datosReto.participantes || [];

    if (participantes.includes(userId)) {
      return { exito: false, mensaje: "Ya estás unido a esta expedición." };
    }

    // 1. Agregar aventurero a la expedición
    await updateDoc(retoRef, {
      participantes: arrayUnion(userId)
    });

    // 2. Otorgar BONO DE CLAN (100 Prestigio extras por aventurero en el grupo)
    const nuevoTamanoGrupo = participantes.length + 1;
    const bonoClan = 100; // +100 Prestigio por unirse a la expedición en grupo

    const userRef = doc(db, "aventureros", userId);
    await updateDoc(userRef, {
      retosAceptados: arrayUnion(retoId),
      prestigio: increment(bonoClan)
    });

    return { exito: true, bonoClan, totalGrupo: nuevoTamanoGrupo };
  } catch (error) {
    console.error("Error al unirse a la misión secundaria:", error);
    return { exito: false, error };
  }
}