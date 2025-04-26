/**
 * Módulo de encriptación/desencriptación simple
 * Este módulo proporciona funciones básicas para encriptar y desencriptar datos
 * utilizando un algoritmo simple pero efectivo para proteger información sensible.
 */
const SimpleCrypto = {
    // Clave de encriptación predeterminada (puede ser cambiada)
    defaultKey: 'SistemaObjetivos2024',
    
    /**
     * Encripta una cadena de texto utilizando un algoritmo simple
     * @param {string} text - Texto a encriptar
     * @param {string} key - Clave de encriptación (opcional)
     * @returns {string} - Texto encriptado en formato Base64
     */
    encrypt(text, key = this.defaultKey) {
        try {
            // Si el texto no es una cadena, convertirlo a JSON
            if (typeof text !== 'string') {
                text = JSON.stringify(text);
            }
            
            // Encriptar utilizando XOR con la clave
            let result = '';
            for (let i = 0; i < text.length; i++) {
                const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            
            // Codificar en Base64 para mayor seguridad
            return btoa(result);
        } catch (error) {
            console.error('Error al encriptar datos:', error);
            return null;
        }
    },
    
    /**
     * Desencripta una cadena de texto encriptada
     * @param {string} encryptedText - Texto encriptado en formato Base64
     * @param {string} key - Clave de encriptación (opcional)
     * @returns {string} - Texto desencriptado
     */
    decrypt(encryptedText, key = this.defaultKey) {
        try {
            // Decodificar Base64
            const base64Decoded = atob(encryptedText);
            
            // Desencriptar utilizando XOR con la clave
            let result = '';
            for (let i = 0; i < base64Decoded.length; i++) {
                const charCode = base64Decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
            }
            
            return result;
        } catch (error) {
            console.error('Error al desencriptar datos:', error);
            return null;
        }
    },
    
    /**
     * Encripta un objeto y lo guarda en localStorage
     * @param {string} key - Clave para almacenar en localStorage
     * @param {any} data - Datos a encriptar y guardar
     * @returns {boolean} - true si se guardó correctamente, false en caso contrario
     */
    saveEncrypted(key, data) {
        try {
            // Convertir a JSON si no es una cadena
            const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
            
            // Encriptar datos
            const encryptedData = this.encrypt(jsonData);
            
            // Guardar en localStorage
            localStorage.setItem(key, encryptedData);
            
            // También guardar una versión no encriptada como respaldo (solo para desarrollo)
            localStorage.setItem(`${key}_plain`, jsonData);
            
            return true;
        } catch (error) {
            console.error(`Error al guardar datos encriptados para ${key}:`, error);
            
            // Intentar guardar sin encriptar como último recurso
            try {
                localStorage.setItem(`${key}_plain`, JSON.stringify(data));
            } catch (backupError) {
                console.error('Error al guardar respaldo:', backupError);
            }
            
            return false;
        }
    },
    
    /**
     * Recupera y desencripta datos de localStorage
     * @param {string} key - Clave para recuperar de localStorage
     * @param {boolean} parseJson - Si se debe analizar el resultado como JSON
     * @returns {any} - Datos desencriptados
     */
    loadEncrypted(key, parseJson = true) {
        try {
            // Obtener datos encriptados
            const encryptedData = localStorage.getItem(key);
            
            if (!encryptedData) {
                console.log(`No se encontraron datos encriptados para ${key}`);
                
                // Intentar cargar desde el respaldo no encriptado
                const plainData = localStorage.getItem(`${key}_plain`);
                if (plainData) {
                    console.log(`Cargando datos desde respaldo no encriptado para ${key}`);
                    return parseJson ? JSON.parse(plainData) : plainData;
                }
                
                return null;
            }
            
            // Desencriptar datos
            const decryptedData = this.decrypt(encryptedData);
            
            if (!decryptedData) {
                console.error(`Error al desencriptar datos para ${key}`);
                
                // Intentar cargar desde el respaldo no encriptado
                const plainData = localStorage.getItem(`${key}_plain`);
                if (plainData) {
                    console.log(`Cargando datos desde respaldo no encriptado para ${key}`);
                    return parseJson ? JSON.parse(plainData) : plainData;
                }
                
                return null;
            }
            
            // Parsear JSON si es necesario
            if (parseJson) {
                try {
                    return JSON.parse(decryptedData);
                } catch (parseError) {
                    console.error(`Error al parsear JSON para ${key}:`, parseError);
                    return decryptedData;
                }
            }
            
            return decryptedData;
        } catch (error) {
            console.error(`Error al cargar datos encriptados para ${key}:`, error);
            
            // Intentar cargar desde el respaldo no encriptado como último recurso
            try {
                const plainData = localStorage.getItem(`${key}_plain`);
                if (plainData) {
                    console.log(`Cargando datos desde respaldo no encriptado para ${key}`);
                    return parseJson ? JSON.parse(plainData) : plainData;
                }
            } catch (backupError) {
                console.error('Error al cargar respaldo:', backupError);
            }
            
            return null;
        }
    }
};

// Exponer el módulo globalmente
window.SimpleCrypto = SimpleCrypto;
