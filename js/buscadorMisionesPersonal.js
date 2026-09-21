// js/buscadorMisionesPersonal.js
import { getFirestore, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);

export function inicializarBotonMisionPersonal(userId, onMisionCreada) {
  // Aseguramos que el modal exista en el DOM
  asegurarModalEnHTML();

  const btnAbrir = document.getElementById("btn-abrir-modal-mision-personal") || document.getElementById("btn-abrir-buscador-mision");
  const modal = document.getElementById("modal-mision-personal");

  if (!btnAbrir) {
    console.warn("⚠️ No se encontró el botón de abrir misión en el perfil.");
    return;
  }

  // Abrir Modal
  btnAbrir.addEventListener("click", () => {
    if (modal) {
      modal.style.display = "flex";
      const input = document.getElementById("input-buscar-libro-api");
      if (input) input.focus();
    }
  });

  // Delegación de eventos global en el documento
  document.addEventListener("click", async (e) => {
    if (e.target && (e.target.id === "cerrar-modal-mision-personal" || e.target === modal)) {
      if (modal) modal.style.display = "none";
      return;
    }

    if (e.target && e.target.id === "btn-buscar-libro-api") {
      e.preventDefault();
      await ejecutarBusquedaGoogleBooks(userId);
    }
  });

  // Permitir buscar pulsando Enter
  document.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && e.target && e.target.id === "input-buscar-libro-api") {
      e.preventDefault();
      await ejecutarBusquedaGoogleBooks(userId);
    }
  });
}

// Función encargada de llamar a la API de Google Books y pintar los resultados
async function ejecutarBusquedaGoogleBooks(userIdParam) {
  const inputBusqueda = document.getElementById("input-buscar-libro-api");
  const contenedorResultados = document.getElementById("resultados-busqueda-libros");

  if (!inputBusqueda || !contenedorResultados) return;

  const query = inputBusqueda.value.trim();
  if (!query) {
    alert("⚠️ Escribe el título de un libro para buscar.");
    return;
  }

  contenedorResultados.innerHTML = `<p style="text-align:center; color: #d4af37; padding: 15px;">⏳ Buscando en los antiguos tomos...</p>`;

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`);
    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      contenedorResultados.innerHTML = `<p style="text-align:center; color: #ff6b6b; padding: 15px;">No se encontraron grimorios con ese título.</p>`;
      return;
    }

    contenedorResultados.innerHTML = "";
    
    data.items.forEach(item => {
      const info = item.volumeInfo;
      const titulo = info.title || "Sin título";
      const autor = info.authors ? info.authors.join(", ") : "Autor desconocido";
      const paginas = info.pageCount || 150;
      const portada = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200";

      const tarjetaLibro = document.createElement("div");
      tarjetaLibro.className = "resultado-libro-card";
      tarjetaLibro.style.cssText = "display: flex; align-items: center; background: #2d3748; padding: 10px; border-radius: 8px; margin-bottom: 8px; border: 1px solid #4a5568;";
      
      tarjetaLibro.innerHTML = `
        <img src="${portada.replace('http:', 'https:')}" alt="${titulo}" style="width: 45px; height: 65px; object-fit: cover; border-radius: 4px;">
        <div style="flex: 1; margin-left: 12px; overflow: hidden;">
          <h4 style="margin: 0; font-size: 0.95rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${titulo}</h4>
          <small style="color: #cbd5e0; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${autor}</small>
          <p style="margin: 4px 0 0; font-size: 0.8rem; color: #f6ad55;">📖 ${paginas} páginas</p>
        </div>
        <button class="btn-seleccionar-libro-item" style="background: #48bb78; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem;">Elegir</button>
      `;

      const btnElegir = tarjetaLibro.querySelector(".btn-seleccionar-libro-item");
      btnElegir.addEventListener("click", async () => {
        // Obtenemos el ID de usuario de forma síncrona y segura mediante la importación de getAuth
        const authUid = userIdParam || (auth.currentUser ? auth.currentUser.uid : null);
        
        if (!authUid) {
          alert("❌ Error: No se detectó la sesión del aventurero.");
          return;
        }

        const nuevaMision = {
          id: `mision_${Date.now()}`,
          titulo,
          autor,
          paginas,
          portadaUrl: portada.replace("http:", "https:"),
          portada: portada.replace("http:", "https:"),
          estado: "EN_PROGRESO",
          generos: info.categories ? [info.categories[0]] : ["Fantasía"],
          fechaCreacion: new Date().toISOString()
        };

        await guardarMisionPersonal(authUid, nuevaMision);

        const modal = document.getElementById("modal-mision-personal");
        if (modal) modal.style.display = "none";
        
        window.location.reload(); 
      });

      contenedorResultados.appendChild(tarjetaLibro);
    });

  } catch (err) {
    console.error("Error buscando libros en Google Books:", err);
    contenedorResultados.innerHTML = `<p style="text-align:center; color: #ff6b6b; padding: 15px;">❌ Error de conexión con Google Books.</p>`;
  }
}

async function guardarMisionPersonal(userId, misionData) {
  try {
    const userRef = doc(db, "aventureros", userId);
    await updateDoc(userRef, {
      misionesSecundarias: arrayUnion(misionData)
    });
    alert("⚔️ ¡Nueva misión secundaria aceptada y guardada en el grimorio!");
  } catch (err) {
    console.error("Error al guardar misión en Firestore:", err);
    alert("❌ No se pudo registrar la misión en tu perfil.");
  }
}

// Inyecta el HTML del modal automáticamente si no existe en el DOM
function asegurarModalEnHTML() {
  if (document.getElementById("modal-mision-personal")) return;

  const modalHtml = `
    <div id="modal-mision-personal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center;">
      <div style="background: #1a202c; padding: 25px; border-radius: 12px; width: 90%; max-width: 500px; border: 1px solid #4a5568; box-shadow: 0 10px 25px rgba(0,0,0,0.5); color: #fff; font-family: inherit;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #f6ad55; font-size: 1.2rem;">📜 Explorar Tomos en Google Books</h3>
          <button id="cerrar-modal-mision-personal" style="background: transparent; border: none; color: #a0aec0; font-size: 1.8rem; cursor: pointer; line-height: 1;">&times;</button>
        </div>
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <input type="text" id="input-buscar-libro-api" placeholder="Escribe el título del libro..." style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #4a5568; background: #2d3748; color: #fff; outline: none; font-size: 0.95rem;">
          <button id="btn-buscar-libro-api" style="background: #3182ce; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.95rem;">Buscar</button>
        </div>
        <div id="resultados-busqueda-libros" style="max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
          <p style="text-align: center; color: #a0aec0; font-size: 0.9rem; padding: 20px 0;">Escribe un título para comenzar tu búsqueda.</p>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}