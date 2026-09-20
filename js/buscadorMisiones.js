// // js/buscadorMisiones.js
// import { getFirestore, doc, updateDoc, arrayUnion, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// import { app } from "./firebase-config.js";

// const db = getFirestore(app);

// // 🔑 Configuración de Google Books y Cloudinary
// const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
// const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
// const CLOUDINARY_UPLOAD_PRESET = "avatar_users";

// // Estado local para los géneros y huellas seleccionados en el modal
// let generosSeleccionados = [];
// let huellasMision = []; 

// export async function inicializarFormularioMisiones(currentUserId, onMisionGuardada) {
//   const form = document.getElementById("form-registrar-mision-libre");
//   const selectGeneros = document.getElementById("select-generos-mision");
//   const contenedorGenerosTags = document.getElementById("generos-tags-contenedor-mision");
  
//   // Cargar círculos de conocimiento (géneros)
//   await cargarSelectGeneros(selectGeneros);

//   if (selectGeneros && contenedorGenerosTags) {
//     selectGeneros.addEventListener("change", (e) => {
//       const valor = e.target.value;
//       if (!valor) return;
//       if (!generosSeleccionados.includes(valor)) {
//         generosSeleccionados.push(valor);
//         renderizarTagsGeneros(contenedorGenerosTags);
//       }
//       selectGeneros.value = ""; 
//     });
//   }

//   // Inicializar manejador de huellas (Rasgos y Cicatrices)
//   inicializarSeccionHuellas();

//   // Subida de archivos de portada propios (Cloudinary)
//   const inputPortadaFile = document.getElementById("portada-mision-file");
//   const inputPortadaUrl = document.getElementById("portada-mision-url");
//   const previewPortada = document.getElementById("preview-portada-mision");

//   if (inputPortadaFile) {
//     inputPortadaFile.addEventListener("change", async (e) => {
//       const file = e.target.files[0];
//       if (!file) return;

//       try {
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

//         const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
//           method: "POST",
//           body: formData
//         });

//         if (!res.ok) throw new Error("Error al subir la imagen a Cloudinary");
//         const data = await res.json();
        
//         if (inputPortadaUrl) inputPortadaUrl.value = data.secure_url;
//         if (previewPortada) {
//           previewPortada.src = data.secure_url;
//           previewPortada.style.display = "block";
//         }
//       } catch (err) {
//         console.error(err);
//         alert("❌ Error al subir la portada.");
//       }
//     });
//   }

//   // Guardar Misión
//   if (form) {
//     form.onsubmit = async (e) => {
//       e.preventDefault();

//       const titulo = document.getElementById("titulo-mision")?.value.trim();
//       const autor = document.getElementById("autor-mision")?.value.trim();
//       const paginas = Number(document.getElementById("paginas-mision")?.value || 0);
//       const estado = document.getElementById("estado-mision")?.value || "en_progreso";
//       const proclama = document.getElementById("proclama-mision")?.value.trim() || "";
//       const portadaUrl = document.getElementById("portada-mision-url")?.value || "";

//       if (!titulo || !autor) {
//         alert("⚠️ Por favor completa el título y el autor.");
//         return;
//       }

//       const rasgosObj = {};
//       const cicatricesObj = {};

//       huellasMision.forEach(h => {
//         if (h.tipo === 'rasgo') {
//           rasgosObj[h.nombre] = { nombre: h.nombre, acumulaciones: 1, icono: '✨' };
//         } else {
//           cicatricesObj[h.nombre] = { nombre: h.nombre, acumulaciones: 1, icono: '🩸' };
//         }
//       });

//       const nuevaMision = {
//         titulo,
//         autor,
//         paginas,
//         estado: estado === 'completada' ? 'TERMINADA' : 'EN_PROGRESO',
//         proclama,
//         portadaUrl,
//         generos: generosSeleccionados.length > 0 ? generosSeleccionados : ["Fantasía"],
//         rasgos: rasgosObj,
//         cicatrices: cicatricesObj,
//         fechaCreacion: new Date().toISOString()
//       };

//       try {
//         const userRef = doc(db, "aventureros", currentUserId);
        
//         await updateDoc(userRef, {
//           misionesSecundarias: arrayUnion(nuevaMision)
//         });

//         // Limpieza y cierre
//         form.reset();
//         generosSeleccionados = [];
//         huellasMision = [];
//         if (contenedorGenerosTags) contenedorGenerosTags.innerHTML = "";
//         renderizarTagsHuellas();
//         if (previewPortada) previewPortada.style.display = "none";

//         const modal = document.getElementById("modal-buscador-mision");
//         if (modal) {
//           modal.classList.add("oculto");
//           modal.style.display = "none";
//         }

//         if (typeof onMisionGuardada === 'function') {
//           onMisionGuardada(nuevaMision);
//         }
//       } catch (error) {
//         console.error("Error al guardar la misión:", error);
//         alert("❌ No se pudo guardar la misión en el grimorio.");
//       }
//     };
//   }
// }

// // Cargar géneros en el selector
// async function cargarSelectGeneros(selectElement) {
//   if (!selectElement) return;
//   selectElement.innerHTML = `<option value="">-- Selecciona Círculo de Conocimiento --</option>`;
  
//   const generosBase = [
//     "Fantasía", "Ciencia Ficción", "Filosofía", "Historia", 
//     "Misterio", "Desarrollo Personal", "Terror", "Romance", "Poesía", "Clásicos"
//   ];

//   generosBase.forEach(gen => {
//     const opt = document.createElement("option");
//     opt.value = gen;
//     opt.textContent = gen;
//     selectElement.appendChild(opt);
//   });
// }

// function renderizarTagsGeneros(contenedor) {
//   contenedor.innerHTML = "";
//   generosSeleccionados.forEach((gen, index) => {
//     const tag = document.createElement("div");
//     tag.className = "tag";
//     tag.innerHTML = `${gen} <span data-index="${index}">&times;</span>`;
    
//     tag.querySelector("span").addEventListener("click", () => {
//       generosSeleccionados.splice(index, 1);
//       renderizarTagsGeneros(contenedor);
//     });
//     contenedor.appendChild(tag);
//   });
// }

// function inicializarSeccionHuellas() {
//   const btnAddHuella = document.getElementById("btn-add-huella-mision");
//   const inputHuella = document.getElementById("input-nueva-huella-mision");
//   const selectTipo = document.getElementById("select-tipo-huella-mision");

//   if (btnAddHuella && inputHuella && selectTipo) {
//     btnAddHuella.addEventListener("click", () => {
//       const texto = inputHuella.value.trim();
//       if (!texto) return;
//       const tipo = selectTipo.value; 

//       huellasMision.push({ nombre: texto, tipo });
//       inputHuella.value = "";
//       renderizarTagsHuellas();
//     });
//   }
// }

// function renderizarTagsHuellas() {
//   const containerRasgos = document.getElementById("container-rasgos-mision");
//   const containerCicatrices = document.getElementById("container-cicatrices-mision");

//   if (containerRasgos) containerRasgos.innerHTML = "";
//   if (containerCicatrices) containerCicatrices.innerHTML = "";

//   huellasMision.forEach((h, index) => {
//     const tag = document.createElement("div");
//     tag.className = "tag";
//     tag.innerHTML = `${h.nombre} <span data-index="${index}">&times;</span>`;

//     tag.querySelector("span").addEventListener("click", () => {
//       huellasMision.splice(index, 1);
//       renderizarTagsHuellas();
//     });

//     if (h.tipo === 'rasgo' && containerRasgos) {
//       containerRasgos.appendChild(tag);
//     } else if (h.tipo === 'cicatriz' && containerCicatrices) {
//       containerCicatrices.appendChild(tag);
//     }
//   });
// }

// // 🔍 Búsqueda restaurada y conectada a Google Books API con validación de query
// export async function buscarEnGoogleBooks(query, contenedorResultados) {
//   if (!query || !query.trim()) {
//     contenedorResultados.style.display = "none";
//     contenedorResultados.innerHTML = "";
//     return;
//   }

//   contenedorResultados.style.display = "block";
//   contenedorResultados.innerHTML = `<div class="item-resultado" style="padding: 10px; color: #d4af37;">⏳ Buscando grimorios...</div>`;

//   try {
//     const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`;
//     const res = await fetch(url);
//     const data = await res.json();

//     contenedorResultados.innerHTML = "";
//     if (!data.items || data.items.length === 0) {
//       contenedorResultados.innerHTML = `<div class="item-resultado" style="padding: 10px; color: #ccc;">No se encontraron grimorios/libros.</div>`;
//       return;
//     }

//     data.items.forEach(item => {
//       const info = item.volumeInfo;
//       const titulo = info.title || "Sin título";
//       const autor = info.authors ? info.authors.join(", ") : "Autor desconocido";
//       const paginas = info.pageCount || 150;
//       const portada = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";

//       const div = document.createElement("div");
//       div.className = "item-resultado";
//       div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer; border-bottom: 1px solid #443224; background: rgba(0,0,0,0.2);";
//       div.innerHTML = `
//         ${portada ? `<img src="${portada.replace('http://', 'https://')}" style="width: 35px; height: 50px; object-fit: cover; border-radius: 3px;" />` : '📖'}
//         <div>
//           <strong style="font-size: 0.9rem; color: #fff8e7;">${titulo}</strong><br>
//           <small style="color: #d4af37;">${autor} (${paginas} págs)</small>
//         </div>
//       `;

//       div.addEventListener("click", () => {
//         // Rellenar campos automáticamente
//         const inputTitulo = document.getElementById("titulo-mision");
//         const inputAutor = document.getElementById("autor-mision");
//         const inputPaginas = document.getElementById("paginas-mision");
//         const inputPortadaUrl = document.getElementById("portada-mision-url");
//         const preview = document.getElementById("preview-portada-mision");

//         if (inputTitulo) inputTitulo.value = titulo;
//         if (inputAutor) inputAutor.value = autor;
//         if (inputPaginas) inputPaginas.value = paginas;
        
//         if (portada) {
//           const imgHttps = portada.replace("http://", "https://");
//           if (inputPortadaUrl) inputPortadaUrl.value = imgHttps;
//           if (preview) {
//             preview.src = imgHttps;
//             preview.style.display = "block";
//           }
//         }

//         // Ocultar resultados de búsqueda
//         contenedorResultados.style.display = "none";
//         contenedorResultados.innerHTML = "";
//       });

//       contenedorResultados.appendChild(div);
//     });
//   } catch (error) {
//     console.error("Error conectando con Google Books:", error);
//     contenedorResultados.innerHTML = `<div class="item-resultado" style="padding: 10px; color: #ff6b6b;">❌ Error al conectar con la biblioteca.</div>`;
//   }
// }

// export function limpiarSeleccionBuscador() {
//   generosSeleccionados = [];
//   huellasMision = [];
// }

// // // js/buscadorMisiones.js
// // import { getFirestore, doc, updateDoc, arrayUnion, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// // import { app } from "./firebase-config.js";
// // import { BANCO_HUELLAS } from "./rasgosData.js";

// // const db = getFirestore(app);

// // // 🔑 CONFIGURACIÓN COMPARTIDA CON ADMIN
// // const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
// // const CLOUDINARY_UPLOAD_PRESET = "portadas";
// // const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
// // const PORTADA_DEFAULT = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400";

// // let libroSeleccionado = null;

// // // Normaliza el título para crear un ID de documento limpio
// // export function generarLibroId(titulo) {
// //   return titulo
// //     .toLowerCase()
// //     .trim()
// //     .normalize("NFD")
// //     .replace(/[\u0300-\u036f]/g, "")
// //     .replace(/[^a-z0-9]+/g, "_")
// //     .replace(/^_+|_+$/g, "");
// // }

// // // 🎲 GENERADOR AUTOMÁTICO DE HUELLAS (Rasgos y Cicatrices)
// // // Genera de forma limpia y transparente las huellas basadas en el libro/páginas/géneros
// // function calcularHuellasAutomaticas(paginas, generos = []) {
// //   const rasgosGuardar = [];
// //   const cicatricesGuardar = [];

// //   if (!BANCO_HUELLAS) {
// //     return { rasgosGuardar, cicatricesGuardar };
// //   }

// //   // 1. Asignación de Rasgos según géneros seleccionados o longitud
// //   if (BANCO_HUELLAS.rasgos) {
// //     BANCO_HUELLAS.rasgos.forEach(r => {
// //       // Si el género del libro coincide con el rasgo o si es un libro largo (+400 pág)
// //       const coincideGenero = generos.some(g => r.nombre.toLowerCase().includes(g.toLowerCase()));
// //       const esLibroLargo = paginas >= 400 && (r.nombre.includes("Sabiduría") || r.nombre.includes("Resistencia"));

// //       if (coincideGenero || esLibroLargo) {
// //         rasgosGuardar.push({
// //           id: r.id || r.nombre,
// //           nombre: r.nombre,
// //           icono: r.icono || "✨"
// //         });
// //       }
// //     });
// //   }

// //   // 2. Asignación de Cicatrices según extensión del libro (Libros pesados/desafiantes)
// //   if (BANCO_HUELLAS.cicatrices && paginas > 300) {
// //     const cicatrizBasica = BANCO_HUELLAS.cicatrices[0];
// //     if (cicatrizBasica) {
// //       cicatricesGuardar.push({
// //         id: cicatrizBasica.id || cicatrizBasica.nombre,
// //         nombre: cicatrizBasica.nombre,
// //         icono: cicatrizBasica.icono || "⚡"
// //       });
// //     }
// //   }

// //   return { rasgosGuardar, cicatricesGuardar };
// // }

// // // Subida a Cloudinary de la portada si el usuario subió archivo
// // async function subirArchivoACloudinary(file) {
// //   const formData = new FormData();
// //   formData.append("file", file);
// //   formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

// //   const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
// //   const respuesta = await fetch(url, { method: "POST", body: formData });

// //   if (!respuesta.ok) throw new Error("Error subiendo el archivo local a Cloudinary");
// //   const data = await respuesta.json();
// //   return data.secure_url;
// // }

// // // Resuelve la URL final de la portada
// // async function obtenerUrlPortadaValida(archivoLocal, urlGB) {
// //   if (archivoLocal) {
// //     try {
// //       return await subirArchivoACloudinary(archivoLocal);
// //     } catch (err) {
// //       console.warn("Falló la subida local, utilizando portada por defecto:", err);
// //       return PORTADA_DEFAULT;
// //     }
// //   }
// //   if (urlGB) return urlGB;
// //   return PORTADA_DEFAULT;
// // }

// // // 🔍 Función principal de búsqueda en Google Books
// // export async function buscarEnGoogleBooks(query, contenedorResultados) {
// //   if (!query.trim()) return;

// //   contenedorResultados.style.display = "block";
// //   contenedorResultados.innerHTML = "<div class='item-resultado'>⏳ Buscando tomos en la gran biblioteca...</div>";

// //   try {
// //     const response = await fetch(
// //       `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6&key=${GOOGLE_BOOKS_API_KEY}`
// //     );

// //     if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

// //     const data = await response.json();

// //     if (!data.items || data.items.length === 0) {
// //       contenedorResultados.innerHTML = "<div class='item-resultado'>No se encontraron tomos.</div>";
// //       return;
// //     }

// //     contenedorResultados.innerHTML = "";

// //     data.items.forEach(item => {
// //       const info = item.volumeInfo;
// //       const autores = info.authors ? info.authors.join(", ") : "Autor desconocido";
// //       const imagenUrl = (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail))
// //         ? (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail).replace("http://", "https://")
// //         : "";

// //       const div = document.createElement("div");
// //       div.className = "item-resultado-gb";
// //       div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px 12px; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.1);";

// //       div.innerHTML = `
// //         ${imagenUrl 
// //           ? `<img src="${imagenUrl}" style="width: 40px; height: 55px; object-fit: cover; border-radius: 4px;">` 
// //           : `<div style="width: 40px; height: 55px; background: #333; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #ccc;">Sin foto</div>`
// //         }
// //         <div>
// //           <div style="font-weight: bold; color: #ffd700; font-size: 0.95rem;">${info.title}</div>
// //           <div style="font-size: 0.85rem; color: #bbb;">${autores}</div>
// //           <small style="color: #888;">📖 ${info.pageCount || '???'} páginas</small>
// //         </div>
// //       `;

// //       div.addEventListener("click", () => {
// //         seleccionarLibroGB(info, imagenUrl);
// //         contenedorResultados.style.display = "none";
// //       });

// //       contenedorResultados.appendChild(div);
// //     });

// //   } catch (error) {
// //     console.error("Error al conectar con Google Books:", error);
// //     contenedorResultados.innerHTML = "<div class='item-resultado'>❌ Error al conectar con la gran biblioteca.</div>";
// //   }
// // }

// // // Selecciona un libro y rellena el formulario de la UI
// // function seleccionarLibroGB(info, imagenUrl) {
// //   const generosGB = info.categories ? info.categories[0] : "Fantasía";

// //   libroSeleccionado = {
// //     titulo: info.title || "",
// //     autor: info.authors ? info.authors.join(", ") : "Autor Desconocido",
// //     paginas: info.pageCount || 100,
// //     descripcion: info.description ? info.description.slice(0, 300) + "..." : "",
// //     portadaUrl: imagenUrl,
// //     genero: generosGB
// //   };

// //   const elemTitulo = document.getElementById("mision-titulo");
// //   const elemAutor = document.getElementById("mision-autor");
// //   const elemPaginas = document.getElementById("mision-paginas");
// //   const elemDesc = document.getElementById("mision-descripcion");
// //   const elemPortadaUrl = document.getElementById("mision-portada-url");
// //   const imgPreview = document.getElementById("mision-preview-portada");
// //   const formConfirmar = document.getElementById("form-confirmar-mision");

// //   if (elemTitulo) elemTitulo.value = libroSeleccionado.titulo;
// //   if (elemAutor) elemAutor.value = libroSeleccionado.autor;
// //   if (elemPaginas) elemPaginas.value = libroSeleccionado.paginas;
// //   if (elemDesc) elemDesc.value = libroSeleccionado.descripcion;
// //   if (elemPortadaUrl) elemPortadaUrl.value = libroSeleccionado.portadaUrl;

// //   if (imgPreview) {
// //     imgPreview.src = imagenUrl || PORTADA_DEFAULT;
// //     imgPreview.style.display = "block";
// //   }

// //   // Mantenemos limpia la UI vaciando los contenedores del DOM
// //   renderizarOpcionesHuellas();

// //   if (formConfirmar) formConfirmar.classList.remove("oculto");
// // }

// // // 🙈 Vacía los contenedores HTML para que el usuario NUNCA vea los selectores en pantalla
// // export function renderizarOpcionesHuellas() {
// //   const contenedorRasgos = document.getElementById("mision-opciones-rasgos");
// //   const contenedorCicatrices = document.getElementById("mision-opciones-cicatrices");

// //   if (contenedorRasgos) contenedorRasgos.innerHTML = "";
// //   if (contenedorCicatrices) contenedorCicatrices.innerHTML = "";
// // }

// // // 💾 Guardado definitivo en Firestore
// // export async function registrarMisionAventurero(userId, datosFormulario) {
// //   const { 
// //     titulo, 
// //     autor, 
// //     paginas, 
// //     proclama, 
// //     estado, 
// //     archivoLocal, 
// //     urlPortadaGB,
// //     generos = [] 
// //   } = datosFormulario;

// //   const urlFinalPortada = await obtenerUrlPortadaValida(archivoLocal, urlPortadaGB);
// //   const libroId = generarLibroId(titulo);

// //   // ⚙️ CALCULO AUTOMÁTICO EN EL BACKEND DE LA APP
// //   const { rasgosGuardar, cicatricesGuardar } = calcularHuellasAutomaticas(paginas, generos);

// //   // 1. Registro en la colección global 'biblioteca'
// //   const datosBiblioteca = {
// //     titulo,
// //     autor,
// //     paginas,
// //     generos,
// //     rasgos: rasgosGuardar,
// //     cicatrices: cicatricesGuardar,
// //     portadaUrl: urlFinalPortada,
// //     portada: urlFinalPortada,
// //     esReto: false,
// //     tipoOrigen: "LECTURA_LIBRE",
// //     proponente: userId,
// //     fechaCreacion: Date.now()
// //   };

// //   const docBibliotecaRef = doc(db, "biblioteca", libroId);
// //   await setDoc(docBibliotecaRef, datosBiblioteca, { merge: true });

// //   // 2. Misión/Lectura individual del Aventurero
// //   const nuevaMision = {
// //     id: `mision_${Date.now()}`,
// //     libroId: libroId,
// //     titulo,
// //     autor,
// //     paginas,
// //     proclama,
// //     estado,
// //     generos,
// //     rasgos: rasgosGuardar,
// //     cicatrices: cicatricesGuardar,
// //     portada: urlFinalPortada,
// //     fechaRegistro: new Date().toISOString()
// //   };

// //   const userRef = doc(db, "aventureros", userId);
// //   await updateDoc(userRef, {
// //     misionesSecundarias: arrayUnion(nuevaMision)
// //   });

// //   return nuevaMision;
// // }

// // export function limpiarSeleccionBuscador() {
// //   libroSeleccionado = null;
// // }

// // // Inicializador de eventos del formulario
// // export function inicializarFormularioMisiones(userId, callbackExito) {
// //   const formConfirmar = document.getElementById('form-confirmar-mision');
// //   if (!formConfirmar) return;

// //   formConfirmar.addEventListener('submit', async (e) => {
// //     e.preventDefault();

// //     const btnSubmit = formConfirmar.querySelector('button[type="submit"]');
// //     if (btnSubmit) btnSubmit.disabled = true;

// //     try {
// //       const generosSeleccionados = Array.from(
// //         document.querySelectorAll('input[name="genero"]:checked')
// //       ).map(cb => cb.value);

// //       const inputArchivo = document.getElementById('mision-portada-file');
// //       const archivoLocal = inputArchivo && inputArchivo.files.length > 0 ? inputArchivo.files[0] : null;

// //       const datosMision = {
// //         titulo: document.getElementById('mision-titulo').value,
// //         autor: document.getElementById('mision-autor').value,
// //         paginas: parseInt(document.getElementById('mision-paginas').value, 10) || 0,
// //         proclama: document.getElementById('mision-proclama').value,
// //         estado: document.getElementById('mision-estado').value,
// //         urlPortadaGB: document.getElementById('mision-portada-url')?.value || "",
// //         archivoLocal: archivoLocal,
// //         generos: generosSeleccionados
// //       };

// //       const misionGuardada = await registrarMisionAventurero(userId, datosMision);
// //       console.log('✅ Misión creada y huellas guardadas en Firestore:', misionGuardada);

// //       formConfirmar.reset();
// //       limpiarSeleccionBuscador();
// //       const modal = document.getElementById('modal-buscador-mision');
// //       if (modal) modal.classList.add('oculto');

// //       if (callbackExito) callbackExito(misionGuardada);

// //     } catch (err) {
// //       console.error('❌ Error al registrar la misión:', err);
// //       alert('Ocurrió un error al guardar la misión.');
// //     } finally {
// //       if (btnSubmit) btnSubmit.disabled = false;
// //     }
// //   });
// // }

// // js/buscadorMisiones.js
// import { getFirestore, collection, getDocs, addDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// import { app } from "./firebase-config.js";

// const db = getFirestore(app);

// // Estado local para los géneros y huellas seleccionados en el modal de perfil
// let generosSeleccionados = [];
// let huellasMision = []; // Almacenará rasgos y cicatrices añadidos

// export async function inicializarFormularioMisiones(currentUserId, onMisionGuardada) {
//   const form = document.getElementById("form-registrar-mision-libre");
//   const selectGeneros = document.getElementById("select-generos-mision");
//   const contenedorGenerosTags = document.getElementById("generos-tags-contenedor-mision");
  
//   // Cargar géneros disponibles desde Firestore al desplegable
//   await cargarSelectGeneros(selectGeneros);

//   // Manejador del selector de géneros
//   if (selectGeneros && contenedorGenerosTags) {
//     selectGeneros.addEventListener("change", (e) => {
//       const valor = e.target.value;
//       if (!valor) return;
//       if (!generosSeleccionados.includes(valor)) {
//         generosSeleccionados.push(valor);
//         renderizarTagsGeneros(contenedorGenerosTags);
//       }
//       selectGeneros.value = ""; // Resetear select
//     });
//   }

//   // Inicializar manejador de huellas (Rasgos y Cicatrices)
//   inicializarSeccionHuellas();

//   // Manejador de subida de archivos de portada propios (Cloudinary)
//   const inputPortadaFile = document.getElementById("portada-mision-file");
//   const inputPortadaUrl = document.getElementById("portada-mision-url");
//   const previewPortada = document.getElementById("preview-portada-mision");

//   if (inputPortadaFile) {
//     inputPortadaFile.addEventListener("change", async (e) => {
//       const file = e.target.files[0];
//       if (!file) return;

//       try {
//         const formData = new FormData();
//         formData.append("file", file);
//         formData.append("upload_preset", "avatar_users"); // O tu preset de Cloudinary

//         const res = await fetch(`https://api.cloudinary.com/v1_1/dwuokewzr/image/upload`, {
//           method: "POST",
//           body: formData
//         });

//         if (!res.ok) throw new Error("Error al subir la imagen a Cloudinary");
//         const data = await res.json();
        
//         if (inputPortadaUrl) inputPortadaUrl.value = data.secure_url;
//         if (previewPortada) {
//           previewPortada.src = data.secure_url;
//           previewPortada.style.display = "block";
//         }
//       } catch (err) {
//         console.error(err);
//         alert("❌ Error al subir la portada.");
//       }
//     });
//   }

//   // Guardar Misión
//   if (form) {
//     // Evitar múltiples bindings clonando el formulario o limpiando eventos previos si es necesario
//     form.onsubmit = async (e) => {
//       e.preventDefault();

//       const titulo = document.getElementById("titulo-mision")?.value.trim();
//       const autor = document.getElementById("autor-mision")?.value.trim();
//       const paginas = Number(document.getElementById("paginas-mision")?.value || 0);
//       const estado = document.getElementById("estado-mision")?.value || "en_progreso";
//       const proclama = document.getElementById("proclama-mision")?.value.trim() || "";
//       const portadaUrl = document.getElementById("portada-mision-url")?.value || "";

//       if (!titulo || !autor) {
//         alert("⚠️ Por favor completa el título y el autor.");
//         return;
//       }

//       // Separar huellas en rasgos y cicatrices para la base de datos
//       const rasgosObj = {};
//       const cicatricesObj = {};

//       huellasMision.forEach(h => {
//         if (h.tipo === 'rasgo') {
//           rasgosObj[h.nombre] = { nombre: h.nombre, acumulaciones: 1, icono: '✨' };
//         } else {
//           cicatricesObj[h.nombre] = { nombre: h.nombre, acumulaciones: 1, icono: '🩸' };
//         }
//       });

//       const nuevaMision = {
//         titulo,
//         autor,
//         paginas,
//         estado: estado === 'completada' ? 'TERMINADA' : 'EN_PROGRESO',
//         proclama,
//         portadaUrl,
//         generos: generosSeleccionados.length > 0 ? generosSeleccionados : ["Fantasía"],
//         rasgos: rasgosObj,
//         cicatrices: cicatricesObj,
//         fechaCreacion: new Date().toISOString()
//       };

//       try {
//         const { getDoc, updateDoc, doc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
//         const userRef = doc(db, "aventureros", currentUserId);
        
//         await updateDoc(userRef, {
//           misionesSecundarias: arrayUnion(nuevaMision)
//         });

//         // Limpiar formulario y cerrar modal
//         form.reset();
//         generosSeleccionados = [];
//         huellasMision = [];
//         if (contenedorGenerosTags) contenedorGenerosTags.innerHTML = "";
//         renderizarTagsHuellas();
//         if (previewPortada) previewPortada.style.display = "none";

//         const modal = document.getElementById("modal-buscador-mision");
//         if (modal) {
//           modal.classList.add("oculto");
//           modal.style.display = "none";
//         }

//         if (typeof onMisionGuardada === 'function') {
//           onMisionGuardada(nuevaMision);
//         }
//       } catch (error) {
//         console.error("Error al guardar la misión:", error);
//         alert("❌ No se pudo guardar la misión en el grimorio.");
//       }
//     };
//   }
// }

// // Cargar géneros en el selector
// async function cargarSelectGeneros(selectElement) {
//   if (!selectElement) return;
//   selectElement.innerHTML = `<option value="">-- Selecciona Círculo de Conocimiento --</option>`;
  
//   const generosBase = [
//     "Fantasía", "Ciencia Ficción", "Filosofía", "Historia", 
//     "Misterio", "Desarrollo Personal", "Terror", "Romance", "Poesía", "Clásicos"
//   ];

//   generosBase.forEach(gen => {
//     const opt = document.createElement("option");
//     opt.value = gen;
//     opt.textContent = gen;
//     selectElement.appendChild(opt);
//   });
// }

// function renderizarTagsGeneros(contenedor) {
//   contenedor.innerHTML = "";
//   generosSeleccionados.forEach((gen, index) => {
//     const tag = document.createElement("div");
//     tag.className = "tag";
//     tag.innerHTML = `${gen} <span data-index="${index}">&times;</span>`;
    
//     tag.querySelector("span").addEventListener("click", () => {
//       generosSeleccionados.splice(index, 1);
//       renderizarTagsGeneros(contenedor);
//     });
//     contenedor.appendChild(tag);
//   });
// }

// function inicializarSeccionHuellas() {
//   const btnAddHuella = document.getElementById("btn-add-huella-mision");
//   const inputHuella = document.getElementById("input-nueva-huella-mision");
//   const selectTipo = document.getElementById("select-tipo-huella-mision");

//   if (btnAddHuella && inputHuella && selectTipo) {
//     btnAddHuella.addEventListener("click", () => {
//       const texto = inputHuella.value.trim();
//       if (!texto) return;
//       const tipo = selectTipo.value; // 'rasgo' o 'cicatriz'

//       huellasMision.push({ nombre: texto, tipo });
//       inputHuella.value = "";
//       renderizarTagsHuellas();
//     });
//   }
// }

// function renderizarTagsHuellas() {
//   const containerRasgos = document.getElementById("container-rasgos-mision");
//   const containerCicatrices = document.getElementById("container-cicatrices-mision");

//   if (containerRasgos) containerRasgos.innerHTML = "";
//   if (containerCicatrices) containerCicatrices.innerHTML = "";

//   huellasMision.forEach((h, index) => {
//     const tag = document.createElement("div");
//     tag.className = "tag";
//     tag.innerHTML = `${h.nombre} <span data-index="${index}">&times;</span>`;

//     tag.querySelector("span").addEventListener("click", () => {
//       huellasMision.splice(index, 1);
//       renderizarTagsHuellas();
//     });

//     if (h.tipo === 'rasgo' && containerRasgos) {
//       containerRasgos.appendChild(tag);
//     } else if (h.tipo === 'cicatriz' && containerCicatrices) {
//       containerCicatrices.appendChild(tag);
//     }
//   });
// }

// // Búsqueda en Google Books y autocompletado
// export async function buscarEnGoogleBooks(query, contenedorResultados) {
//   try {
//     const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`);
//     const data = await res.json();

//     contenedorResultados.innerHTML = "";
//     if (!data.items || data.items.length === 0) {
//       contenedorResultados.innerHTML = `<div class="item-resultado">No se encontraron grimorios/libros.</div>`;
//       return;
//     }

//     data.items.forEach(item => {
//       const info = item.volumeInfo;
//       const titulo = info.title || "Sin título";
//       const autor = info.authors ? info.authors.join(", ") : "Autor desconocido";
//       const paginas = info.pageCount || 150;
//       const portada = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";

//       const div = document.createElement("div");
//       div.className = "item-resultado";
//       div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer; border-bottom: 1px solid #443224;";
//       div.innerHTML = `
//         ${portada ? `<img src="${portada}" style="width: 35px; height: 50px; object-fit: cover; border-radius: 3px;" />` : '📖'}
//         <div>
//           <strong style="font-size: 0.9rem; color: #fff8e7;">${titulo}</strong><br>
//           <small style="color: #d4af37;">${autor} (${paginas} págs)</small>
//         </div>
//       `;

//       div.addEventListener("click", () => {
//         // Rellenar automáticamente los campos del formulario de misión
//         document.getElementById("titulo-mision").value = titulo;
//         document.getElementById("autor-mision").value = autor;
//         document.getElementById("paginas-mision").value = paginas;
        
//         if (portada) {
//           const imgHttps = portada.replace("http://", "https://");
//           document.getElementById("portada-mision-url").value = imgHttps;
//           const preview = document.getElementById("preview-portada-mision");
//           if (preview) {
//             preview.src = imgHttps;
//             preview.style.display = "block";
//           }
//         }

//         // Ocultar resultados de búsqueda
//         contenedorResultados.style.display = "none";
//         contenedorResultados.innerHTML = "";
//       });

//       contenedorResultados.appendChild(div);
//     });
//   } catch (error) {
//     console.error("Error conectando con Google Books:", error);
//   }
// }

// export function limpiarSeleccionBuscador() {
//   generosSeleccionados = [];
//   huellasMision = [];
// }

// js/buscadorMisiones.js
import { getFirestore, doc, updateDoc, arrayUnion, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);

// 🔑 Configuración de Google Books y Cloudinary
const GOOGLE_BOOKS_API_KEY = "AIzaSyDcEUoGcKs6vwoNUF0ok1W-d8F2vVjCqP0";
const CLOUDINARY_CLOUD_NAME = "dwuokewzr";
const CLOUDINARY_UPLOAD_PRESET = "avatar_users";

// Estado local para los géneros y huellas seleccionados en el modal
let generosSeleccionados = [];
let huellasMision = []; 

export async function inicializarFormularioMisiones(currentUserId, onMisionGuardada) {
  const form = document.getElementById("form-registrar-mision-libre");
  const selectGeneros = document.getElementById("select-generos-mision");
  const contenedorGenerosTags = document.getElementById("generos-tags-contenedor-mision");
  
  // Cargar círculos de conocimiento (géneros)
  await cargarSelectGeneros(selectGeneros);

  if (selectGeneros && contenedorGenerosTags) {
    selectGeneros.addEventListener("change", (e) => {
      const valor = e.target.value;
      if (!valor) return;
      if (!generosSeleccionados.includes(valor)) {
        generosSeleccionados.push(valor);
        renderizarTagsGeneros(contenedorGenerosTags);
      }
      selectGeneros.value = ""; 
    });
  }

  // Inicializar manejador de huellas (Rasgos y Cicatrices)
  inicializarSeccionHuellas();

  // Subida de archivos de portada propios (Cloudinary)
  const inputPortadaFile = document.getElementById("portada-mision-file");
  const inputPortadaUrl = document.getElementById("portada-mision-url");
  const previewPortada = document.getElementById("preview-portada-mision");

  if (inputPortadaFile) {
    inputPortadaFile.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: formData
        });

        if (!res.ok) throw new Error("Error al subir la imagen a Cloudinary");
        const data = await res.json();
        
        if (inputPortadaUrl) inputPortadaUrl.value = data.secure_url;
        if (previewPortada) {
          previewPortada.src = data.secure_url;
          previewPortada.style.display = "block";
        }
      } catch (err) {
        console.error(err);
        alert("❌ Error al subir la portada.");
      }
    });
  }

  // Guardar Misión
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const titulo = document.getElementById("titulo-mision")?.value.trim();
      const autor = document.getElementById("autor-mision")?.value.trim();
      const paginas = Number(document.getElementById("paginas-mision")?.value || 0);
      const estado = document.getElementById("estado-mision")?.value || "en_progreso";
      const proclama = document.getElementById("proclama-mision")?.value.trim() || "";
      const portadaUrl = document.getElementById("portada-mision-url")?.value || "";

      if (!titulo || !autor) {
        alert("⚠️ Por favor completa el título y el autor.");
        return;
      }

      const rasgosObj = {};
      const cicatricesObj = {};

      huellasMision.forEach(h => {
        if (h.tipo === 'rasgo') {
          rasgosObj[h.nombre] = { nombre: h.nombre, acumulaciones: 1, icono: '✨' };
        } else {
          cicatricesObj[h.nombre] = { nombre: h.nombre, acumulaciones: 1, icono: '🩸' };
        }
      });

      const nuevaMision = {
        titulo,
        autor,
        paginas,
        estado: estado === 'completada' ? 'TERMINADA' : 'EN_PROGRESO',
        proclama,
        portadaUrl,
        generos: generosSeleccionados.length > 0 ? generosSeleccionados : ["Fantasía"],
        rasgos: rasgosObj,
        cicatrices: cicatricesObj,
        fechaCreacion: new Date().toISOString()
      };

      try {
        const userRef = doc(db, "aventureros", currentUserId);
        
        await updateDoc(userRef, {
          misionesSecundarias: arrayUnion(nuevaMision)
        });

        // Limpieza y cierre
        form.reset();
        generosSeleccionados = [];
        huellasMision = [];
        if (contenedorGenerosTags) contenedorGenerosTags.innerHTML = "";
        renderizarTagsHuellas();
        if (previewPortada) previewPortada.style.display = "none";

        const modal = document.getElementById("modal-buscador-mision");
        if (modal) {
          modal.classList.add("oculto");
          modal.style.display = "none";
        }

        if (typeof onMisionGuardada === 'function') {
          onMisionGuardada(nuevaMision);
        }
      } catch (error) {
        console.error("Error al guardar la misión:", error);
        alert("❌ No se pudo guardar la misión en el grimorio.");
      }
    };
  }
}

// Cargar géneros en el selector
async function cargarSelectGeneros(selectElement) {
  if (!selectElement) return;
  selectElement.innerHTML = `<option value="">-- Selecciona Círculo de Conocimiento --</option>`;
  
  const generosBase = [
    "Fantasía", "Ciencia Ficción", "Filosofía", "Historia", 
    "Misterio", "Desarrollo Personal", "Terror", "Romance", "Poesía", "Clásicos"
  ];

  generosBase.forEach(gen => {
    const opt = document.createElement("option");
    opt.value = gen;
    opt.textContent = gen;
    selectElement.appendChild(opt);
  });
}

function renderizarTagsGeneros(contenedor) {
  contenedor.innerHTML = "";
  generosSeleccionados.forEach((gen, index) => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `${gen} <span data-index="${index}">&times;</span>`;
    
    tag.querySelector("span").addEventListener("click", () => {
      generosSeleccionados.splice(index, 1);
      renderizarTagsGeneros(contenedor);
    });
    contenedor.appendChild(tag);
  });
}

function inicializarSeccionHuellas() {
  const btnAddHuella = document.getElementById("btn-add-huella-mision");
  const inputHuella = document.getElementById("input-nueva-huella-mision");
  const selectTipo = document.getElementById("select-tipo-huella-mision");

  if (btnAddHuella && inputHuella && selectTipo) {
    btnAddHuella.addEventListener("click", () => {
      const texto = inputHuella.value.trim();
      if (!texto) return;
      const tipo = selectTipo.value; 

      huellasMision.push({ nombre: texto, tipo });
      inputHuella.value = "";
      renderizarTagsHuellas();
    });
  }
}

function renderizarTagsHuellas() {
  const containerRasgos = document.getElementById("container-rasgos-mision");
  const containerCicatrices = document.getElementById("container-cicatrices-mision");

  if (containerRasgos) containerRasgos.innerHTML = "";
  if (containerCicatrices) containerCicatrices.innerHTML = "";

  huellasMision.forEach((h, index) => {
    const tag = document.createElement("div");
    tag.className = "tag";
    tag.innerHTML = `${h.nombre} <span data-index="${index}">&times;</span>`;

    tag.querySelector("span").addEventListener("click", () => {
      huellasMision.splice(index, 1);
      renderizarTagsHuellas();
    });

    if (h.tipo === 'rasgo' && containerRasgos) {
      containerRasgos.appendChild(tag);
    } else if (h.tipo === 'cicatriz' && containerCicatrices) {
      containerCicatrices.appendChild(tag);
    }
  });
}

// 🔍 Búsqueda restaurada y conectada a Google Books API con validación de query
export async function buscarEnGoogleBooks(query, contenedorResultados) {
  if (!query || !query.trim()) {
    contenedorResultados.style.display = "none";
    contenedorResultados.innerHTML = "";
    return;
  }

  contenedorResultados.style.display = "block";
  contenedorResultados.innerHTML = `<div class="item-resultado" style="padding: 10px; color: #d4af37;">⏳ Buscando grimorios...</div>`;

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5&key=${GOOGLE_BOOKS_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    contenedorResultados.innerHTML = "";
    if (!data.items || data.items.length === 0) {
      contenedorResultados.innerHTML = `<div class="item-resultado" style="padding: 10px; color: #ccc;">No se encontraron grimorios/libros.</div>`;
      return;
    }

    data.items.forEach(item => {
      const info = item.volumeInfo;
      const titulo = info.title || "Sin título";
      const autor = info.authors ? info.authors.join(", ") : "Autor desconocido";
      const paginas = info.pageCount || 150;
      const portada = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || "";

      const div = document.createElement("div");
      div.className = "item-resultado";
      div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 8px; cursor: pointer; border-bottom: 1px solid #443224; background: rgba(0,0,0,0.2);";
      div.innerHTML = `
        ${portada ? `<img src="${portada.replace('http://', 'https://')}" style="width: 35px; height: 50px; object-fit: cover; border-radius: 3px;" />` : '📖'}
        <div>
          <strong style="font-size: 0.9rem; color: #fff8e7;">${titulo}</strong><br>
          <small style="color: #d4af37;">${autor} (${paginas} págs)</small>
        </div>
      `;

      div.addEventListener("click", () => {
        // Rellenar campos automáticamente
        const inputTitulo = document.getElementById("titulo-mision");
        const inputAutor = document.getElementById("autor-mision");
        const inputPaginas = document.getElementById("paginas-mision");
        const inputPortadaUrl = document.getElementById("portada-mision-url");
        const preview = document.getElementById("preview-portada-mision");

        if (inputTitulo) inputTitulo.value = titulo;
        if (inputAutor) inputAutor.value = autor;
        if (inputPaginas) inputPaginas.value = paginas;
        
        if (portada) {
          const imgHttps = portada.replace("http://", "https://");
          if (inputPortadaUrl) inputPortadaUrl.value = imgHttps;
          if (preview) {
            preview.src = imgHttps;
            preview.style.display = "block";
          }
        }

        // Ocultar resultados de búsqueda
        contenedorResultados.style.display = "none";
        contenedorResultados.innerHTML = "";
      });

      contenedorResultados.appendChild(div);
    });
  } catch (error) {
    console.error("Error conectando con Google Books:", error);
    contenedorResultados.innerHTML = `<div class="item-resultado" style="padding: 10px; color: #ff6b6b;">❌ Error al conectar con la biblioteca.</div>`;
  }
}

export function limpiarSeleccionBuscador() {
  generosSeleccionados = [];
  huellasMision = [];
}