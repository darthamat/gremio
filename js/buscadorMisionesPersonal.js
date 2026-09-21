// js/buscadorMisionesPersonal.js
import { getFirestore, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);

export function inicializarBotonMisionPersonal(userId, onMisionCreada) {
  // 1. Inyectar o asegurar que el Modal HTML existe en el DOM automáticamente
  asegurarModalEnHTML();

  const btnAbrir = document.getElementById("btn-abrir-modal-mision-personal") || document.getElementById("btn-abrir-buscador-mision");
  const modal = document.getElementById("modal-mision-personal");
  const btnCerrar = document.getElementById("cerrar-modal-mision-personal");
  const btnBuscar = document.getElementById("btn-buscar-libro-api");
  const inputBusqueda = document.getElementById("input-buscar-libro-api");
  const contenedorResultados = document.getElementById("resultados-busqueda-libros");

  if (!btnAbrir) {
    console.warn("⚠️ No se encontró el botón con ID #btn-abrir-modal-mision-personal o #btn-abrir-buscador-mision en el DOM.");
    return;
  }

  // Abrir Modal
  btnAbrir.addEventListener("click", () => {
    if (modal) {
      modal.style.display = "flex";
      if (inputBusqueda) inputBusqueda.focus();
    }
  });

  // Cerrar Modal con la X
  if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  // Cerrar al hacer clic fuera de la caja del modal
  window.addEventListener("click", (e) => {
    if (modal && e.target === modal) {
      modal.style.display = "none";
    }
  });

  // Buscar en la API de Google Books
  if (btnBuscar && inputBusqueda) {
    btnBuscar.addEventListener("click", async () => {
      const query = inputBusqueda.value.trim();
      if (!query) return alert("Escribe el título de un libro para buscar.");

      contenedorResultados.innerHTML = `<p style="text-align:center; color: #a0aec0;">Buscando en los antiguos tomos...</p>`;

      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
        const data = await response.json();

        if (!data.items || data.items.length === 0) {
          contenedorResultados.innerHTML = `<p style="text-align:center; color: #e53e3e;">No se encontraron grimorios con ese título.</p>`;
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
          tarjetaLibro.style.cssText = "display: flex; align-items: center; background: #2d3748; padding: 10px; border-radius: 8px; margin-bottom: 8px;";
          
          tarjetaLibro.innerHTML = `
            <img src="${portada}" alt="${titulo}" style="width: 50px; height: 75px; object-fit: cover; border-radius: 4px;">
            <div style="flex: 1; margin-left: 12px;">
              <h4 style="margin: 0; font-size: 0.95rem; color: #fff;">${titulo}</h4>
              <small style="color: #a0aec0;">${autor}</small>
              <p style="margin: 4px 0 0; font-size: 0.8rem; color: #cbd5e0;">📖 ${paginas} páginas</p>
            </div>
            <button class="btn-seleccionar-libro" style="background: #48bb78; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-weight: bold;">Elegir</button>
          `;

          tarjetaLibro.querySelector(".btn-seleccionar-libro").addEventListener("click", async () => {
            await guardarMisionPersonal(userId, {
              titulo,
              autor,
              paginas,
              portadaUrl: portada.replace("http:", "https:"),
              estado: "EN_PROGRESO",
              fechaInicio: new Date().toISOString()
            });

            modal.style.display = "none";
            if (typeof onMisionCreada === "function") {
              onMisionCreada();
            }
          });

          contenedorResultados.appendChild(tarjetaLibro);
        });

      } catch (err) {
        console.error("Error buscando libros:", err);
        alert("❌ Error al conectar con la gran biblioteca de Google Books.");
      }
    });
  }
}

async function guardarMisionPersonal(userId, misionData) {
  try {
    const userRef = doc(db, "aventureros", userId);
    await updateDoc(userRef, {
      misionesSecundarias: arrayUnion(misionData)
    });
    alert("⚔️ ¡Nueva misión secundaria aceptada!");
  } catch (err) {
    console.error("Error al guardar misión:", err);
    alert("❌ No se pudo registrar la misión en tu grimorio.");
  }
}

// Inyecta el HTML del modal automáticamente si no existe en el DOM de perfil.html para evitar fallos de diseño
function asegurarModalEnHTML() {
  if (document.getElementById("modal-mision-personal")) return;

  const modalHtml = `
    <div id="modal-mision-personal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center;">
      <div style="background: #1a202c; padding: 25px; border-radius: 12px; width: 90%; max-width: 500px; border: 1px solid #4a5568; box-shadow: 0 10px 25px rgba(0,0,0,0.5); color: #fff; font-family: inherit;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
          <h3 style="margin: 0; color: #f6ad55;">📜 Buscar Misión Secundaria (Libro)</h3>
          <button id="cerrar-modal-mision-personal" style="background: transparent; border: none; color: #a0aec0; font-size: 1.5rem; cursor: pointer;">&times;</button>
        </div>
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <input type="text" id="input-buscar-libro-api" placeholder="Ej: El Señor de los Anillos..." style="flex: 1; padding: 10px; border-radius: 6px; border: 1px solid #4a5568; background: #2d3748; color: #fff; outline: none;">
          <button id="btn-buscar-libro-api" style="background: #3182ce; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; font-weight: bold;">Buscar</button>
        </div>
        <div id="resultados-busqueda-libros" style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
          <p style="text-align: center; color: #a0aec0; font-size: 0.9rem;">Escribe un título para comenzar tu búsqueda.</p>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}