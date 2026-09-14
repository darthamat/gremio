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
    const portada = datosReto.portadaUrl || datosReto.portada || "https://via.placeholder.com/150x220?text=Sin+Portada";
    
    // Generamos un ID único y limpio para el libro
    const libroId = generarIdLibro(datosReto);
    const libroRef = doc(db, "biblioteca", libroId);

    // 1. Guardar/Actualizar en la colección global 'biblioteca'
    await setDoc(libroRef, {
      titulo: datosReto.titulo || datosReto.libro || "Misión del Gremio",
      autor: datosReto.autor || "Desconocido",
      portadaUrl: portada,
      paginas: paginas,
      genero: datosReto.genero || "Fantasía",
      isbn: datosReto.isbn || null,

      // Añadimos al usuario al array de lectores e incrementamos el contador
      lectores: arrayUnion(usuarioUid),
      totalLectores: increment(1),
      retosAsociados: datosReto.id ? arrayUnion(datosReto.id) : []
    }, { merge: true }); // 👈 merge: true evita sobrescribir y crea si no existe

    // 2. Actualizar las estadísticas del Aventurero
    const userRef = doc(db, "aventureros", usuarioUid);
    await updateDoc(userRef, {
      retosCompletados: arrayUnion(datosReto.id),
      retosAceptados: arrayUnion(datosReto.id),
      xp: increment(paginas),
      paginasLeidas: increment(paginas),
      librosCompletados: increment(1),
      prestigio: increment(paginas)
    });

    // 3. Registrar en la subcolección personal de libros del aventurero (Historial propio)
    const miLibroRef = doc(db, "aventureros", usuarioUid, "misLibros", libroId);
    await setDoc(miLibroRef, {
      libroId: libroId,
      titulo: datosReto.titulo || datosReto.libro,
      fechaCompletado: serverTimestamp(),
      esReto: true,
      retoId: datosReto.id || null
    }, { merge: true });

    console.log(`✅ Libro registrado/actualizado en 'biblioteca' con ID: ${libroId}`);
    return { exito: true, libroId };

  } catch (error) {
    console.error("❌ Error al completar reto en gestorLibros:", error);
    return { exito: false, error };
  }
}