// Funciones Generales de la Aplicación

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    console.log('Aplicación inicializada');

    // Configurar event listeners globales si es necesario
    checkFirebaseConnection();

    // Inicializar animaciones de scroll
    initializeScrollAnimations();
}

function initializeScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observar todos los elementos con clase animate-on-scroll
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(element => {
        observer.observe(element);
    });
}

function checkFirebaseConnection() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('Usuario autenticado:', user.email);
        } else {
            console.log('No hay usuario autenticado');
        }
    });
}

// Función para formatear moneda
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Función para formatear fecha
function formatDate(date) {
    if (!(date instanceof Date)) {
        date = date.toDate();
    }
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Aquí se podría agregar un sistema de notificaciones más visual
}
