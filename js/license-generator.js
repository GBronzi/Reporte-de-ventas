// Generador de licencias para Sistema Objetivos
const LicenseGenerator = {
    // Clave de encriptación (debe ser la misma que en security.js)
    encryptionKey: (function() {
        const parts = ['Sistema', 'Objetivos', '2023', 'Secure', 'Key', 'Mauricio', 'Bronzi'];
        return parts.join('') + '_' + btoa('g.bronzi91@gmail.com');
    })(),

    // Inicializar generador de licencias
    init() {
        console.log('Inicializando generador de licencias...');
        this.setupEventListeners();
    },

    // Configurar listeners de eventos
    setupEventListeners() {
        // Listener para el formulario de generación de licencias
        const licenseForm = document.getElementById('license-generator-form');
        if (licenseForm) {
            licenseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateLicense();
            });
        }

        // Listener para el formulario de activación de licencias
        const activationForm = document.getElementById('license-activation-form');
        if (activationForm) {
            activationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.activateLicense();
            });
        }
    },

    // Generar una nueva licencia
    generateLicense() {
        try {
            // Obtener datos del formulario
            const ownerName = document.getElementById('license-owner').value.trim();
            const ownerEmail = document.getElementById('license-email').value.trim();
            const expirationDays = parseInt(document.getElementById('license-expiration').value) || 365;
            const maxInstallations = parseInt(document.getElementById('license-installations').value) || 3;

            // Validar datos
            if (!ownerName || !ownerEmail) {
                this.showMessage('error', 'Por favor, complete todos los campos obligatorios.');
                return;
            }

            // Generar ID único para la licencia
            const licenseId = this.generateUniqueId();

            // Crear datos de la licencia
            const licenseData = {
                id: licenseId,
                owner: ownerName,
                email: ownerEmail,
                creationDate: new Date().toISOString(),
                expirationDays: expirationDays,
                maxInstallations: maxInstallations,
                features: this.getSelectedFeatures(),
                activations: []
            };

            // Generar clave de licencia
            const licenseKey = this.generateLicenseKey(licenseData);

            // Guardar licencia en el almacenamiento (en un entorno real, esto iría a una base de datos)
            this.saveLicense(licenseKey, licenseData);

            // Mostrar licencia generada
            this.displayGeneratedLicense(licenseKey, licenseData);

            // Limpiar formulario
            document.getElementById('license-generator-form').reset();

            return licenseKey;
        } catch (error) {
            console.error('Error al generar licencia:', error);
            this.showMessage('error', 'Error al generar licencia: ' + error.message);
            return null;
        }
    },

    // Generar ID único
    generateUniqueId() {
        return 'lic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Obtener características seleccionadas
    getSelectedFeatures() {
        const features = [];
        const checkboxes = document.querySelectorAll('input[name="license-features"]:checked');

        checkboxes.forEach(checkbox => {
            features.push(checkbox.value);
        });

        // Si no se seleccionó ninguna, incluir todas por defecto
        if (features.length === 0) {
            return ['dashboard', 'objetivos', 'creditos', 'admin', 'updates'];
        }

        return features;
    },

    // Generar clave de licencia
    generateLicenseKey(licenseData) {
        // Crear string con datos importantes
        const dataString = `${licenseData.id}|${licenseData.owner}|${licenseData.email}|${licenseData.creationDate}`;

        // Generar hash
        const licenseKey = this.simpleHash(dataString + this.encryptionKey);

        return licenseKey;
    },

    // Función de hash simple (debe ser la misma que en security.js)
    simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convertir a entero de 32 bits
        }
        // Convertir a string hexadecimal y asegurar que sea positivo
        return (hash >>> 0).toString(16).padStart(8, '0');
    },

    // Guardar licencia en el almacenamiento
    saveLicense(licenseKey, licenseData) {
        // Verificar si está disponible el módulo de almacenamiento
        if (window.LicenseStorage) {
            // Usar el nuevo sistema de almacenamiento
            const success = LicenseStorage.saveLicense(licenseKey, licenseData);

            if (success) {
                console.log('Licencia guardada con el nuevo sistema:', licenseKey);
                return true;
            } else {
                console.error('Error al guardar licencia con el nuevo sistema');
            }
        }

        // Método de respaldo (antiguo)
        try {
            // Obtener licencias existentes
            const licenses = JSON.parse(localStorage.getItem('generatedLicenses') || '{}');

            // Agregar nueva licencia
            licenses[licenseKey] = licenseData;

            // Guardar en localStorage
            localStorage.setItem('generatedLicenses', JSON.stringify(licenses));

            console.log('Licencia guardada con el sistema antiguo:', licenseKey);
            return true;
        } catch (error) {
            console.error('Error al guardar licencia con el sistema antiguo:', error);
            return false;
        }
    },

    // Mostrar licencia generada
    displayGeneratedLicense(licenseKey, licenseData) {
        const licenseDisplay = document.getElementById('generated-license-display');
        if (!licenseDisplay) return;

        // Crear contenido HTML
        licenseDisplay.innerHTML = `
            <div class="license-result">
                <h4>Licencia Generada Exitosamente</h4>

                <div class="license-key-container">
                    <p><strong>Clave de Licencia:</strong></p>
                    <div class="license-key">${licenseKey}</div>
                    <button class="btn btn-sm btn-outline-primary copy-license-btn" data-license="${licenseKey}">
                        <i class="fas fa-copy"></i> Copiar
                    </button>
                </div>

                <div class="license-details">
                    <p><strong>Propietario:</strong> ${licenseData.owner}</p>
                    <p><strong>Email:</strong> ${licenseData.email}</p>
                    <p><strong>Fecha de Creación:</strong> ${new Date(licenseData.creationDate).toLocaleDateString()}</p>
                    <p><strong>Expiración:</strong> ${licenseData.expirationDays} días</p>
                    <p><strong>Instalaciones Máximas:</strong> ${licenseData.maxInstallations}</p>
                    <p><strong>Características:</strong> ${licenseData.features.join(', ')}</p>
                </div>

                <div class="license-actions mt-3">
                    <button class="btn btn-primary" id="download-license-btn">Descargar Archivo de Licencia</button>
                </div>
            </div>
        `;

        // Mostrar el contenedor
        licenseDisplay.style.display = 'block';

        // Configurar botón de copia
        const copyBtn = licenseDisplay.querySelector('.copy-license-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyToClipboard(licenseKey);
                this.showMessage('success', 'Clave de licencia copiada al portapapeles');
            });
        }

        // Configurar botón de descarga
        const downloadBtn = document.getElementById('download-license-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadLicenseFile(licenseKey, licenseData);
            });
        }
    },

    // Copiar texto al portapapeles
    copyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    },

    // Descargar archivo de licencia
    downloadLicenseFile(licenseKey, licenseData) {
        // Crear objeto con datos de licencia
        const licenseFileData = {
            licenseKey: licenseKey,
            licenseData: licenseData
        };

        // Convertir a JSON
        const licenseJson = JSON.stringify(licenseFileData, null, 2);

        // Crear blob
        const blob = new Blob([licenseJson], { type: 'application/json' });

        // Crear URL
        const url = URL.createObjectURL(blob);

        // Crear enlace de descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = `licencia_${licenseData.owner.replace(/\s+/g, '_')}.json`;

        // Simular clic
        document.body.appendChild(a);
        a.click();

        // Limpiar
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);

        this.showMessage('success', 'Archivo de licencia descargado correctamente');
    },

    // Activar una licencia
    activateLicense() {
        try {
            // Obtener clave de licencia
            const licenseKey = document.getElementById('activation-license-key').value.trim();

            if (!licenseKey) {
                this.showMessage('error', 'Por favor, ingrese una clave de licencia válida.');
                return false;
            }

            // Verificar si la licencia existe
            const licenses = JSON.parse(localStorage.getItem('generatedLicenses') || '{}');
            const licenseData = licenses[licenseKey];

            if (!licenseData) {
                this.showMessage('error', 'La clave de licencia ingresada no es válida o no existe.');
                return false;
            }

            // Generar ID de instalación
            const installationId = this.generateInstallationId();

            // Verificar si se ha alcanzado el límite de instalaciones
            if (licenseData.activations.length >= licenseData.maxInstallations) {
                this.showMessage('error', `Se ha alcanzado el límite de instalaciones (${licenseData.maxInstallations}) para esta licencia.`);
                return false;
            }

            // Registrar activación
            const activationData = {
                installationId: installationId,
                activationDate: new Date().toISOString(),
                hardwareId: this.getHardwareId(),
                domain: window.location.hostname || 'localhost'
            };

            licenseData.activations.push(activationData);

            // Actualizar licencia
            licenses[licenseKey] = licenseData;
            localStorage.setItem('generatedLicenses', JSON.stringify(licenses));

            // Aplicar licencia al sistema actual
            this.applyLicenseToSystem(licenseKey, licenseData, activationData);

            // Mostrar mensaje de éxito
            this.showMessage('success', 'Licencia activada correctamente.');

            // Mostrar detalles de activación
            this.displayActivationDetails(licenseKey, licenseData, activationData);

            return true;
        } catch (error) {
            console.error('Error al activar licencia:', error);
            this.showMessage('error', 'Error al activar licencia: ' + error.message);
            return false;
        }
    },

    // Generar ID de instalación
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

    // Obtener ID de hardware
    getHardwareId() {
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

    // Aplicar licencia al sistema actual
    applyLicenseToSystem(licenseKey, licenseData, activationData) {
        try {
            console.log('Aplicando licencia al sistema:', licenseKey);

            // Guardar licencia en localStorage
            localStorage.setItem('licenseKey', licenseKey);

            // Crear datos de licencia para el sistema
            const systemLicenseData = {
                key: licenseKey,
                activationDate: activationData.activationDate,
                installationId: activationData.installationId,
                hardwareId: activationData.hardwareId,
                owner: licenseData.owner,
                email: licenseData.email,
                expirationDays: licenseData.expirationDays || 365,
                features: licenseData.features || ['all']
            };

            console.log('Datos de licencia a guardar:', systemLicenseData);

            // Intentar usar SimpleCrypto si está disponible
            let encryptedData;
            if (window.SimpleCrypto) {
                console.log('Usando SimpleCrypto para encriptar datos');
                encryptedData = SimpleCrypto.encrypt(JSON.stringify(systemLicenseData));
            } else {
                console.log('Usando método interno para encriptar datos');
                // Encriptar datos de licencia con método interno
                encryptedData = this.encrypt(JSON.stringify(systemLicenseData));
            }

            if (!encryptedData) {
                throw new Error('No se pudieron encriptar los datos de licencia');
            }

            // Guardar datos encriptados
            localStorage.setItem('licenseData', encryptedData);

            // Guardar también una versión sin encriptar como respaldo
            localStorage.setItem('licenseData_plain', JSON.stringify(systemLicenseData));

            // Guardar ID de hardware
            localStorage.setItem('hardwareId', activationData.hardwareId);

            // Guardar fecha de activación por separado para facilitar su acceso
            localStorage.setItem('activationDate', activationData.activationDate);

            // Verificar que los datos se guardaron correctamente
            const storedLicenseKey = localStorage.getItem('licenseKey');
            const storedLicenseData = localStorage.getItem('licenseData');
            const storedHardwareId = localStorage.getItem('hardwareId');

            if (!storedLicenseKey || !storedLicenseData || !storedHardwareId) {
                console.error('Error: No se pudieron guardar todos los datos de licencia');
                console.log('LicenseKey guardada:', !!storedLicenseKey);
                console.log('LicenseData guardada:', !!storedLicenseData);
                console.log('HardwareId guardado:', !!storedHardwareId);

                // Intentar guardar de nuevo con otro método
                if (!storedLicenseData && encryptedData) {
                    console.log('Intentando guardar datos sin encriptar como último recurso');
                    localStorage.setItem('licenseData_backup', JSON.stringify(systemLicenseData));
                }
            } else {
                console.log('Licencia aplicada correctamente al sistema');
            }

            // Intentar activar la licencia con Security si está disponible
            if (window.Security && typeof window.Security.activateLicenseManually === 'function') {
                console.log('Activando licencia con Security.activateLicenseManually');
                window.Security.activateLicenseManually(licenseKey)
                    .then(success => {
                        console.log('Resultado de activación con Security:', success ? 'Éxito' : 'Fallo');
                    })
                    .catch(error => {
                        console.error('Error al activar licencia con Security:', error);
                    });
            }

            console.log('Proceso de aplicación de licencia completado');
            return true;
        } catch (error) {
            console.error('Error al aplicar licencia al sistema:', error);

            // Intentar guardar datos sin encriptar como último recurso
            try {
                localStorage.setItem('licenseKey', licenseKey);
                localStorage.setItem('licenseData_emergency', JSON.stringify({
                    key: licenseKey,
                    activationDate: new Date().toISOString(),
                    hardwareId: activationData.hardwareId,
                    owner: licenseData.owner,
                    email: licenseData.email
                }));
                localStorage.setItem('hardwareId', activationData.hardwareId);
                console.log('Datos de emergencia guardados');
            } catch (emergencyError) {
                console.error('Error al guardar datos de emergencia:', emergencyError);
            }

            return false;
        }
    },

    // Encriptar datos (debe ser la misma que en security.js)
    encrypt(data) {
        try {
            // Encriptar usando XOR con la clave
            let result = '';
            for (let i = 0; i < data.length; i++) {
                const charCode = data.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                result += String.fromCharCode(charCode);
            }

            return btoa(result); // Codificar en base64
        } catch (error) {
            console.error('Error al encriptar datos:', error);
            return null;
        }
    },

    // Mostrar detalles de activación
    displayActivationDetails(licenseKey, licenseData, activationData) {
        const activationDisplay = document.getElementById('activation-details-display');
        if (!activationDisplay) return;

        // Crear contenido HTML
        activationDisplay.innerHTML = `
            <div class="activation-result">
                <h4>Licencia Activada Exitosamente</h4>

                <div class="activation-details">
                    <p><strong>Propietario:</strong> ${licenseData.owner}</p>
                    <p><strong>Email:</strong> ${licenseData.email}</p>
                    <p><strong>Fecha de Activación:</strong> ${new Date(activationData.activationDate).toLocaleDateString()}</p>
                    <p><strong>Expiración:</strong> ${new Date(new Date(activationData.activationDate).getTime() + licenseData.expirationDays * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    <p><strong>ID de Instalación:</strong> ${activationData.installationId}</p>
                    <p><strong>Instalaciones Utilizadas:</strong> ${licenseData.activations.length} de ${licenseData.maxInstallations}</p>
                </div>

                <div class="activation-actions mt-3">
                    <button class="btn btn-primary" id="restart-system-btn">Reiniciar Sistema</button>
                </div>
            </div>
        `;

        // Mostrar el contenedor
        activationDisplay.style.display = 'block';

        // Configurar botón de reinicio
        const restartBtn = document.getElementById('restart-system-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }
    },

    // Mostrar mensaje
    showMessage(type, message) {
        const messageContainer = document.getElementById('license-message');
        if (!messageContainer) return;

        // Crear alerta
        messageContainer.innerHTML = `
            <div class="alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show" role="alert">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        // Mostrar contenedor
        messageContainer.style.display = 'block';

        // Ocultar después de 5 segundos
        setTimeout(() => {
            const alert = messageContainer.querySelector('.alert');
            if (alert) {
                alert.classList.remove('show');
                setTimeout(() => {
                    messageContainer.innerHTML = '';
                    messageContainer.style.display = 'none';
                }, 500);
            }
        }, 5000);
    }
};

// Inicializar generador de licencias cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    LicenseGenerator.init();
});
