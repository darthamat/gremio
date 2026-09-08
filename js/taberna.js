// Obtener el ID del reto enviado desde el botón
const urlParams = new URLSearchParams(window.location.search);
const retoIdOriginal = urlParams.get('retoId');

if (retoIdOriginal) {
  console.log("Cargando hilo de discusión para el reto ID:", retoIdOriginal);
  // Aquí puedes filtrar los comentarios de Firestore usando: retoId == retoIdOriginal
}