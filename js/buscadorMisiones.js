// js/buscadorMisiones.js
// Búsqueda de libros en Google Books para el formulario "Abrir Portal de Lectura" (misiones.html).
// Rellena los campos mision-titulo / mision-autor / mision-paginas / mision-portada-url al elegir un resultado.

const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
const PORTADA_DEFAULT = "https://via.placeholder.com/150x220";

/**
 * Busca libros en Google Books y pinta los resultados dentro de "contenedorResultados".
 * Al hacer click en un resultado, rellena automáticamente el formulario de la misión.
 */
export async function buscarEnGoogleBooks(termino, contenedorResultados) {
  if (!contenedorResultados) return;

  const query = (termino || "").trim();
  if (!query) {
    contenedorResultados.innerHTML = "<div style='padding:8px;'>Escribe un título o autor para buscar.</div>";
    return;
  }

  contenedorResultados.innerHTML = "<div style='padding:8px;'>⏳ Buscando en Google Books...</div>";

  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`);
    const data = await res.json();

    contenedorResultados.innerHTML = "";

    if (!data.items || data.items.length === 0) {
      contenedorResultados.innerHTML = "<div style='padding:8px;'>No se encontraron resultados.</div>";
      return;
    }

    data.items.forEach(item => {
      const info = item.volumeInfo || {};
      const img = info.imageLinks?.thumbnail?.replace("http://", "https://") || PORTADA_DEFAULT;
      const autores = info.authors ? info.authors.join(", ") : "Autor desconocido";

      const fila = document.createElement("div");
      fila.style.cssText = "padding:6px; border-bottom:1px solid #2a3a52; cursor:pointer; display:flex; gap:8px; align-items:center;";
      fila.innerHTML = `
        <img src="${img}" style="width:30px; height:40px; object-fit:cover;">
        <div><b>${info.title || "Sin título"}</b><br><small>${autores}</small></div>
      `;

      fila.addEventListener("click", () => {
        const elTitulo = document.getElementById("mision-titulo");
        const elAutor = document.getElementById("mision-autor");
        const elPaginas = document.getElementById("mision-paginas");
        const elPortada = document.getElementById("mision-portada-url");

        if (elTitulo) elTitulo.value = info.title || "";
        if (elAutor) elAutor.value = autores;
        if (elPaginas) elPaginas.value = info.pageCount || 150;
        if (elPortada) elPortada.value = img;

        contenedorResultados.innerHTML = "";
      });

      contenedorResultados.appendChild(fila);
    });

  } catch (error) {
    console.error("Error al consultar Google Books:", error);
    contenedorResultados.innerHTML = "<div style='padding:8px;'>Error al consultar la API.</div>";
  }
}

/**
 * Limpia el input y los resultados de búsqueda tras crear el portal con éxito.
 */
export function limpiarSeleccionBuscador() {
  const inputBuscar = document.getElementById("input-buscar-libro");
  const contenedorResultados = document.getElementById("resultados-busqueda-libros");

  if (inputBuscar) inputBuscar.value = "";
  if (contenedorResultados) contenedorResultados.innerHTML = "";
}
