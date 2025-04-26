// Sistema de actualizaciones (manual, en línea o Google Drive)
const Updater = {
    // Versión actual del sistema
    currentVersion: '2.0.0',

    // URL del servidor de actualizaciones (simulado)
    updateServerUrl: 'https://sistema-objetivos.com/api/updates',

    // URL de Google Drive para actualizaciones
    googleDriveUrl: 'https://drive.google.com/drive/folders/1z5631DNrFjyXX8zMxiXA5efBBpEa_h_S',

    // ID de la carpeta de Google Drive
    googleDriveFolderId: '1z5631DNrFjyXX8zMxiXA5efBBpEa_h_S',

    // Modo de actualización (manual, online o drive)
    updateMode: 'drive', // 'manual', 'online' o 'drive'

    // Frecuencia de verificación de actualizaciones (en milisegundos)
    checkInterval: 1 * 60 * 60 * 1000, // 1 hora

    // Inicializar el sistema de actualizaciones
    init() {
        console.log('Inicializando sistema de actualizaciones...');

        // Cargar configuración de actualizaciones
        this.loadUpdateConfig();

        // Verificar si hay una versión guardada
        const savedVersion = localStorage.getItem('appVersion');
        if (!savedVersion) {
            localStorage.setItem('appVersion', this.currentVersion);
            console.log('Primera ejecución, versión guardada:', this.currentVersion);
        } else if (savedVersion !== this.currentVersion) {
            console.log(`Actualización detectada: ${savedVersion} -> ${this.currentVersion}`);
            this.showUpdateNotification(savedVersion, this.currentVersion);
            localStorage.setItem('appVersion', this.currentVersion);
        }

        // Configurar eventos
        this.setupEvents();

        // Verificar actualizaciones automáticamente para todos los modos excepto manual
        if (this.updateMode !== 'manual') {
            // Verificar actualizaciones inmediatamente
            setTimeout(() => {
                this.checkForUpdates(true); // true = verificación silenciosa
            }, 3000); // Esperar 3 segundos para que la aplicación termine de cargar

            // Programar verificaciones periódicas
            this.scheduleUpdateCheck();
        }
    },

    // Cargar configuración de actualizaciones
    loadUpdateConfig() {
        // Cargar modo de actualización
        const savedMode = localStorage.getItem('updateMode');
        if (savedMode) {
            this.updateMode = savedMode;
        }

        // Cargar configuración de Google Drive
        const savedFolderId = localStorage.getItem('googleDriveFolderId');
        if (savedFolderId) {
            this.googleDriveFolderId = savedFolderId;
        }

        const savedDriveUrl = localStorage.getItem('googleDriveUrl');
        if (savedDriveUrl) {
            this.googleDriveUrl = savedDriveUrl;
        } else if (this.googleDriveFolderId) {
            // Reconstruir URL si no está guardada pero tenemos el ID
            this.googleDriveUrl = `https://drive.google.com/drive/folders/${this.googleDriveFolderId}`;
        }

        console.log(`Modo de actualización: ${this.updateMode}`);
        if (this.updateMode === 'drive') {
            console.log(`Carpeta de Google Drive: ${this.googleDriveUrl}`);
        }
    },

    // Programar verificación de actualizaciones
    scheduleUpdateCheck() {
        // Verificar si es necesario comprobar actualizaciones
        const lastCheck = localStorage.getItem('lastUpdateCheck');
        const now = Date.now();

        if (!lastCheck || (now - parseInt(lastCheck)) > this.checkInterval) {
            console.log('Verificando actualizaciones en línea...');
            this.checkForUpdates();
            localStorage.setItem('lastUpdateCheck', now.toString());
        }

        // Programar próxima verificación
        setTimeout(() => {
            this.scheduleUpdateCheck();
        }, this.checkInterval);
    },

    // Verificar actualizaciones en línea
    async checkForUpdates(silentCheck = false) {
        try {
            console.log('Verificando actualizaciones...');

            // Verificar según el modo configurado
            if (this.updateMode === 'drive') {
                await this.checkForDriveUpdates(silentCheck);
            } else {
                await this.checkForOnlineUpdates(silentCheck);
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones:', error);
        }
    },

    // Verificar actualizaciones en línea (servidor)
    async checkForOnlineUpdates(silentCheck = false) {
        try {
            console.log('Verificando actualizaciones en línea (servidor)...');
            console.log(`URL del servidor: ${this.updateServerUrl}`);

            // Intentar conectar con el servidor de actualizaciones
            try {
                // Verificar si hay conexión a internet
                const testConnection = await fetch('https://www.google.com', {
                    mode: 'no-cors',
                    cache: 'no-cache',
                    timeout: 5000
                });

                console.log('Conexión a internet disponible para actualizaciones');

                // En un entorno real, aquí haríamos una llamada al servidor
                // Por ahora, simularemos una verificación de actualización

                // Simular una actualización disponible (solo para demostración)
                const simulateUpdate = false; // Cambiar a true para simular una actualización

                if (simulateUpdate) {
                    const newVersion = '2.1.0';
                    const changes = [
                        'Mejoras en el rendimiento',
                        'Corrección de errores',
                        'Nuevas funcionalidades'
                    ];

                    console.log(`Actualización encontrada: versión ${newVersion}`);

                    // Mostrar punto rojo en el botón de actualización (sin importar si es silenciosa o no)
                    this.showUpdateAvailableNotification(newVersion, changes);
                } else {
                    console.log('No se encontraron actualizaciones en línea');

                    // Quitar el punto rojo si no hay actualizaciones
                    const updateButton = document.getElementById('load-update');
                    if (updateButton) {
                        updateButton.classList.remove('has-update');
                    }
                }
            } catch (connectionError) {
                console.warn('No se pudo conectar al servidor de actualizaciones:', connectionError);
                console.log('Verificación de actualizaciones en línea omitida por falta de conexión');
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones en línea:', error);
        }
    },

    // Verificar actualizaciones en Google Drive
    async checkForDriveUpdates(silentCheck = false) {
        try {
            console.log('Verificando actualizaciones en Google Drive...');
            console.log(`Carpeta de Google Drive: ${this.googleDriveUrl}`);

            // Intentar conectar con Google Drive
            try {
                // Verificar si hay conexión a internet
                const testConnection = await fetch('https://www.google.com', {
                    mode: 'no-cors',
                    cache: 'no-cache',
                    timeout: 5000
                });

                console.log('Conexión a internet disponible para actualizaciones desde Google Drive');

                // Simular una actualización disponible (solo para demostración)
                const simulateUpdate = false; // Cambiar a true para simular una actualización

                if (simulateUpdate) {
                    // Simular un archivo de actualización
                    const latestVersion = '2.1.0';
                    const latestFile = {
                        name: `update-${latestVersion}.json`,
                        downloadUrl: this.googleDriveUrl,
                        id: 'simulated-file-id'
                    };

                    const changes = [
                        'Mejoras en el rendimiento',
                        'Corrección de errores',
                        'Nuevas funcionalidades para Google Drive'
                    ];

                    console.log(`Actualización encontrada en Google Drive: versión ${latestVersion}`);

                    // Mostrar punto rojo en el botón de actualización (sin importar si es silenciosa o no)
                    this.showDriveUpdateNotification(latestVersion, changes, this.googleDriveUrl);
                } else {
                    console.log('No se encontraron actualizaciones en Google Drive');

                    // Quitar el punto rojo si no hay actualizaciones
                    const updateButton = document.getElementById('load-update');
                    if (updateButton) {
                        updateButton.classList.remove('has-update');
                    }
                }
            } catch (connectionError) {
                console.warn('No se pudo conectar a Google Drive:', connectionError);
                console.log('Verificación de actualizaciones en Google Drive omitida por falta de conexión');
            }
        } catch (error) {
            console.error('Error al verificar actualizaciones en Google Drive:', error);
        }
    },

    // Verificar si un archivo existe en Google Drive
    async checkFileExists(fileId) {
        try {
            console.log(`Verificando si el archivo con ID ${fileId} existe en Google Drive...`);

            // En un entorno real, aquí haríamos una llamada a la API de Google Drive
            // para verificar si el archivo existe

            // Simulación: verificar si el archivo existe
            const exists = false; // Cambiar a true para simular que el archivo existe

            console.log(`El archivo ${exists ? 'existe' : 'no existe'} en Google Drive`);
            return exists;
        } catch (error) {
            console.error('Error al verificar si el archivo existe:', error);
            return false;
        }
    },

    // Verificar si una versión es más reciente que otra
    isNewerVersion(newVersion, currentVersion) {
        const newParts = newVersion.split('.').map(Number);
        const currentParts = currentVersion.split('.').map(Number);

        for (let i = 0; i < newParts.length; i++) {
            if (newParts[i] > currentParts[i]) {
                return true;
            } else if (newParts[i] < currentParts[i]) {
                return false;
            }
        }

        return false; // Versiones iguales
    },

    // Configurar eventos
    setupEvents() {
        // Botón para cargar actualizaciones
        const updateBtn = document.getElementById('load-update');
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                this.showUpdateDialog();
            });
        }
    },

    // Mostrar notificación de actualización (ahora solo muestra un punto rojo)
    showUpdateNotification(oldVersion, newVersion) {
        console.log(`Sistema actualizado de la versión ${oldVersion} a la versión ${newVersion}`);
        // No mostrar notificación, solo registrar en la consola
    },

    // Mostrar notificación de actualización disponible (ahora solo muestra un punto rojo)
    showUpdateAvailableNotification(newVersion, changes = []) {
        console.log(`Actualización disponible: versión ${newVersion}`);
        if (changes && changes.length > 0) {
            console.log('Cambios en esta versión:');
            changes.forEach(change => console.log(`- ${change}`));
        }

        // Mostrar punto rojo en el botón de actualización
        const updateButton = document.getElementById('load-update');
        if (updateButton) {
            updateButton.classList.add('has-update');
        }
    },

    // Mostrar notificación de actualización disponible en Google Drive (ahora solo muestra un punto rojo)
    showDriveUpdateNotification(newVersion, changes = [], downloadUrl) {
        console.log(`Actualización disponible en Google Drive: versión ${newVersion}`);
        if (changes && changes.length > 0) {
            console.log('Cambios en esta versión:');
            changes.forEach(change => console.log(`- ${change}`));
        }

        // Mostrar punto rojo en el botón de actualización
        const updateButton = document.getElementById('load-update');
        if (updateButton) {
            updateButton.classList.add('has-update');
        }
    },

    // Descargar actualización desde Google Drive
    async downloadDriveUpdate(version, changes = [], downloadUrl) {
        try {
            console.log(`Descargando actualización desde Google Drive: versión ${version}...`);

            // Crear diálogo de descarga
            const dialog = document.createElement('div');
            dialog.className = 'update-dialog';
            dialog.innerHTML = `
                <div class="update-dialog-content">
                    <h3>Descargando Actualización</h3>
                    <p>Descargando actualización desde Google Drive...</p>
                    <div class="progress-container">
                        <div class="progress-bar" id="download-progress"></div>
                    </div>
                    <p id="download-status">Conectando con Google Drive...</p>
                </div>
            `;

            document.body.appendChild(dialog);

            // Simular progreso de descarga
            const progressBar = document.getElementById('download-progress');
            const statusText = document.getElementById('download-status');

            // Simular descarga
            for (let i = 0; i <= 100; i += 10) {
                progressBar.style.width = i + '%';

                if (i === 0) {
                    statusText.textContent = 'Conectando con Google Drive...';
                } else if (i === 30) {
                    statusText.textContent = 'Descargando archivo de actualización...';
                } else if (i === 60) {
                    statusText.textContent = 'Verificando integridad del archivo...';
                } else if (i === 90) {
                    statusText.textContent = 'Preparando para aplicar actualización...';
                } else if (i === 100) {
                    statusText.textContent = 'Descarga completada';
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Simular procesamiento del archivo
            statusText.textContent = 'Procesando archivo de actualización...';
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Cerrar diálogo de descarga
            dialog.remove();

            // Crear datos de actualización simulados
            const updateData = {
                version: version,
                changes: changes,
                data: {},
                files: {}
            };

            // Simular archivos del proyecto
            updateData.files = {
                'js/app.js': {
                    type: 'js',
                    content: '// Contenido actualizado de app.js',
                    lastModified: new Date().toISOString()
                },
                'css/styles.css': {
                    type: 'css',
                    content: '/* Contenido actualizado de styles.css */',
                    lastModified: new Date().toISOString()
                }
            };

            // Aplicar actualización
            await this.applyUpdate(updateData);

            return true;
        } catch (error) {
            console.error('Error al descargar actualización desde Google Drive:', error);
            alert('Error al descargar la actualización: ' + error.message);
            return false;
        }
    },

    // Descargar actualización en línea
    async downloadUpdate(version, changes = []) {
        try {
            // Mostrar diálogo de descarga
            const dialog = document.createElement('div');
            dialog.className = 'update-dialog';
            dialog.innerHTML = `
                <div class="update-dialog-content">
                    <div class="update-dialog-header">
                        <h3>Descargando Actualización</h3>
                        <p class="update-subtitle">Versión ${version}</p>
                    </div>

                    <div class="update-section">
                        <div class="update-section-header">
                            <i class="fas fa-download update-icon"></i>
                            <div>
                                <h4>Descarga en progreso</h4>
                                <p>Por favor espere mientras se descarga la actualización</p>
                            </div>
                        </div>

                        <div class="download-progress-container">
                            <div class="download-progress-info">
                                <span id="download-percentage">0%</span>
                                <span id="download-speed">0 KB/s</span>
                            </div>
                            <div class="progress-container">
                                <div class="progress-bar">
                                    <div class="progress" id="download-progress" style="width: 0%;"></div>
                                </div>
                            </div>
                            <div class="download-progress-details">
                                <span id="download-size">0 KB / 0 KB</span>
                                <span id="download-time">Calculando tiempo restante...</span>
                            </div>
                        </div>

                        <div id="update-status" class="mt-3"></div>
                    </div>
                </div>
            `;

            document.body.appendChild(dialog);

            // En un entorno real, esto sería una petición a un servidor
            // Por ahora, simularemos la descarga

            // Simular progreso de descarga
            let progress = 0;
            const progressBar = document.getElementById('download-progress');
            const percentageEl = document.getElementById('download-percentage');
            const speedEl = document.getElementById('download-speed');
            const sizeEl = document.getElementById('download-size');
            const timeEl = document.getElementById('download-time');

            // Tamaño total simulado (en KB)
            const totalSize = 15360; // 15 MB
            let downloadedSize = 0;

            const progressInterval = setInterval(() => {
                // Incremento aleatorio entre 1 y 5
                const increment = Math.floor(Math.random() * 5) + 1;
                progress += increment;

                if (progress > 100) progress = 100;

                // Actualizar barra de progreso
                progressBar.style.width = `${progress}%`;
                percentageEl.textContent = `${progress}%`;

                // Calcular tamaño descargado
                downloadedSize = Math.floor((progress / 100) * totalSize);

                // Velocidad simulada (entre 100 y 500 KB/s)
                const speed = Math.floor(Math.random() * 400) + 100;
                speedEl.textContent = `${speed} KB/s`;

                // Actualizar tamaño
                sizeEl.textContent = `${downloadedSize} KB / ${totalSize} KB`;

                // Tiempo restante
                const remainingSize = totalSize - downloadedSize;
                const remainingTime = Math.ceil(remainingSize / speed);

                if (remainingTime > 60) {
                    const minutes = Math.floor(remainingTime / 60);
                    const seconds = remainingTime % 60;
                    timeEl.textContent = `${minutes} min ${seconds} seg restantes`;
                } else {
                    timeEl.textContent = `${remainingTime} segundos restantes`;
                }

                if (progress >= 100) {
                    clearInterval(progressInterval);

                    // Actualizar información final
                    speedEl.textContent = `0 KB/s`;
                    timeEl.textContent = `Descarga completada`;

                    // Simular finalización de descarga
                    setTimeout(() => {
                        this.showUpdateStatus('success', 'Descarga completada. Aplicando actualización...');

                        // Simular aplicación de actualización
                        setTimeout(() => {
                            // Crear datos de actualización
                            const updateData = {
                                version: version,
                                changes: changes.length > 0 ? changes : [
                                    'Mejoras de rendimiento en el sistema',
                                    'Corrección de errores en la visualización de gráficas',
                                    'Optimización de la base de datos local',
                                    'Nuevas funcionalidades en el módulo de objetivos',
                                    'Mejoras en la interfaz de usuario'
                                ],
                                data: {}
                            };

                            this.applyUpdate(updateData, dialog);
                        }, 1500);
                    }, 500);
                }
            }, 200);

            // En un entorno real, sería algo como:
            /*
            const response = await fetch(`${this.updateServerUrl}/download?version=${version}`);
            const updateData = await response.json();
            this.applyUpdate(updateData, dialog);
            */
        } catch (error) {
            console.error('Error al descargar actualización:', error);
            this.showUpdateStatus('error', 'Error al descargar la actualización: ' + error.message);
        }
    },

    // Mostrar diálogo para cargar actualizaciones
    showUpdateDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'update-dialog';
        dialog.innerHTML = `
            <div class="update-dialog-content">
                <div class="update-dialog-header">
                    <h3>Actualización del Sistema</h3>
                    <p class="update-subtitle">Gestione las actualizaciones de su sistema</p>
                </div>

                <div class="update-tabs">
                    <button class="update-tab-btn active" id="manual-update-tab">
                        <i class="fas fa-file-upload"></i> Actualización Manual
                    </button>
                    <button class="update-tab-btn" id="online-update-tab">
                        <i class="fas fa-globe"></i> Actualización en Línea
                    </button>
                </div>

                <div class="update-tab-content" id="manual-update-content">
                    <div class="update-section">
                        <div class="update-section-header">
                            <i class="fas fa-file-upload update-icon"></i>
                            <div>
                                <h4>Cargar archivo de actualización</h4>
                                <p>Seleccione un archivo JSON con la actualización del sistema</p>
                            </div>
                        </div>

                        <div class="file-upload-container">
                            <label for="update-file" class="file-upload-label">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <span>Seleccionar archivo</span>
                            </label>
                            <input type="file" id="update-file" accept=".json" class="file-upload-input">
                            <div id="file-name" class="file-name">Ningún archivo seleccionado</div>
                        </div>

                        <div class="update-actions">
                            <button class="btn btn-secondary" id="cancel-update">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button class="btn btn-primary" id="apply-update">
                                <i class="fas fa-check"></i> Aplicar Actualización
                            </button>
                        </div>
                    </div>
                </div>

                <div class="update-tab-content" id="online-update-content" style="display: none;">
                    <div class="update-section">
                        <div class="update-section-header">
                            <i class="fas fa-cog update-icon"></i>
                            <div>
                                <h4>Configuración de actualizaciones</h4>
                                <p>Elija cómo desea recibir las actualizaciones del sistema</p>
                            </div>
                        </div>

                        <div class="update-options">
                            <div class="update-option">
                                <label class="update-option-label">
                                    <input type="radio" name="update-mode" value="manual" ${this.updateMode === 'manual' ? 'checked' : ''}>
                                    <div class="update-option-content">
                                        <div class="update-option-icon">
                                            <i class="fas fa-user-clock"></i>
                                        </div>
                                        <div class="update-option-info">
                                            <h5>Modo manual</h5>
                                            <p>Verificar y aplicar actualizaciones manualmente</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <div class="update-option">
                                <label class="update-option-label">
                                    <input type="radio" name="update-mode" value="online" ${this.updateMode === 'online' ? 'checked' : ''}>
                                    <div class="update-option-content">
                                        <div class="update-option-icon">
                                            <i class="fas fa-sync-alt"></i>
                                        </div>
                                        <div class="update-option-info">
                                            <h5>Modo en línea</h5>
                                            <p>Verificar automáticamente y notificar cuando haya actualizaciones</p>
                                        </div>
                                    </div>
                                </label>
                            </div>

                            <div class="update-option">
                                <label class="update-option-label">
                                    <input type="radio" name="update-mode" value="drive" ${this.updateMode === 'drive' ? 'checked' : ''}>
                                    <div class="update-option-content">
                                        <div class="update-option-icon">
                                            <i class="fab fa-google-drive"></i>
                                        </div>
                                        <div class="update-option-info">
                                            <h5>Google Drive</h5>
                                            <p>Verificar actualizaciones desde una carpeta compartida en Google Drive</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div id="drive-config" class="update-section" style="display: ${this.updateMode === 'drive' ? 'block' : 'none'}">
                            <div class="update-section-header">
                                <i class="fab fa-google-drive update-icon"></i>
                                <div>
                                    <h4>Configuración de Google Drive</h4>
                                    <p>Configure la carpeta de Google Drive donde se alojan las actualizaciones</p>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="drive-folder-id">ID de la carpeta de Google Drive</label>
                                <input type="text" id="drive-folder-id" value="${this.googleDriveFolderId}" placeholder="Ej: 1a2b3c4d5e6f7g8h9i0j">
                                <p class="form-help">
                                    <small>El ID de la carpeta se encuentra en la URL de Google Drive: https://drive.google.com/drive/folders/<strong>ID-DE-LA-CARPETA</strong></small>
                                </p>
                            </div>
                        </div>

                        <div class="update-actions">
                            <button class="btn btn-secondary" id="cancel-update-config">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button class="btn btn-primary" id="save-update-config">
                                <i class="fas fa-save"></i> Guardar Configuración
                            </button>
                            <button class="btn btn-info" id="check-updates-now">
                                <i class="fas fa-sync"></i> Verificar Ahora
                            </button>
                        </div>
                    </div>
                </div>

                <div id="update-status" class="mt-3"></div>
            </div>
        `;

        document.body.appendChild(dialog);

        // Configurar pestañas
        document.getElementById('manual-update-tab').addEventListener('click', () => {
            document.getElementById('manual-update-tab').classList.add('active');
            document.getElementById('online-update-tab').classList.remove('active');
            document.getElementById('manual-update-content').style.display = 'block';
            document.getElementById('online-update-content').style.display = 'none';
        });

        document.getElementById('online-update-tab').addEventListener('click', () => {
            document.getElementById('manual-update-tab').classList.remove('active');
            document.getElementById('online-update-tab').classList.add('active');
            document.getElementById('manual-update-content').style.display = 'none';
            document.getElementById('online-update-content').style.display = 'block';
        });

        // Mostrar nombre del archivo seleccionado
        document.getElementById('update-file').addEventListener('change', (event) => {
            const fileInput = event.target;
            const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : 'Ningún archivo seleccionado';
            document.getElementById('file-name').textContent = fileName;

            if (fileInput.files.length > 0) {
                document.getElementById('file-name').classList.add('file-selected');
            } else {
                document.getElementById('file-name').classList.remove('file-selected');
            }
        });

        // Configurar botones de actualización manual
        document.getElementById('cancel-update').addEventListener('click', () => {
            dialog.remove();
        });

        document.getElementById('apply-update').addEventListener('click', () => {
            const fileInput = document.getElementById('update-file');
            const file = fileInput.files[0];

            if (!file) {
                this.showUpdateStatus('error', 'Por favor seleccione un archivo de actualización.');
                return;
            }

            this.processUpdateFile(file, dialog);
        });

        // Configurar botones de actualización en línea
        document.getElementById('cancel-update-config').addEventListener('click', () => {
            dialog.remove();
        });

        // Mostrar/ocultar configuración de Google Drive cuando cambia el modo
        const updateModeRadios = document.querySelectorAll('input[name="update-mode"]');
        updateModeRadios.forEach(radio => {
            radio.addEventListener('change', () => {
                const driveConfig = document.getElementById('drive-config');
                if (radio.value === 'drive') {
                    driveConfig.style.display = 'block';
                } else {
                    driveConfig.style.display = 'none';
                }
            });
        });

        document.getElementById('save-update-config').addEventListener('click', () => {
            const mode = document.querySelector('input[name="update-mode"]:checked').value;
            this.updateMode = mode;
            localStorage.setItem('updateMode', mode);

            // Si el modo es Google Drive, guardar la configuración de la carpeta
            if (mode === 'drive') {
                const folderId = document.getElementById('drive-folder-id').value.trim();
                if (folderId) {
                    this.googleDriveFolderId = folderId;
                    localStorage.setItem('googleDriveFolderId', folderId);

                    // Actualizar URL de Google Drive
                    this.googleDriveUrl = `https://drive.google.com/drive/folders/${folderId}`;
                    localStorage.setItem('googleDriveUrl', this.googleDriveUrl);
                }
            }

            this.showUpdateStatus('success', `Configuración guardada. Modo de actualización: ${mode}`);

            // Si se cambió a modo en línea o drive, iniciar verificación
            if (mode === 'online' || mode === 'drive') {
                this.scheduleUpdateCheck();
            }
        });

        document.getElementById('check-updates-now').addEventListener('click', () => {
            console.log('Verificando actualizaciones...');

            // Verificar actualizaciones según el modo configurado
            setTimeout(async () => {
                try {
                    if (this.updateMode === 'drive') {
                        // Verificar actualizaciones en Google Drive directamente
                        await this.checkForDriveUpdates(false);
                    } else {
                        // Verificar actualizaciones en línea directamente
                        await this.checkForOnlineUpdates(false);
                    }
                } catch (error) {
                    console.error('Error al verificar actualizaciones:', error);
                }
            }, 1000);
        });
    },

    // Procesar archivo de actualización
    processUpdateFile(file, dialog) {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
                const updateData = JSON.parse(event.target.result);
                this.applyUpdate(updateData, dialog);
            } catch (error) {
                console.error('Error al procesar archivo de actualización:', error);
                this.showUpdateStatus('error', 'El archivo no es válido. Debe ser un archivo JSON con el formato correcto.');
            }
        };

        reader.onerror = () => {
            this.showUpdateStatus('error', 'Error al leer el archivo.');
        };

        reader.readAsText(file);
    },

    // Aplicar actualización
    async applyUpdate(updateData, dialog) {
        try {
            // Verificar formato del archivo
            if (!updateData.version || !updateData.changes || !updateData.data) {
                this.showUpdateStatus('error', 'El archivo de actualización no tiene el formato correcto.');
                return;
            }

            // Verificar versión
            if (updateData.version <= this.currentVersion) {
                this.showUpdateStatus('error', `La versión del archivo (${updateData.version}) es igual o anterior a la versión actual (${this.currentVersion}).`);
                return;
            }

            this.showUpdateStatus('info', 'Aplicando actualización...');

            // Aplicar cambios en la base de datos
            if (updateData.data) {
                await this.applyDatabaseChanges(updateData.data);
            }

            // Aplicar cambios en los archivos del proyecto
            if (updateData.files) {
                await this.applyFileChanges(updateData.files);
            }

            // Actualizar versión
            const oldVersion = this.currentVersion;
            this.currentVersion = updateData.version;
            localStorage.setItem('appVersion', this.currentVersion);

            this.showUpdateStatus('success', `Actualización aplicada correctamente. Versión actual: ${this.currentVersion}`);

            // Mostrar cambios
            let changesHtml = '<h4>Cambios en esta versión:</h4><ul>';
            updateData.changes.forEach(change => {
                changesHtml += `<li>${change}</li>`;
            });
            changesHtml += '</ul>';

            document.getElementById('update-status').innerHTML += changesHtml;

            // Mostrar resumen de archivos actualizados
            if (updateData.files) {
                const filesCount = Object.keys(updateData.files).length;
                if (filesCount > 0) {
                    let filesHtml = `<h4>Archivos actualizados (${filesCount}):</h4><ul>`;
                    Object.keys(updateData.files).forEach(filePath => {
                        filesHtml += `<li>${filePath}</li>`;
                    });
                    filesHtml += '</ul>';
                    document.getElementById('update-status').innerHTML += filesHtml;
                }
            }

            // Agregar botón para recargar
            const reloadBtn = document.createElement('button');
            reloadBtn.className = 'btn btn-primary mt-3';
            reloadBtn.textContent = 'Recargar Aplicación';
            reloadBtn.addEventListener('click', () => {
                window.location.reload();
            });

            document.getElementById('update-status').appendChild(reloadBtn);

        } catch (error) {
            console.error('Error al aplicar actualización:', error);
            this.showUpdateStatus('error', 'Error al aplicar la actualización: ' + error.message);
        }
    },

    // Aplicar cambios en los archivos del proyecto
    async applyFileChanges(files) {
        try {
            console.log('Aplicando cambios en archivos del proyecto...');

            // En un entorno real, aquí escribiríamos los archivos en el sistema de archivos
            // Como estamos en un navegador, simularemos esto

            const fileCount = Object.keys(files).length;
            console.log(`Actualizando ${fileCount} archivos...`);

            // Simular la escritura de archivos
            // En un entorno real, esto sería una llamada al sistema de archivos
            for (const [path, fileData] of Object.entries(files)) {
                console.log(`Actualizando archivo: ${path}`);

                // En un entorno real, aquí escribiríamos el archivo
                // localStorage.setItem(`file_${path}`, fileData.content);
            }

            console.log('Archivos actualizados correctamente');
            return true;
        } catch (error) {
            console.error('Error al aplicar cambios en archivos:', error);
            throw error;
        }
    },

    // Aplicar cambios en la base de datos
    async applyDatabaseChanges(data) {
        // Incrementar versión de la base de datos
        DB.version += 1;

        // Aplicar cambios en objetivos de monto
        if (data.objetivos_monto) {
            for (const objetivo of data.objetivos_monto) {
                await DB.saveObjetivoMonto(objetivo);
            }
        }

        // Aplicar cambios en objetivos de unidades
        if (data.objetivos_unidades) {
            for (const objetivo of data.objetivos_unidades) {
                await DB.saveObjetivoUnidades(objetivo);
            }
        }

        // Aplicar cambios en créditos
        if (data.creditos) {
            for (const credito of data.creditos) {
                await DB.saveCredito(credito);
            }
        }

        // Aplicar cambios en usuarios
        if (data.usuarios) {
            for (const usuario of data.usuarios) {
                await DB.saveUsuario(usuario);
            }
        }

        return true;
    },

    // Mostrar estado de la actualización (ahora solo registra en la consola)
    showUpdateStatus(type, message) {
        console.log(`[${type}] ${message}`);
        // No mostrar mensajes en la interfaz, solo registrar en la consola
    },

    // Generar archivo de actualización
    async generateUpdateFile(newVersion, changes, includeFiles = true) {
        try {
            console.log(`Generando archivo de actualización para versión ${newVersion}...`);

            // Obtener datos actuales
            const objetivos_monto = await DB.getAllObjetivosMonto();
            const objetivos_unidades = await DB.getAllObjetivosUnidades();
            const creditos = await DB.getAllCreditos();
            const usuarios = await DB.getAllUsuarios();

            // Crear objeto de actualización
            const updateData = {
                version: newVersion,
                changes: changes,
                timestamp: new Date().toISOString(),
                data: {
                    objetivos_monto,
                    objetivos_unidades,
                    creditos,
                    usuarios
                }
            };

            // Incluir archivos del proyecto si se solicita
            if (includeFiles) {
                updateData.files = await this.collectProjectFiles();
            }

            // Convertir a JSON
            const jsonData = JSON.stringify(updateData, null, 2);

            // Crear blob y descargar
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `update-${newVersion}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);

            console.log(`Archivo de actualización generado: update-${newVersion}.json`);
            return true;
        } catch (error) {
            console.error('Error al generar archivo de actualización:', error);
            return false;
        }
    },

    // Recopilar archivos del proyecto
    async collectProjectFiles() {
        try {
            console.log('Recopilando archivos del proyecto...');

            // Lista de archivos a incluir en la actualización
            const filesToInclude = [
                // Archivos JavaScript
                { path: 'js/app.js', type: 'js' },
                { path: 'js/auth.js', type: 'js' },
                { path: 'js/db.js', type: 'js' },
                { path: 'js/objetivos-monto.js', type: 'js' },
                { path: 'js/objetivos-unidades.js', type: 'js' },
                { path: 'js/creditos.js', type: 'js' },
                { path: 'js/dashboard.js', type: 'js' },
                { path: 'js/admin.js', type: 'js' },
                { path: 'js/updater.js', type: 'js' },
                { path: 'js/contact.js', type: 'js' },

                // Archivos CSS
                { path: 'css/styles.css', type: 'css' },

                // Archivos HTML
                { path: 'index.html', type: 'html' }
            ];

            // En un entorno real, aquí leeríamos los archivos del sistema de archivos
            // Como estamos en un navegador, simularemos esto con una estructura de datos

            // Objeto para almacenar el contenido de los archivos
            const files = {};

            // En un entorno real, aquí leeríamos los archivos
            // Para esta demostración, usaremos una simulación
            for (const file of filesToInclude) {
                // Simular la lectura del archivo
                // En un entorno real, esto sería una llamada al sistema de archivos
                files[file.path] = {
                    type: file.type,
                    content: `// Contenido simulado del archivo ${file.path}`,
                    lastModified: new Date().toISOString()
                };
            }

            console.log(`Se recopilaron ${Object.keys(files).length} archivos`);
            return files;
        } catch (error) {
            console.error('Error al recopilar archivos del proyecto:', error);
            throw error;
        }
    }
};

// Agregar métodos a DB para obtener todos los datos
DB.getAllObjetivosMonto = async function() {
    return new Promise((resolve, reject) => {
        try {
            const transaction = this.db.transaction(['objetivos_monto'], 'readonly');
            const store = transaction.objectStore('objetivos_monto');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};

DB.getAllObjetivosUnidades = async function() {
    return new Promise((resolve, reject) => {
        try {
            const transaction = this.db.transaction(['objetivos_unidades'], 'readonly');
            const store = transaction.objectStore('objetivos_unidades');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};

DB.getAllCreditos = async function() {
    return new Promise((resolve, reject) => {
        try {
            const transaction = this.db.transaction(['creditos'], 'readonly');
            const store = transaction.objectStore('creditos');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        } catch (error) {
            reject(error);
        }
    });
};
