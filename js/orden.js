import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("members-container");
    if (!container) return;

    try {
        // 1. Obtener todos los documentos de la colección
        const querySnapshot = await getDocs(collection(db, "aventureros"));
        
        // 2. Convertir los documentos a un array de objetos con sus datos
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });

        // 3. Ordenar en memoria: Nivel (Desc) -> XP (Desc) -> Nombre (Asc)
        users.sort((a, b) => {
            const nivelA = a.nivel ?? 1;
            const nivelB = b.nivel ?? 1;

            // Criterio 1: Mayor Nivel
            if (nivelB !== nivelA) {
                return nivelB - nivelA;
            }

            const xpA = a.xp ?? 0;
            const xpB = b.xp ?? 0;

            // Criterio 2: Mayor XP (Prestigio) en caso de empate de nivel
            if (xpB !== xpA) {
                return xpB - xpA;
            }

            const nombreA = (a.nombre || "").toLowerCase();
            const nombreB = (b.nombre || "").toLowerCase();

            // Criterio 3: Orden Alfabético (A-Z) en caso de empate de Nivel y XP
            return nombreA.localeCompare(nombreB);
        });

        // 4. Limpiar contenedor e inyectar en el DOM
        container.innerHTML = "";

        users.forEach((user) => {
            const avatarUrl = user.photoURL || "img/default-avatar.jpg";

            const userNode = document.createElement("div");
            userNode.className = "tree-node member-node";
            userNode.innerHTML = `
                <div class="avatar-frame">
                    <img src="${avatarUrl}" alt="${user.nombre || 'Aventurero'}" class="node-avatar">
                </div>
                <span class="node-title">Nivel ${user.nivel || 1}</span>
                <span class="node-name">${user.nombre || 'Anónimo'}</span>

                <!-- Tooltip Informativo de Aventurero -->
                <div class="node-tooltip">
                    <div class="tooltip-header">
                        <h4>${user.nombre || 'Anónimo'}</h4>
                        <span class="tooltip-role">Clase: ${user.clase || "Iniciado"}</span>
                    </div>
                    <div class="tooltip-stats">
                        <div class="stat-row"><span>Nivel:</span> <strong>${user.nivel || 1}</strong></div>
                        <div class="stat-row"><span>Puntos XP:</span> <strong>${user.xp || 0} XP</strong></div>
                        <div class="stat-row"><span>Páginas Leídas:</span> <strong>${user.paginasLeidas || 0}</strong></div>
                        <div class="stat-row"><span>Libros Completados:</span> <strong>${user.librosCompletados || 0}</strong></div>
                    </div>
                </div>
            `;

            container.appendChild(userNode);
        });

    } catch (error) {
        console.error("Error al cargar la jerarquía de aventureros:", error);
    }
});