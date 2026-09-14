import { 
  getFirestore, 
  doc, 
  setDoc,
  updateDoc, 
  arrayUnion, 
  increment, 
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
 * 1. REGISTRAR LECTURA LIBRE
 */
export async function registrarLecturaLibre(usuarioUid, datosLibro) {
  try {
    const paginas = Number(datosLibro.paginas) || 0;
    const portada = datosLibro.portadaUrl || datosLibro.portada || "https://via.placeholder.com/150x220?text=Sin+Portada";
    const libroId = generarIdLibro(datosLibro);

    // Guardar/Actualizar en la colección global 'biblioteca'
    const libroRef = doc(db, "biblioteca", libroId);
    await setDoc(libroRef, {
      titulo: datosLibro.titulo || "Libro sin título",
      autor: datosLibro.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: datosLibro.genero || "General",
      isbn: datosLibro.isbn || null,
      lectores: arrayUnion(usuarioUid),
      totalLectores: increment(1)
    }, { merge: true });

    // Actualizar estadísticas en la ficha del aventurero
    const userRef = doc(db, "aventureros", usuarioUid);
    await updateDoc(userRef, {
      xp: increment(paginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1)
    });

    console.log("✅ Lectura libre guardada en 'biblioteca' con ID:", libroId);
    return { exito: true, libroId };

  } catch (error) {
    console.error("❌ Error al registrar lectura libre:", error);
    return { exito: false, error };
  }
}

/**
 * 2. COMPLETAR RETO DEL GREMIO
 */
export async function completarRetoGremio(usuarioUid, datosReto) {
  try {
    const paginas = Number(datosReto.paginas) || 0;
    const generoNorm = (datosReto.genero || "ficción").toLowerCase().trim();
    const colorLomo = COLORES_GENERO_LOMO[generoNorm] || COLORES_GENERO_LOMO["default"];
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

      // Control de lectores globales
      lectores: arrayUnion(usuarioUid),
      totalLectores: increment(1),
      retosAsociados: retoId ? arrayUnion(retoId) : []
    }, { merge: true });

    // B. Guardar el ID del reto en el documento del aventurero (ej: "reto26_09")
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

    // C. Guardar registro personal en la subcolección misLibros del aventurero
    const miLibroRef = doc(db, "aventureros", usuarioUid, "misLibros", libroId);
    await setDoc(miLibroRef, {
      libroId: libroId,
      titulo: datosReto.titulo || datosReto.libro,
      fechaCompletado: serverTimestamp(),
      esReto: true,
      retoId: retoId || null
    }, { merge: true });

    console.log(`✅ Reto '${retoId}' completado y registrado para el aventurero ${usuarioUid}`);
    return { exito: true, libroId };

  } catch (error) {
    console.error("❌ Error al completar reto en gestorLibros:", error);
    return { exito: false, error };
  }
}