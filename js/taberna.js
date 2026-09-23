// js/taberna.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  arrayUnion, 
  Timestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let userDataActual = {};
let seccionActiva = "retos"; // 'retos' o 'misiones'

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;
  const userSnap = await getDoc(doc(db, "aventureros", user.uid));
  if (userSnap.exists()) {
    userDataActual = userSnap.data();
  }

  inicializarTabs();
  cargarHilosTaberna(seccionActiva);
});

function inicializarTabs() {
  const botones = document.querySelectorAll(".btn-tab-foro");
  botones.forEach(btn => {
    btn.addEventListener("click", () => {
      botones.forEach(b => b.classList.remove("activo"));
      btn.classList.add("activo");
      seccionActiva = btn.getAttribute("data-seccion");
      cargarHilosTaberna(seccionActiva);
    });
  });
}

async function cargarHilosTaberna(tipoSeccion) {
  const contenedor = document.getElementById("contenedor-hilos");
  if (!contenedor) return;

  contenedor.innerHTML = `<p style="text-align: center; font-style: italic;">Consultando los anales del foro...</p>`;

  try {
    const querySnapshot = await getDocs(collection(db, "taberna_hilos"));
    const hilos = [];

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (data.tipo === tipoSeccion) {
        hilos.push({ id: docSnap.id, ...data });
      }
    });

    if (hilos.length === 0) {
      contenedor.innerHTML = `
        <div style="text-align: center; padding: 40px; background: rgba(243,229,171,0.1); border: 2px dashed #8b5a2b; border-radius: 6px;">
          <p>🍺 Aún no hay debates abiertos en esta sección.</p>
          <small>¡Sé el primero en completar una lectura y abrir el fuego en la taberna!</small>
        </div>`;
      return;
    }

    contenedor.innerHTML = "";
    hilos.forEach(hilo => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "hilo-card";

      // Calcular nota media
      const comentarios = hilo.comentarios || [];
      let sumaNotas = 0;
      comentarios.forEach(c => sumaNotas += Number(c.puntuacion || 0));
      const notaMedia = comentarios.length > 0 ? (sumaNotas / comentarios.length).toFixed(1) : "N/A";

      tarjeta.innerHTML = `
        <h3 class="hilo-titulo">
          <span>📖 ${hilo.tituloLibro} <small style="font-size:0.8rem; color:#5c4033;">(${hilo.autor})</small></span>
          <span class="estrellas-badge">⭐ Media: ${notaMedia} / 10</span>
        </h3>
        <p style="font-size: 0.9rem; margin-bottom: 15px;"><em>Iniciado por un aventurero del Gremio</em></p>
        
        <div class="lista-comentarios">
          ${comentarios.length === 0 ? '<p style="font-size:0.85rem; color:#5c4033;">Nadie ha opinado todavía. ¡Sé el primero!</p>' : ''}
          ${comentarios.map(c => `
            <div class="comentario-item">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: #2a150c; font-size: 0.9rem;">${c.nombreUsuario}</strong>
                <span class="estrellas-badge">⭐ ${c.puntuacion}/10</span>
              </div>
              <p style="margin: 0; font-size: 0.9rem; color: #3b2219;">${c.opinion}</p>
            </div>
          `).join('')}
        </div>

        <div class="form-comentario">
          <label style="font-weight: bold; font-size: 0.9rem; display: block;">Dejar tu reseña y puntuación:</label>
          <div style="display: flex; gap: 10px; margin-top: 5px; align-items: center;">
            <label style="font-size: 0.85rem;">Nota:</label>
            <select id="select-nota-${hilo.id}">
              <option value="10">10 - Obra Maestra 🌟</option>
              <option value="9">9 - Excepcional</option>
              <option value="8">8 - Muy Notable</option>
              <option value="7">7 - Notable</option>
              <option value="6">6 - Bien</option>
              <option value="5">5 - Pasable</option>
              <option value="4">4 - Mediocre</option>
              <option value="3">3 - Flojo</option>
              <option value="2">2 - Malo</option>
              <option value="1">1 - Infumable</option>
            </select>
          </div>
          <textarea id="text-opinion-${hilo.id}" rows="2" placeholder="¿Qué te ha parecido? ¿Qué destacarías o qué no te gustó?"></textarea>
          <button type="button" class="btn-enviar-opinion" onclick="window.enviarOpinionHilo('${hilo.id}')">💬 Publicar Opinión</button>
        </div>
      `;

      contenedor.appendChild(tarjeta);
    });

  } catch (err) {
    console.error("Error al cargar la taberna:", err);
    contenedor.innerHTML = "<p style='color: red; text-align: center;'>Error al invocar los murmullos de la taberna.</p>";
  }
}

// Función global para que los botones de los hilos funcionen
window.enviarOpinionHilo = async function(hiloId) {
  const selectNota = document.getElementById(`select-nota-${hiloId}`);
  const textOpinion = document.getElementById(`text-opinion-${hiloId}`);

  if (!selectNota || !textOpinion) return;
  const puntuacion = Number(selectNota.value);
  const opinion = textOpinion.value.trim();

  if (!opinion) {
    alert("Por favor, escribe una breve opinión antes de publicar.");
    return;
  }

  try {
    const hiloRef = doc(db, "taberna_hilos", hiloId);
    const nuevoComentario = {
      userId: currentUser.uid,
      nombreUsuario: userDataActual.nombre || "Aventurero Anónimo",
      puntuacion: puntuacion,
      opinion: opinion,
      fecha: new Date().toISOString()
    };

    await updateDoc(hiloRef, {
      comentarios: arrayUnion(nuevoComentario)
    });

    alert("🍺 ¡Tu opinión ha resonado en la Taberna!");
    textOpinion.value = "";
    cargarHilosTaberna(seccionActiva);

  } catch (err) {
    console.error("Error al publicar opinión:", err);
    alert("No se pudo registrar tu opinión en el foro.");
  }
};

// Añade esto en js/taberna.js
export async function asegurarHiloTaberna(userId, datosLibro, tipoSeccion) {
  try {
    // Generamos un ID único para el hilo basado en el título limpio
    const hiloId = datosLibro.titulo.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    const hiloRef = doc(db, "taberna_hilos", hiloId);
    
    const snap = await getDoc(hiloRef);
    if (!snap.exists()) {
      // Si el hilo no existe, este aventurero se convierte en el fundador del debate
      await setDoc(hiloRef, {
        tipo: tipoSeccion, // 'retos' o 'misiones'
        tituloLibro: datosLibro.titulo,
        autor: datosLibro.autor || "Desconocido",
        creadorHiloId: userId,
        comentarios: []
      });
    }
  } catch (err) {
    console.error("Error al asegurar el hilo en la taberna:", err);
  }
}