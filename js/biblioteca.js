// js/biblioteca.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    where, 
    or,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    increment
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";
import { registrarLecturaLibre } from "./gestorLibros.js";
import { asegurarHiloTaberna } from "./taberna.js";
import { inicializarBuscadorGremio, abrirBuscadorGremio } from "./buscadorGremio.js";

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

async function cargarBiblioteca() {
    try {
        const estante = document.getElementById("estante-libros");
        if (!estante) return;
        
        estante.innerHTML = "";

        // 1. OBTENER DATOS OFICIALES DEL AVENTURERO (Sincronización de Contadores)
        const aventureroRef = doc(db, "aventureros", currentUser.uid);
        const aventureroSnap = await getDoc(aventureroRef);
        
        if (aventureroSnap.exists()) {
            const dataAventurero = aventureroSnap.data();
            
            const elemLibros = document.getElementById("total-libros");
            const elemPaginas = document.getElementById("total-paginas");
            const elemXp = document.getElementById("total-xp");
            const elemPrestigio = document.getElementById("total-prestigio");
            const elemMarcapaginas = document.getElementById("total-marcapaginas") || document.getElementById("contador-marcapaginas");

            if (elemLibros) elemLibros.textContent = dataAventurero.librosCompletados || 0;
            if (elemPaginas) elemPaginas.textContent = dataAventurero.paginasLeidas || 0;
            if (elemXp) elemXp.textContent = `${dataAventurero.xp || 0} XP`;
            if (elemPrestigio) elemPrestigio.textContent = dataAventurero.prestigio || 0;
            if (elemMarcapaginas) elemMarcapaginas.textContent = dataAventurero.marcapaginas || 0;
        }

        // 2. CARGAR Y RENDERIZAR LOS LOMOS DE LA ESTANTERÍA
        const q = query(
            collection(db, "biblioteca"), 
            or(
                where("lectores", "array-contains", currentUser.uid),
                where("usuarioId", "==", currentUser.uid)
            )
        );
        
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            estante.innerHTML = `<p class="sin-datos">Tu estantería está vacía. Completa retos o añade lecturas libres para llenar tus pergaminos.</p>`;
        } else {
            snapshot.forEach(docSnap => {
                const libro = docSnap.data();
                renderizarLomoLibro(libro);
            });
        }

    } catch (error) {
        console.error("Error al cargar la biblioteca:", error);
    }
}

let tooltipGlobal = document.getElementById("tooltip-global");
if (!tooltipGlobal) {
    tooltipGlobal = document.createElement("div");
    tooltipGlobal.id = "tooltip-global";
    tooltipGlobal.className = "tooltip-libro-global";
    document.body.appendChild(tooltipGlobal);
}

// 🎨 Función para determinar el color del lomo según la leyenda del Atlas
function obtenerColorSegunGenero(libro) {
    // Si ya trae un color personalizado guardado, se respeta
    if (libro.colorLomo) return libro.colorLomo;
    if (libro.color) return libro.color;

    // Extraer géneros posibles (puede venir como string, array o dentro de géneros del libro)
    let generosTexto = "";
    if (Array.isArray(libro.generos)) {
        generosTexto = libro.generos.join(" ").toLowerCase();
    } else if (typeof libro.genero === "string") {
        generosTexto = libro.genero.toLowerCase();
    } else if (typeof libro.generos === "string") {
        generosTexto = libro.generos.toLowerCase();
    }

    // Comprobaciones según la leyenda del atlas
    if (generosTexto.includes("fantasia") || generosTexto.includes("fantasía")) {
        return "#2e7d32"; // Verde para fantasía
    }
    if (generosTexto.includes("ficcion") || generosTexto.includes("ficción")) {
        return "#c62828"; // Rojo para ficción
    }
    if (generosTexto.includes("terror") || generosTexto.includes("miedo") || generosTexto.includes("suspense")) {
        return "#6a1b9a"; // Morado para terror
    }
    if (generosTexto.includes("no ficcion") || generosTexto.includes("no-ficción") || generosTexto.includes("historia") || generosTexto.includes("biografia") || generosTexto.includes("ensayo")) {
        return "#d4af37"; // Dorado para no ficción
    }

    // Color por defecto si no coincide con ninguno (o si es un reto genérico)
    const esReto = libro.esReto || libro.tipoOrigen === "RETO_GREMIO" || (libro.retosAsociados && libro.retosAsociados.length > 0);
    return esReto ? "#8e44ad" : "#8b263e"; 
}

function renderizarLomoLibro(libro) {
    const estante = document.getElementById("estante-libros");
    if (!estante) return;

    const lomo = document.createElement("div");
    lomo.className = "lomo-libro";
    
    const paginasNum = Number(libro.paginas) || 100;
    const ancho = Math.min(Math.max(paginasNum / 12, 28), 65);
    const alto = Math.min(Math.max(180 + (paginasNum / 10), 190), 240);

    const esReto = libro.esReto || libro.tipoOrigen === "RETO_GREMIO" || (libro.retosAsociados && libro.retosAsociados.length > 0);
    
    // Aplicamos la función inteligente de colores
    const colorFondo = obtenerColorSegunGenero(libro);

    lomo.style.width = `${ancho}px`;
    lomo.style.height = `${alto}px`;
    lomo.style.backgroundColor = colorFondo;

    let fechaTexto = "Fecha no registrada";
    if (libro.fechaCompletado || libro.fechaTerminado) {
        const fechaBruta = libro.fechaCompletado || libro.fechaTerminado;
        const fechaObj = fechaBruta.toDate ? fechaBruta.toDate() : new Date(fechaBruta);
        if (!isNaN(fechaObj)) {
            fechaTexto = fechaObj.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
        }
    }

    const tituloSpan = document.createElement("span");
    tituloSpan.className = "lomo-titulo";
    tituloSpan.textContent = libro.titulo || "Sin título";
    lomo.appendChild(tituloSpan);

    const urlPortada = libro.portadaUrl || libro.imagenUrl || "https://via.placeholder.com/100x150/1e1e2f/f39c12?text=Sin+Portada";

    lomo.addEventListener("mouseenter", (e) => {
        tooltipGlobal.innerHTML = `
            <div class="tooltip-cuerpo">
                <img src="${urlPortada}" alt="Portada" class="tooltip-portada" onerror="this.src='https://via.placeholder.com/100x150/1e1e2f/f39c12?text=Sin+Portada';" />
                <div class="tooltip-info">
                    <div class="tooltip-titulo">📖 ${libro.titulo || 'Sin título'}</div>
                    <div class="tooltip-autor"><em>de ${libro.autor || 'Autor desconocido'}</em></div>
                    <hr class="tooltip-divisor">
                    <div class="tooltip-detalle">📄 <strong>${paginasNum}</strong> páginas</div>
                    <div class="tooltip-detalle">📅 Leído: <strong>${fechaTexto}</strong></div>
                    ${esReto ? '<div class="tooltip-badge">📜 Reto del Gremio</div>' : '<div class="tooltip-badge badge-libre">📚 Lectura Libre</div>'}
                </div>
            </div>
        `;
        
        tooltipGlobal.style.display = "block";
        posicionarTooltip(e);
    });

    lomo.addEventListener("mousemove", (e) => {
        posicionarTooltip(e);
    });

    lomo.addEventListener("mouseleave", () => {
        tooltipGlobal.style.display = "none";
    });

    estante.appendChild(lomo);
}

function posicionarTooltip(e) {
    const offset = 15;
    let left = e.clientX + offset;
    let top = e.clientY - (tooltipGlobal.offsetHeight / 2);

    if (left + tooltipGlobal.offsetWidth > window.innerWidth - 10) {
        left = e.clientX - tooltipGlobal.offsetWidth - offset;
    }

    if (top < 10) {
        top = 10;
    } else if (top + tooltipGlobal.offsetHeight > window.innerHeight - 10) {
        top = window.innerHeight - tooltipGlobal.offsetHeight - 10;
    }

    tooltipGlobal.style.left = `${left}px`;
    tooltipGlobal.style.top = `${top}px`;
}

// Control del Modal Rápido en la Biblioteca
// Control del Modal Rápido en la Biblioteca
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

if (formLibro) {
    formLibro.addEventListener("submit", async (e) => {
        e.preventDefault();

        const titulo = document.getElementById("titulo").value.trim();
        const autor = document.getElementById("autor").value.trim();
        const paginas = Number(document.getElementById("paginas").value) || 0;
        const color = document.getElementById("color") ? document.getElementById("color").value : "#8b263e";
        const generoInput = document.getElementById("genero") ? document.getElementById("genero").value : "Fantasía";

        try {
            const libroId = titulo.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_");

            // 1. RECOMPENSAS (Prestigio y Marcapáginas, sin XP)
            const gananciaPrestigio = paginas + Math.floor(Math.random() * (paginas + 1));
            const gananciaMarcapaginas = Math.floor(Math.random() * (paginas || 1)) + 1;

            // 2. REGISTRAR EN LA COLECCIÓN GLOBAL "BIBLIOTECA"
            await setDoc(doc(db, "biblioteca", `${currentUser.uid}_${libroId}`), {
                titulo,
                autor,
                paginas,
                portadaUrl: "https://via.placeholder.com/100x150/1e1e2f/f39c12?text=Sin+Portada",
                usuarioId: currentUser.uid,
                lectores: [currentUser.uid],
                fechaCompletado: new Date(),
                colorLomo: color,
                generos: [generoInput],
                tipoOrigen: "LECTURA_LIBRE"
            }, { merge: true });

            // 3. REGISTRAR EN LAS MISIONES SECUNDARIAS / PERFIL Y ACTUALIZAR CONTADORES GLOBALES
            const aventureroRef = doc(db, "aventureros", currentUser.uid);
            const nuevaMisionSecundaria = {
                id: libroId,
                titulo: titulo,
                autor: autor,
                paginas: paginas,
                estado: "TERMINADA",
                generos: [generoInput],
                colorLomo: color,
                fechaCreacion: new Date().toISOString()
            };

            await updateDoc(aventureroRef, {
                misionesSecundarias: arrayUnion(nuevaMisionSecundaria),
                prestigio: increment(gananciaPrestigio),
                marcapaginas: increment(gananciaMarcapaginas),
                paginasLeidas: increment(paginas),
                librosCompletados: increment(1)
            });

            // 4. REGISTRAR EN EL ATLAS / ESTANTERÍA GLOBAL (Usando la función oficial del Gremio)
            const datosLibroParaAtlas = {
                id: libroId,
                titulo: titulo,
                autor: autor,
                paginas: paginas,
                genero: generoInput,
                portadaUrl: "https://via.placeholder.com/100x150/1e1e2f/f39c12?text=Sin+Portada",
                fechaTerminado: new Date().toISOString(),
                colorLomo: color
            };
            await registrarLecturaLibre(currentUser.uid, datosLibroParaAtlas);

            // 5. ASEGURAR HILO EN LA TABERNA PARA DEBATIR
            await asegurarHiloTaberna(currentUser.uid, datosLibroParaAtlas, 'misiones');

            alert(`🎉 ¡Lectura libre registrada con éxito!\n\n🏆 +${gananciaPrestigio} Puntos de Prestigio\n🔖 +${gananciaMarcapaginas} Marcapáginas\n📚 El lomo luce en tu Estantería, el Atlas ha sido iluminado y ¡se ha abierto su debate en la Taberna!`);
            
            if (modal) modal.classList.add("oculto");
            formLibro.reset();
            await cargarBiblioteca();

        } catch (error) {
            console.error("Error al guardar la lectura libre:", error);
            alert("❌ Ocurrió un error al registrar el libro y sus recompensas.");
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarBuscadorGremio();

  document.getElementById("btn-abrir-buscador")?.addEventListener("click", () => {
    abrirBuscadorGremio();
  });
});