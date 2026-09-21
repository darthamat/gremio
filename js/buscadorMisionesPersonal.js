// js/buscadorMisionesPersonal.js
import { getFirestore, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);

const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";

export function inicializarBotonMisionPersonal(userId, onMisionCreada) {
  // Inyectamos nuestro propio modal garantizado
  asegurarModalPropio();

  const btnAbrir = document.getElementById("btn-abrir-modal-mision-personal") || 
                   document.getElementById("btn-abrir-buscador-mision") ||
                   document.querySelector("[data-abrir-modal-mision]");

  const modal = document.getElementById("modal-mision-personal-seguro");

  if (!btnAbrir) {
    console.warn("⚠️ No se encontró el botón de abrir misión en el perfil.");
    return;
  }

  // Abrir Modal
  btnAbrir.addEventListener("click", (e) => {
    e.preventDefault();
    if (modal) {
      modal.style.display = "flex";
      const input = document.getElementById("input-buscar-libro-seguro");
      if (input) {
        input.value = "";
        input.focus();
      }
      const resultados = document.getElementById("resultados-busqueda-seguro");
      if (resultados) {
        resultados.innerHTML = `<p style="text-align: center; color: #a0aec0; font-size: 0.9rem; padding: 20px 0;">Escribe un título para comenzar tu búsqueda.</p>`;
      }
    }
  });

  vincularEventosModalSeguro(userId);
}

function vincularEventosModalSeguro(userId) {
  const modal = document.getElementById("modal-mision-personal-seguro");
  const btnCerrar = document.getElementById("cerrar-modal-seguro");
  const btnBuscar = document.getElementById("btn-buscar-seguro");
  const inputBusqueda = document.getElementById("input-buscar-libro-seguro");

  if (btnCerrar && modal) {
    btnCerrar.onclick = () => { modal.style.display = "none"; };
  }

  if (modal) {
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };
  }

  if (btnBuscar) {
    const nuevoBtn = btnBuscar.cloneNode(true);
    btnBuscar.parentNode.replaceChild(nuevoBtn, btnBuscar);
    nuevoBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await ejecutarBusquedaSegura(userId);
    });
  }

  if (inputBusqueda) {
    const nuevoInput = inputBusqueda.cloneNode(true);
    inputBusqueda.parentNode.replaceChild(nuevoInput, inputBusqueda);
    nuevoInput.addEventListener("keydown", async (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        await ejecutarBusquedaSegura(userId);
      }
    });
  }
}

async function ejecutarBusquedaSegura(userIdParam) {
  const inputBusqueda = document.getElementById("input-buscar-libro-seguro");
  const contenedorResultados = document.getElementById("resultados-busqueda-seguro");

  if (!inputBusqueda || !contenedorResultados) return;

  const query = inputBusqueda.value.trim();
  if (!query) {
    alert("⚠️ Escribe el título de un libro para buscar.");
    return;
  }

  contenedorResultados.style.cssText = "display: flex !important; flex-direction: column !important; max-height: 320px !important; overflow-y: auto !important; gap: 8px !important;";
  contenedorResultados.innerHTML = `<p style="text-align:center; color: #d4af37; padding: 15px;">⏳ Buscando en los antiguos tomos...</p>`;

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&key=${GOOGLE_BOOKS_API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

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
      tarjetaLibro.style.cssText = "display: flex !important; align-items: center !important; background: #2d3748 !important; padding: 10px !important; border-radius: 8px !important; margin-bottom: 8px !important; border: 1px solid #4a5568 !important;";
      
      tarjetaLibro.innerHTML = `
        <img src="${portada.replace('http:', 'https:')}" alt="${titulo}" style="width: 45px; height: 65px; object-fit: cover; border-radius: 4px; flex-shrink: 0;">
        <div style="flex: 1; margin-left: 12px; overflow: hidden;">
          <h4 style="margin: 0; font-size: 0.95rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${titulo}</h4>
          <small style="color: #cbd5e0; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${autor}</small>
          <p style="margin: 4px 0 0; font-size: 0.8rem; color: #f6ad55;">📖 ${paginas} páginas</p>
        </div>
        <button class="btn-elegir-libro" style="background: #48bb78; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.85rem; flex-shrink: 0;">Elegir</button>
      `;

      const btnElegir = tarjetaLibro.querySelector(".btn-elegir-libro");
      btnElegir.addEventListener("click", async () => {
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

        const modal = document.getElementById("modal-mision-personal-seguro");
        if (modal) modal.style.display = "none";
        
        window.location.reload(); 
      });

      contenedorResultados.appendChild(tarjetaLibro);
    });

  } catch (err) {
    console.error("❌ Error en la búsqueda de Google Books:", err);
    contenedorResultados.innerHTML = `<p style="text-align:center; color: #ff6b6b; padding: 15px;">❌ Error al conectar con Google Books.</p>`;
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

function asegurarModalPropio() {
  if (document.getElementById("modal-mision-personal-seguro")) return;

  const modalHtml = `
    <div id="modal-mision-personal-seguro" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center;">
      <div style="background: #1a202c; padding: 25px; border-radius: 12px; width: 90%; max-width: 500px; border: 1px solid #4a5568; box-shadow: 0 10px 25px rgba(0,0,0,0.5); color: #fff; font-family: inherit;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #f6ad55; font-size: 1.2rem;">📜 Explorar Tomos en Google Books</h3>
          <button id="cerrar-modal-seguro" style="background: transparent; border: none; color: #a0aec0; font-size: 1.8rem; cursor: pointer; line-height: 1;">&times;</button>
        </div>
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <input type="text" id="input-buscar-libro-seguro" placeholder="Escribe el título del libro..." style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #4a5568; background: #2d3748; color: #fff; outline: none; font-size: 0.95rem;">
          <button id="btn-buscar-seguro" style="background: #3182ce; color: white; border: none; padding: 10px 18px; border-radius: 6px; cursor: pointer; font-weight: bold; font-size: 0.95rem;">Buscar</button>
        </div>
        <div id="resultados-busqueda-seguro" style="max-height: 320px; overflow-y: auto; display: flex; flex-direction: column; gap: 8px;">
          <p style="text-align: center; color: #a0aec0; font-size: 0.9rem; padding: 20px 0;">Escribe un título para comenzar tu búsqueda.</p>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}