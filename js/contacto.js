// Módulo para la página de contacto
const Contacto = {
    // Inicializar módulo
    init() {
        console.log('Inicializando módulo de contacto...');
        this.setupEventListeners();
    },

    // Configurar event listeners
    setupEventListeners() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            // Formspree maneja el envío del formulario directamente
            // Solo agregamos validación adicional
            contactForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
    },

    // Manejar envío del formulario
    handleFormSubmit(event) {
        // No prevenimos el evento por defecto para permitir que Formspree maneje el envío
        // Solo validamos el formulario

        // Obtener valores del formulario
        const name = document.getElementById('contact-name').value.trim();
        const email = document.getElementById('contact-email').value.trim();
        const phone = document.getElementById('contact-phone').value.trim();
        const message = document.getElementById('contact-message').value.trim();

        // Validar formulario
        if (!this.validateForm(name, email, phone, message)) {
            event.preventDefault();
            return;
        }

        // Mostrar mensaje de carga
        this.showMessage('Enviando mensaje...', 'info');

        // Formspree se encargará del envío del formulario
        // No necesitamos hacer nada más aquí
    },

    // Validar formulario
    validateForm(name, email, phone, message) {
        // Validar nombre
        if (!name) {
            alert('Por favor, ingrese su nombre.');
            return false;
        }

        // Validar email
        if (!email || !this.validateEmail(email)) {
            alert('Por favor, ingrese un correo electrónico válido.');
            return false;
        }

        // Validar teléfono
        if (!phone) {
            alert('Por favor, ingrese su número de teléfono.');
            return false;
        }

        // Validar mensaje
        if (!message) {
            alert('Por favor, ingrese un mensaje.');
            return false;
        }

        return true;
    },

    // Validar formato de email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Mostrar mensaje al usuario
    showMessage(message, type = 'info') {
        // Buscar contenedor de mensajes o crearlo si no existe
        let messageContainer = document.getElementById('contact-message-container');

        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'contact-message-container';

            // Insertar antes del formulario
            const form = document.getElementById('contact-form');
            form.parentNode.insertBefore(messageContainer, form);
        }

        // Crear elemento de mensaje
        const messageElement = document.createElement('div');
        messageElement.className = `alert alert-${type}`;
        messageElement.textContent = message;

        // Limpiar mensajes anteriores
        messageContainer.innerHTML = '';

        // Agregar nuevo mensaje
        messageContainer.appendChild(messageElement);

        // Si es un mensaje de éxito, eliminarlo después de un tiempo
        if (type === 'success') {
            setTimeout(() => {
                messageElement.style.opacity = '0';
                setTimeout(() => {
                    if (messageContainer.contains(messageElement)) {
                        messageContainer.removeChild(messageElement);
                    }
                }, 500);
            }, 5000);
        }
    },

    // Resetear formulario
    resetForm() {
        document.getElementById('contact-form').reset();
    }
};

// Exportar módulo
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Contacto;
}
