import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, updateDoc, arrayUnion, query, orderBy, increment } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { procesarEvolucionLectura } from './oraculo.js'; // Importa la lógica de rasgos ganados

let usuarioActual = null;
let retosCompletadosUsuario = [];

// 1. Monitorizar sesión para obtener los retos que el usuario ya completó
onAuthStateChanged(auth, async (user) => {
  if (user) {
    usuarioActual = user;
    const userDocRef = doc(db, 'aventureros', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      // Leemos la lista de IDs de retos que el usuario ya ha superado
      retosCompletadosUsuario = data.retosCompletados || [];
    }
  }
  // Cargar el catálogo una vez conocemos el estado del usuario
  cargarCatalogoRetos();
});

// 2. Cargar todas las tarjetas en la vista de Retos
async function cargarCatalogoRetos() {
  const contenedorRetos = document.getElementById('contenedor-catalogo-retos');
  if (!contenedorRetos) return;

  try {
    const q = query(collection(db, 'retos'), orderBy('fechaCreacion', 'desc'));
    const querySnapshot = await getDocs(q);

    contenedorRetos.innerHTML = '';

    querySnapshot.forEach((documento) => {
      const idDoc = documento.id;

      // Omitir el documento 'actual' para no repetirlo
      if (idDoc === 'actual') return;

      const data = documento.data();
      const yaCompletado = retosCompletadosUsuario.includes(idDoc);

      const tarjetaHTML = `
        <div class="tarjeta-reto-historico ${yaCompletado ? 'reto-superado' : ''}" data-id="${idDoc}">
          <div class="portada-wrapper">
            <img src="${data.portadaUrl || 'placeholder.jpg'}" alt="${data.titulo}">
            <span class="badge-id">${idDoc}</span>
            ${yaCompletado ? '<span class="badge-completado">✅ COMPLETADO</span>' : ''}
          </div>
          <div class="info-reto">
            <h3>${data.titulo}</h3>
            <p class="puntos">🏆 ${data.puntosPrestigio || 0} Pts Prestigio</p>
            <p class="descripcion">${data.descripcion}</p>
            
            <button 
              class="btn-completar-reto" 
              data-id="${idDoc}" 
              data-genero="${data.genero || 'clasicos'}" 
              data-puntos="${data.puntosPrestigio || 0}"
              ${yaCompletado || !usuarioActual ? 'disabled' : ''}>
              ${yaCompletado ? '🛡️ Misión Cumplida' : '⚔️ Marcar como Completado'}
            </button>
          </div>
        </div>
      `;

      contenedorRetos.innerHTML += tarjetaHTML;
    });

    // Delegar evento de clic a todos los botones "Completar"
    escucharBotonesCompletar();

  } catch (error) {
    console.error("❌ Error al cargar el catálogo de retos:", error);
  }
}

// 3. Registrar el evento en el botón
function escucharBotonesCompletar() {
  const botones = document.querySelectorAll('.btn-completar-reto');
  botones.forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const idReto = e.target.getAttribute('data-id');
      const genero = e.target.getAttribute('data-genero');
      const puntos = Number(e.target.getAttribute('data-puntos'));

      if (!usuarioActual) {
        alert("Debes iniciar sesión para completar retos.");
        return;
      }

      if (confirm(`¿Has terminado la lectura de este reto? Obtendrás +${puntos} Puntos de Prestigio y nuevas huellas en tu mente.`)) {
        await reclamarRetoHistorico(idReto, genero, puntos, e.target);
      }
    });
  });
}

// 4. Lógica para guardar la victoria en Firestore y asignar recompensas
async function reclamarRetoHistorico(idReto, genero, puntos, botonElemento) {
  try {
    botonElemento.disabled = true;
    botonElemento.innerText = "⏳ Procesando huellas...";

    const userDocRef = doc(db, 'aventureros', usuarioActual.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) return;

    const datosUsuario = userDocSnap.data();
    const huellasActuales = datosUsuario.huellas || {};

    // A. Calcular huellas/rasgos ganados con el motor oráculo
    const { mapaActualizado, gananciasDelViaje } = procesarEvolucionLectura(genero, huellasActuales);

    // B. Actualizar el perfil del usuario en Firestore
    await updateDoc(userDocRef, {
      retosCompletados: arrayUnion(idReto), // Guarda el ID (ej: "reto26_09")
      puntosPrestigio: increment(puntos),   // Suma los puntos
      huellas: mapaActualizado               // Actualiza los niveles de rasgos y cicatrices
    });

    // C. Cambiar visualmente el estado del botón
    botonElemento.innerText = "🛡️ Misión Cumplida";
    const tarjeta = botonElemento.closest('.tarjeta-reto-historico');
    tarjeta.classList.add('reto-superado');

    // D. Notificar al usuario las huellas ganadas
    let mensajeHuellas = gananciasDelViaje.map(g => `${g.icono} ${g.nombre} (+1)`).join("\n");
    alert(`🎉 ¡Reto '${idReto}' superado!\n\nGanaste +${puntos} Pts de Prestigio.\n\nHuellas marcadas en tu mente:\n${mensajeHuellas}`);

  } catch (error) {
    console.error("❌ Error al reclamar el reto:", error);
    alert("Ocurrió un error al guardar tu progreso.");
    botonElemento.disabled = false;
    botonElemento.innerText = "⚔️ Marcar como Completado";
  }
}