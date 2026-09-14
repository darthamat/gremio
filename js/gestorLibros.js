// js/gestorLibros.js
import { 
  getFirestore, 
  doc, 
  setDoc, 
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

// Colores por defecto para los lomos según su género
const COLORES_GENERO_LOMO = {
  "ficción": "#c0392b",
  "fantasía": "#27ae60",
  "ciencia ficción": "#2980b9",
  "historia": "#d35400",
  "misterio": "#8e44ad",
  "terror": "#000000",
  "default": "#8b263e"
};

/**
 * Función auxiliar para generar un ID único y limpio para cada libro
 */
function generarIdLibro(datosLibro) {
  if (datosLibro.isbn) return datosLibro.isbn.trim();
  
  const titulo = datosLibro.titulo || datosLibro.libro || "libro-desconocido";
  return titulo
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-');
}

/**
 * 📚 1. REGISTRO DE LECTURA LIBRE (Desde la Biblioteca o Perfil)
 */
export async function registrarLecturaLibre(usuarioUid, datosLibro) {
  try {
    const paginas = Number(datosLibro.paginas) || 0;
    const portada = datosLibro.portadaUrl || datosLibro.portada || "https://via.placeholder.com/150x220?text=Sin+Portada";
    const libroId = generarIdLibro(datosLibro);
    const generoNorm = (datosLibro.genero || "ficción").toLowerCase().trim();
    const colorLomo = datosLibro.colorLomo || COLORES_GENERO_LOMO[generoNorm] || COLORES_GENERO_LOMO["default"];

    // Fórmulas de Recompensas
    const bonusPrestigio = paginas > 0 ? Math.floor(Math.random() * paginas) + 1 : 0;
    const prestigioGanado = paginas + bonusPrestigio;
    const marcapaginasGanados = paginas > 0 ? Math.floor(Math.random() * paginas) + 1 : 1;

    // A. Guardar/Actualizar en la colección global 'biblioteca'
    const libroRef = doc(db, "biblioteca", libroId);
    await setDoc(libroRef, {
      titulo: datosLibro.titulo || "Libro sin título",
      autor: datosLibro.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: datosLibro.genero || "General",
      colorLomo: colorLomo,
      isbn: datosLibro.isbn || null,
      lectores: arrayUnion(usuarioUid),
      totalLectores: increment(1)
    }, { merge: true });

    // B. Guardar registro personal en aventureros/{uid}/misLibros/{libroId}
    const miLibroRef = doc(db, "aventureros", usuarioUid, "misLibros", libroId);
    await setDoc(miLibroRef, {
      libroId: libroId,
      titulo: datosLibro.titulo || "Libro sin título",
      autor: datosLibro.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: datosLibro.genero || "General",
      colorLomo: colorLomo,
      fechaFinLectura: serverTimestamp(),
      esReto: false,
      retoId: null
    }, { merge: true });

    // C. Actualizar estadísticas en la ficha del aventurero
    const userRef = doc(db, "aventureros", usuarioUid);
    await updateDoc(userRef, {
      xp: increment(paginas),
      prestigio: increment(prestigioGanado),
      marcapaginas: increment(marcapaginasGanados),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1),
      estanteria: arrayUnion({
        id: libroId,
        titulo: datosLibro.titulo,
        autor: datosLibro.autor,
        paginas: paginas,
        colorLomo: colorLomo
      })
    });

    console.log("✅ Lectura libre guardada en 'biblioteca' y 'misLibros' con ID:", libroId);
    return { 
      exito: true, 
      libroId, 
      prestigio: prestigioGanado, 
      marcapaginas: marcapaginasGanados, 
      xp: paginas 
    };

  } catch (error) {
    console.error("❌ Error al registrar lectura libre:", error);
    return { exito: false, error };
  }
}

/**
 * 🏆 2. COMPLETAR RETO DEL GREMIO (Desde retos.js)
 */
export async function completarRetoGremio(usuarioUid, datosReto) {
  try {
    const paginas = Number(datosReto.paginas) || 0;
    const generoNorm = (datosReto.genero || "ficción").toLowerCase().trim();
    const colorLomo = datosReto.colorLomo || COLORES_GENERO_LOMO[generoNorm] || COLORES_GENERO_LOMO["default"];
    const portada = datosReto.portadaUrl || datosReto.portada || "https://via.placeholder.com/150x220?text=Sin+Portada";
    
    // ID del reto (ej: "reto26_09")
    const retoId = datosReto.id; 

    if (!retoId) {
      console.warn("⚠️ Advertencia: No se proporcionó un id de reto en datosReto.");
    }

    // Generar un ID único para el libro en biblioteca global
    const libroId = generarIdLibro(datosReto);
    const libroRef = doc(db, "biblioteca", libroId);

    // A. Guardar o actualizar en la colección principal 'biblioteca'
    await setDoc(libroRef, {
      titulo: datosReto.titulo || datosReto.libro || "Misión del Gremio",
      autor: datosReto.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: datosReto.genero || "Fantasía",
      colorLomo: colorLomo,
      isbn: datosReto.isbn || null,
      lectores: arrayUnion(usuarioUid),
      totalLectores: increment(1),
      retosAsociados: retoId ? arrayUnion(retoId) : []
    }, { merge: true });

    // B. Guardar registro personal en aventureros/{uid}/misLibros/{libroId}
    const miLibroRef = doc(db, "aventureros", usuarioUid, "misLibros", libroId);
    await setDoc(miLibroRef, {
      libroId: libroId,
      titulo: datosReto.titulo || datosReto.libro || "Misión del Gremio",
      autor: datosReto.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: datosReto.genero || "Fantasía",
      colorLomo: colorLomo,
      fechaFinLectura: serverTimestamp(),
      esReto: true,
      retoId: retoId || null
    }, { merge: true });

    // C. Guardar el ID del reto y stats en el documento del aventurero
    const userRef = doc(db, "aventureros", usuarioUid);
    const actualizacionAventurero = {
      xp: increment(paginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1),
      prestigio: increment(paginas)
    };

    if (retoId) {
      actualizacionAventurero.retosCompletados = arrayUnion(retoId);
      actualizacionAventurero.retosAceptados = arrayUnion(retoId);
    }

    await updateDoc(userRef, actualizacionAventurero);

    console.log(`✅ Reto '${retoId}' completado y registrado para el aventurero ${usuarioUid}`);
    return { exito: true, libroId };

  } catch (error) {
    console.error("❌ Error al completar reto en gestorLibros:", error);
    return { exito: false, error };
  }
}

/**
 * ⚔️ 3. REGISTRO DE MISIÓN SECUNDARIA (Desde Perfil/Misiones)
 */
export async function crearMisionSecundaria(userId, datosMision) {
  try {
    const paginas = Number(datosMision.paginas) || 0;
    const esCompletadaDirecta = datosMision.estado === "TERMINADA";

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
      participantes: [userId],
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
 * 🛡️ 4. UNIRSE A UNA MISIÓN SECUNDARIA EN GRUPO / CLAN
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

    // 2. Otorgar BONO DE CLAN
    const nuevoTamanoGrupo = participantes.length + 1;
    const bonoClan = 100;

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