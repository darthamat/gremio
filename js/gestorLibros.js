import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  increment 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);

/**
 * Normaliza un texto para generar un ID limpio en Firestore
 * Ej: "El Nombre del Viento" -> "el-nombre-del-viento"
 */
export function generarLibroId(titulo) {
  return titulo
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Elimina acentos
    .replace(/[^a-z0-9]/g, "-")      // Sustituye caracteres especiales por guiones
    .replace(/-+/g, "-");             // Elimina guiones dobles
}

/**
 * 1. REGISTRAR O VINCULAR LECTURA LIBRE
 * Añade un libro que el usuario leyó por su cuenta.
 */
export async function registrarLecturaLibre(usuarioUid, datosLibro) {
  try {
    const libroId = datosLibro.id || generarLibroId(datosLibro.titulo);
    const libroRef = doc(db, "libros", libroId);
    const libroSnap = await getDoc(libroRef);

    // A. Si el libro NO existe en la biblioteca global, lo creamos
    if (!libroSnap.exists()) {
      await setDoc(libroRef, {
        id: libroId,
        titulo: datosLibro.titulo,
        autor: datosLibro.autor || "Desconocido",
        portadaUrl: datosLibro.portadaUrl || "img/placeholder-book.jpg",
        paginas: Number(datosLibro.paginas) || 0,
        genero: datosLibro.genero || "No Ficción / Erudito",
        esReto: false,
        lectores: [usuarioUid],
        totalLectores: 1,
        fechaRegistro: new Date().toISOString()
      });
    } else {
      // B. Si ya existe, añadimos al usuario al array de lectores e incrementamos el contador
      await updateDoc(libroRef, {
        lectores: arrayUnion(usuarioUid),
        totalLectores: increment(1)
      });
    }

    // C. Actualizamos el expediente del aventurero
    const paginas = Number(datosLibro.paginas) || 0;
    const userRef = doc(db, "aventureros", usuarioUid);
    const userSnap = await getDoc(userRef);
    const xpActual = userSnap.exists() ? (userSnap.data().xp || 0) : 0;
    const paginasActuales = userSnap.exists() ? (userSnap.data().paginasLeidas || 0) : 0;
    const librosCompletadosActuales = userSnap.exists() ? (userSnap.data().librosCompletados || 0) : 0;

    const nuevaLecturaUsuario = {
      libroId: libroId,
      titulo: datosLibro.titulo,
      autor: datosLibro.autor || "Desconocido",
      portadaUrl: datosLibro.portadaUrl || "img/placeholder-book.jpg",
      paginas: paginas,
      genero: datosLibro.genero || "General",
      estado: "completado",
      esReto: false,
      fechaFin: new Date().toISOString()
    };

    await updateDoc(userRef, {
      lecturas: arrayUnion(nuevaLecturaUsuario),
      xp: xpActual + paginas,
      paginasLeidas: paginasActuales + paginas,
      librosCompletados: librosCompletadosActuales + 1
    });

    console.log(`✨ Lectura libre "${datosLibro.titulo}" registrada con éxito.`);
    return { exito: true, libroId };

  } catch (error) {
    console.error("Error al registrar lectura libre:", error);
    return { exito: false, error };
  }
}

/**
 * 2. COMPLETAR UN RETO DEL GREMIO
 * Sincroniza la finalización del reto con la biblioteca global y el aventurero.
 */
export async function completarRetoGremio(usuarioUid, retoData) {
  try {
    const libroId = retoData.libroId || generarLibroId(retoData.titulo);
    const libroRef = doc(db, "libros", libroId);
    const libroSnap = await getDoc(libroRef);

    const puntosRecompensa = Number(retoData.paginas) || 0;

    // A. Aseguramos la ficha en la colección global `/libros`
    if (!libroSnap.exists()) {
      await setDoc(libroRef, {
        id: libroId,
        titulo: retoData.titulo,
        autor: retoData.autor || "Desconocido",
        portadaUrl: retoData.portadaUrl || "img/placeholder-book.jpg",
        paginas: puntosRecompensa,
        genero: retoData.genero || "Fantasía",
        esReto: true,
        retoId: retoData.id,
        lectores: [usuarioUid],
        totalLectores: 1,
        fechaRegistro: new Date().toISOString()
      });
    } else {
      await updateDoc(libroRef, {
        lectores: arrayUnion(usuarioUid),
        totalLectores: increment(1)
      });
    }

    // B. Actualizamos al aventurero (Prestigio, XP, Lecturas y Misión Completada)
    const userRef = doc(db, "aventureros", usuarioUid);
    const userSnap = await getDoc(userRef);
    const usuarioData = userSnap.exists() ? userSnap.data() : {};

    const nuevaLectura = {
      libroId: libroId,
      titulo: retoData.titulo,
      autor: retoData.autor || "Desconocido",
      portadaUrl: retoData.portadaUrl || "img/placeholder-book.jpg",
      paginas: puntosRecompensa,
      genero: retoData.genero || "Fantasía",
      estado: "completado",
      esReto: true,
      retoId: retoData.id,
      fechaFin: new Date().toISOString()
    };

    await updateDoc(userRef, {
      retosCompletados: arrayUnion(retoData.id),
      prestigio: (usuarioData.prestigio || 0) + puntosRecompensa,
      xp: (usuarioData.xp || 0) + puntosRecompensa,
      paginasLeidas: (usuarioData.paginasLeidas || 0) + puntosRecompensa,
      librosCompletados: (usuarioData.librosCompletados || 0) + 1,
      lecturas: arrayUnion(nuevaLectura)
    });

    console.log(`🏆 Reto "${retoData.titulo}" completado y sincronizado en la Biblioteca Global.`);
    return { exito: true };

  } catch (error) {
    console.error("Error al completar el reto:", error);
    return { exito: false, error };
  }
}