import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc, 
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
 * 1. REGISTRAR LECTURA LIBRE
 * Crea un documento único en la colección global 'biblioteca' y actualiza las estadísticas del aventurero.
 */
export async function registrarLecturaLibre(usuarioUid, datosLibro) {
  try {
    const paginas = Number(datosLibro.paginas) || 0;
    const portada = datosLibro.portadaUrl || datosLibro.portada || "https://via.placeholder.com/150x220?text=Sin+Portada";

    // A. Guardar en la colección principal 'biblioteca' (ID aleatoria única)
    const docRef = await addDoc(collection(db, "biblioteca"), {
      titulo: datosLibro.titulo || "Libro sin título",
      autor: datosLibro.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: datosLibro.genero || "General",
      isbn: datosLibro.isbn || null,

      // Clasificación del Origen
      esReto: false,
      tipoOrigen: "LECTURA_LIBRE",
      retoId: null,

      // Control de Usuario y Fecha
      usuarioId: usuarioUid,
      fechaAgregado: serverTimestamp(),
      estadoLectura: datosLibro.estadoLectura || "COMPLETADO"
    });

    // B. Actualizar las estadísticas en la ficha del aventurero
    const userRef = doc(db, "aventureros", usuarioUid);
    await updateDoc(userRef, {
      xp: increment(paginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1)
    });

    console.log("✅ Lectura libre guardada en 'biblioteca' con ID:", docRef.id);
    return { exito: true, libroId: docRef.id };

  } catch (error) {
    console.error("❌ Error al registrar lectura libre:", error);
    return { exito: false, error };
  }
}

/**
 * 2. COMPLETAR RETO DEL GREMIO
 * Guarda el tomo del reto en la colección 'biblioteca' con ID única y otorga recompensas.
 */
export async function completarRetoGremio(usuarioUid, datosReto) {
  try {
    const paginas = Number(datosReto.paginas) || 0;
    const generoNorm = (datosReto.genero || "ficción").toLowerCase().trim();
    const colorLomo = COLORES_GENERO_LOMO[generoNorm] || COLORES_GENERO_LOMO["default"];
    const portada = datosReto.portadaUrl || datosReto.portada || "https://via.placeholder.com/150x220?text=Sin+Portada";

    // A. Guardar en la colección principal 'biblioteca' (ID aleatoria única)
    const docBibliotecaRef = await addDoc(collection(db, "biblioteca"), {
      titulo: datosReto.titulo || datosReto.libro || "Misión del Gremio",
      autor: datosReto.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: datosReto.genero || "Fantasía",
      colorLomo: colorLomo,
      isbn: datosReto.isbn || null,

      // Clasificación del Origen
      esReto: true,
      tipoOrigen: "RETO_GREMIO",
      retoId: datosReto.id || null,

      // Control de Usuario y Fecha
      usuarioId: usuarioUid,
      fechaAgregado: serverTimestamp(),
      estadoLectura: "COMPLETADO"
    });

    // B. Actualizar recompensas y listas del Aventurero
    const userRef = doc(db, "aventureros", usuarioUid);
    await updateDoc(userRef, {
      retosCompletados: arrayUnion(datosReto.id),
      retosAceptados: arrayUnion(datosReto.id),
      xp: increment(paginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1),
      prestigio: increment(paginas)
    });

    // C. Vincular al aventurero con el documento del reto
    if (datosReto.id) {
      const retoRef = doc(db, "retos", datosReto.id);
      await updateDoc(retoRef, {
        completadoPor: arrayUnion(usuarioUid)
      });
    }

    console.log("✅ Reto completado guardado en 'biblioteca' con ID:", docBibliotecaRef.id);
    return { exito: true, libroId: docBibliotecaRef.id };

  } catch (error) {
    console.error("❌ Error al completar reto en gestorLibros:", error);
    return { exito: false, error };
  }
}