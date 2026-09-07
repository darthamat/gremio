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

// Cargar libros guardados desde Firestore
async function cargarBiblioteca() {
    const librosRef = collection(db, "aventureros", currentUser.uid, "biblioteca");
    const snapshot = await getDocs(librosRef);

    const estante = document.getElementById("estante-libros");
    estante.innerHTML = "";

    let totalPaginas = 0;
    let totalLibros = 0;
    let totalPrestigio = 0;

    snapshot.forEach(docSnap => {
        const libro = docSnap.data();
        totalLibros++;
        totalPaginas += Number(libro.paginas || 0);
        totalPrestigio += Number(libro.prestigioGanado || 0);
        renderizarLomoLibro(libro);
    });

    // Actualizar Estadísticas en pantalla
    document.getElementById("total-libros").textContent = totalLibros;
    document.getElementById("total-paginas").textContent = totalPaginas;
    document.getElementById("total-xp").textContent = `${totalPaginas} XP`;
    
    // Si tienes un elemento para el Prestigio Total en la biblioteca:
    const elemPrestigio = document.getElementById("total-prestigio");
    if (elemPrestigio) {
        elemPrestigio.textContent = totalPrestigio;
    }
}

// Renderizar un lomo individual en la estantería
function renderizarLomoLibro(libro) {
    const estante = document.getElementById("estante-libros");

    const lomo = document.createElement("div");
    lomo.className = "lomo-libro";
    
    // El grosor escala con las páginas (mínimo 28px, máximo 65px)
    const ancho = Math.min(Math.max(libro.paginas / 12, 28), 65);
    // La altura también escala ligeramente (mínimo 190px, máximo 240px)
    const alto = Math.min(Math.max(180 + (libro.paginas / 10), 190), 240);

    lomo.style.width = `${ancho}px`;
    lomo.style.height = `${alto}px`;
    lomo.style.backgroundColor = libro.color || "#8b263e";

    lomo.innerHTML = `
        <span class="lomo-titulo" title="${libro.titulo} - ${libro.autor}">${libro.titulo}</span>
        <span class="lomo-paginas">📖 ${libro.paginas}p</span>
    `;

    estante.appendChild(lomo);
}

// Lógica del Modal
const modal = document.getElementById("modal-libro");
document.getElementById("btn-abrir-modal").addEventListener("click", () => modal.classList.remove("oculto"));
document.getElementById("btn-cerrar-modal").addEventListener("click", () => modal.classList.add("oculto"));


// Guardar un nuevo libro en Firestore con tirada de Prestigio
document.getElementById("form-libro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const autor = document.getElementById("autor").value;
    const paginas = Number(document.getElementById("paginas").value);
    const color = document.getElementById("color").value;

    // 🎲 Tirada virtual de dado de 100 (número entre 1 y 100)
    const tiradaDado100 = Math.floor(Math.random() * 100) + 1;

    // 🏆 Cálculo del Prestigio: Páginas + (Páginas entre Tirada d100)
    const prestigioGanado = paginas + (paginas / tiradaDado100);

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
        // 1. Guardar el libro en la subcolección del usuario
        const librosRef = collection(db, "aventureros", currentUser.uid, "biblioteca");
        await addDoc(librosRef, nuevoLibro);

        // 2. Actualizar XP, Páginas, Libros y el nuevo Prestigio en el usuario
        const userDocRef = doc(db, "aventureros", currentUser.uid);
        await updateDoc(userDocRef, {
            xp: increment(paginas),
            paginasLeidas: increment(paginas),
            librosCompletados: increment(1),
            prestigio: increment(prestigioGanado) // ⬅️ Se suma el prestigio acumulado
        });

        // Notificación épica al jugador indicando la tirada
        alert(`🎲 ¡Tirada de d100: Sacaste un ${tiradaDado100}!\n✨ Has ganado ${prestigioGanado} Puntos de Prestigio.`);

        // 3. Renderizar y cerrar modal
        renderizarLomoLibro(nuevoLibro);
        modal.classList.add("oculto");
        document.getElementById("form-libro").reset();
        
        // Recargar contadores
        cargarBiblioteca();

    } catch (error) {
        console.error("Error al guardar el libro:", error);
        alert("Ocurrió un error al registrar el libro.");
    }
});