// js/buscadorMisionesPersonal.js
import { inicializarFormularioLibro } from "./adminGestorLibros.js";

export function inicializarBotonMisionPersonal(userId, onMisionCreada) {
  // 1. Inyectar automáticamente el HTML completo del formulario de Admin dentro de un modal flotante en el Perfil
  asegurarModalAdminEnPerfil();

  const btnAbrir = document.getElementById("btn-abrir-modal-mision-personal") || document.getElementById("btn-abrir-buscador-mision");
  const modal = document.getElementById("modal-admin-mision-personal");
  const btnCerrar = document.getElementById("cerrar-modal-admin-mision");

  if (!btnAbrir) {
    console.warn("⚠️ No se encontró el botón de abrir misión en el perfil.");
    return;
  }

  // Abrir Modal
  btnAbrir.addEventListener("click", (e) => {
    e.preventDefault();
    if (modal) {
      modal.style.display = "flex";
      const inputBusqueda = document.getElementById("buscarLibro");
      if (inputBusqueda) inputBusqueda.focus();
    }
  });

  // Cerrar Modal con la X
  if (btnCerrar) {
    btnCerrar.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  // Cerrar al hacer clic fuera del contenido del modal
  window.addEventListener("click", (e) => {
    if (modal && e.target === modal) {
      modal.style.display = "none";
    }
  });

  // 2. Inicializamos tu gestor unificado en modo 'aventurero'
  inicializarFormularioLibro('aventurero', userId, (nuevaMision) => {
    alert("🎉 ¡Misión secundaria aceptada con éxito!");
    if (modal) modal.style.display = "none";
    if (typeof onMisionCreada === "function") {
      onMisionCreada(nuevaMision);
    }
  });
}

// Inyecta el HTML exacto de admin.html adaptado como un modal flotante estético
function asegurarModalAdminEnPerfil() {
  if (document.getElementById("modal-admin-mision-personal")) return;

  const modalHtml = `
    <div id="modal-admin-mision-personal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; overflow-y:auto; padding: 20px 0;">
      <div class="admin-container" style="max-width: 650px; width: 95%; max-height: 90vh; overflow-y: auto; background: #f3e5ab; border: 4px solid #8b5a2b; padding: 25px; border-radius: 6px; color: #3b2219; box-shadow: 0 10px 25px rgba(0,0,0,0.7); position: relative; margin: auto;">
        
        <!-- BOTÓN CERRAR -->
        <button id="cerrar-modal-admin-mision" style="position: absolute; top: 15px; right: 20px; background: transparent; border: none; font-size: 1.8rem; font-weight: bold; cursor: pointer; color: #3b2219;">&times;</button>

        <h2 style="margin-top: 0; text-align: center; color: #8b5a2b; font-family: inherit;">📜 Registrar Misión Secundaria</h2>
        <hr style="border-color: #8b5a2b; margin: 15px 0;">

        <!-- BUSCADOR GOOGLE BOOKS -->
        <div class="form-group buscador-container" style="margin-bottom: 15px; position: relative; display: flex; flex-direction: column; text-align: left;">
          <label for="buscarLibro" style="font-weight: bold; margin-bottom: 5px;">🔍 Buscar Libro en Google Books:</label>
          <div class="buscador-box" style="display: flex; gap: 10px;">
            <input type="text" id="buscarLibro" placeholder="Escribe el nombre del libro o autor..." style="flex: 1; padding: 10px; border: 2px solid #5a3a1a; border-radius: 4px; background: #fff8e7; color: #3b2219;">
            <button type="button" id="btn-buscar-gb" class="btn-secundario" style="padding: 10px 15px; background: #8b5a2b; color: #fff; border: 1px solid #d4af37; border-radius: 4px; cursor: pointer; font-weight: bold;">Buscar</button>
          </div>
          <div id="resultados-busqueda" class="resultados-busqueda" style="display: none; position: absolute; top: 100%; left: 0; right: 0; max-height: 220px; overflow-y: auto; background: #2a221b; color: #fff8e7; border: 2px solid #8b5a2b; border-radius: 4px; z-index: 1000; box-shadow: 0 8px 16px rgba(0,0,0,0.5);"></div>
        </div>

        <hr style="border-color: #8b5a2b; margin: 15px 0;">

        <form id="form-crear-reto">
          <div class="form-group" style="margin-bottom: 15px; display: flex; flex-direction: column; text-align: left;">
            <label for="titulo" style="font-weight: bold; margin-bottom: 5px;">Título del Libro:</label>
            <input type="text" id="titulo" placeholder="Ej: La Sombra del Viento" required style="padding: 10px; border: 2px solid #5a3a1a; border-radius: 4px; background: #fff8e7; color: #3b2219;">
          </div>

          <div class="form-row" style="display: flex; gap: 15px; margin-bottom: 15px;">
            <div class="form-group" style="flex: 1; display: flex; flex-direction: column; text-align: left;">
              <label for="autor" style="font-weight: bold; margin-bottom: 5px;">Autor(es):</label>
              <input type="text" id="autor" placeholder="Ej: Carlos Ruiz Zafón" required style="padding: 10px; border: 2px solid #5a3a1a; border-radius: 4px; background: #fff8e7; color: #3b2219;">
            </div>
            <div class="form-group" style="flex: 1; display: flex; flex-direction: column; text-align: left;">
              <label for="paginas" style="font-weight: bold; margin-bottom: 5px;">Número de Páginas:</label>
              <input type="number" id="paginas" min="1" placeholder="Ej: 576" required style="padding: 10px; border: 2px solid #5a3a1a; border-radius: 4px; background: #fff8e7; color: #3b2219;">
            </div>
          </div>

          <!-- ESTADO DE LA MISIÓN -->
          <div class="form-group" style="margin-bottom: 15px; display: flex; flex-direction: column; text-align: left;">
            <label for="estado-mision" style="font-weight: bold; margin-bottom: 5px;">Estado Inicial:</label>
            <select id="estado-mision" style="padding: 10px; border: 2px solid #5a3a1a; border-radius: 4px; background: #fff8e7; color: #3b2219;">
              <option value="en_progreso">En Progreso (Leyendo)</option>
              <option value="completada">Completada (Terminada)</option>
            </select>
          </div>

          <!-- DESCRIPCIÓN -->
          <div class="form-group" style="margin-bottom: 15px; display: flex; flex-direction: column; text-align: left;">
            <label for="descripcion" style="font-weight: bold; margin-bottom: 5px;">Proclama / Sinopsis:</label>
            <textarea id="descripcion" rows="3" placeholder="Notas o sinopsis..." required style="padding: 10px; border: 2px solid #5a3a1a; border-radius: 4px; background: #fff8e7; color: #3b2219;"></textarea>
          </div>

          <!-- GÉNEROS -->
          <div class="form-group" style="margin-bottom: 15px; display: flex; flex-direction: column; text-align: left;">
            <label style="font-weight: bold; margin-bottom: 5px;">Géneros del Libro:</label>
            <div id="generos-tags-contenedor" style="min-height: 38px; border: 2px solid #5a3a1a; border-radius: 4px; padding: 5px; margin-bottom: 8px; background: #fff8e7; display: flex; flex-wrap: wrap; gap: 5px;"></div>
            <select id="select-generos-disponibles" style="width: 100%; padding: 8px; margin-bottom: 8px; border: 2px solid #5a3a1a; border-radius: 4px; background: #fff8e7;">
              <option value="">Cargando géneros...</option>
            </select>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; background: rgba(139, 90, 43, 0.1); padding: 8px; border-radius: 4px; border: 1px dashed #8b5a2b;">
              <input type="text" id="input-nuevo-genero" placeholder="Nuevo género..." style="flex: 2; padding: 6px; border: 1px solid #5a3a1a; border-radius: 4px;">
              <select id="select-genero-padre" style="flex: 2; padding: 6px; border: 1px solid #5a3a1a; border-radius: 4px;">
                <option value="">-- Padre --</option>
                <option value="fantasia">Fantasía</option>
                <option value="terror">Terror</option>
                <option value="poesia">Poesía</option>
                <option value="clasicos">Clásicos</option>
                <option value="ficcion">Ficción</option>
                <option value="no_ficcion">No Ficción</option>
                <option value="filosofia">Filosofía</option>
                <option value="historica">Histórica</option>
                <option value="ciencia_ficcion">Ciencia Ficción</option>
                <option value="romance">Romance</option>
              </select>
              <button type="button" id="btn-agregar-genero" class="btn-secundario" style="padding: 6px 12px; background: #8b5a2b; color: white; border: none; border-radius: 4px; cursor: pointer;">+ Añadir</button>
            </div>
          </div>

          <!-- PORTADA -->
          <div class="form-group" style="margin-bottom: 15px; display: flex; flex-direction: column; text-align: left;">
            <label for="portadaFile" style="font-weight: bold; margin-bottom: 5px;">Portada:</label>
            <input type="file" id="portadaFile" accept="image/*">
            <input type="hidden" id="portadaUrlGB">
            <img id="preview-portada" class="preview-portada" alt="Previsualización" style="max-width: 100px; margin-top: 8px; border: 2px solid #8b5a2b; border-radius: 4px; display: none;">
          </div>

          <!-- RASGOS Y CICATRICES -->
          <div class="seccion-huellas" style="border: 2px dashed #8b5a2b; padding: 12px; border-radius: 6px; background: rgba(139, 90, 43, 0.05); margin-bottom: 15px; text-align: left;">
            <label style="font-weight: bold; display: block; margin-bottom: 8px;">🎭 Huellas Automáticas (Rasgos y Cicatrices):</label>
            <div style="margin-top: 6px;"><small><strong>Rasgos:</strong></small><div id="container-rasgos" class="tag-container" style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px;"></div></div>
            <div style="margin-top: 10px;"><small><strong>Cicatrices:</strong></small><div id="container-cicatrices" class="tag-container" style="display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px;"></div></div>
          </div>

          <div id="mensaje-estado" class="mensaje-estado" style="margin-bottom: 15px; text-align: center; font-weight: bold;"></div>

          <button type="submit" id="btn-submit" class="btn-crear" style="width: 100%; padding: 12px; background: #8b5a2b; color: white; border: 1px solid #d4af37; border-radius: 4px; font-weight: bold; font-size: 1.1rem; cursor: pointer;">⚔️ Aceptar Misión</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}