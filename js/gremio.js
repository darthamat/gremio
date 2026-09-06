import { db } from 'js/firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

async function cargarRetoActualGremio() {
  try {
    const docRef = doc(db, 'retos', 'actual');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      // Inyectar datos en la interfaz del Gremio
      const imgCover = document.getElementById('book-cover');
      if (imgCover && data.portadaUrl) imgCover.src = data.portadaUrl;

      document.getElementById('book-title').textContent = data.titulo || 'Misión Sin Título';
      document.getElementById('book-description').textContent = data.descripcion || 'Sin descripción.';
      
      const elPuntos = document.getElementById('book-puntos');
      if (elPuntos) elPuntos.textContent = `${data.puntosPrestigio || 0} Pts Prestigio`;
    } else {
      console.warn("⚠️ No hay ningún reto activo configurado en 'actual'.");
    }
  } catch (error) {
    console.error("❌ Error al obtener el reto del Gremio:", error);
  }
}

document.addEventListener('DOMContentLoaded', cargarRetoActualGremio);