// js/perfil.js
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { 
  buscarEnGoogleBooks, 
  registrarMisionAventurero, 
  limpiarSeleccionBuscador 
} from "./buscadorMisiones.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
let currentUserDocRef = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }

    currentUserId = user.uid;
    currentUserDocRef = doc(db, "aventureros", user.uid);
    
    await cargarDatosAventurero(currentUserDocRef);
    inicializarAcordeon();
    inicializarModalMisiones();
    inicializarCerrarSesion();
});

async function cargarDatosAventurero(docRef) {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const misiones = data.misionesSecundarias || [];

    if (document.getElementById("char-name")) document.getElementById("char-name").textContent = data.nombre || "Aventurero";
    if (document.getElementById("char-level")) document.getElementById("char-level").textContent = data.nivel || 1;
    if (document.getElementById("char-xp")) document.getElementById("char-xp").textContent = `${data.xp || 0} XP`;

    renderizarMisiones(misiones);
}

function inicializarAcordeon() {
    const botones = document.querySelectorAll(".acordeon-botones .btn-tab:not(.btn-enlace)");
    const panelContenido = document.getElementById("panel-contenido");

    botones.forEach(boton => {
        boton.addEventListener("click", () => {
            const tabNombre = boton.getAttribute("data-tab");
            const tabObjetivo = document.getElementById(`tab-${tabNombre}`);

            if (!tabObjetivo) return;

            const yaEstaActivo = boton.classList.contains("activo");

            if (yaEstaActivo) {
                boton.classList.remove("activo");
                panelContenido.classList.add("oculto");
                document.querySelectorAll(".tab-contenido").forEach(tc => tc.classList.add("oculto"));
                return;
            }

            document.querySelectorAll(".tab-contenido").forEach(tc => tc.classList.add("oculto"));
            botones.forEach(b => b.classList.remove("activo"));

            boton.classList.add("activo");
            panelContenido.classList.remove("oculto");
            tabObjetivo.classList.remove("oculto");
        });
    });
}

function renderizarMisiones(misiones) {
    const contenedor = document.getElementById("contenedor-misiones");
    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (!misiones || misiones.length === 0) {
        contenedor.innerHTML = `<p class="sin-datos">No tienes misiones registradas actualmente.</p>`;
        return;
    }

    misiones.forEach(mision => {
        const tarjeta = document.createElement("div");
        tarjeta.className = `mision-card ${mision.estado === 'TERMINADA' ? 'mision-completada' : 'mision-en-progreso'}`;
        
        tarjeta.innerHTML = `
            ${mision.portada ? `<img src="${mision.portada}" class="mision-portada-thumb" alt="Portada">` : ''}
            <div class="mision-info">
                <strong>${mision.titulo}</strong>
                <small>${mision.autor}</small>
                <p>📖 ${mision.paginas} páginas | Estado: ${mision.estado}</p>
                ${mision.proclama ? `<p class="proclama">"${mision.proclama}"</p>` : ''}
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

function inicializarModalMisiones() {
    const btnAbrir = document.getElementById("btn-abrir-buscador-mision");
    const btnCerrar = document.getElementById("btn-cerrar-modal-mision");
    const modal = document.getElementById("modal-buscador-mision");
    
    const inputBuscar = document.getElementById("input-buscar-libro");
    const btnBuscar = document.getElementById("btn-ejecutar-busqueda");
    const contenedorResultados = document.getElementById("resultados-busqueda-libros");
    
    const inputPortadaFile = document.getElementById("mision-portada-file");
    const previewPortada = document.getElementById("mision-preview-portada");
    const formConfirmar = document.getElementById("form-confirmar-mision");
    const btnGuardar = document.getElementById("btn-guardar-mision");

    if (btnAbrir && modal) {
        btnAbrir.addEventListener("click", () => modal.classList.remove("oculto"));
    }

    if (btnCerrar && modal) {
        btnCerrar.addEventListener("click", () => {
            modal.classList.add("oculto");
            limpiarFormularioLocal();
        });
    }

    if (btnBuscar && inputBuscar) {
        btnBuscar.addEventListener("click", (e) => {
            e.preventDefault();
            buscarEnGoogleBooks(inputBuscar.value, contenedorResultados);
        });

        inputBuscar.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                buscarEnGoogleBooks(inputBuscar.value, contenedorResultados);
            }
        });
    }

    // Previsualización de imagen si el usuario sube su propio archivo
    if (inputPortadaFile) {
        inputPortadaFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    previewPortada.src = event.target.result;
                    previewPortada.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (formConfirmar) {
        formConfirmar.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            try {
                btnGuardar.disabled = true;
                btnGuardar.innerText = "⏳ Registrando en Firestore y Cloudinary...";

                const datosFormulario = {
                    titulo: document.getElementById("mision-titulo").value,
                    autor: document.getElementById("mision-autor").value,
                    paginas: Number(document.getElementById("mision-paginas").value) || 0,
                    proclama: document.getElementById("mision-proclama").value,
                    estado: document.getElementById("mision-estado").value,
                    urlPortadaGB: document.getElementById("mision-portada-url").value,
                    archivoLocal: inputPortadaFile?.files[0]
                };

                await registrarMisionAventurero(currentUserId, datosFormulario);

                alert("✨ ¡Misión registrada con éxito en tu Perfil y en la Biblioteca!");
                modal.classList.add("oculto");
                limpiarFormularioLocal();
                await cargarDatosAventurero(currentUserDocRef);

            } catch (err) {
                console.error("Error al guardar la misión:", err);
                alert("❌ Ocurrió un error al registrar la misión.");
            } finally {
                btnGuardar.disabled = false;
                btnGuardar.innerText = "💾 Registrar Misión";
            }
        });
    }
}

function limpiarFormularioLocal() {
    limpiarSeleccionBuscador();
    const formConfirmar = document.getElementById("form-confirmar-mision");
    const contenedorResultados = document.getElementById("resultados-busqueda-libros");
    const previewPortada = document.getElementById("mision-preview-portada");

    if (formConfirmar) {
        formConfirmar.reset();
        formConfirmar.classList.add("oculto");
    }
    if (contenedorResultados) contenedorResultados.style.display = "none";
    if (previewPortada) previewPortada.style.display = "none";
}

function inicializarCerrarSesion() {
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            signOut(auth).then(() => window.location.href = "index.html");
        });
    }
}