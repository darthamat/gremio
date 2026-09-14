import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    where, 
    or 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { registrarLecturaLibre } from "./gestorLibros.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    currentUser = user;
    await cargarBiblioteca();
});

// Cargar libros guardados desde la colección principal 'biblioteca'
async function cargarBiblioteca() {
    try {
        const estante = document.getElementById("estante-libros");
        if (!estante) return;
        
        estante.innerHTML = "";

        const q = query(
            collection(db, "biblioteca"), 
            or(
                where("lectores", "array-contains", currentUser.uid),
                where("usuarioId", "==", currentUser.uid)
            )
        );
        
        const snapshot = await getDocs(q);

        let totalPaginas = 0;
        let totalLibros = 0;
        let totalPrestigio = 0;

        if (snapshot.empty) {
            estante.innerHTML = `<p class="sin-datos">Tu estantería está vacía. Completa retos o añade libros para llenar tus pergaminos.</p>`;
        } else {
            snapshot.forEach(docSnap => {
                const libro = docSnap.data();
                totalLibros++;
                const paginasNum = Number(libro.paginas || 0);
                const prestigioNum = Number(libro.prestigioGanado || paginasNum);

                totalPaginas += paginasNum;
                totalPrestigio += prestigioNum;
                
                renderizarLomoLibro(libro);
            });
        }

        // Actualizar estadísticas en pantalla
        const elemLibros = document.getElementById("total-libros");
        const elemPaginas = document.getElementById("total-paginas");
        const elemXp = document.getElementById("total-xp");
        const elemPrestigio = document.getElementById("total-prestigio");

        if (elemLibros) elemLibros.textContent = totalLibros;
        if (elemPaginas) elemPaginas.textContent = totalPaginas;
        if (elemXp) elemXp.textContent = `${totalPaginas} XP`;
        if (elemPrestigio) elemPrestigio.textContent = totalPrestigio;

    } catch (error) {
        console.error("Error al cargar la biblioteca:", error);
    }
}

// Crear un único tooltip global en el body si no existe
let tooltipGlobal = document.getElementById("tooltip-global");
if (!tooltipGlobal) {
    tooltipGlobal = document.createElement("div");
    tooltipGlobal.id = "tooltip-global";
    tooltipGlobal.className = "tooltip-libro-global";
    document.body.appendChild(tooltipGlobal);
}

function renderizarLomoLibro(libro) {
    const estante = document.getElementById("estante-libros");
    if (!estante) return;

    const lomo = document.createElement("div");
    lomo.className = "lomo-libro";
    
    const paginasNum = Number(libro.paginas) || 100;

    // Dimensiones proporcionales
    const ancho = Math.min(Math.max(paginasNum / 12, 28), 65);
    const alto = Math.min(Math.max(180 + (paginasNum / 10), 190), 240);

    const esReto = libro.esReto || libro.tipoOrigen === "RETO_GREMIO" || (libro.retosAsociados && libro.retosAsociados.length > 0);
    const colorFondo = libro.colorLomo || libro.color || (esReto ? "#8e44ad" : "#8b263e");

    lomo.style.width = `${ancho}px`;
    lomo.style.height = `${alto}px`;
    lomo.style.backgroundColor = colorFondo;

    // Formatear la fecha
    let fechaTexto = "Fecha desconocida";
    if (libro.fechaCompletado) {
        const fechaObj = libro.fechaCompletado.toDate ? libro.fechaCompletado.toDate() : new Date(libro.fechaCompletado);
        if (!isNaN(fechaObj)) {
            fechaTexto = fechaObj.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
        }
    }

    // Título en el lomo
    const tituloSpan = document.createElement("span");
    tituloSpan.className = "lomo-titulo";
    tituloSpan.textContent = libro.titulo || "Sin título";
    lomo.appendChild(tituloSpan);

    // Eventos de ratón para mostrar/ocultar el tooltip fuera del div estante
    lomo.addEventListener("mouseenter", (e) => {
        tooltipGlobal.innerHTML = `
            <div class="tooltip-titulo">📖 ${libro.titulo || 'Sin título'}</div>
            <div class="tooltip-autor"><em>de ${libro.autor || 'Autor desconocido'}</em></div>
            <hr class="tooltip-divisor">
            <div class="tooltip-detalle">📄 <strong>${paginasNum}</strong> páginas</div>
            <div class="tooltip-detalle">📅 Leído el <strong>${fechaTexto}</strong></div>
            ${esReto ? '<div class="tooltip-badge">📜 Reto del Gremio</div>' : ''}
        `;
        
        tooltipGlobal.classList.add("visible");
        posicionarTooltip(e);
    });

    lomo.addEventListener("mousemove", (e) => {
        posicionarTooltip(e);
    });

    lomo.addEventListener("mouseleave", () => {
        tooltipGlobal.classList.remove("visible");
    });

    estante.appendChild(lomo);
}

// Función para calcular la posición sobre el cursor
function posicionarTooltip(e) {
    const offset = 15;
    let left = e.clientX + offset;
    let top = e.clientY - tooltipGlobal.offsetHeight - offset;

    // Si el tooltip se sale por la derecha de la pantalla
    if (left + tooltipGlobal.offsetWidth > window.innerWidth) {
        left = e.clientX - tooltipGlobal.offsetWidth - offset;
    }

    // Si el tooltip se sale por la parte superior de la pantalla
    if (top < 10) {
        top = e.clientY + offset;
    }

    tooltipGlobal.style.left = `${left}px`;
    tooltipGlobal.style.top = `${top}px`;
}

// Control del Modal
const modal = document.getElementById("modal-libro");
const btnAbrirModal = document.getElementById("btn-abrir-modal");
const btnCerrarModal = document.getElementById("btn-cerrar-modal");
const formLibro = document.getElementById("form-libro");

if (btnAbrirModal && modal) {
    btnAbrirModal.addEventListener("click", () => modal.classList.remove("oculto"));
}

if (btnCerrarModal && modal) {
    btnCerrarModal.addEventListener("click", () => modal.classList.add("oculto"));
}

// Formulario de registro de libro libre
if (formLibro) {
    formLibro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const titulo = document.getElementById("titulo").value.trim();
        const autor = document.getElementById("autor").value.trim();
        const paginas = Number(document.getElementById("paginas").value) || 0;
        const color = document.getElementById("color") ? document.getElementById("color").value : "#8b263e";

        const tiradaDado100 = Math.floor(Math.random() * 100) + 1;
        const prestigioGanado = Math.round(paginas + (paginas / tiradaDado100));

        const datosLibro = {
            titulo,
            autor,
            paginas,
            colorLomo: color,
            prestigioGanado,
            tiradaDado: tiradaDado100
        };

        try {
            const resultado = await registrarLecturaLibre(currentUser.uid, datosLibro);

            if (resultado.exito) {
                alert(`🎲 ¡Tirada de d100: Sacaste un ${tiradaDado100}!\n✨ Has ganado ${prestigioGanado} Puntos de Prestigio.`);

                if (modal) modal.classList.add("oculto");
                formLibro.reset();
                await cargarBiblioteca();
            } else {
                alert("Ocurrió un error al registrar el libro.");
            }

        } catch (error) {
            console.error("Error al guardar el libro manual:", error);
            alert("Ocurrió un error al registrar el libro.");
        }
    });
}