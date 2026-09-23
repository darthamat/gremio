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
  arrayUnion 
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
  
  // Comprobar si venimos con un parámetro específico de reto o libro desde otra vista
  const urlParams = new URLSearchParams(window.location.search);
  const seccionUrl = urlParams.get('seccion');
  if (seccionUrl) {
    seccionActiva = seccionUrl;
    document.querySelectorAll(".btn-tab-foro").forEach(b => {
      b.classList.toggle("activo", b.getAttribute("data-seccion") === seccionActiva);
    });
  }

  await cargarHilosTaberna(seccionActiva);
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

export async function asegurarHiloTaberna(userId, datosLibro, tipoSeccion = 'retos') {
  try {
    const hiloId = `hilo_${(datosLibro.id || datosLibro.titulo).toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '_')}`;
    const hiloRef = doc(db, "taberna_hilos", hiloId);
    const snap = await getDoc(hiloRef);
    
    if (!snap.exists()) {
      await setDoc(hiloRef, {
        tipo: tipoSeccion, // 'retos' o 'misiones'
        tituloLibro: datosLibro.titulo,
        autor: datosLibro.autor || "Desconocido",
        portadaUrl: datosLibro.portadaUrl || "",
        creadorHiloId: userId,
        comentarios: []
      });
    }
  } catch (err) {
    console.error("Error al asegurar el hilo en la taberna:", err);
  }
}

async function cargarHilosTaberna(tipoSeccion) {
  const contenedor = document.getElementById("contenedor-hilos");
  if (!contenedor) return;

  contenedor.innerHTML = `<p style="text-align: center; font-style: italic; color: #f3e5ab;">Consultando los anales del foro en la Taberna...</p>`;

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
        <div style="text-align: center; padding: 40px; background: rgba(243,229,171,0.1); border: 2px dashed #8b5a2b; border-radius: 6px; color: #f3e5ab;">
          <p>🍺 Aún no hay debates abiertos en esta sección.</p>
          <small>¡Completa una lectura o un reto mensual para inaugurar el primer hilo de debate!</small>
        </div>`;
      return;
    }

    contenedor.innerHTML = "";
    hilos.forEach(hilo => {
      const tarjeta = document.createElement("div");
      tarjeta.className = "hilo-card";

      // Calcular nota media del 1 al 10
      const comentarios = hilo.comentarios || [];
      let sumaNotas = 0;
      comentarios.forEach(c => sumaNotas += Number(c.puntuacion || 0));
      const notaMedia = comentarios.length > 0 ? (sumaNotas / comentarios.length).toFixed(1) : "Sin calificar";

      tarjeta.innerHTML = `
        <div style="display: flex; gap: 15px; align-items: flex-start;">
          ${hilo.portadaUrl ? `<img src="${hilo.portadaUrl}" style="width: 70px; height: 100px; object-fit: cover; border-radius: 4px; border: 1px solid #8b5a2b;" onerror="this.style.display='none'">` : ''}
          <div style="flex-grow: 1;">
            <h3 class="hilo-titulo">
              <span>📖 ${hilo.tituloLibro} <small style="font-size:0.8rem; color:#5c4033;">(Autor: ${hilo.autor})</small></span>
              <span class="estrellas-badge">⭐ Media: ${notaMedia} / 10</span>
            </h3>
            <p style="font-size: 0.85rem; margin: 5px 0 15px 0; color: #5c4033; font-style: italic;">Hilo oficial de debate y reseñas de la comunidad.</p>
          </div>
        </div>
        
        <div class="lista-comentarios" style="margin-top: 15px;">
          <h4 style="margin: 0 0 10px 0; font-size: 0.95rem; color: #3b2219; border-bottom: 1px solid rgba(139,90,43,0.3); padding-bottom: 4px;">💬 Opiniones de los Aventureros (${comentarios.length}):</h4>
          ${comentarios.length === 0 ? '<p style="font-size:0.85rem; color:#5c4033; font-style:italic;">Nadie ha dejado su reseña todavía. ¡Sé el primero en puntuar y opinar!</p>' : ''}
          ${comentarios.map(c => `
            <div class="comentario-item">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: #2a150c; font-size: 0.9rem;">🛡️ ${c.nombreUsuario}</strong>
                <span class="estrellas-badge">⭐ Puntuación: ${c.puntuacion} / 10</span>
              </div>
              <p style="margin: 4px 0 0 0; font-size: 0.9rem; color: #3b2219; white-space: pre-line;">${c.opinion}</p>
            </div>
          `).join('')}
        </div>

        <div class="form-comentario">
          <label style="font-weight: bold; font-size: 0.9rem; display: block; margin-bottom: 5px;">✍️ Deja tu puntuación y opinión sobre la obra:</label>
          <div style="display: flex; gap: 10px; margin-bottom: 10px; align-items: center;">
            <label style="font-size: 0.85rem; font-weight: bold;">Puntuación (1 a 10):</label>
            <select id="select-nota-${hilo.id}" style="padding: 5px 10px; border-radius: 4px; border: 1px solid #8b5a2b; background: #fff8e7; font-weight: bold;">
              <option value="10">⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ 10 - Obra Maestra</option>
              <option value="9">⭐⭐⭐⭐⭐⭐⭐⭐⭐ 9 - Excelente</option>
              <option value="8">⭐⭐⭐⭐⭐⭐⭐⭐ 8 - Muy Notable</option>
              <option value="7">⭐⭐⭐⭐⭐⭐⭐ 7 - Notable</option>
              <option value="6" selected>⭐⭐⭐⭐⭐⭐ 6 - Bien</option>
              <option value="5">⭐⭐⭐⭐⭐ 5 - Pasable</option>
              <option value="4">⭐⭐⭐⭐ 4 - Mediocre</option>
              <option value="3">⭐⭐⭐ 3 - Flojo</option>
              <option value="2">⭐⭐ 2 - Malo</option>
              <option value="1">⭐ 1 - Infumable</option>
            </select>
          </div>
          <textarea id="text-opinion-${hilo.id}" rows="3" placeholder="¿Qué te ha parecido? ¿Qué destacarías de la trama, sus personajes o qué no te gustó?" style="width: 100%; padding: 10px; border: 1px solid #8b5a2b; background: #fff8e7; border-radius: 4px; font-family: inherit; box-sizing: border-box;"></textarea>
          <button type="button" class="btn-enviar-opinion" onclick="window.enviarOpinionHilo('${hilo.id}')">💬 Publicar Opinión en el Hilo</button>
        </div>
      `;

      contenedor.appendChild(tarjeta);
    });

  } catch (err) {
    console.error("Error al cargar la taberna:", err);
    contenedor.innerHTML = "<p style='color: #ff6b6b; text-align: center;'>Error al invocar los murmullos de la taberna.</p>";
  }
}

// Función global para publicar la opinión
window.enviarOpinionHilo = async function(hiloId) {
  const selectNota = document.getElementById(`select-nota-${hiloId}`);
  const textOpinion = document.getElementById(`text-opinion-${hiloId}`);

  if (!selectNota || !textOpinion) return;
  const puntuacion = Number(selectNota.value);
  const opinion = textOpinion.value.trim();

  if (!opinion) {
    alert("Por favor, escribe tu opinión antes de publicar.");
    return;
  }

  try {
    const hiloRef = doc(db, "taberna_hilos", hiloId);
    const nuevoComentario = {
      userId: currentUser.uid,
      nombreUsuario: userDataActual.nombre || "Aventurero del Gremio",
      puntuacion: puntuacion,
      opinion: opinion,
      fecha: new Date().toISOString()
    };

    await updateDoc(hiloRef, {
      comentarios: arrayUnion(nuevoComentario)
    });

    alert("🍺 ¡Tu reseña y puntuación han quedado grabadas en el hilo de la Taberna!");
    textOpinion.value = "";
    cargarHilosTaberna(seccionActiva);

  } catch (err) {
    console.error("Error al publicar opinión:", err);
    alert("No se pudo registrar tu opinión en el foro.");
  }
};