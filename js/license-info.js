// Módulo para gestionar la información de licencia
const LicenseInfo = {
    // Inicializar el módulo
    init() {
        console.log('Inicializando módulo de información de licencia...');

        // Configurar eventos
        this.setupEvents();

        console.log('Módulo de información de licencia inicializado correctamente');
    },

    // Configurar eventos
    setupEvents() {
        // Evento para mostrar información de licencia
        document.getElementById('show-license-info')?.addEventListener('click', () => {
            this.showLicenseInfo();
        });

        // Evento para activar licencia manualmente
        document.getElementById('activate-license-manually')?.addEventListener('click', () => {
            this.showLicenseActivationForm();
        });
    },

    // Mostrar información de la licencia actual
    showLicenseInfo() {
        try {
            // Obtener datos de licencia
            const licenseData = this.getLicenseData();

            if (!licenseData) {
                this.showMessage('No hay información de licencia disponible', 'error');
                return;
            }

            // Crear diálogo para mostrar información
            const dialog = document.createElement('div');
            dialog.className = 'license-info-dialog';

            // Calcular días restantes
            let daysLeft = 'Indefinido';
            let expirationStatus = 'valid';

            if (licenseData.activationDate) {
                const activationDate = new Date(licenseData.activationDate);
                const expirationDays = licenseData.expirationDays || 365;
                const expirationDate = new Date(activationDate.getTime() + expirationDays * 24 * 60 * 60 * 1000);
                const currentDate = new Date();

                // Calcular días restantes
                const timeLeft = expirationDate.getTime() - currentDate.getTime();
                const daysRemaining = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));

                daysLeft = daysRemaining;

                // Determinar estado de expiración
                if (daysRemaining <= 0) {
                    expirationStatus = 'expired';
                } else if (daysRemaining <= 30) {
                    expirationStatus = 'warning';
                }
            }

            // Formatear fecha de activación
            let activationDateFormatted = 'No disponible';
            if (licenseData.activationDate) {
                const activationDate = new Date(licenseData.activationDate);
                activationDateFormatted = activationDate.toLocaleDateString();
            }

            // Crear contenido del diálogo
            dialog.innerHTML = `
                <div class="license-info-content">
                    <div class="license-info-header">
                        <h3>Información de Licencia</h3>
                        <button class="close-btn" id="close-license-info">&times;</button>
                    </div>
                    <div class="license-info-body">
                        <div class="license-info-item">
                            <span class="license-info-label">Clave de Licencia:</span>
                            <span class="license-info-value license-key">${licenseData.key || 'No disponible'}</span>
                        </div>
                        <div class="license-info-item">
                            <span class="license-info-label">Propietario:</span>
                            <span class="license-info-value">${licenseData.owner || 'No disponible'}</span>
                        </div>
                        <div class="license-info-item">
                            <span class="license-info-label">Correo Electrónico:</span>
                            <span class="license-info-value">${licenseData.email || 'No disponible'}</span>
                        </div>
                        <div class="license-info-item">
                            <span class="license-info-label">Fecha de Activación:</span>
                            <span class="license-info-value">${activationDateFormatted}</span>
                        </div>
                        <div class="license-info-item">
                            <span class="license-info-label">Días Restantes:</span>
                            <span class="license-info-value license-days-left ${expirationStatus}">${daysLeft}</span>
                        </div>
                        <div class="license-info-item">
                            <span class="license-info-label">ID de Instalación:</span>
                            <span class="license-info-value">${licenseData.installationId || 'No disponible'}</span>
                        </div>
                        <div class="license-info-item">
                            <span class="license-info-label">ID de Hardware:</span>
                            <span class="license-info-value">${licenseData.hardwareId || 'No disponible'}</span>
                        </div>
                        <div class="license-info-item">
                            <span class="license-info-label">Características:</span>
                            <span class="license-info-value">${this.formatFeatures(licenseData.features)}</span>
                        </div>
                    </div>
                    <div class="license-info-footer">
                        <button class="btn btn-secondary" id="export-license-info">
                            <i class="fas fa-file-export"></i> Exportar
                        </button>
                        <button class="btn btn-primary" id="close-license-info-btn">
                            <i class="fas fa-check"></i> Aceptar
                        </button>
                    </div>
                </div>
            `;

            // Añadir diálogo al DOM
            document.body.appendChild(dialog);

            // Configurar eventos
            document.getElementById('close-license-info')?.addEventListener('click', () => {
                dialog.remove();
            });

            document.getElementById('close-license-info-btn')?.addEventListener('click', () => {
                dialog.remove();
            });

            document.getElementById('export-license-info')?.addEventListener('click', () => {
                this.exportLicenseInfo(licenseData);
            });

            // Añadir estilos
            this.addStyles();
        } catch (error) {
            console.error('Error al mostrar información de licencia:', error);
            this.showMessage('Error al mostrar información de licencia', 'error');
        }
    },

    // Obtener datos de licencia
    getLicenseData() {
        try {
            console.log('Obteniendo datos de licencia...');

            // Verificar si está disponible SimpleCrypto
            if (window.SimpleCrypto) {
                console.log('Usando SimpleCrypto para obtener datos de licencia');

                // Intentar cargar datos con SimpleCrypto
                const licenseData = SimpleCrypto.loadEncrypted('licenseData', true);

                if (licenseData) {
                    console.log('Datos de licencia obtenidos correctamente con SimpleCrypto:', licenseData);
                    return licenseData;
                }

                console.log('No se encontraron datos de licencia con SimpleCrypto');
            }

            // Método de respaldo: obtener clave de licencia
            const licenseKey = localStorage.getItem('licenseKey');

            if (!licenseKey) {
                console.log('No se encontró clave de licencia en localStorage');
                return null;
            }

            console.log('Clave de licencia encontrada:', licenseKey);

            // Intentar cargar datos no encriptados (respaldo)
            const plainLicenseData = localStorage.getItem('licenseData_plain');
            if (plainLicenseData) {
                console.log('Datos de licencia no encriptados encontrados');
                try {
                    const licenseData = JSON.parse(plainLicenseData);
                    console.log('Datos de licencia parseados correctamente desde respaldo:', licenseData);
                    return licenseData;
                } catch (parseError) {
                    console.error('Error al parsear datos de licencia desde respaldo:', parseError);
                }
            }

            // Si todo lo demás falla, devolver un objeto básico con la clave
            return {
                key: licenseKey,
                activationDate: localStorage.getItem('activationDate') || new Date().toISOString(),
                owner: 'Usuario Registrado',
                email: 'g.bronzi91@gmail.com',
                expirationDays: 365,
                features: ['all']
            };
        } catch (error) {
            console.error('Error general al obtener datos de licencia:', error);

            // Intentar recuperar al menos la clave de licencia
            const licenseKey = localStorage.getItem('licenseKey');
            if (licenseKey) {
                return {
                    key: licenseKey,
                    activationDate: new Date().toISOString(),
                    owner: 'Usuario Registrado',
                    email: 'g.bronzi91@gmail.com'
                };
            }

            return null;
        }
    },

    // Formatear características
    formatFeatures(features) {
        if (!features || !Array.isArray(features) || features.length === 0) {
            return 'No disponible';
        }

        return features.map(feature => {
            // Convertir primera letra a mayúscula
            return feature.charAt(0).toUpperCase() + feature.slice(1);
        }).join(', ');
    },

    // Exportar información de licencia
    exportLicenseInfo(licenseData) {
        try {
            if (!licenseData) {
                this.showMessage('No hay información de licencia para exportar', 'error');
                return;
            }

            // Crear objeto para exportar
            const exportData = {
                licenseKey: licenseData.key || 'No disponible',
                owner: licenseData.owner || 'No disponible',
                email: licenseData.email || 'No disponible',
                activationDate: licenseData.activationDate || 'No disponible',
                expirationDays: licenseData.expirationDays || 'No disponible',
                installationId: licenseData.installationId || 'No disponible',
                hardwareId: licenseData.hardwareId || 'No disponible',
                features: licenseData.features || []
            };

            // Convertir a JSON
            const jsonData = JSON.stringify(exportData, null, 2);

            // Crear blob
            const blob = new Blob([jsonData], { type: 'application/json' });

            // Crear nombre de archivo
            const fileName = `license-info-${new Date().toISOString().split('T')[0]}.json`;

            // Descargar archivo
            saveAs(blob, fileName);

            this.showMessage('Información de licencia exportada correctamente', 'success');
        } catch (error) {
            console.error('Error al exportar información de licencia:', error);
            this.showMessage('Error al exportar información de licencia', 'error');
        }
    },

    // Mostrar formulario de activación de licencia
    showLicenseActivationForm() {
        try {
            // Crear diálogo para mostrar formulario
            const dialog = document.createElement('div');
            dialog.className = 'license-activation-dialog';

            // Crear contenido del diálogo
            dialog.innerHTML = `
                <div class="license-activation-content">
                    <div class="license-activation-header">
                        <h3>Activar Licencia</h3>
                        <button class="close-btn" id="close-license-activation">&times;</button>
                    </div>
                    <div class="license-activation-body">
                        <p>Ingrese su clave de licencia para activar el sistema:</p>
                        <div class="form-group">
                            <label for="license-key-input">Clave de Licencia:</label>
                            <input type="text" id="license-key-input" class="form-control" placeholder="Ingrese su clave de licencia">
                        </div>
                        <div id="license-activation-status" class="mt-3"></div>
                    </div>
                    <div class="license-activation-footer">
                        <button class="btn btn-secondary" id="cancel-license-activation">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button class="btn btn-primary" id="submit-license-activation">
                            <i class="fas fa-key"></i> Activar
                        </button>
                    </div>
                </div>
            `;

            // Añadir diálogo al DOM
            document.body.appendChild(dialog);

            // Configurar eventos
            document.getElementById('close-license-activation')?.addEventListener('click', () => {
                dialog.remove();
            });

            document.getElementById('cancel-license-activation')?.addEventListener('click', () => {
                dialog.remove();
            });

            document.getElementById('submit-license-activation')?.addEventListener('click', () => {
                const licenseKey = document.getElementById('license-key-input').value.trim();
                this.activateLicense(licenseKey, dialog);
            });

            // Permitir activación con Enter
            document.getElementById('license-key-input')?.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const licenseKey = document.getElementById('license-key-input').value.trim();
                    this.activateLicense(licenseKey, dialog);
                }
            });

            // Añadir estilos
            this.addStyles();
        } catch (error) {
            console.error('Error al mostrar formulario de activación de licencia:', error);
            this.showMessage('Error al mostrar formulario de activación de licencia', 'error');
        }
    },

    // Activar licencia
    async activateLicense(licenseKey, dialog) {
        try {
            if (!licenseKey) {
                this.showActivationStatus('Por favor, ingrese una clave de licencia válida.', 'error');
                return;
            }

            // Mostrar mensaje de carga
            this.showActivationStatus('Activando licencia...', 'info');

            console.log('Intentando activar licencia:', licenseKey);

            // Crear datos de licencia
            const licenseData = {
                key: licenseKey,
                activationDate: new Date().toISOString(),
                installationId: this.generateRandomId(),
                hardwareId: this.generateRandomId(),
                owner: 'Usuario Registrado',
                email: 'g.bronzi91@gmail.com',
                expirationDays: 365,
                features: ['all']
            };

            // Guardar clave de licencia
            localStorage.setItem('licenseKey', licenseKey);
            localStorage.setItem('activationDate', licenseData.activationDate);

            let success = false;

            // Intentar guardar con SimpleCrypto si está disponible
            if (window.SimpleCrypto) {
                console.log('Guardando datos de licencia con SimpleCrypto');
                success = SimpleCrypto.saveEncrypted('licenseData', licenseData);
                console.log('Resultado de guardar con SimpleCrypto:', success ? 'Éxito' : 'Fallo');
            }

            // Si no se pudo guardar con SimpleCrypto, intentar con Security
            if (!success) {
                try {
                    console.log('Intentando guardar con Security.activateLicenseManually');
                    success = await Security.activateLicenseManually(licenseKey);
                    console.log('Resultado de activación con Security:', success ? 'Éxito' : 'Fallo');
                } catch (securityError) {
                    console.error('Error al activar con Security:', securityError);

                    // Último recurso: guardar como texto plano
                    try {
                        console.log('Guardando datos de licencia como texto plano');
                        localStorage.setItem('licenseData_plain', JSON.stringify(licenseData));
                        localStorage.setItem('hardwareId', licenseData.hardwareId);
                        success = true;
                    } catch (plainError) {
                        console.error('Error al guardar como texto plano:', plainError);
                    }
                }
            }

            if (success) {
                this.showActivationStatus('Licencia activada correctamente.', 'success');

                // Esperar un momento y luego cerrar el diálogo y recargar la página
                setTimeout(() => {
                    if (dialog && typeof dialog.remove === 'function') {
                        dialog.remove();
                    }
                    window.location.reload();
                }, 2000);
            } else {
                this.showActivationStatus('La clave de licencia no es válida o no se pudo activar.', 'error');
            }
        } catch (error) {
            console.error('Error general al activar licencia:', error);
            this.showActivationStatus(`Error al activar licencia: ${error.message || 'Error desconocido'}`, 'error');
        }
    },

    // Generar ID aleatorio
    generateRandomId() {
        return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
    },

    // Mostrar estado de activación
    showActivationStatus(message, type) {
        const statusDiv = document.getElementById('license-activation-status');

        if (!statusDiv) {
            return;
        }

        let icon = '';
        let alertClass = '';

        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle"></i>';
                alertClass = 'alert-success';
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle"></i>';
                alertClass = 'alert-danger';
                break;
            case 'info':
                icon = '<i class="fas fa-spinner fa-spin"></i>';
                alertClass = 'alert-info';
                break;
            default:
                icon = '<i class="fas fa-info-circle"></i>';
                alertClass = 'alert-info';
        }

        statusDiv.innerHTML = `
            <div class="alert ${alertClass}">
                ${icon} ${message}
            </div>
        `;
    },

    // Mostrar mensaje
    showMessage(message, type = 'info') {
        // Crear elemento para el mensaje
        const messageElement = document.createElement('div');
        messageElement.className = `toast-message toast-${type}`;

        // Añadir contenido
        messageElement.innerHTML = `
            <div class="toast-content">
                <span class="toast-text">${message}</span>
                <button class="toast-close">&times;</button>
            </div>
        `;

        // Añadir al DOM
        document.body.appendChild(messageElement);

        // Mostrar mensaje
        setTimeout(() => {
            messageElement.classList.add('show');
        }, 10);

        // Configurar evento para cerrar
        messageElement.querySelector('.toast-close').addEventListener('click', () => {
            messageElement.classList.remove('show');
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        });

        // Cerrar automáticamente después de 5 segundos
        setTimeout(() => {
            if (document.body.contains(messageElement)) {
                messageElement.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(messageElement)) {
                        messageElement.remove();
                    }
                }, 300);
            }
        }, 5000);

        // Añadir estilos
        this.addStyles();
    },

    // Añadir estilos
    addStyles() {
        // Verificar si ya existen los estilos
        if (document.getElementById('license-info-styles')) {
            return;
        }

        // Crear elemento de estilo
        const style = document.createElement('style');
        style.id = 'license-info-styles';

        // Añadir estilos
        style.textContent = `
            /* Estilos para el diálogo de información de licencia */
            .license-info-dialog, .license-activation-dialog {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
            }

            .license-info-content, .license-activation-content {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                width: 90%;
                max-width: 600px;
                overflow: hidden;
            }

            .license-info-header, .license-activation-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 15px 20px;
                background-color: #f8f9fa;
                border-bottom: 1px solid #dee2e6;
            }

            .license-info-header h3, .license-activation-header h3 {
                margin: 0;
                font-size: 18px;
                color: #212529;
            }

            .close-btn {
                background: none;
                border: none;
                font-size: 24px;
                line-height: 1;
                color: #6c757d;
                cursor: pointer;
            }

            .license-info-body, .license-activation-body {
                padding: 20px;
                max-height: 60vh;
                overflow-y: auto;
            }

            .license-info-item {
                margin-bottom: 12px;
                display: flex;
                flex-wrap: wrap;
            }

            .license-info-label {
                font-weight: bold;
                width: 150px;
                color: #495057;
            }

            .license-info-value {
                flex: 1;
                min-width: 200px;
                word-break: break-all;
            }

            .license-key {
                font-family: monospace;
                background-color: #f8f9fa;
                padding: 2px 4px;
                border-radius: 3px;
            }

            .license-days-left {
                font-weight: bold;
            }

            .license-days-left.expired {
                color: #dc3545;
            }

            .license-days-left.warning {
                color: #ffc107;
            }

            .license-days-left.valid {
                color: #28a745;
            }

            .license-info-footer, .license-activation-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding: 15px 20px;
                background-color: #f8f9fa;
                border-top: 1px solid #dee2e6;
            }

            /* Estilos para mensajes toast */
            .toast-message {
                position: fixed;
                bottom: 20px;
                right: 20px;
                max-width: 350px;
                background-color: white;
                border-radius: 4px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateY(100px);
                opacity: 0;
                transition: transform 0.3s, opacity 0.3s;
                z-index: 9999;
            }

            .toast-message.show {
                transform: translateY(0);
                opacity: 1;
            }

            .toast-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 12px 15px;
            }

            .toast-text {
                margin-right: 10px;
            }

            .toast-close {
                background: none;
                border: none;
                font-size: 18px;
                line-height: 1;
                color: #6c757d;
                cursor: pointer;
            }

            .toast-success {
                border-left: 4px solid #28a745;
            }

            .toast-error {
                border-left: 4px solid #dc3545;
            }

            .toast-info {
                border-left: 4px solid #17a2b8;
            }

            /* Estilos para formulario de activación */
            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
                color: #495057;
            }

            .form-control {
                display: block;
                width: 100%;
                padding: 8px 12px;
                font-size: 16px;
                line-height: 1.5;
                color: #495057;
                background-color: #fff;
                background-clip: padding-box;
                border: 1px solid #ced4da;
                border-radius: 4px;
                transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
            }

            .form-control:focus {
                color: #495057;
                background-color: #fff;
                border-color: #80bdff;
                outline: 0;
                box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
            }

            .alert {
                position: relative;
                padding: 12px 15px;
                margin-bottom: 15px;
                border: 1px solid transparent;
                border-radius: 4px;
            }

            .alert-success {
                color: #155724;
                background-color: #d4edda;
                border-color: #c3e6cb;
            }

            .alert-danger {
                color: #721c24;
                background-color: #f8d7da;
                border-color: #f5c6cb;
            }

            .alert-info {
                color: #0c5460;
                background-color: #d1ecf1;
                border-color: #bee5eb;
            }

            .btn {
                display: inline-block;
                font-weight: 400;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
                user-select: none;
                border: 1px solid transparent;
                padding: 8px 16px;
                font-size: 16px;
                line-height: 1.5;
                border-radius: 4px;
                transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
                cursor: pointer;
            }

            .btn-primary {
                color: #fff;
                background-color: #007bff;
                border-color: #007bff;
            }

            .btn-primary:hover {
                color: #fff;
                background-color: #0069d9;
                border-color: #0062cc;
            }

            .btn-secondary {
                color: #fff;
                background-color: #6c757d;
                border-color: #6c757d;
            }

            .btn-secondary:hover {
                color: #fff;
                background-color: #5a6268;
                border-color: #545b62;
            }

            .mt-3 {
                margin-top: 15px;
            }
        `;

        // Añadir al DOM
        document.head.appendChild(style);
    }
};

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    LicenseInfo.init();
});
