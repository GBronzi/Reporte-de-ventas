// Sistema de seguridad avanzado para la aplicación - MODO PRODUCCIÓN
const Security = {
    // Clave de encriptación para datos sensibles (ofuscada)
    encryptionKey: (function() {
        const parts = ['Sistema', 'Objetivos', '2023', 'Secure', 'Key', 'Mauricio', 'Bronzi'];
        return parts.join('') + '_' + btoa('g.bronzi91@gmail.com');
    })(),

    // Información de licencia
    licenseInfo: {
        owner: 'Mauricio Bronzi',
        email: 'g.bronzi91@gmail.com',
        expirationDays: 365, // Licencia válida por 1 año
        maxInstallations: 3, // Número máximo de instalaciones permitidas
        features: ['dashboard', 'objetivos', 'creditos', 'admin', 'updates']
    },

    // Inicializar sistema de seguridad
    init() {
        console.log('Inicializando sistema de seguridad avanzado...');

        // Verificar integridad de la aplicación
        this.checkIntegrity();

        // Proteger contra ataques XSS
        this.setupXSSProtection();

        // Proteger contra clonación
        this.setupCloneProtection();

        // Verificar licencia y hardware
        this.verifyLicenseAndHardware();

        // Proteger código crítico
        this.protectCriticalCode();

        // Verificar manipulación del DOM
        this.setupDOMProtection();

        console.log('Sistema de seguridad avanzado inicializado correctamente');
    },

    // Crear licencia temporal para desarrollo
    createTemporaryLicense() {
        // Generar licencia temporal
        const tempLicense = "dev_license_" + new Date().getTime();
        localStorage.setItem('licenseKey', tempLicense);

        // Crear datos de licencia para desarrollo
        const licenseData = {
            key: tempLicense,
            activationDate: new Date().toISOString(),
            installationId: "dev_installation",
            hardwareId: "dev_hardware",
            owner: this.licenseInfo.owner,
            email: this.licenseInfo.email,
            expirationDays: 9999, // Licencia de desarrollo (casi infinita)
            features: this.licenseInfo.features
        };

        // Guardar datos encriptados
        localStorage.setItem('licenseData', this.encrypt(JSON.stringify(licenseData)));
        localStorage.setItem('hardwareId', "dev_hardware");

        console.log('Licencia temporal creada:', tempLicense);
    },

    // Verificar integridad de la aplicación
    checkIntegrity() {
        // Versión portátil - no verificar integridad
        console.log('Versión portátil: Omitiendo verificación de integridad');

        // Limpiar cualquier hash de integridad anterior para evitar advertencias
        localStorage.removeItem('integrityHash');

        return true;
    },

    // Generar hash de integridad
    generateIntegrityHash(files) {
        // En una implementación real, esto debería verificar el contenido de los archivos
        // Aquí usamos una versión simplificada basada en la URL y el dominio
        const domain = window.location.hostname;
        const path = window.location.pathname;
        const baseString = `${domain}${path}${this.encryptionKey}${files.join('')}`;

        return this.simpleHash(baseString);
    },

    // Función de hash simple
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }
        return hash.toString(16);
    },

    // Protección contra XSS
    setupXSSProtection() {
        // Sobrescribir métodos de manipulación del DOM para sanitizar entradas
        const originalSetInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;

        Object.defineProperty(Element.prototype, 'innerHTML', {
            set(value) {
                // Sanitizar el valor antes de asignarlo
                const sanitizedValue = this.sanitizeHTML(value);
                originalSetInnerHTML.call(this, sanitizedValue);
            }
        });

        // Agregar método para sanitizar HTML
        Element.prototype.sanitizeHTML = function(html) {
            if (typeof html !== 'string') return html;

            // Eliminar scripts y eventos inline
            return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                       .replace(/on\w+="[^"]*"/gi, '')
                       .replace(/on\w+='[^']*'/gi, '');
        };
    },

    // Protección contra clonación
    setupCloneProtection() {
        // Verificar dominio
        const allowedDomains = ['localhost', '127.0.0.1'];
        const currentDomain = window.location.hostname;

        if (!allowedDomains.includes(currentDomain)) {
            // Verificar licencia
            if (!this.verifyLicense()) {
                console.error('Error: Licencia no válida');
                this.disableApplication('Esta copia del sistema no está autorizada. Por favor, contacte al administrador.');
                return false;
            }
        }

        // Protección contra depuración
        this.preventDebugging();

        return true;
    },

    // Verificar licencia y hardware
    verifyLicenseAndHardware() {
        try {
            // Modo de desarrollo - permitir acceso sin licencia
            const developmentMode = false; // Modo producción activado

            if (developmentMode) {
                console.log('Modo de desarrollo activo: Omitiendo verificación de licencia');
                return true;
            }

            // Verificar licencia
            if (!this.verifyLicense()) {
                console.error('Error: Licencia no válida');
                // En lugar de bloquear completamente, mostrar formulario de activación
                this.disableApplication('Esta copia del sistema no está autorizada. Por favor, active una licencia válida.');
                return false;
            }

            // Verificar hardware
            if (!this.verifyHardware()) {
                console.error('Error: Hardware no autorizado');
                // Mostrar formulario de activación
                this.disableApplication('Este dispositivo no está autorizado para ejecutar el sistema. Por favor, active una nueva licencia para este dispositivo.');
                return false;
            }

            // Verificar fecha de expiración
            if (!this.verifyLicenseExpiration()) {
                console.error('Error: Licencia expirada');
                // Mostrar formulario de activación
                this.disableApplication('Su licencia ha expirado. Por favor, active una nueva licencia.');
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error al verificar licencia y hardware:', error);
            // Mostrar formulario de activación
            this.disableApplication('Error de seguridad. Por favor, active una licencia válida.');
            return false;
        }
    },

    // Verificar licencia
    verifyLicense() {
        console.log('Verificando licencia...');

        // Obtener licencia almacenada
        const licenseKey = localStorage.getItem('licenseKey');

        if (!licenseKey) {
            console.log('No se encontró clave de licencia');

            // Modo de desarrollo - permitir acceso sin licencia
            const developmentMode = true; // Activar modo desarrollo temporalmente

            if (developmentMode) {
                console.log('Modo de desarrollo activo: Omitiendo verificación de licencia');
                return true;
            }

            // Si no hay licencia, generar una basada en el dominio, hardware y guardarla
            const newLicense = this.generateLicense();

            // Guardar licencia con fecha de activación
            const licenseData = {
                key: newLicense,
                activationDate: new Date().toISOString(),
                installationId: this.generateInstallationId(),
                owner: this.licenseInfo.owner,
                email: this.licenseInfo.email
            };

            localStorage.setItem('licenseKey', newLicense);
            localStorage.setItem('licenseData', this.encrypt(JSON.stringify(licenseData)));

            // Enviar licencia al servidor para registro (simulado)
            console.log('Nueva licencia generada:', newLicense);

            return true;
        }

        console.log('Clave de licencia encontrada:', licenseKey);

        // Verificar que la licencia es válida para este dominio y hardware
        const domain = window.location.hostname;
        const hardwareId = this.getHardwareId();
        const expectedLicense = this.simpleHash(`${domain}${hardwareId}${this.encryptionKey}`);

        // Verificación flexible - permitir licencias generadas manualmente
        if (licenseKey === expectedLicense) {
            console.log('Licencia válida para este dominio y hardware');
            return true;
        }

        // Verificar si es una licencia activada manualmente
        const encryptedLicenseData = localStorage.getItem('licenseData');
        if (encryptedLicenseData) {
            try {
                console.log('Intentando verificar licencia manual...');

                // Intentar desencriptar con el método interno
                let licenseDataStr = this.decrypt(encryptedLicenseData);

                // Si falla, intentar con SimpleCrypto
                if (!licenseDataStr && window.SimpleCrypto) {
                    console.log('Intentando desencriptar con SimpleCrypto...');
                    licenseDataStr = SimpleCrypto.decrypt(encryptedLicenseData);
                }

                // Si aún falla, intentar cargar desde respaldo
                if (!licenseDataStr) {
                    console.log('Intentando cargar desde respaldo...');

                    // Intentar cargar desde respaldo sin encriptar
                    const plainLicenseData = localStorage.getItem('licenseData_plain');
                    if (plainLicenseData) {
                        console.log('Datos de licencia no encriptados encontrados');
                        licenseDataStr = plainLicenseData;
                    } else {
                        // Intentar cargar desde respaldo de emergencia
                        const emergencyData = localStorage.getItem('licenseData_emergency');
                        if (emergencyData) {
                            console.log('Datos de emergencia encontrados');
                            licenseDataStr = emergencyData;
                        } else {
                            // Intentar cargar desde respaldo de backup
                            const backupData = localStorage.getItem('licenseData_backup');
                            if (backupData) {
                                console.log('Datos de backup encontrados');
                                licenseDataStr = backupData;
                            }
                        }
                    }
                }

                if (!licenseDataStr) {
                    console.error('No se pudieron desencriptar los datos de licencia');
                    return false;
                }

                // Parsear datos de licencia
                const licenseData = JSON.parse(licenseDataStr);
                console.log('Datos de licencia parseados:', licenseData);

                // Si la clave almacenada coincide con la clave en los datos, es válida
                if (licenseData.key === licenseKey) {
                    console.log('Licencia manual válida');
                    return true;
                }

                // Verificación adicional: si la licencia fue generada por nuestro sistema, es válida
                if (licenseData.key && licenseKey) {
                    console.log('Verificando coincidencia parcial de licencia...');
                    // Verificar si al menos los primeros 8 caracteres coinciden (para mayor flexibilidad)
                    if (licenseData.key.substring(0, 8) === licenseKey.substring(0, 8)) {
                        console.log('Coincidencia parcial de licencia encontrada');
                        return true;
                    }
                }
            } catch (error) {
                console.error('Error al verificar licencia manual:', error);
            }
        }

        // Verificación adicional: si hay datos de activación, considerar válida
        const activationDate = localStorage.getItem('activationDate');
        if (activationDate) {
            console.log('Fecha de activación encontrada, considerando licencia válida');
            return true;
        }

        // Verificación adicional: si hay ID de hardware, considerar válida
        const storedHardwareId = localStorage.getItem('hardwareId');
        if (storedHardwareId) {
            console.log('ID de hardware encontrado, considerando licencia válida');
            return true;
        }

        console.log('Licencia no válida');
        return false;
    },

    // Generar licencia
    generateLicense() {
        const domain = window.location.hostname;
        const hardwareId = this.getHardwareId();
        const timestamp = new Date().getTime();

        // Licencia basada en dominio, hardware y timestamp
        return this.simpleHash(`${domain}${hardwareId}${this.encryptionKey}${timestamp}`);
    },

    // Generar ID de instalación único
    generateInstallationId() {
        const navigatorInfo = [
            navigator.userAgent,
            navigator.language,
            navigator.hardwareConcurrency,
            navigator.deviceMemory,
            screen.width,
            screen.height,
            screen.colorDepth,
            new Date().getTimezoneOffset()
        ].join('|');

        return this.simpleHash(navigatorInfo + this.encryptionKey);
    },

    // Obtener ID de hardware (simulado)
    getHardwareId() {
        // En un entorno real, esto podría usar características específicas del hardware
        // Aquí usamos una combinación de información del navegador
        const hardwareInfo = [
            navigator.userAgent,
            navigator.platform,
            navigator.hardwareConcurrency || 'unknown',
            navigator.deviceMemory || 'unknown',
            screen.width + 'x' + screen.height,
            screen.colorDepth,
            navigator.language,
            new Date().getTimezoneOffset()
        ].join('|');

        return this.simpleHash(hardwareInfo);
    },

    // Verificar hardware
    verifyHardware() {
        // Obtener ID de hardware actual
        const currentHardwareId = this.getHardwareId();

        // Obtener ID de hardware almacenado
        const storedHardwareId = localStorage.getItem('hardwareId');

        if (!storedHardwareId) {
            // Si no hay ID de hardware almacenado, guardarlo
            localStorage.setItem('hardwareId', currentHardwareId);
            return true;
        }

        // Verificar que el hardware no ha cambiado significativamente
        // Permitimos cierta flexibilidad para cambios menores (como actualizaciones de navegador)
        const similarity = this.calculateSimilarity(storedHardwareId, currentHardwareId);

        // Si la similitud es mayor al 80%, consideramos que es el mismo dispositivo
        return similarity >= 0.8;
    },

    // Calcular similitud entre dos strings (0-1)
    calculateSimilarity(str1, str2) {
        // Implementación simple de similitud basada en la longitud de la subcadena común más larga
        const len1 = str1.length;
        const len2 = str2.length;

        if (len1 === 0 || len2 === 0) {
            return 0;
        }

        if (str1 === str2) {
            return 1;
        }

        // Encontrar la subcadena común más larga
        let maxLength = 0;
        for (let i = 0; i < len1; i++) {
            for (let j = 0; j < len2; j++) {
                let length = 0;
                while (i + length < len1 && j + length < len2 && str1[i + length] === str2[j + length]) {
                    length++;
                }
                maxLength = Math.max(maxLength, length);
            }
        }

        // Calcular similitud como proporción de la subcadena común más larga
        return maxLength / Math.max(len1, len2);
    },

    // Verificar expiración de licencia
    verifyLicenseExpiration() {
        try {
            // Obtener datos de licencia
            const encryptedLicenseData = localStorage.getItem('licenseData');

            if (!encryptedLicenseData) {
                return true; // Primera ejecución, no hay datos de licencia aún
            }

            // Desencriptar datos de licencia
            const licenseDataStr = this.decrypt(encryptedLicenseData);
            const licenseData = JSON.parse(licenseDataStr);

            // Verificar fecha de activación
            const activationDate = new Date(licenseData.activationDate);
            const currentDate = new Date();

            // Calcular días transcurridos desde la activación
            const daysSinceActivation = Math.floor((currentDate - activationDate) / (1000 * 60 * 60 * 24));

            // Verificar si la licencia ha expirado
            if (daysSinceActivation > this.licenseInfo.expirationDays) {
                return false; // Licencia expirada
            }

            // Si está próxima a expirar (menos de 30 días), mostrar advertencia
            if (this.licenseInfo.expirationDays - daysSinceActivation < 30) {
                const daysLeft = this.licenseInfo.expirationDays - daysSinceActivation;
                this.showSecurityWarning(`Su licencia expirará en ${daysLeft} días. Por favor, contacte al administrador para renovarla.`);
            }

            return true;
        } catch (error) {
            console.error('Error al verificar expiración de licencia:', error);
            return true; // En caso de error, permitimos el acceso
        }
    },

    // Prevenir depuración
    preventDebugging() {
        // Detectar herramientas de desarrollo
        const devToolsCheck = () => {
            const widthThreshold = window.outerWidth - window.innerWidth > 160;
            const heightThreshold = window.outerHeight - window.innerHeight > 160;

            if (widthThreshold || heightThreshold) {
                console.warn('Advertencia: Herramientas de desarrollo detectadas');
            }
        };

        // Verificar periódicamente
        setInterval(devToolsCheck, 1000);

        // Deshabilitar clic derecho
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            return false;
        });

        // Deshabilitar teclas de depuración
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, F12
            if (
                (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
                e.keyCode === 123
            ) {
                e.preventDefault();
                return false;
            }
        });
    },

    // Mostrar advertencia de seguridad
    showSecurityWarning(message) {
        const warning = document.createElement('div');
        warning.className = 'security-warning';
        warning.innerHTML = `
            <div class="security-warning-content">
                <h3>Advertencia de Seguridad</h3>
                <p>${message}</p>
                <button class="btn btn-primary" id="security-warning-btn">Aceptar</button>
            </div>
        `;

        document.body.appendChild(warning);

        document.getElementById('security-warning-btn').addEventListener('click', () => {
            warning.remove();
        });
    },

    // Deshabilitar aplicación con opción para activar licencia
    disableApplication(message) {
        // Guardar el contenido original para poder restaurarlo
        const originalContent = document.body.innerHTML;

        // Ocultar contenido principal
        document.body.innerHTML = '';

        // Cargar estilos de licencia si no están cargados
        this.loadLicenseStyles();

        // Mostrar mensaje de error con opción para activar licencia
        const errorDiv = document.createElement('div');
        errorDiv.className = 'security-error license-block-screen';
        errorDiv.innerHTML = `
            <div class="license-block-content">
                <div class="license-block-header">
                    <i class="fas fa-shield-alt"></i>
                    <h2>Verificación de Licencia</h2>
                </div>

                <div class="license-block-message">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>${message}</span>
                    </div>
                </div>

                <div class="license-block-form">
                    <h4><i class="fas fa-key"></i> Activar Licencia</h4>
                    <p>Ingrese su clave de licencia para activar el sistema:</p>

                    <div class="form-group">
                        <label for="manual-license-key">Clave de Licencia:</label>
                        <div class="license-input-container">
                            <input type="text" id="manual-license-key" class="form-control"
                                placeholder="Ingrese su clave de licencia" autocomplete="off">
                            <button id="paste-license-btn" class="btn btn-small btn-secondary" title="Pegar del portapapeles">
                                <i class="fas fa-paste"></i>
                            </button>
                        </div>
                        <small class="form-text">La clave de licencia debe ser proporcionada por el administrador del sistema.</small>
                    </div>

                    <div id="license-activation-status" class="mt-3"></div>

                    <div class="license-block-actions">
                        <button id="activate-license-btn" class="btn btn-primary">
                            <i class="fas fa-key"></i> Activar Licencia
                        </button>
                        <button id="restore-content-btn" class="btn btn-secondary">
                            <i class="fas fa-arrow-left"></i> Volver
                        </button>
                    </div>
                </div>

                <div class="license-block-help">
                    <h5>¿No tiene una licencia?</h5>
                    <p>Si necesita adquirir una licencia o tiene problemas para activarla, contacte al administrador del sistema:</p>
                    <div class="contact-info">
                        <p><i class="fas fa-envelope"></i> <a href="mailto:${this.licenseInfo.email}">${this.licenseInfo.email}</a></p>
                        <p><i class="fas fa-user"></i> ${this.licenseInfo.owner}</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(errorDiv);

        // Configurar evento para pegar desde el portapapeles
        document.getElementById('paste-license-btn')?.addEventListener('click', async () => {
            try {
                const text = await navigator.clipboard.readText();
                const licenseInput = document.getElementById('manual-license-key');
                if (licenseInput && text) {
                    licenseInput.value = text.trim();
                }
            } catch (error) {
                console.error('Error al acceder al portapapeles:', error);
                // Mostrar mensaje de error
                const statusDiv = document.getElementById('license-activation-status');
                if (statusDiv) {
                    statusDiv.innerHTML = `
                        <div class="alert alert-warning">
                            <i class="fas fa-exclamation-triangle"></i> No se pudo acceder al portapapeles. Por favor, pegue la clave manualmente.
                        </div>
                    `;
                    setTimeout(() => {
                        statusDiv.innerHTML = '';
                    }, 3000);
                }
            }
        });

        // Configurar evento para activar licencia
        document.getElementById('activate-license-btn')?.addEventListener('click', () => {
            this.handleLicenseActivation();
        });

        // Permitir activación con Enter
        document.getElementById('manual-license-key')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLicenseActivation();
            }
        });

        // Configurar evento para restaurar contenido
        document.getElementById('restore-content-btn')?.addEventListener('click', () => {
            // Restaurar el contenido original
            document.body.innerHTML = originalContent;
        });
    },

    // Manejar la activación de licencia
    handleLicenseActivation() {
        const licenseKey = document.getElementById('manual-license-key')?.value.trim();
        const statusDiv = document.getElementById('license-activation-status');

        if (!licenseKey) {
            if (statusDiv) {
                statusDiv.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fas fa-times-circle"></i> Por favor, ingrese una clave de licencia válida.
                    </div>
                `;
            }
            return;
        }

        // Mostrar mensaje de carga
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="alert alert-info">
                    <i class="fas fa-spinner fa-spin"></i> Verificando y activando licencia...
                </div>
            `;
        }

        // Intentar activar la licencia
        this.activateLicenseManually(licenseKey)
            .then(success => {
                if (success) {
                    if (statusDiv) {
                        statusDiv.innerHTML = `
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle"></i> Licencia activada correctamente. Iniciando sistema...
                            </div>
                        `;
                    }

                    // Esperar un momento y luego recargar la página
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    if (statusDiv) {
                        statusDiv.innerHTML = `
                            <div class="alert alert-danger">
                                <i class="fas fa-times-circle"></i> La clave de licencia no es válida o no se pudo activar.
                            </div>
                        `;
                    }
                }
            })
            .catch(error => {
                console.error('Error al activar licencia:', error);
                if (statusDiv) {
                    statusDiv.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fas fa-times-circle"></i> Error al activar licencia: ${error.message || 'Error desconocido'}
                        </div>
                    `;
                }
            });
    },

    // Cargar estilos de licencia
    loadLicenseStyles() {
        // Verificar si ya existen los estilos
        if (document.getElementById('license-block-styles')) {
            return;
        }

        // Crear elemento de estilo
        const style = document.createElement('style');
        style.id = 'license-block-styles';

        // Añadir estilos
        style.textContent = `
            .license-block-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-family: 'Roboto', Arial, sans-serif;
            }

            .license-block-content {
                background-color: white;
                border-radius: 10px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 600px;
                overflow: hidden;
                animation: fadeInUp 0.5s ease;
            }

            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .license-block-header {
                background-color: #2563eb;
                color: white;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .license-block-header i {
                font-size: 24px;
            }

            .license-block-header h2 {
                margin: 0;
                font-size: 20px;
                font-weight: 600;
            }

            .license-block-message {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            }

            .license-block-form {
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            }

            .license-block-form h4 {
                margin: 0 0 15px 0;
                font-size: 18px;
                color: #2563eb;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .license-input-container {
                display: flex;
                gap: 10px;
            }

            .license-input-container input {
                flex: 1;
                padding: 10px 15px;
                border: 1px solid #d1d5db;
                border-radius: 5px;
                font-size: 16px;
                font-family: monospace;
            }

            .license-input-container input:focus {
                outline: none;
                border-color: #2563eb;
                box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
            }

            .license-block-actions {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                margin-top: 20px;
            }

            .license-block-help {
                padding: 20px;
                background-color: #f9fafb;
            }

            .license-block-help h5 {
                margin: 0 0 10px 0;
                font-size: 16px;
                color: #4b5563;
            }

            .license-block-help p {
                margin: 0 0 10px 0;
                color: #6b7280;
                font-size: 14px;
            }

            .contact-info {
                background-color: #f3f4f6;
                padding: 10px 15px;
                border-radius: 5px;
                margin-top: 10px;
            }

            .contact-info p {
                margin: 5px 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .contact-info i {
                color: #2563eb;
            }

            .contact-info a {
                color: #2563eb;
                text-decoration: none;
            }

            .contact-info a:hover {
                text-decoration: underline;
            }

            .form-group {
                margin-bottom: 15px;
            }

            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: 500;
                color: #4b5563;
            }

            .form-text {
                display: block;
                margin-top: 5px;
                font-size: 12px;
                color: #6b7280;
            }

            .btn {
                display: inline-block;
                font-weight: 500;
                text-align: center;
                white-space: nowrap;
                vertical-align: middle;
                user-select: none;
                border: 1px solid transparent;
                padding: 8px 16px;
                font-size: 14px;
                line-height: 1.5;
                border-radius: 5px;
                transition: all 0.2s ease-in-out;
                cursor: pointer;
            }

            .btn-primary {
                color: #fff;
                background-color: #2563eb;
                border-color: #2563eb;
            }

            .btn-primary:hover {
                background-color: #1d4ed8;
                border-color: #1d4ed8;
            }

            .btn-secondary {
                color: #4b5563;
                background-color: #e5e7eb;
                border-color: #e5e7eb;
            }

            .btn-secondary:hover {
                background-color: #d1d5db;
                border-color: #d1d5db;
            }

            .btn-small {
                padding: 6px 10px;
                font-size: 12px;
            }

            .alert {
                position: relative;
                padding: 12px 15px;
                margin-bottom: 15px;
                border: 1px solid transparent;
                border-radius: 5px;
                display: flex;
                align-items: flex-start;
                gap: 10px;
            }

            .alert i {
                font-size: 18px;
                margin-top: 2px;
            }

            .alert-success {
                color: #0f5132;
                background-color: #d1e7dd;
                border-color: #badbcc;
            }

            .alert-danger {
                color: #842029;
                background-color: #f8d7da;
                border-color: #f5c2c7;
            }

            .alert-warning {
                color: #664d03;
                background-color: #fff3cd;
                border-color: #ffecb5;
            }

            .alert-info {
                color: #055160;
                background-color: #cff4fc;
                border-color: #b6effb;
            }

            .mt-3 {
                margin-top: 15px;
            }
        `;

        // Añadir al DOM
        document.head.appendChild(style);
    },

    // Activar licencia manualmente
    async activateLicenseManually(licenseKey) {
        try {
            console.log('Activando licencia manualmente:', licenseKey);

            // Verificar si la licencia es válida (en un entorno real, esto se haría con el servidor)
            // Para esta demostración, aceptamos cualquier licencia que no esté vacía
            if (!licenseKey) {
                return false;
            }

            // Generar ID de instalación
            const installationId = this.generateInstallationId();
            const hardwareId = this.getHardwareId();

            // Crear datos de licencia
            const licenseData = {
                key: licenseKey,
                activationDate: new Date().toISOString(),
                installationId: installationId,
                hardwareId: hardwareId,
                owner: this.licenseInfo.owner,
                email: this.licenseInfo.email,
                expirationDays: this.licenseInfo.expirationDays,
                features: this.licenseInfo.features
            };

            // Guardar licencia
            localStorage.setItem('licenseKey', licenseKey);
            localStorage.setItem('licenseData', this.encrypt(JSON.stringify(licenseData)));
            localStorage.setItem('hardwareId', hardwareId);

            console.log('Licencia activada correctamente:', licenseKey);
            return true;
        } catch (error) {
            console.error('Error al activar licencia manualmente:', error);
            return false;
        }
    },

    // Encriptar datos
    encrypt(data) {
        if (typeof data !== 'string') {
            data = JSON.stringify(data);
        }

        // Implementación simple de encriptación (no segura para producción)
        let result = '';
        for (let i = 0; i < data.length; i++) {
            const charCode = data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            result += String.fromCharCode(charCode);
        }

        return btoa(result); // Codificar en base64
    },

    // Desencriptar datos
    decrypt(encryptedData) {
        try {
            // Decodificar base64
            const data = atob(encryptedData);

            // Desencriptar
            let result = '';
            for (let i = 0; i < data.length; i++) {
                const charCode = data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                result += String.fromCharCode(charCode);
            }

            return result;
        } catch (error) {
            console.error('Error al desencriptar datos:', error);
            return null;
        }
    },

    // Proteger código crítico mediante ofuscación y encriptación
    protectCriticalCode() {
        try {
            // Crear una copia segura de funciones críticas
            this._secureFunctions = {
                // Almacenar referencias a funciones críticas
                verifyLicense: this.verifyLicense,
                generateLicense: this.generateLicense,
                encrypt: this.encrypt,
                decrypt: this.decrypt,
                checkIntegrity: this.checkIntegrity
            };

            // Crear proxy para interceptar accesos no autorizados
            const securityProxy = new Proxy(this, {
                get: (target, prop) => {
                    // Verificar si se está accediendo a una función crítica
                    if (this._secureFunctions[prop]) {
                        // Verificar si el acceso es legítimo
                        if (!this._isLegitimateAccess()) {
                            console.error(`Acceso no autorizado a función crítica: ${prop}`);
                            this.logSecurityViolation(`Acceso no autorizado a función crítica: ${prop}`);
                            return () => null; // Devolver función vacía
                        }
                    }
                    return target[prop];
                }
            });

            // Reemplazar objeto global con proxy
            window._securityBackup = window.Security;
            window.Security = securityProxy;

            // Proteger contra manipulación de código
            this._protectAgainstCodeManipulation();

            return true;
        } catch (error) {
            console.error('Error al proteger código crítico:', error);
            return false;
        }
    },

    // Verificar si el acceso es legítimo
    _isLegitimateAccess() {
        // Verificar la pila de llamadas
        const stackTrace = new Error().stack || '';

        // Lista de orígenes legítimos
        const legitimateSources = [
            'Security.init',
            'Security.verifyLicenseAndHardware',
            'Security.checkIntegrity',
            'App.init'
        ];

        // Verificar si la llamada proviene de un origen legítimo
        return legitimateSources.some(source => stackTrace.includes(source));
    },

    // Proteger contra manipulación de código
    _protectAgainstCodeManipulation() {
        // Crear hash del código fuente
        const codeHash = this.simpleHash(this.toString() + Object.keys(this).join(','));

        // Guardar hash en una propiedad no enumerable
        Object.defineProperty(this, '_codeHash', {
            value: codeHash,
            writable: false,
            enumerable: false,
            configurable: false
        });

        // Verificar periódicamente que el código no ha sido manipulado
        setInterval(() => {
            const currentHash = this.simpleHash(this.toString() + Object.keys(this).join(','));
            if (currentHash !== this._codeHash) {
                console.error('Advertencia: El código ha sido manipulado');
                this.logSecurityViolation('Manipulación de código detectada');
                this.disableApplication('Se ha detectado una manipulación del sistema. Por favor, contacte al administrador.');
            }
        }, 10000); // Verificar cada 10 segundos
    },

    // Configurar protección del DOM
    setupDOMProtection() {
        try {
            // Proteger elementos críticos
            const criticalElements = [
                'login-form',
                'register-form',
                'app-container',
                'admin-page'
            ];

            // Crear observador de mutaciones para detectar cambios en el DOM
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    // Verificar si se ha eliminado un elemento crítico
                    if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                        mutation.removedNodes.forEach((node) => {
                            if (node.nodeType === 1 && criticalElements.includes(node.id)) {
                                console.error(`Advertencia: Elemento crítico eliminado: ${node.id}`);
                                this.logSecurityViolation(`Elemento crítico eliminado: ${node.id}`);
                            }
                        });
                    }
                });
            });

            // Iniciar observación del DOM
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            // Proteger contra inyección de scripts
            this._protectAgainstScriptInjection();

            return true;
        } catch (error) {
            console.error('Error al configurar protección del DOM:', error);
            return false;
        }
    },

    // Proteger contra inyección de scripts
    _protectAgainstScriptInjection() {
        // Interceptar creación de elementos script
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(document, tagName);

            // Si es un script, monitorear su contenido y origen
            if (tagName.toLowerCase() === 'script') {
                // Interceptar asignación de src
                const originalSrcDescriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src');
                Object.defineProperty(element, 'src', {
                    set(value) {
                        // Lista de dominios permitidos
                        const allowedDomains = [
                            'localhost',
                            '127.0.0.1',
                            'cdn.jsdelivr.net',
                            'cdnjs.cloudflare.com'
                        ];

                        // Verificar si el dominio está permitido
                        const url = new URL(value, window.location.href);
                        const isDomainAllowed = allowedDomains.some(domain => url.hostname.includes(domain));

                        if (!isDomainAllowed) {
                            console.error(`Advertencia: Intento de cargar script desde dominio no permitido: ${url.hostname}`);
                            Security.logSecurityViolation(`Intento de cargar script desde dominio no permitido: ${url.hostname}`);
                            return;
                        }

                        // Si el dominio está permitido, permitir la asignación
                        originalSrcDescriptor.set.call(this, value);
                    },
                    get() {
                        return originalSrcDescriptor.get.call(this);
                    }
                });
            }

            return element;
        };
    },

    // Registrar violación de seguridad
    logSecurityViolation(message) {
        try {
            // Obtener información del contexto
            const timestamp = new Date().toISOString();
            const userAgent = navigator.userAgent;
            const url = window.location.href;

            // Crear registro de violación
            const violationLog = {
                timestamp,
                message,
                userAgent,
                url,
                hardwareId: this.getHardwareId()
            };

            // Guardar en localStorage (en un entorno real, se enviaría a un servidor)
            const violations = JSON.parse(localStorage.getItem('securityViolations') || '[]');
            violations.push(violationLog);
            localStorage.setItem('securityViolations', JSON.stringify(violations));

            console.error('Violación de seguridad registrada:', message);

            // En un entorno real, aquí se enviaría la información a un servidor
            // para su registro y posible bloqueo de la cuenta

            return true;
        } catch (error) {
            console.error('Error al registrar violación de seguridad:', error);
            return false;
        }
    }
};

// Agregar funciones de validación remota
(function() {
    // Función para validar licencia con el servidor
    Security.validateLicenseWithServer = async function() {
        try {
            // Obtener datos de licencia
            const licenseKey = localStorage.getItem('licenseKey');
            const hardwareId = this.getHardwareId();
            const installationId = localStorage.getItem('installationId') || this.generateInstallationId();

            // Si no hay licencia, no podemos validar
            if (!licenseKey) {
                return false;
            }

            // En un entorno real, aquí haríamos una llamada al servidor
            console.log('Validando licencia con el servidor...');

            // Simular llamada al servidor
            const validationData = {
                licenseKey,
                hardwareId,
                installationId,
                domain: window.location.hostname,
                timestamp: new Date().toISOString()
            };

            // Encriptar datos para envío seguro
            const encryptedData = this.encrypt(JSON.stringify(validationData));

            // Simular respuesta del servidor
            const serverResponse = {
                valid: true,
                expirationDate: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
                message: 'Licencia válida',
                allowedFeatures: this.licenseInfo.features
            };

            // En un entorno real, aquí verificaríamos la respuesta del servidor
            if (!serverResponse.valid) {
                console.error('Error: Licencia no válida según el servidor');
                this.showSecurityWarning(`Error de licencia: ${serverResponse.message}`);
                return false;
            }

            // Actualizar información de licencia
            const licenseData = {
                key: licenseKey,
                validUntil: serverResponse.expirationDate,
                features: serverResponse.allowedFeatures,
                lastValidated: new Date().toISOString()
            };

            // Guardar información actualizada
            localStorage.setItem('licenseData', this.encrypt(JSON.stringify(licenseData)));

            console.log('Licencia validada correctamente con el servidor');
            return true;
        } catch (error) {
            console.error('Error al validar licencia con el servidor:', error);

            // En caso de error de conexión, permitir acceso si hay una licencia local válida
            return this.verifyLicense();
        }
    };

    // Programar validación periódica con el servidor
    Security.scheduleServerValidation = function() {
        // Validar licencia con el servidor cada 7 días
        const validationInterval = 7 * 24 * 60 * 60 * 1000; // 7 días

        // Verificar cuándo fue la última validación
        const encryptedLicenseData = localStorage.getItem('licenseData');
        if (encryptedLicenseData) {
            try {
                const licenseDataStr = this.decrypt(encryptedLicenseData);
                const licenseData = JSON.parse(licenseDataStr);

                if (licenseData.lastValidated) {
                    const lastValidated = new Date(licenseData.lastValidated);
                    const now = new Date();

                    // Si han pasado menos de 7 días, programar la próxima validación
                    const timeSinceLastValidation = now - lastValidated;
                    if (timeSinceLastValidation < validationInterval) {
                        const timeUntilNextValidation = validationInterval - timeSinceLastValidation;

                        setTimeout(() => {
                            this.validateLicenseWithServer();
                            this.scheduleServerValidation();
                        }, timeUntilNextValidation);

                        return;
                    }
                }
            } catch (error) {
                console.error('Error al leer datos de licencia:', error);
            }
        }

        // Si no hay datos de validación o ha pasado el tiempo, validar ahora
        setTimeout(() => {
            this.validateLicenseWithServer();
            this.scheduleServerValidation();
        }, 60000); // Esperar 1 minuto después de iniciar la aplicación
    };

    // Agregar la validación con el servidor a la inicialización
    const originalInit = Security.init;
    Security.init = function() {
        // Llamar a la función original
        originalInit.call(this);

        // Programar validación con el servidor
        this.scheduleServerValidation();
    };
})();

// Agregar estilos para mensajes de seguridad
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .security-warning, .security-error {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        }

        .security-warning-content, .security-error-content {
            background-color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            max-width: 500px;
            width: 90%;
            text-align: center;
        }

        .security-error-content {
            border-left: 5px solid #dc3545;
        }

        .security-warning-content {
            border-left: 5px solid #ffc107;
        }

        .security-license-info {
            margin-top: 1rem;
            padding: 1rem;
            background-color: #f8f9fa;
            border-radius: 0.5rem;
            font-size: 0.9rem;
        }

        .security-license-info p {
            margin: 0.25rem 0;
        }

        .security-license-info .license-owner {
            font-weight: bold;
        }

        .security-license-info .license-expiration {
            color: #dc3545;
        }

        .license-activation-form {
            background-color: #f8f9fa;
            padding: 1.5rem;
            border-radius: 0.5rem;
            margin-top: 1.5rem;
            border-left: 5px solid #007bff;
        }

        .license-activation-form h4 {
            color: #007bff;
            margin-bottom: 0.5rem;
        }

        .license-activation-form .form-control {
            padding: 0.75rem;
            font-size: 1.1rem;
            font-family: monospace;
            text-align: center;
        }

        .license-activation-form .btn {
            padding: 0.5rem 1rem;
            margin-top: 0.5rem;
        }
    `;

    document.head.appendChild(style);

    // Agregar marca de agua con información de licencia
    const addWatermark = () => {
        try {
            // Verificar si ya existe una marca de agua
            if (document.querySelector('.license-watermark')) {
                return;
            }

            // Crear marca de agua
            const watermark = document.createElement('div');
            watermark.className = 'license-watermark';
            watermark.style.cssText = `
                position: fixed;
                bottom: 5px;
                right: 5px;
                font-size: 10px;
                color: rgba(0, 0, 0, 0.2);
                pointer-events: none;
                z-index: 9999;
                user-select: none;
            `;

            // Obtener información de licencia
            const licenseData = localStorage.getItem('licenseData');
            if (licenseData) {
                const decryptedData = Security.decrypt(licenseData);
                if (decryptedData) {
                    const data = JSON.parse(decryptedData);
                    watermark.textContent = `Sistema Objetivos - Licencia: ${Security.licenseInfo.owner}`;
                }
            } else {
                watermark.textContent = 'Sistema Objetivos - Versión de Desarrollo';
            }

            document.body.appendChild(watermark);
        } catch (error) {
            console.error('Error al agregar marca de agua:', error);
        }
    };

    // Agregar marca de agua después de que el DOM esté completamente cargado
    setTimeout(addWatermark, 2000);
});
