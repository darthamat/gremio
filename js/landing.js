// ===========================
// LANDING - GREMIO
// ===========================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    // Page loaded successfully
    console.log('Gremio landing page loaded');
});


document.addEventListener("DOMContentLoaded", () => {
    const btnLogin = document.getElementById("btn-login");
    const loginForm = document.getElementById("login-form");

    if (btnLogin && loginForm) {
        btnLogin.addEventListener("click", () => {
            // Muestra u oculta el formulario al hacer clic
            loginForm.classList.toggle("hidden");
        });
    }
});
