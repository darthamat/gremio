import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, addDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

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

// Cargar libros guardados desde Firestore (subcolección del usuario)
async function cargarBiblioteca() {
    try {
        const librosRef = collection(db, "aventureros", currentUser.uid, "biblioteca");
        const snapshot = await getDocs(librosRef);

        const estante = document.getElementById("estante-libros");
        if (!estante) return;
        
        estante.innerHTML = "";

        let totalPaginas = 0;
        let totalLibros = 0;
        let totalPrestigio = 0;

        if (snapshot.empty) {
            estante.innerHTML = `<p class="sin-datos" style="color: #bbb; padding: 20px;">Tu estantería está vacía. Completa retos o añade libros para llenar tus pergaminos.</p>`;
        }

        snapshot.forEach(docSnap => {
            const libro = docSnap.data();
            totalLibros++;
            const paginasNum = Number(libro.paginas || 0);
            const prestigioNum = Number(libro.prestigioGanado || paginasNum);

            totalPaginas += paginasNum;
            totalPrestigio += prestigioNum;
            
            renderizarLomoLibro(libro);
        });

        // Actualizar Estadísticas en pantalla si los elementos existen
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

// Renderizar un lomo individual en la estantería
function renderizarLomoLibro(libro) {
    const estante = document.getElementById("estante-libros");
    if (!estante) return;

    const lomo = document.createElement("div");
    lomo.className = "lomo-libro";
    
    const paginasNum = Number(libro.paginas) || 100;

    // El grosor escala con las páginas (mínimo 28px, máximo 65px)
    const ancho = Math.min(Math.max(paginasNum / 12, 28), 65);
    // La altura también escala ligeramente (mínimo 190px, máximo 240px)
    const alto = Math.min(Math.max(180 + (paginasNum / 10), 190), 240);

    const colorFondo = libro.color || (libro.esRetoGremio ? "#8e44ad" : "#8b263e");

    lomo.style.width = `${ancho}px`;
    lomo.style.height = `${alto}px`;
    lomo.style.backgroundColor = colorFondo;

    // Distintivo especial si es un reto del gremio completado
    const insigniaGremio = libro.esRetoGremio ? `<span style="font-size: 10px; display: block;">📜 GREMIO</span>` : '';

    lomo.innerHTML = `
        <span class="lomo-titulo" title="${libro.titulo || 'Sin título'} - ${libro.autor || 'Autor desconocido'}">
            ${libro.titulo || 'Sin título'}
        </span>
        <span class="lomo-paginas">
            ${insigniaGremio}
            📖 ${paginasNum}p
        </span>
    `;

    estante.appendChild(lomo);
}

// Control seguro del Modal (solo si los botones existen en la vista HTML)
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

// Guardar un libro manual en Firestore con tirada de Prestigio
if (formLibro) {
    formLibro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const titulo = document.getElementById("titulo").value;
        const autor = document.getElementById("autor").value;
        const paginas = Number(document.getElementById("paginas").value);
        const color = document.getElementById("color").value;

        // 🎲 Tirada virtual de d100
        const tiradaDado100 = Math.floor(Math.random() * 100) + 1;

        // 🏆 Cálculo del Prestigio
        const prestigioGanado = Math.round(paginas + (paginas / tiradaDado100));

        const nuevoLibro = {
            titulo,
            autor,
            paginas,
            color,
            prestigioGanado,
            tiradaDado: tiradaDado100,
            completadoEn: new Date()
        };

        try {
            // 1. Guardar en la subcolección del usuario
            const librosRef = collection(db, "aventureros", currentUser.uid, "biblioteca");
            await addDoc(librosRef, nuevoLibro);

            // 2. Actualizar las estadísticas en el documento principal del aventurero
            const userDocRef = doc(db, "aventureros", currentUser.uid);
            await updateDoc(userDocRef, {
                xp: increment(paginas),
                paginasLeidas: increment(paginas),
                librosCompletados: increment(1),
                prestigio: increment(prestigioGanado)
            });

            alert(`🎲 ¡Tirada de d100: Sacaste un ${tiradaDado100}!\n✨ Has ganado ${prestigioGanado} Puntos de Prestigio.`);

            if (modal) modal.classList.add("oculto");
            formLibro.reset();
            
            // Recargar biblioteca completa
            await cargarBiblioteca();

        } catch (error) {
            console.error("Error al guardar el libro manual:", error);
            alert("Ocurrió un error al registrar el libro.");
        }
    });
}