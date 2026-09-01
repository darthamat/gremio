import { db } from './firebase-config.js'; // Ajusta a la ruta de tu configuración de Firebase
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

async function cargarRetoMensual() {
  try {
    // Referencia al documento del reto actual en Firestore (ejemplo: colección 'retos', doc 'actual')
    const docRef = doc(db, 'retos', 'actual');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Inyectar datos en el libro mágico
      if (data.portadaUrl) {
        document.getElementById('book-cover').src = data.portadaUrl;
      }
      document.getElementById('book-title').textContent = data.titulo || 'Misión Sin Título';
      document.getElementById('book-author').textContent = `Por: ${data.autor || 'Desconocido'}`;
      document.getElementById('book-description').textContent = data.descripcion || 'Sin descripción disponible.';
      document.getElementById('expedition-name').textContent = data.nombreExpedicion || 'Expedición Activa';
    } else {
      console.log("No se encontró el reto mensual en Firestore.");
    }
  } catch (error) {
    console.error("Error al obtener el reto de Firebase:", error);
  }
}

// Ejecutar al cargar el DOM
document.addEventListener('DOMContentLoaded', cargarRetoMensual);