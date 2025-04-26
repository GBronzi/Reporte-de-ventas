// Sistema para evitar múltiples instancias de la aplicación
const SingleInstance = {
    // Clave para identificar la instancia en localStorage
    instanceKey: 'sistema-objetivos-instance',

    // Tiempo de vida de la instancia en milisegundos (2 minutos)
    instanceTTL: 2 * 60 * 1000,

    // Intervalo de verificación en milisegundos (10 segundos)
    checkInterval: 10 * 1000,

    // Forzar continuar sin mostrar advertencia
    forceContinue: true,

    // ID único de esta instancia
    instanceId: null,

    // Intervalo para actualizar la marca de tiempo
    heartbeatInterval: null,

    // Inicializar el sistema de instancia única
    init() {
        console.log('Inicializando sistema de instancia única...');

        try {
            // Limpiar instancias antiguas que puedan haber quedado
            this.cleanupOldInstances();

            // Generar ID único para esta instancia
            this.instanceId = this.generateInstanceId();
            console.log(`ID de instancia: ${this.instanceId}`);

            // Verificar si ya hay una instancia activa
            if (this.isInstanceActive()) {
                console.log('Ya hay una instancia activa de la aplicación');

                // Si está configurado para forzar continuar, registrar esta instancia y continuar
                if (this.forceContinue) {
                    console.log('Forzando continuación sin mostrar advertencia');
                    this.registerInstance();
                    this.startHeartbeat();
                    return true;
                }

                // Mostrar mensaje al usuario
                this.showInstanceWarning();

                // No continuar con la inicialización
                return false;
            }

            // Registrar esta instancia
            this.registerInstance();

            // Iniciar heartbeat para mantener la instancia activa
            this.startHeartbeat();

            // Registrar evento para limpiar la instancia al cerrar
            window.addEventListener('beforeunload', () => {
                this.unregisterInstance();
            });

            console.log('Sistema de instancia única inicializado correctamente');
            return true;
        } catch (error) {
            console.error('Error en la inicialización del sistema de instancia única:', error);
            // En caso de error, permitir que la aplicación continúe
            return true;
        }
    },

    // Limpiar instancias antiguas
    cleanupOldInstances() {
        try {
            const instanceData = this.getInstanceData();

            if (instanceData) {
                const now = Date.now();
                const lastHeartbeat = instanceData.timestamp;
                const elapsed = now - lastHeartbeat;

                // Si ha pasado más de 30 segundos desde el último heartbeat, considerar la instancia como inactiva
                if (elapsed > 30 * 1000) {
                    console.log('Limpiando instancia antigua inactiva');
                    localStorage.removeItem(this.instanceKey);
                }
            }
        } catch (error) {
            console.error('Error al limpiar instancias antiguas:', error);
        }
    },

    // Generar ID único para esta instancia
    generateInstanceId() {
        return 'instance_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Verificar si ya hay una instancia activa
    isInstanceActive() {
        try {
            // Obtener datos de la instancia actual
            const instanceData = this.getInstanceData();

            // Si no hay datos, no hay instancia activa
            if (!instanceData) {
                return false;
            }

            // Verificar si la instancia ha expirado
            const now = Date.now();
            const lastHeartbeat = instanceData.timestamp;
            const elapsed = now - lastHeartbeat;

            // Si ha pasado más tiempo que el TTL, la instancia ha expirado
            if (elapsed > this.instanceTTL) {
                console.log('La instancia anterior ha expirado');
                // Limpiar la instancia expirada
                localStorage.removeItem(this.instanceKey);
                return false;
            }

            // Verificar si la instancia es de la misma sesión del navegador
            // Esto ayuda a evitar bloqueos cuando el navegador se cierra abruptamente
            const currentUserAgent = navigator.userAgent;
            if (instanceData.userAgent !== currentUserAgent) {
                console.log('La instancia anterior es de un navegador diferente, considerándola inactiva');
                return false;
            }

            // Hay una instancia activa
            return true;
        } catch (error) {
            console.error('Error al verificar instancia activa:', error);
            return false;
        }
    },

    // Obtener datos de la instancia actual
    getInstanceData() {
        try {
            const data = localStorage.getItem(this.instanceKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al obtener datos de instancia:', error);
            return null;
        }
    },

    // Registrar esta instancia
    registerInstance() {
        try {
            const instanceData = {
                id: this.instanceId,
                timestamp: Date.now(),
                userAgent: navigator.userAgent
            };

            localStorage.setItem(this.instanceKey, JSON.stringify(instanceData));
            console.log('Instancia registrada correctamente');
        } catch (error) {
            console.error('Error al registrar instancia:', error);
        }
    },

    // Actualizar marca de tiempo de la instancia
    updateInstanceTimestamp() {
        try {
            const instanceData = this.getInstanceData();

            // Verificar que sea nuestra instancia
            if (instanceData && instanceData.id === this.instanceId) {
                instanceData.timestamp = Date.now();
                localStorage.setItem(this.instanceKey, JSON.stringify(instanceData));
            }
        } catch (error) {
            console.error('Error al actualizar marca de tiempo de instancia:', error);
        }
    },

    // Iniciar heartbeat para mantener la instancia activa
    startHeartbeat() {
        // Limpiar intervalo anterior si existe
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Iniciar nuevo intervalo
        this.heartbeatInterval = setInterval(() => {
            this.updateInstanceTimestamp();
        }, this.checkInterval);
    },

    // Eliminar registro de esta instancia
    unregisterInstance() {
        try {
            const instanceData = this.getInstanceData();

            // Verificar que sea nuestra instancia
            if (instanceData && instanceData.id === this.instanceId) {
                localStorage.removeItem(this.instanceKey);
                console.log('Instancia eliminada correctamente');
            }

            // Limpiar intervalo de heartbeat
            if (this.heartbeatInterval) {
                clearInterval(this.heartbeatInterval);
                this.heartbeatInterval = null;
            }
        } catch (error) {
            console.error('Error al eliminar instancia:', error);
        }
    },

    // Mostrar advertencia de instancia múltiple
    showInstanceWarning() {
        // Crear diálogo de advertencia
        const dialog = document.createElement('div');
        dialog.className = 'instance-warning-dialog';
        dialog.innerHTML = `
            <div class="instance-warning-content">
                <div class="instance-warning-header">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Aplicación ya en ejecución</h3>
                </div>
                <div class="instance-warning-body">
                    <p>La aplicación ya está abierta en otra ventana o pestaña.</p>
                    <p>Para evitar problemas de sincronización, se recomienda utilizar una sola instancia de la aplicación.</p>
                    <p><strong>Si no tiene otra ventana abierta, haga clic en "Continuar de todos modos".</strong></p>
                </div>
                <div class="instance-warning-footer">
                    <button id="continue-anyway" class="btn btn-primary">Continuar de todos modos</button>
                    <button id="close-window" class="btn btn-secondary">Cerrar esta ventana</button>
                </div>
            </div>
        `;

        // Añadir estilos
        const style = document.createElement('style');
        style.textContent = `
            .instance-warning-dialog {
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

            .instance-warning-content {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                width: 90%;
                max-width: 500px;
                padding: 20px;
            }

            .instance-warning-header {
                display: flex;
                align-items: center;
                margin-bottom: 15px;
                color: #e67e22;
            }

            .instance-warning-header i {
                font-size: 24px;
                margin-right: 10px;
            }

            .instance-warning-header h3 {
                margin: 0;
                font-size: 18px;
            }

            .instance-warning-body {
                margin-bottom: 20px;
            }

            .instance-warning-footer {
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }

            .btn {
                padding: 8px 16px;
                border-radius: 4px;
                border: none;
                cursor: pointer;
                font-size: 14px;
            }

            .btn-primary {
                background-color: #3498db;
                color: white;
            }

            .btn-secondary {
                background-color: #ecf0f1;
                color: #2c3e50;
            }
        `;

        // Añadir elementos al DOM
        document.head.appendChild(style);
        document.body.appendChild(dialog);

        // Configurar eventos
        document.getElementById('continue-anyway').addEventListener('click', () => {
            // Registrar esta instancia y continuar
            this.registerInstance();
            this.startHeartbeat();
            dialog.remove();
            style.remove();
        });

        document.getElementById('close-window').addEventListener('click', () => {
            // Cerrar esta ventana
            window.close();

            // Si window.close() no funciona (por políticas del navegador),
            // redirigir a una página en blanco
            setTimeout(() => {
                window.location.href = 'about:blank';
            }, 100);
        });
    }
};
