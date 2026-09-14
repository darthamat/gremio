// js/perfil.js
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { 
  buscarEnGoogleBooks, 
  registrarMisionAventurero, 
  limpiarSeleccionBuscador 
} from "./buscadorMisiones.js";

// 1. Inicialización de Firebase (SIEMPRE PRIMERO)
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
let currentUserDocRef = null;

// 2. Control de Estado de Autenticación (Único listener)
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

// Carga y renderiza los datos del usuario desde Firestore
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

// Lógica de pestañas / acordeón
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

// Renderiza la lista de tarjetas de misiones
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
                ${mision.generos && mision.generos.length ? `<p><small>🏷️ ${mision.generos.join(', ')}</small></p>` : ''}
            </div>
        `;
        contenedor.appendChild(tarjeta);
    });
}

// Inicializa todos los eventos del modal de búsqueda y guardado de misiones
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

    // Previsualización de imagen si el usuario sube archivo local
    if (inputPortadaFile) {
        inputPortadaFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (previewPortada) {
                        previewPortada.src = event.target.result;
                        previewPortada.style.display = "block";
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Procesamiento del submit para guardar en Firestore
    if (formConfirmar) {
        formConfirmar.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            try {
                if (btnGuardar) {
                    btnGuardar.disabled = true;
                    btnGuardar.innerText = "⏳ Registrando en Firestore y Cloudinary...";
                }

                // 1. Obtener géneros seleccionados (checkboxes)
                const generosSeleccionados = Array.from(
                    document.querySelectorAll('input[name="genero"]:checked')
                ).map(cb => cb.value);

                // 2. Obtener Rasgos y Cicatrices (listas separadas por comas)
                const rasgosRaw = document.getElementById('mision-rasgos')?.value || "";
                const cicatricesRaw = document.getElementById('mision-cicatrices')?.value || "";

                const rasgos = rasgosRaw ? rasgosRaw.split(',').map(r => r.trim()).filter(Boolean) : [];
                const cicatrices = cicatricesRaw ? cicatricesRaw.split(',').map(c => c.trim()).filter(Boolean) : [];

                // 3. Empaquetar payload completo
                const datosFormulario = {
                    titulo: document.getElementById("mision-titulo").value,
                    autor: document.getElementById("mision-autor").value,
                    paginas: Number(document.getElementById("mision-paginas").value) || 0,
                    proclama: document.getElementById("mision-proclama").value,
                    estado: document.getElementById("mision-estado").value,
                    urlPortadaGB: document.getElementById("mision-portada-url")?.value || "",
                    archivoLocal: inputPortadaFile?.files[0] || null,
                    generos: generosSeleccionados,
                    rasgos: rasgos,
                    cicatrices: cicatrices
                };

                // 4. Guardar en BD mediante la función exportada de buscadorMisiones.js
                await registrarMisionAventurero(currentUserId, datosFormulario);

                alert("✨ ¡Misión registrada con éxito en tu Perfil y en la Biblioteca!");
                if (modal) modal.classList.add("oculto");
                limpiarFormularioLocal();
                
                // Recargar los datos del perfil
                await cargarDatosAventurero(currentUserDocRef);

            } catch (err) {
                console.error("Error al guardar la misión:", err);
                alert("❌ Ocurrió un error al registrar la misión.");
            } finally {
                if (btnGuardar) {
                    btnGuardar.disabled = false;
                    btnGuardar.innerText = "💾 Registrar Misión";
                }
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