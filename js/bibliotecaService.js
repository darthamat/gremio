import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  writeBatch,
  arrayUnion, 
  increment,
  serverTimestamp 
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
      portadaUrl: datosLibro.portadaUrl || datosLibro.portada || "img/placeholder-book.jpg",
      paginas: Number(datosLibro.paginas) || 0,
      genero: datosLibro.genero || (esReto ? "Fantasía" : "Ficción"),
      esReto: esReto,
      retoId: datosLibro.idMes || datosLibro.retoId || null,
      lectores: usuarioUid ? [usuarioUid] : [],
      totalLectores: usuarioUid ? 1 : 0,
      fechaRegistro: new Date().toISOString()
    });
  } else if (usuarioUid) {
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
 * 📖 Obtener todos los libros registrados en la biblioteca global
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

/**
 * ⚔️ Marca un reto como completado para un aventurero de forma atómica
 */
export async function completarRetoAventurero(uid, datosReto) {
  const libroId = datosReto.id || generarLibroId(datosReto.titulo || datosReto.libro);
  
  const userRef = doc(db, "aventureros", uid);
  const libroUserRef = doc(db, "aventureros", uid, "libros", libroId);
  const libroGlobalRef = doc(db, "biblioteca", libroId);

  const batch = writeBatch(db);

  // A. Guardar en la subcolección del aventurero
  batch.set(libroUserRef, {
    libroId: libroId,
    titulo: datosReto.titulo || datosReto.libro,
    autor: datosReto.autor || "Desconocido",
    portadaUrl: datosReto.portadaUrl || datosReto.portada || "img/placeholder-book.jpg",
    paginasTotales: Number(datosReto.paginas) || 0,
    estadoLectura: "COMPLETADO",
    tipoOrigen: "RETO_GREMIO",
    retoId: datosReto.idMes || datosReto.retoId || "reto_desconocido",
    fechaCompletado: serverTimestamp()
  }, { merge: true });

  // B. Otorgar puntos y recompensas al perfil del aventurero
  const puntosAGanar = Number(datosReto.puntosPrestigio || datosReto.puntos) || 0;
  const updateUsuario = {
    puntosPrestigio: increment(puntosAGanar),
    retosCompletadosCount: increment(1),
    librosLeidosCount: increment(1)
  };

  if (datosReto.rasgosOtorga && datosReto.rasgosOtorga.length > 0) {
    updateUsuario.rasgos = arrayUnion(...datosReto.rasgosOtorga);
  }
  if (datosReto.cicatricesOtorga && datosReto.cicatricesOtorga.length > 0) {
    updateUsuario.cicatrices = arrayUnion(...datosReto.cicatricesOtorga);
  }

  batch.update(userRef, updateUsuario);

  // C. Actualizar contador global de lectores en la biblioteca
  batch.set(libroGlobalRef, {
    lectores: arrayUnion(uid),
    totalLectores: increment(1)
  }, { merge: true });

  // Ejecutar todas las escrituras juntas
  await batch.commit();
}