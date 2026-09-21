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
 * 🗺️ Auxiliar para pintar el Hexágono del Atlas por Género
 */
async function actualizarAtlasGenero(userId, genero, tituloLibro) {
  if (!genero) return;
  const generoId = genero.toLowerCase().trim();
  const atlasRef = doc(db, `aventureros/${userId}/atlas`, generoId);

  await setDoc(atlasRef, {
    genero: genero,
    librosLeidos: increment(1),
    ultimoLibro: tituloLibro,
    ultimaActualizacion: serverTimestamp()
  }, { merge: true });
}

/**
 * 📚 1. REGISTRO DE LECTURA LIBRE (Desde la Biblioteca o Perfil)
 */
export async function registrarLecturaLibre(usuarioUid, datosLibro) {
  try {
    const paginas = Number(datosLibro.paginas) || 0;
    const portada = datosLibro.portadaUrl || datosLibro.portada || "https://via.placeholder.com/150x220?text=Sin+Portada";
    const libroId = generarIdLibro(datosLibro);
    const genero = datosLibro.genero || "Fantasía";
    const generoNorm = genero.toLowerCase().trim();
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
      genero: genero,
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
      genero: genero,
      colorLomo: colorLomo,
      fechaFinLectura: serverTimestamp(),
      esReto: false,
      retoId: null
    }, { merge: true });

    // C. Actualizar estadísticas en la ficha del aventurero
    const userRef = doc(db, "aventureros", usuarioUid);
    await updateDoc(userRef, {
      
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

    // D. Iluminar Hexágono en el Atlas
    await actualizarAtlasGenero(usuarioUid, genero, datosLibro.titulo);

    console.log("✅ Lectura libre guardada en 'biblioteca', 'misLibros' y 'Atlas' con ID:", libroId);
    return { 
      exito: true, 
      libroId, 
      prestigio: prestigioGanado, 
      marcapaginas: marcapaginasGanados, 
      xp: 0 
    };

  } catch (error) {
    console.error("❌ Error al registrar lectura libre:", error);
    return { exito: false, error };
  }
}

/**
 * 🏆 2. COMPLETAR RETO DEL GREMIO (Desde retos.js)
 * NOTA DE ARQUITECTURA: retos.js ya incrementa XP/Páginas/Prestigio del aventurero.
 * Esta función solo registra la obra en las colecciones de Biblioteca, Estantería y Atlas.
 */
export async function completarRetoGremio(usuarioUid, datosReto) {
  try {
    const paginas = Number(datosReto.paginas) || 0;
    const genero = datosReto.genero || "Fantasía";
    const generoNorm = genero.toLowerCase().trim();
    const colorLomo = datosReto.colorLomo || COLORES_GENERO_LOMO[generoNorm] || COLORES_GENERO_LOMO["default"];
    const portada = datosReto.portadaUrl || datosReto.portada || "https://via.placeholder.com/150x220?text=Sin+Portada";
    
    const retoId = datosReto.id; 
    const libroId = generarIdLibro(datosReto);

    // A. Colección global 'biblioteca'
    const libroRef = doc(db, "biblioteca", libroId);
    await setDoc(libroRef, {
      titulo: datosReto.titulo || datosReto.libro || "Misión del Gremio",
      autor: datosReto.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: genero,
      colorLomo: colorLomo,
      isbn: datosReto.isbn || null,
      lectores: arrayUnion(usuarioUid),
      totalLectores: increment(1),
      retosAsociados: retoId ? arrayUnion(retoId) : []
    }, { merge: true });

    // B. Registro personal en aventureros/{uid}/misLibros/{libroId}
    const miLibroRef = doc(db, "aventureros", usuarioUid, "misLibros", libroId);
    await setDoc(miLibroRef, {
      libroId: libroId,
      titulo: datosReto.titulo || datosReto.libro || "Misión del Gremio",
      autor: datosReto.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: genero,
      colorLomo: colorLomo,
      fechaFinLectura: serverTimestamp(),
      esReto: true,
      retoId: retoId || null
    }, { merge: true });

    // C. Añadir libro a la estantería del aventurero (sin duplicar contadores de XP/Páginas)
    const userRef = doc(db, "aventureros", usuarioUid);
    await updateDoc(userRef, {
      estanteria: arrayUnion({
        id: libroId,
        titulo: datosReto.titulo || datosReto.libro,
        autor: datosReto.autor || "Desconocido",
        paginas: paginas,
        colorLomo: colorLomo
      })
    });

    // D. Iluminar Hexágono en el Atlas
    await actualizarAtlasGenero(usuarioUid, genero, datosReto.titulo || datosReto.libro);

    console.log(`✅ Reto '${retoId}' registrado en Biblioteca, Estantería y Atlas para el aventurero ${usuarioUid}`);
    return { exito: true, libroId };

  } catch (error) {
    console.error("❌ Error al registrar reto en gestorLibros:", error);
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

    const userSnap = await getDoc(doc(db, "aventureros", userId));
    const nombreCreador = userSnap.exists() ? (userSnap.data().nombre || "Un Aventurero") : "Un Aventurero";

    const nuevaMisionRef = await addDoc(collection(db, "misionesSecundarias"), {
      titulo: datosMision.titulo,
      libro: datosMision.titulo,
      autor: datosMision.autor || "Desconocido",
      paginas: paginas,
      genero: datosMision.genero || "Fantasía",
      portadaUrl: datosMision.portadaUrl || datosMision.portada || "https://via.placeholder.com/150x220?text=Sin+Portada",
      creadorNombre: nombreCreador,
      creadorId: userId,
      activa: true,
      mensajeProponente: datosMision.proclama || `¡Aventureros! Os convoco a explorar el reino de ${datosMision.titulo}.`,
      usuariosAceptaron: [userId],
      usuariosCompletaron: esCompletadaDirecta ? [userId] : [],
      fechaCreacion: serverTimestamp()
    });

    if (esCompletadaDirecta) {
      await registrarLibroEnBibliotecaYAtlas(userId, {
        id: nuevaMisionRef.id,
        titulo: datosMision.titulo,
        autor: datosMision.autor,
        paginas: paginas,
        genero: datosMision.genero || "Fantasía",
        portadaUrl: datosMision.portadaUrl || datosMision.portada
      });
    }

    return { exito: true, id: nuevaMisionRef.id };
  } catch (error) {
    console.error("Error al crear la misión secundaria:", error);
    return { exito: false, error };
  }
}

/**
 * 🛡️ 4. UNIRSE A UNA MISIÓN SECUNDARIA
 */
export async function unirseAMisionSecundaria(userId, misionId) {
  try {
    const misionRef = doc(db, "misionesSecundarias", misionId);
    const misionSnap = await getDoc(misionRef);

    if (!misionSnap.exists()) return { exito: false, mensaje: "La misión no existe." };

    const datosMision = misionSnap.data();
    const aceptaron = datosMision.usuariosAceptaron || [];

    if (aceptaron.includes(userId)) {
      return { exito: false, mensaje: "Ya estás unido a esta expedición." };
    }

    await updateDoc(misionRef, {
      usuariosAceptaron: arrayUnion(userId)
    });

    const bonoClan = 100;
    const userRef = doc(db, "aventureros", userId);
    await updateDoc(userRef, {
      prestigio: increment(bonoClan)
    });

    return { exito: true, bonoClan };
  } catch (error) {
    console.error("Error al unirse a la misión secundaria:", error);
    return { exito: false, error };
  }
}

/**
 * 🗺️ 5. MISIONES SECUNDARIAS -> BIBLIOTECA Y ATLAS
 * Guarda en aventureros/{userId}/misLibros, en la colección global 'biblioteca', añade a la estantería y actualiza el Atlas.
 */
export async function registrarLibroEnBibliotecaYAtlas(userId, datosLibro) {
  try {
    const libroId = datosLibro.id || generarIdLibro(datosLibro);
    const genero = datosLibro.genero || "Fantasía";
    const generoNorm = genero.toLowerCase().trim();
    const paginas = Number(datosLibro.paginas) || 0;
    const portada = datosLibro.portadaUrl || datosLibro.portada || "https://via.placeholder.com/150x220?text=Sin+Portada";
    const colorLomo = datosLibro.colorLomo || COLORES_GENERO_LOMO[generoNorm] || COLORES_GENERO_LOMO["default"];

    // 1. Biblioteca Personal (misLibros)
    const libroRef = doc(db, `aventureros/${userId}/misLibros`, libroId);
    await setDoc(libroRef, {
      libroId: libroId,
      titulo: datosLibro.titulo,
      autor: datosLibro.autor || "Desconocido",
      genero: genero,
      paginas: paginas,
      portadaUrl: portada,
      fechaFinLectura: datosLibro.fechaTerminado || serverTimestamp(),
      esMisionSecundaria: true
    }, { merge: true });

    // 2. Biblioteca Global
    const globalRef = doc(db, "biblioteca", libroId);
    await setDoc(globalRef, {
      titulo: datosLibro.titulo,
      autor: datosLibro.autor || "Desconocido",
      genero: genero,
      paginas: paginas,
      portadaUrl: portada,
      lectores: arrayUnion(userId),
      totalLectores: increment(1)
    }, { merge: true });

    // 3. Estantería del Perfil
    const userRef = doc(db, "aventureros", userId);
    await updateDoc(userRef, {
      estanteria: arrayUnion({
        id: libroId,
        titulo: datosLibro.titulo,
        autor: datosLibro.autor || "Desconocido",
        paginas: paginas,
        colorLomo: colorLomo
      })
    });

    // 4. Atlas (Pinta Hexágono por género)
    await actualizarAtlasGenero(userId, genero, datosLibro.titulo);

    console.log(`✅ Misión Secundaria "${datosLibro.titulo}" registrada en misLibros, biblioteca global, estantería y Atlas.`);
    return { exito: true };
  } catch (error) {
    console.error("❌ Error registrando libro en biblioteca/atlas:", error);
    return { exito: false, error };
  }
}