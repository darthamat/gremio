import { 
  getFirestore, 
  collection, 
  getDocs, 
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
 * Genera un ID normalizado a partir del título del libro
 */
export function generarLibroId(titulo) {
  return titulo
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-");
}

/**
 * 📚 Registrar o vincular un libro en la biblioteca global
 */
export async function registrarEnBibliotecaGlobal(usuarioUid, datosLibro, esReto = false) {
  const libroId = datosLibro.id || generarLibroId(datosLibro.titulo);
  const libroRef = doc(db, "biblioteca", libroId);
  const snap = await getDoc(libroRef);

  if (!snap.exists()) {
    // Si el libro no existía en el catálogo global, lo crea
    await setDoc(libroRef, {
      id: libroId,
      titulo: datosLibro.titulo,
      autor: datosLibro.autor || "Desconocido",
      portadaUrl: datosLibro.portadaUrl || "img/placeholder-book.jpg",
      paginas: Number(datosLibro.paginas) || 0,
      genero: datosLibro.genero || (esReto ? "Fantasía" : "Ficción"),
      esReto: esReto,
      lectores: [usuarioUid],
      totalLectores: 1,
      fechaRegistro: new Date().toISOString()
    });
  } else {
    // Si ya existe en la biblioteca global, agrega al usuario a la lista de lectores
    const dataLibro = snap.data();
    const yaEsLector = dataLibro.lectores?.includes(usuarioUid);

    if (!yaEsLector) {
      await updateDoc(libroRef, {
        lectores: arrayUnion(usuarioUid),
        totalLectores: increment(1)
      });
    }
  }

  return libroId;
}

/**
 * 📖 Obtener todos los libros registrados en la biblioteca global (para selectores o catálogo)
 */
export async function obtenerBibliotecaGlobal() {
  try {
    const colRef = collection(db, "biblioteca");
    const snapshot = await getDocs(colRef);
    const catálogo = [];
    snapshot.forEach(docSnap => {
      catálogo.push(docSnap.data());
    });
    return catálogo;
  } catch (error) {
    console.error("Error al obtener la biblioteca global:", error);
    return [];
  }
}