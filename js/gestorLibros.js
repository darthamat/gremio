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

// Colores por defecto para los lomos de retos del gremio según su género
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
export async function completarRetoGremio(userId, datosReto) {
  try {
    const paginas = Number(datosReto.paginas) || 0;
    const generoNorm = (datosReto.genero || "ficción").toLowerCase().trim();
    const colorLomo = COLORES_GENERO_LOMO[generoNorm] || COLORES_GENERO_LOMO["default"];

    // 1. Añadir el libro a la estantería personal del Aventurero
    const bibliotecaRef = collection(db, "aventureros", userId, "biblioteca");
    await addDoc(bibliotecaRef, {
      titulo: datosReto.titulo || "Misión del Gremio",
      autor: datosReto.autor || "Desconocido",
      paginas: paginas,
      genero: datosReto.genero || "Fantasía",
      color: colorLomo,
      portadaUrl: datosReto.portadaUrl || datosReto.portada || "img/placeholder-book.jpg",
      prestigioGanado: paginas,
      esRetoGremio: true,
      retoId: datosReto.id,
      completadoEn: new Date()
    });

    // 2. Actualizar las estadísticas del Aventurero (XP, Páginas, Prestigio y Retos Completados)
    const userRef = doc(db, "aventureros", userId);
    await updateDoc(userRef, {
      retosCompletados: arrayUnion(datosReto.id),
      retosAceptados: arrayUnion(datosReto.id), // Se asegura que quede en ambos arrays
      xp: increment(paginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1),
      prestigio: increment(paginas)
    });

    // 3. Registrar al usuario en el Reto como uno de los completadores (para el Atlas)
    const retoRef = doc(db, "retos", datosReto.id);
    await updateDoc(retoRef, {
      completadoPor: arrayUnion(userId)
    });

    return { exito: true };
  } catch (err) {
    console.error("Error al completar el reto en gestorLibros:", err);
    return { exito: false, error: err };
  }
}