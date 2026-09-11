import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { registrarEnBibliotecaGlobal } from "./bibliotecaService.js";

const db = getFirestore(app);

/**
 * 1. REGISTRAR LECTURA LIBRE
 */
export async function registrarLecturaLibre(usuarioUid, datosLibro) {
  try {
    // A. Asegura la ficha en la colección global 'biblioteca'
    const libroId = await registrarEnBibliotecaGlobal(usuarioUid, datosLibro, false);

    // B. Actualiza el expediente personal del aventurero
    const paginas = Number(datosLibro.paginas) || 0;
    const userRef = doc(db, "aventureros", usuarioUid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    const nuevaLecturaUsuario = {
      libroId: libroId,
      titulo: datosLibro.titulo,
      autor: datosLibro.autor || "Desconocido",
      portadaUrl: datosLibro.portadaUrl || "img/placeholder-book.jpg",
      paginas: paginas,
      genero: datosLibro.genero || "Ficción",
      estado: "completado",
      esReto: false,
      fechaFin: new Date().toISOString()
    };

    // Usamos setDoc con { merge: true } para crear el documento si no existía
    await setDoc(userRef, {
      lecturas: arrayUnion(nuevaLecturaUsuario),
      xp: (userData.xp || 0) + paginas,
      paginasLeidas: (userData.paginasLeidas || 0) + paginas,
      librosCompletados: (userData.librosCompletados || 0) + 1
    }, { merge: true });

    return { exito: true, libroId };
  } catch (error) {
    console.error("Error al registrar lectura libre:", error);
    return { exito: false, error };
  }
}

/**
 * 2. COMPLETAR RETO DEL GREMIO
 */
export async function completarRetoGremio(usuarioUid, retoData) {
  try {
    // A. Asegura la ficha en la colección global 'biblioteca'
    const libroId = await registrarEnBibliotecaGlobal(usuarioUid, retoData, true);
    const puntosRecompensa = Number(retoData.paginas) || 0;

    // B. Actualiza al aventurero
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

    // Usamos setDoc con { merge: true } para seguridad absoluta
    await setDoc(userRef, {
      retosCompletados: arrayUnion(retoData.id),
      prestigio: (usuarioData.prestigio || 0) + puntosRecompensa,
      xp: (usuarioData.xp || 0) + puntosRecompensa,
      paginasLeidas: (usuarioData.paginasLeidas || 0) + puntosRecompensa,
      librosCompletados: (usuarioData.librosCompletados || 0) + 1,
      lecturas: arrayUnion(nuevaLectura)
    }, { merge: true });

    return { exito: true };
  } catch (error) {
    console.error("Error al completar el reto:", error);
    return { exito: false, error };
  }
}