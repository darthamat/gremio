document.addEventListener("DOMContentLoaded", () => {
    const subtitle = document.getElementById("loader-quote");

    // Frases narrativas que cambian durante la espera
    const frases = [
        "Sintonizando la frecuencia de los grimorios...",
        "Calculando puntos de XP de tus expediciones...",
        "Preparando las mesas de la Taberna...",
        "Desplegando tu Ficha de Personaje..."
    ];

    let index = 0;

    // Cambiar la frase cada 900ms
    const interval = setInterval(() => {
        index = (index + 1) % frases.length;
        if (subtitle) {
            subtitle.style.opacity = "0";
            setTimeout(() => {
                subtitle.innerText = frases[index];
                subtitle.style.opacity = "1";
            }, 200);
        }
    }, 900);

    // Redireccionar al Dashboard / Taberna tras 3.5 segundos
    setTimeout(() => {
        clearInterval(interval);
        window.location.href = "gremio.html"; // Ajusta la ruta a tu página destino
    }, 3500);
});