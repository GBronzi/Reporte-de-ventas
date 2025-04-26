/**
 * Módulo de almacenamiento de licencias
 * Proporciona funciones para almacenar, recuperar y gestionar licencias
 * de forma segura y con capacidad de respaldo.
 */
const LicenseStorage = {
    // Clave para el almacenamiento encriptado
    storageKey: 'secureGeneratedLicenses',
    
    // Clave de encriptación (debe ser la misma que en security.js)
    encryptionKey: (function() {
        const parts = ['Sistema', 'Objetivos', '2023', 'Secure', 'Key', 'Mauricio', 'Bronzi'];
        return parts.join('') + '_' + btoa('g.bronzi91@gmail.com');
    })(),
    
    // Inicializar el almacenamiento
    init() {
        console.log('Inicializando almacenamiento de licencias...');
        
        // Migrar datos antiguos si existen
        this.migrateOldData();
        
        // Verificar integridad del almacenamiento
        this.verifyStorageIntegrity();
        
        console.log('Almacenamiento de licencias inicializado correctamente');
    },
    
    // Migrar datos antiguos al nuevo formato
    migrateOldData() {
        try {
            // Verificar si existen datos antiguos
            const oldData = localStorage.getItem('generatedLicenses');
            
            if (oldData && !localStorage.getItem(this.storageKey)) {
                console.log('Migrando datos antiguos al nuevo formato...');
                
                // Parsear datos antiguos
                const licenses = JSON.parse(oldData);
                
                // Guardar en el nuevo formato
                this.saveLicenses(licenses);
                
                // Crear respaldo de los datos antiguos
                localStorage.setItem('generatedLicenses_backup', oldData);
                
                console.log('Migración completada correctamente');
            }
        } catch (error) {
            console.error('Error al migrar datos antiguos:', error);
        }
    },
    
    // Verificar integridad del almacenamiento
    verifyStorageIntegrity() {
        try {
            // Intentar cargar licencias
            const licenses = this.getLicenses();
            
            // Si no hay licencias, inicializar con un objeto vacío
            if (!licenses) {
                this.saveLicenses({});
            }
            
            // Verificar si hay respaldo y no hay datos principales
            const backupData = localStorage.getItem(this.storageKey + '_backup');
            if (backupData && Object.keys(licenses || {}).length === 0) {
                console.log('Restaurando datos desde respaldo...');
                
                try {
                    // Desencriptar respaldo
                    const decryptedBackup = this.decrypt(backupData);
                    
                    if (decryptedBackup) {
                        // Parsear respaldo
                        const backupLicenses = JSON.parse(decryptedBackup);
                        
                        // Restaurar desde respaldo
                        this.saveLicenses(backupLicenses);
                        
                        console.log('Restauración desde respaldo completada');
                    }
                } catch (backupError) {
                    console.error('Error al restaurar desde respaldo:', backupError);
                }
            }
        } catch (error) {
            console.error('Error al verificar integridad del almacenamiento:', error);
        }
    },
    
    // Obtener todas las licencias
    getLicenses() {
        try {
            // Obtener datos encriptados
            const encryptedData = localStorage.getItem(this.storageKey);
            
            if (!encryptedData) {
                return {};
            }
            
            // Desencriptar datos
            const decryptedData = this.decrypt(encryptedData);
            
            if (!decryptedData) {
                return {};
            }
            
            // Parsear datos
            return JSON.parse(decryptedData);
        } catch (error) {
            console.error('Error al obtener licencias:', error);
            
            // Intentar cargar desde respaldo
            return this.loadFromBackup() || {};
        }
    },
    
    // Guardar todas las licencias
    saveLicenses(licenses) {
        try {
            // Convertir a JSON
            const jsonData = JSON.stringify(licenses);
            
            // Encriptar datos
            const encryptedData = this.encrypt(jsonData);
            
            // Guardar datos encriptados
            localStorage.setItem(this.storageKey, encryptedData);
            
            // Crear respaldo automático
            this.createBackup(encryptedData);
            
            return true;
        } catch (error) {
            console.error('Error al guardar licencias:', error);
            return false;
        }
    },
    
    // Obtener una licencia específica
    getLicense(licenseKey) {
        try {
            // Obtener todas las licencias
            const licenses = this.getLicenses();
            
            // Devolver la licencia específica
            return licenses[licenseKey];
        } catch (error) {
            console.error('Error al obtener licencia:', error);
            return null;
        }
    },
    
    // Guardar una licencia
    saveLicense(licenseKey, licenseData) {
        try {
            // Obtener todas las licencias
            const licenses = this.getLicenses();
            
            // Agregar o actualizar la licencia
            licenses[licenseKey] = licenseData;
            
            // Guardar todas las licencias
            return this.saveLicenses(licenses);
        } catch (error) {
            console.error('Error al guardar licencia:', error);
            return false;
        }
    },
    
    // Eliminar una licencia
    deleteLicense(licenseKey) {
        try {
            // Obtener todas las licencias
            const licenses = this.getLicenses();
            
            // Verificar si existe la licencia
            if (!licenses[licenseKey]) {
                return false;
            }
            
            // Eliminar la licencia
            delete licenses[licenseKey];
            
            // Guardar todas las licencias
            return this.saveLicenses(licenses);
        } catch (error) {
            console.error('Error al eliminar licencia:', error);
            return false;
        }
    },
    
    // Crear respaldo automático
    createBackup(encryptedData) {
        try {
            // Guardar respaldo
            localStorage.setItem(this.storageKey + '_backup', encryptedData);
            
            // Guardar fecha del respaldo
            localStorage.setItem(this.storageKey + '_backup_date', new Date().toISOString());
            
            return true;
        } catch (error) {
            console.error('Error al crear respaldo:', error);
            return false;
        }
    },
    
    // Cargar desde respaldo
    loadFromBackup() {
        try {
            // Obtener respaldo
            const backupData = localStorage.getItem(this.storageKey + '_backup');
            
            if (!backupData) {
                return null;
            }
            
            // Desencriptar respaldo
            const decryptedBackup = this.decrypt(backupData);
            
            if (!decryptedBackup) {
                return null;
            }
            
            // Parsear respaldo
            return JSON.parse(decryptedBackup);
        } catch (error) {
            console.error('Error al cargar desde respaldo:', error);
            return null;
        }
    },
    
    // Exportar todas las licencias a un archivo
    exportLicenses() {
        try {
            // Obtener todas las licencias
            const licenses = this.getLicenses();
            
            // Crear objeto para exportar
            const exportData = {
                licenses: licenses,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            // Convertir a JSON
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // Crear blob
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // Crear URL
            const url = URL.createObjectURL(blob);
            
            // Crear enlace de descarga
            const a = document.createElement('a');
            a.href = url;
            a.download = `licencias_exportadas_${new Date().toISOString().split('T')[0]}.json`;
            
            // Simular clic
            document.body.appendChild(a);
            a.click();
            
            // Limpiar
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 0);
            
            return true;
        } catch (error) {
            console.error('Error al exportar licencias:', error);
            return false;
        }
    },
    
    // Importar licencias desde un archivo
    importLicenses(jsonData, merge = true) {
        try {
            // Parsear datos
            const importedData = JSON.parse(jsonData);
            
            // Verificar formato
            if (!importedData.licenses) {
                throw new Error('Formato de archivo inválido');
            }
            
            // Obtener licencias importadas
            const importedLicenses = importedData.licenses;
            
            if (merge) {
                // Obtener licencias actuales
                const currentLicenses = this.getLicenses();
                
                // Combinar licencias
                const mergedLicenses = { ...currentLicenses, ...importedLicenses };
                
                // Guardar licencias combinadas
                return this.saveLicenses(mergedLicenses);
            } else {
                // Reemplazar todas las licencias
                return this.saveLicenses(importedLicenses);
            }
        } catch (error) {
            console.error('Error al importar licencias:', error);
            return false;
        }
    },
    
    // Encriptar datos
    encrypt(data) {
        try {
            // Si está disponible SimpleCrypto, usarlo
            if (window.SimpleCrypto) {
                return SimpleCrypto.encrypt(data, this.encryptionKey);
            }
            
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
    
    // Desencriptar datos
    decrypt(encryptedData) {
        try {
            // Si está disponible SimpleCrypto, usarlo
            if (window.SimpleCrypto) {
                return SimpleCrypto.decrypt(encryptedData, this.encryptionKey);
            }
            
            // Decodificar base64
            const base64Decoded = atob(encryptedData);
            
            // Desencriptar usando XOR con la clave
            let result = '';
            for (let i = 0; i < base64Decoded.length; i++) {
                const charCode = base64Decoded.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                result += String.fromCharCode(charCode);
            }
            
            return result;
        } catch (error) {
            console.error('Error al desencriptar datos:', error);
            return null;
        }
    },
    
    // Obtener estadísticas de licencias
    getLicenseStats() {
        try {
            // Obtener todas las licencias
            const licenses = this.getLicenses();
            const licenseKeys = Object.keys(licenses);
            
            // Inicializar estadísticas
            const stats = {
                total: licenseKeys.length,
                active: 0,
                expired: 0,
                activations: 0,
                maxActivations: 0,
                byMonth: {}
            };
            
            // Calcular estadísticas
            const currentDate = new Date();
            
            licenseKeys.forEach(key => {
                const license = licenses[key];
                
                // Contar activaciones
                const activationsCount = license.activations ? license.activations.length : 0;
                stats.activations += activationsCount;
                stats.maxActivations += license.maxInstallations || 0;
                
                // Verificar si está activa o expirada
                let isExpired = false;
                
                if (license.activations && license.activations.length > 0) {
                    const firstActivation = new Date(license.activations[0].activationDate);
                    const expirationDate = new Date(firstActivation.getTime() + (license.expirationDays || 365) * 24 * 60 * 60 * 1000);
                    
                    isExpired = currentDate > expirationDate;
                }
                
                if (isExpired) {
                    stats.expired++;
                } else {
                    stats.active++;
                }
                
                // Agrupar por mes de creación
                const creationDate = new Date(license.creationDate);
                const monthKey = `${creationDate.getFullYear()}-${(creationDate.getMonth() + 1).toString().padStart(2, '0')}`;
                
                if (!stats.byMonth[monthKey]) {
                    stats.byMonth[monthKey] = 0;
                }
                
                stats.byMonth[monthKey]++;
            });
            
            return stats;
        } catch (error) {
            console.error('Error al obtener estadísticas de licencias:', error);
            return null;
        }
    }
};

// Exponer el módulo globalmente
window.LicenseStorage = LicenseStorage;
