/**
 * Módulo para gestionar respaldos de licencias
 * Proporciona funciones para importar y exportar licencias
 */
const LicenseBackup = {
    // Inicializar el módulo
    init() {
        console.log('Inicializando módulo de respaldo de licencias...');
        this.setupEventListeners();
    },
    
    // Configurar listeners de eventos
    setupEventListeners() {
        // Botón de exportar licencias
        const exportBtn = document.getElementById('export-licenses-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportLicenses();
            });
        }
        
        // Botón de importar licencias
        const importBtn = document.getElementById('import-licenses-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => {
                document.getElementById('import-licenses-file').click();
            });
        }
        
        // Input de archivo para importar licencias
        const importFileInput = document.getElementById('import-licenses-file');
        if (importFileInput) {
            importFileInput.addEventListener('change', (e) => {
                this.handleImportFile(e.target.files[0]);
            });
        }
    },
    
    // Exportar licencias
    exportLicenses() {
        try {
            // Verificar si está disponible el módulo de almacenamiento
            if (!window.LicenseStorage) {
                this.showMessage('error', 'El módulo de almacenamiento de licencias no está disponible.');
                return;
            }
            
            // Exportar licencias
            const success = LicenseStorage.exportLicenses();
            
            if (success) {
                this.showMessage('success', 'Licencias exportadas correctamente.');
            } else {
                this.showMessage('error', 'Error al exportar licencias.');
            }
        } catch (error) {
            console.error('Error al exportar licencias:', error);
            this.showMessage('error', 'Error al exportar licencias: ' + error.message);
        }
    },
    
    // Manejar archivo de importación
    handleImportFile(file) {
        if (!file) {
            return;
        }
        
        // Verificar tipo de archivo
        if (file.type !== 'application/json') {
            this.showMessage('error', 'El archivo debe ser de tipo JSON.');
            return;
        }
        
        // Leer archivo
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const jsonData = e.target.result;
                
                // Mostrar diálogo de confirmación
                this.showImportConfirmation(jsonData);
            } catch (error) {
                console.error('Error al leer archivo:', error);
                this.showMessage('error', 'Error al leer archivo: ' + error.message);
            }
        };
        
        reader.onerror = () => {
            this.showMessage('error', 'Error al leer el archivo.');
        };
        
        reader.readAsText(file);
    },
    
    // Mostrar diálogo de confirmación para importar
    showImportConfirmation(jsonData) {
        try {
            // Parsear datos para verificar
            const importedData = JSON.parse(jsonData);
            
            // Verificar formato
            if (!importedData.licenses) {
                throw new Error('Formato de archivo inválido');
            }
            
            // Contar licencias
            const licenseCount = Object.keys(importedData.licenses).length;
            
            // Crear modal para confirmación
            const modal = document.createElement('div');
            modal.className = 'modal fade';
            modal.id = 'importConfirmationModal';
            modal.setAttribute('tabindex', '-1');
            modal.setAttribute('aria-labelledby', 'importConfirmationModalLabel');
            modal.setAttribute('aria-hidden', 'true');
            
            modal.innerHTML = `
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="importConfirmationModalLabel">Confirmar Importación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p>Se encontraron <strong>${licenseCount}</strong> licencias en el archivo.</p>
                            <p>¿Cómo desea importar estas licencias?</p>
                            
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="radio" name="importMode" id="importModeMerge" value="merge" checked>
                                <label class="form-check-label" for="importModeMerge">
                                    <strong>Combinar</strong>: Añadir las licencias nuevas y actualizar las existentes
                                </label>
                            </div>
                            
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="importMode" id="importModeReplace" value="replace">
                                <label class="form-check-label" for="importModeReplace">
                                    <strong>Reemplazar</strong>: Eliminar todas las licencias actuales y usar solo las importadas
                                </label>
                            </div>
                            
                            <div class="alert alert-warning mt-3">
                                <i class="fas fa-exclamation-triangle"></i> 
                                Si elige "Reemplazar", todas las licencias actuales se perderán.
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" id="confirmImportBtn">Importar</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Mostrar modal
            const modalInstance = new bootstrap.Modal(modal);
            modalInstance.show();
            
            // Configurar botón de confirmación
            const confirmBtn = document.getElementById('confirmImportBtn');
            if (confirmBtn) {
                confirmBtn.addEventListener('click', () => {
                    // Obtener modo de importación
                    const mergeMode = document.getElementById('importModeMerge').checked;
                    
                    // Importar licencias
                    this.importLicenses(jsonData, mergeMode);
                    
                    // Cerrar modal
                    modalInstance.hide();
                });
            }
            
            // Eliminar modal del DOM cuando se cierre
            modal.addEventListener('hidden.bs.modal', () => {
                document.body.removeChild(modal);
            });
        } catch (error) {
            console.error('Error al mostrar confirmación de importación:', error);
            this.showMessage('error', 'Error al procesar archivo: ' + error.message);
        }
    },
    
    // Importar licencias
    importLicenses(jsonData, merge = true) {
        try {
            // Verificar si está disponible el módulo de almacenamiento
            if (!window.LicenseStorage) {
                this.showMessage('error', 'El módulo de almacenamiento de licencias no está disponible.');
                return;
            }
            
            // Importar licencias
            const success = LicenseStorage.importLicenses(jsonData, merge);
            
            if (success) {
                this.showMessage('success', 'Licencias importadas correctamente.');
                
                // Recargar lista de licencias
                if (typeof loadLicensesList === 'function') {
                    loadLicensesList();
                }
            } else {
                this.showMessage('error', 'Error al importar licencias.');
            }
        } catch (error) {
            console.error('Error al importar licencias:', error);
            this.showMessage('error', 'Error al importar licencias: ' + error.message);
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

// Inicializar módulo cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    LicenseBackup.init();
});
