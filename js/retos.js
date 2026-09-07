import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);

const contenedorRetos = document.getElementById("contenedor-retos");

// Verificar sesión de usuario
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  
  // Cargar retos desde Firestore
  await cargarRetos();
});

async function cargarRetos() {
  contenedorRetos.innerHTML = "<p style='text-align:center; color:#fff;'>📜 Consultando los pergaminos del Gremio...</p>";

  try {
    // 1. Intentar obtener el reto actual
    const docActual = await getDoc(doc(db, "retos", "actual"));

    if (!docActual.exists()) {
      contenedorRetos.innerHTML = `
        <div style="text-align: center; color: #fff; padding: 20px;">
          <h2>📜 No hay retos activos en este momento</h2>
          <p>Un administrador debe publicar el reto del mes desde el panel de control.</p>
        </div>
      `;
      return;
    }

    const reto = docActual.data();

    // 2. Formatear la lista de Rasgos y Cicatrices
    const listaRasgosHTML = (reto.rasgosOtorga && reto.rasgosOtorga.length > 0)
      ? reto.rasgosOtorga.map(r => `<span class="tag-huella rasgo">✨ ${r}</span>`).join(" ")
      : "<small>Sin rasgos asignados</small>";

    const listaCicatricesHTML = (reto.cicatricesOtorga && reto.cicatricesOtorga.length > 0)
      ? reto.cicatricesOtorga.map(c => `<span class="tag-huella cicatriz">👁️ ${c}</span>`).join(" ")
      : "<small>Sin cicatrices asignadas</small>";

    // 3. Renderizar la tarjeta del reto activo
    contenedorRetos.innerHTML = `
      <article class="tarjeta-reto">
        <div class="reto-portada-box">
          <img src="${reto.portadaUrl || 'https://via.placeholder.com/150x220?text=Sin+Portada'}" alt="${reto.titulo}" class="reto-portada">
        </div>
        
        <div class="reto-info">
          <span class="badge-mes">RETO ACTUAL</span>
          <h2 class="reto-titulo">${reto.titulo}</h2>
          <h4 class="reto-autor">por ${reto.autor}</h4>
          
          <div class="reto-detalles-grid">
            <p><strong>📖 Páginas:</strong> ${reto.paginas} (Bono de Prestigio)</p>
            <p><strong>🏷️ Género:</strong> <span style="text-transform: capitalize;">${reto.genero}</span></p>
          </div>

          <p class="reto-descripcion">${reto.descripcion}</p>

          <div class="seccion-recompensas">
            <h3>🎁 Recompensas al completar:</h3>
            <div class="bloque-huellas">
              <strong>Rasgos:</strong>
              <div class="contenedor-tags">${listaRasgosHTML}</div>
            </div>
            <div class="bloque-huellas" style="margin-top: 8px;">
              <strong>Cicatrices:</strong>
              <div class="contenedor-tags">${listaCicatricesHTML}</div>
            </div>
          </div>
        </div>
      </article>
    `;

  } catch (error) {
    console.error("Error al cargar los retos:", error);
    contenedorRetos.innerHTML = `
      <div style="text-align: center; color: #ff6b6b; padding: 20px;">
        ❌ Hubo un error al conectar con la biblioteca del Gremio.
      </div>
    `;
  }
}