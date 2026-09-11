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
 * 1. REGISTRAR O VINCULAR LECTURA LIBRE
 */
export async function registrarLecturaLibre(usuarioUid, datosLibro) {
  try {
    const libroId = datosLibro.id || generarLibroId(datosLibro.titulo);
    const libroRef = doc(db, "libros", libroId);
    const libroSnap = await getDoc(libroRef);

    if (!libroSnap.exists()) {
      await setDoc(libroRef, {
        id: libroId,
        titulo: datosLibro.titulo,
        autor: datosLibro.autor || "Desconocido",
        portadaUrl: datosLibro.portadaUrl || "img/placeholder-book.jpg",
        paginas: Number(datosLibro.paginas) || 0,
        genero: datosLibro.genero || "Ficción",
        esReto: false,
        lectores: [usuarioUid],
        totalLectores: 1,
        fechaRegistro: new Date().toISOString()
      });
    } else {
      const dataLibro = libroSnap.data();
      const yaEsLector = dataLibro.lectores?.includes(usuarioUid);

      if (!yaEsLector) {
        await updateDoc(libroRef, {
          lectores: arrayUnion(usuarioUid),
          totalLectores: increment(1)
        });
      }
    }

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

    await updateDoc(userRef, {
      lecturas: arrayUnion(nuevaLecturaUsuario),
      xp: (userData.xp || 0) + paginas,
      paginasLeidas: (userData.paginasLeidas || 0) + paginas,
      librosCompletados: (userData.librosCompletados || 0) + 1
    });

    return { exito: true, libroId };

  } catch (error) {
    console.error("Error al registrar lectura libre:", error);
    return { exito: false, error };
  }
}

/**
 * 2. COMPLETAR UN RETO DEL GREMIO
 */
export async function completarRetoGremio(usuarioUid, retoData) {
  try {
    const libroId = retoData.libroId || generarLibroId(retoData.titulo);
    const libroRef = doc(db, "libros", libroId);
    const libroSnap = await getDoc(libroRef);

    const puntosRecompensa = Number(retoData.paginas) || 0;

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
      const dataLibro = libroSnap.data();
      const yaEsLector = dataLibro.lectores?.includes(usuarioUid);

      if (!yaEsLector) {
        await updateDoc(libroRef, {
          lectores: arrayUnion(usuarioUid),
          totalLectores: increment(1)
        });
      }
    }

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
      retosCompletados: arrayUnion(retoData.id), // Array de IDs para validar si completó la misión
      prestigio: (usuarioData.prestigio || 0) + puntosRecompensa,
      xp: (usuarioData.xp || 0) + puntosRecompensa,
      paginasLeidas: (usuarioData.paginasLeidas || 0) + puntosRecompensa,
      librosCompletados: (usuarioData.librosCompletados || 0) + 1,
      lecturas: arrayUnion(nuevaLectura) // Toda la metadata va al array 'lecturas'
    });

    return { exito: true };

  } catch (error) {
    console.error("Error al completar el reto:", error);
    return { exito: false, error };
  }
}