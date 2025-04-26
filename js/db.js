// Base de datos local con IndexedDB
const DB = {
    name: 'SistemaObjetivosDB',
    version: 21,
    db: null,

    // Inicializar la base de datos
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Crear almacén de usuarios
                if (!db.objectStoreNames.contains('usuarios')) {
                    const usuariosStore = db.createObjectStore('usuarios', { keyPath: 'id', autoIncrement: true });
                    usuariosStore.createIndex('email', 'email', { unique: true });

                    // No creamos usuario administrador aquí para evitar duplicados
                    // El usuario administrador se creará en Auth.createDefaultAdmin()
                }

                // Crear almacén de objetivos de monto
                if (!db.objectStoreNames.contains('objetivos_monto')) {
                    const objetivosMontoStore = db.createObjectStore('objetivos_monto', { keyPath: 'id', autoIncrement: true });
                    objetivosMontoStore.createIndex('mes_anio', ['mes', 'anio'], { unique: true });
                }

                // Crear almacén de ingresos de monto
                if (!db.objectStoreNames.contains('ingresos_monto')) {
                    const ingresosMontoStore = db.createObjectStore('ingresos_monto', { keyPath: 'id', autoIncrement: true });
                    ingresosMontoStore.createIndex('objetivo_id', 'objetivo_id', { unique: false });
                    ingresosMontoStore.createIndex('fecha', 'fecha', { unique: false });
                    // Nota: El campo 'tickets' se agregará a los registros pero no necesita un índice
                }

                // Crear almacén de objetivos de unidades
                if (!db.objectStoreNames.contains('objetivos_unidades')) {
                    const objetivosUnidadesStore = db.createObjectStore('objetivos_unidades', { keyPath: 'id', autoIncrement: true });
                    objetivosUnidadesStore.createIndex('mes_anio', ['mes', 'anio'], { unique: true });
                }

                // Crear almacén de ingresos de unidades
                if (!db.objectStoreNames.contains('ingresos_unidades')) {
                    const ingresosUnidadesStore = db.createObjectStore('ingresos_unidades', { keyPath: 'id', autoIncrement: true });
                    ingresosUnidadesStore.createIndex('objetivo_id', 'objetivo_id', { unique: false });
                    ingresosUnidadesStore.createIndex('fecha', 'fecha', { unique: false });
                }

                // Crear almacén de créditos
                if (!db.objectStoreNames.contains('creditos')) {
                    const creditosStore = db.createObjectStore('creditos', { keyPath: 'id', autoIncrement: true });
                    creditosStore.createIndex('fecha', 'fecha', { unique: false });
                    creditosStore.createIndex('tipo', 'tipo', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('Base de datos inicializada correctamente');
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('Error al inicializar la base de datos:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    // Métodos para usuarios
    async getUsuarioByEmail(email) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['usuarios'], 'readonly');
            const store = transaction.objectStore('usuarios');
            const index = store.index('email');
            const request = index.get(email);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    async createUsuario(usuario) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['usuarios'], 'readwrite');
            const store = transaction.objectStore('usuarios');
            usuario.created_at = new Date().toISOString();
            const request = store.add(usuario);

            request.onsuccess = () => {
                resolve({ id: request.result, ...usuario });
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    // Método para guardar usuario (alias de createUsuario para compatibilidad)
    async saveUsuario(usuario) {
        try {
            console.log('Guardando usuario:', usuario);
            return await this.createUsuario(usuario);
        } catch (error) {
            console.error('Error al guardar usuario:', error);
            throw error;
        }
    },

    async getAllUsuarios() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['usuarios'], 'readonly');
            const store = transaction.objectStore('usuarios');
            const request = store.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    async updateUsuario(id, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['usuarios'], 'readwrite');
            const store = transaction.objectStore('usuarios');
            const request = store.get(id);

            request.onsuccess = () => {
                const usuario = request.result;
                if (!usuario) {
                    reject(new Error('Usuario no encontrado'));
                    return;
                }

                const updatedUsuario = { ...usuario, ...data };
                const updateRequest = store.put(updatedUsuario);

                updateRequest.onsuccess = () => {
                    resolve(updatedUsuario);
                };

                updateRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    // Métodos para objetivos de monto
    async getObjetivoMonto(mes, anio) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`Obteniendo objetivo de monto para ${mes}/${anio}`);

                // Validar que mes y anio sean números válidos
                mes = parseInt(mes);
                anio = parseInt(anio);

                if (isNaN(mes) || isNaN(anio) || mes < 1 || mes > 12 || anio < 2000 || anio > 2100) {
                    console.error('Mes o año inválidos:', { mes, anio });
                    return resolve(null);
                }

                const transaction = this.db.transaction(['objetivos_monto'], 'readonly');
                const store = transaction.objectStore('objetivos_monto');
                const index = store.index('mes_anio');
                const request = index.get([mes, anio]);

                request.onsuccess = () => {
                    console.log(`Objetivo de monto para ${mes}/${anio}:`, request.result);
                    resolve(request.result);
                };

                request.onerror = (event) => {
                    console.error(`Error al obtener objetivo de monto para ${mes}/${anio}:`, event.target.error);
                    reject(event.target.error);
                };
            } catch (error) {
                console.error(`Error al obtener objetivo de monto para ${mes}/${anio}:`, error);
                resolve(null);
            }
        });
    },

    async saveObjetivoMonto(objetivo) {
        return new Promise(async (resolve, reject) => {
            try {
                const existingObjetivo = await this.getObjetivoMonto(objetivo.mes, objetivo.anio);

                const transaction = this.db.transaction(['objetivos_monto'], 'readwrite');
                const store = transaction.objectStore('objetivos_monto');

                let request;

                if (existingObjetivo) {
                    // Actualizar objetivo existente
                    const updatedObjetivo = { ...existingObjetivo, ...objetivo };
                    request = store.put(updatedObjetivo);
                } else {
                    // Crear nuevo objetivo
                    objetivo.created_at = new Date().toISOString();
                    request = store.add(objetivo);
                }

                request.onsuccess = () => {
                    if (!existingObjetivo) {
                        resolve({ id: request.result, ...objetivo });
                    } else {
                        resolve({ ...existingObjetivo, ...objetivo });
                    }
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    },

    // Métodos para ingresos de monto
    async getIngresosMonto(objetivoId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ingresos_monto'], 'readonly');
            const store = transaction.objectStore('ingresos_monto');
            const index = store.index('objetivo_id');
            const request = index.getAll(objetivoId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    async saveIngresoMonto(ingreso) {
        return new Promise(async (resolve, reject) => {
            try {
                const transaction = this.db.transaction(['ingresos_monto'], 'readwrite');
                const store = transaction.objectStore('ingresos_monto');

                // Verificar si ya existe un ingreso para esta fecha
                const index = store.index('fecha');
                const existingRequest = index.get(ingreso.fecha);

                existingRequest.onsuccess = () => {
                    const existingIngreso = existingRequest.result;
                    let request;

                    // Asegurarse de que el campo tickets tenga un valor por defecto si no se proporciona
                    if (!ingreso.tickets && ingreso.tickets !== 0) {
                        ingreso.tickets = 1; // Valor por defecto: 1 ticket
                    }

                    if (existingIngreso && existingIngreso.objetivo_id === ingreso.objetivo_id) {
                        // Actualizar ingreso existente
                        const updatedIngreso = { ...existingIngreso, ...ingreso };
                        request = store.put(updatedIngreso);
                    } else {
                        // Crear nuevo ingreso
                        ingreso.created_at = new Date().toISOString();
                        request = store.add(ingreso);
                    }

                    request.onsuccess = () => {
                        if (!existingIngreso || existingIngreso.objetivo_id !== ingreso.objetivo_id) {
                            resolve({ id: request.result, ...ingreso });
                        } else {
                            resolve({ ...existingIngreso, ...ingreso });
                        }
                    };

                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                };

                existingRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    },

    // Borrar ingresos de monto por fecha
    async borrarIngresosMontoPorFecha(objetivoId, fecha) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['ingresos_monto'], 'readwrite');
                const store = transaction.objectStore('ingresos_monto');
                const index = store.index('fecha');
                const request = index.get(fecha);

                request.onsuccess = () => {
                    const ingreso = request.result;

                    if (ingreso && ingreso.objetivo_id === objetivoId) {
                        // Borrar ingreso
                        const deleteRequest = store.delete(ingreso.id);

                        deleteRequest.onsuccess = () => {
                            resolve(true);
                        };

                        deleteRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    } else {
                        resolve(false);
                    }
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    },

    // Borrar todos los ingresos de monto de un objetivo
    async borrarIngresosMontoDelMes(objetivoId) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['ingresos_monto'], 'readwrite');
                const store = transaction.objectStore('ingresos_monto');
                const index = store.index('objetivo_id');
                const request = index.getAll(objetivoId);

                request.onsuccess = () => {
                    const ingresos = request.result;

                    if (ingresos.length === 0) {
                        resolve(false);
                        return;
                    }

                    let deletedCount = 0;

                    ingresos.forEach(ingreso => {
                        const deleteRequest = store.delete(ingreso.id);

                        deleteRequest.onsuccess = () => {
                            deletedCount++;

                            if (deletedCount === ingresos.length) {
                                resolve(true);
                            }
                        };

                        deleteRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    });
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    },

    // Métodos para objetivos de unidades
    async getObjetivoUnidades(mes, anio) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`Obteniendo objetivo de unidades para ${mes}/${anio}`);

                // Validar que mes y anio sean números válidos
                mes = parseInt(mes);
                anio = parseInt(anio);

                if (isNaN(mes) || isNaN(anio) || mes < 1 || mes > 12 || anio < 2000 || anio > 2100) {
                    console.error('Mes o año inválidos:', { mes, anio });
                    return resolve(null);
                }

                const transaction = this.db.transaction(['objetivos_unidades'], 'readonly');
                const store = transaction.objectStore('objetivos_unidades');
                const index = store.index('mes_anio');
                const request = index.get([mes, anio]);

                request.onsuccess = () => {
                    console.log(`Objetivo de unidades para ${mes}/${anio}:`, request.result);
                    resolve(request.result);
                };

                request.onerror = (event) => {
                    console.error(`Error al obtener objetivo de unidades para ${mes}/${anio}:`, event.target.error);
                    reject(event.target.error);
                };
            } catch (error) {
                console.error(`Error al obtener objetivo de unidades para ${mes}/${anio}:`, error);
                resolve(null);
            }
        });
    },

    async saveObjetivoUnidades(objetivo) {
        return new Promise(async (resolve, reject) => {
            try {
                const existingObjetivo = await this.getObjetivoUnidades(objetivo.mes, objetivo.anio);

                const transaction = this.db.transaction(['objetivos_unidades'], 'readwrite');
                const store = transaction.objectStore('objetivos_unidades');

                let request;

                if (existingObjetivo) {
                    // Actualizar objetivo existente
                    const updatedObjetivo = { ...existingObjetivo, ...objetivo };
                    request = store.put(updatedObjetivo);
                } else {
                    // Crear nuevo objetivo
                    objetivo.created_at = new Date().toISOString();
                    request = store.add(objetivo);
                }

                request.onsuccess = () => {
                    if (!existingObjetivo) {
                        resolve({ id: request.result, ...objetivo });
                    } else {
                        resolve({ ...existingObjetivo, ...objetivo });
                    }
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    },

    // Métodos para ingresos de unidades
    async getIngresosUnidades(objetivoId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['ingresos_unidades'], 'readonly');
            const store = transaction.objectStore('ingresos_unidades');
            const index = store.index('objetivo_id');
            const request = index.getAll(objetivoId);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    async saveIngresoUnidades(ingreso) {
        return new Promise(async (resolve, reject) => {
            try {
                const transaction = this.db.transaction(['ingresos_unidades'], 'readwrite');
                const store = transaction.objectStore('ingresos_unidades');

                // Verificar si ya existe un ingreso para esta fecha
                const index = store.index('fecha');
                const existingRequest = index.get(ingreso.fecha);

                existingRequest.onsuccess = () => {
                    const existingIngreso = existingRequest.result;
                    let request;

                    if (existingIngreso && existingIngreso.objetivo_id === ingreso.objetivo_id) {
                        // Actualizar ingreso existente
                        const updatedIngreso = { ...existingIngreso, ...ingreso };
                        request = store.put(updatedIngreso);
                    } else {
                        // Crear nuevo ingreso
                        ingreso.created_at = new Date().toISOString();
                        request = store.add(ingreso);
                    }

                    request.onsuccess = () => {
                        if (!existingIngreso || existingIngreso.objetivo_id !== ingreso.objetivo_id) {
                            resolve({ id: request.result, ...ingreso });
                        } else {
                            resolve({ ...existingIngreso, ...ingreso });
                        }
                    };

                    request.onerror = (event) => {
                        reject(event.target.error);
                    };
                };

                existingRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    },

    // Borrar ingresos de unidades por fecha
    async borrarIngresosUnidadesPorFecha(objetivoId, fecha) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['ingresos_unidades'], 'readwrite');
                const store = transaction.objectStore('ingresos_unidades');
                const index = store.index('fecha');
                const request = index.get(fecha);

                request.onsuccess = () => {
                    const ingreso = request.result;

                    if (ingreso && ingreso.objetivo_id === objetivoId) {
                        // Borrar ingreso
                        const deleteRequest = store.delete(ingreso.id);

                        deleteRequest.onsuccess = () => {
                            resolve(true);
                        };

                        deleteRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    } else {
                        resolve(false);
                    }
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    },

    // Borrar todos los ingresos de unidades de un objetivo
    async borrarIngresosUnidadesDelMes(objetivoId) {
        return new Promise((resolve, reject) => {
            try {
                const transaction = this.db.transaction(['ingresos_unidades'], 'readwrite');
                const store = transaction.objectStore('ingresos_unidades');
                const index = store.index('objetivo_id');
                const request = index.getAll(objetivoId);

                request.onsuccess = () => {
                    const ingresos = request.result;

                    if (ingresos.length === 0) {
                        resolve(false);
                        return;
                    }

                    let deletedCount = 0;

                    ingresos.forEach(ingreso => {
                        const deleteRequest = store.delete(ingreso.id);

                        deleteRequest.onsuccess = () => {
                            deletedCount++;

                            if (deletedCount === ingresos.length) {
                                resolve(true);
                            }
                        };

                        deleteRequest.onerror = (event) => {
                            reject(event.target.error);
                        };
                    });
                };

                request.onerror = (event) => {
                    reject(event.target.error);
                };
            } catch (error) {
                reject(error);
            }
        });
    },

    // Métodos para créditos
    async getCreditos(mes, anio) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['creditos'], 'readonly');
            const store = transaction.objectStore('creditos');
            const request = store.getAll();

            request.onsuccess = () => {
                const creditos = request.result;

                // Filtrar por mes y año
                const primerDia = new Date(anio, mes - 1, 1).toISOString().split('T')[0];
                const ultimoDia = new Date(anio, mes, 0).toISOString().split('T')[0];

                const creditosFiltrados = creditos.filter(credito => {
                    return credito.fecha >= primerDia && credito.fecha <= ultimoDia;
                });

                resolve(creditosFiltrados);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    },

    async saveCredito(credito) {
        return new Promise((resolve, reject) => {
            try {
                console.log('Guardando crédito:', credito);

                if (!this.db) {
                    console.error('Base de datos no inicializada');
                    return reject(new Error('Base de datos no inicializada'));
                }

                const transaction = this.db.transaction(['creditos'], 'readwrite');
                const store = transaction.objectStore('creditos');

                credito.created_at = new Date().toISOString();
                console.log('Crédito a guardar:', credito);

                const request = store.add(credito);

                request.onsuccess = () => {
                    console.log('Crédito guardado correctamente con ID:', request.result);
                    resolve({ id: request.result, ...credito });
                };

                request.onerror = (event) => {
                    console.error('Error al guardar crédito:', event.target.error);
                    reject(event.target.error);
                };

                transaction.oncomplete = () => {
                    console.log('Transacción completada');
                };

                transaction.onerror = (event) => {
                    console.error('Error en la transacción:', event.target.error);
                };
            } catch (error) {
                console.error('Error al guardar crédito (excepción):', error);
                reject(error);
            }
        });
    },

    // Actualizar crédito existente
    async updateCredito(id, credito) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`Actualizando crédito con ID ${id}:`, credito);

                if (!this.db) {
                    console.error('Base de datos no inicializada');
                    return reject(new Error('Base de datos no inicializada'));
                }

                const transaction = this.db.transaction(['creditos'], 'readwrite');
                const store = transaction.objectStore('creditos');

                // Asegurarse de que el ID sea el mismo
                credito.id = id;

                // Actualizar fecha de modificación
                credito.updated_at = new Date().toISOString();

                const request = store.put(credito);

                request.onsuccess = () => {
                    console.log('Crédito actualizado correctamente');
                    resolve(credito);
                };

                request.onerror = (event) => {
                    console.error('Error al actualizar crédito:', event.target.error);
                    reject(event.target.error);
                };

                transaction.oncomplete = () => {
                    console.log('Transacción de actualización completada');
                };

                transaction.onerror = (event) => {
                    console.error('Error en la transacción de actualización:', event.target.error);
                };
            } catch (error) {
                console.error('Error al actualizar crédito (excepción):', error);
                reject(error);
            }
        });
    },

    // Eliminar usuario
    async deleteUsuario(id) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`Eliminando usuario con ID ${id}`);

                if (!this.db) {
                    console.error('Base de datos no inicializada');
                    return reject(new Error('Base de datos no inicializada'));
                }

                const transaction = this.db.transaction(['usuarios'], 'readwrite');
                const store = transaction.objectStore('usuarios');

                const request = store.delete(id);

                request.onsuccess = () => {
                    console.log('Usuario eliminado correctamente');
                    resolve(true);
                };

                request.onerror = (event) => {
                    console.error('Error al eliminar usuario:', event.target.error);
                    reject(event.target.error);
                };

                transaction.oncomplete = () => {
                    console.log('Transacción de eliminación completada');
                };

                transaction.onerror = (event) => {
                    console.error('Error en la transacción de eliminación:', event.target.error);
                };
            } catch (error) {
                console.error('Error al eliminar usuario (excepción):', error);
                reject(error);
            }
        });
    },

    // Eliminar crédito por ID
    async deleteCredito(id) {
        return new Promise((resolve, reject) => {
            try {
                console.log(`Eliminando crédito con ID ${id}`);

                if (!this.db) {
                    console.error('Base de datos no inicializada');
                    return reject(new Error('Base de datos no inicializada'));
                }

                const transaction = this.db.transaction(['creditos'], 'readwrite');
                const store = transaction.objectStore('creditos');

                const request = store.delete(id);

                request.onsuccess = () => {
                    console.log('Crédito eliminado correctamente');
                    resolve(true);
                };

                request.onerror = (event) => {
                    console.error('Error al eliminar crédito:', event.target.error);
                    reject(event.target.error);
                };

                transaction.oncomplete = () => {
                    console.log('Transacción de eliminación completada');
                };

                transaction.onerror = (event) => {
                    console.error('Error en la transacción de eliminación:', event.target.error);
                };
            } catch (error) {
                console.error('Error al eliminar crédito (excepción):', error);
                reject(error);
            }
        });
    },

    // Eliminar créditos por fecha
    async deleteCreditosPorFecha(fecha) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`Eliminando créditos para la fecha ${fecha}`);

                if (!this.db) {
                    console.error('Base de datos no inicializada');
                    return reject(new Error('Base de datos no inicializada'));
                }

                // Obtener todos los créditos
                const transaction = this.db.transaction(['creditos'], 'readwrite');
                const store = transaction.objectStore('creditos');
                const request = store.getAll();

                request.onsuccess = async () => {
                    const creditos = request.result;

                    // Filtrar créditos por fecha
                    const creditosFiltrados = creditos.filter(credito => credito.fecha === fecha);

                    if (creditosFiltrados.length === 0) {
                        console.log(`No hay créditos para la fecha ${fecha}`);
                        resolve(0);
                        return;
                    }

                    console.log(`Se encontraron ${creditosFiltrados.length} créditos para la fecha ${fecha}`);

                    // Eliminar cada crédito
                    let eliminados = 0;

                    for (const credito of creditosFiltrados) {
                        try {
                            await this.deleteCredito(credito.id);
                            eliminados++;
                        } catch (error) {
                            console.error(`Error al eliminar crédito ${credito.id}:`, error);
                        }
                    }

                    console.log(`Se eliminaron ${eliminados} créditos para la fecha ${fecha}`);
                    resolve(eliminados);
                };

                request.onerror = (event) => {
                    console.error('Error al obtener créditos:', event.target.error);
                    reject(event.target.error);
                };
            } catch (error) {
                console.error('Error al eliminar créditos por fecha (excepción):', error);
                reject(error);
            }
        });
    },

    // Eliminar créditos por mes y año
    async deleteCreditosPorMes(mes, anio) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(`Eliminando créditos para ${mes}/${anio}`);

                if (!this.db) {
                    console.error('Base de datos no inicializada');
                    return reject(new Error('Base de datos no inicializada'));
                }

                // Obtener créditos del mes
                const creditos = await this.getCreditos(mes, anio);

                if (creditos.length === 0) {
                    console.log(`No hay créditos para ${mes}/${anio}`);
                    resolve(0);
                    return;
                }

                console.log(`Se encontraron ${creditos.length} créditos para ${mes}/${anio}`);

                // Eliminar cada crédito
                let eliminados = 0;

                for (const credito of creditos) {
                    try {
                        await this.deleteCredito(credito.id);
                        eliminados++;
                    } catch (error) {
                        console.error(`Error al eliminar crédito ${credito.id}:`, error);
                    }
                }

                console.log(`Se eliminaron ${eliminados} créditos para ${mes}/${anio}`);
                resolve(eliminados);
            } catch (error) {
                console.error('Error al eliminar créditos por mes (excepción):', error);
                reject(error);
            }
        });
    },

    // Borrar todos los datos excepto usuarios
    async resetDatabase() {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Borrando todos los datos de la base de datos...');

                if (!this.db) {
                    console.error('Base de datos no inicializada');
                    return reject(new Error('Base de datos no inicializada'));
                }

                // Lista de almacenes a borrar (todos excepto usuarios)
                const storesToClear = [
                    'objetivos_monto',
                    'ingresos_monto',
                    'objetivos_unidades',
                    'ingresos_unidades',
                    'creditos'
                ];

                let clearedCount = 0;

                // Borrar cada almacén
                for (const storeName of storesToClear) {
                    const transaction = this.db.transaction([storeName], 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const clearRequest = store.clear();

                    await new Promise((resolveStore, rejectStore) => {
                        clearRequest.onsuccess = () => {
                            console.log(`Almacén ${storeName} borrado correctamente`);
                            clearedCount++;
                            resolveStore();
                        };

                        clearRequest.onerror = (event) => {
                            console.error(`Error al borrar almacén ${storeName}:`, event.target.error);
                            rejectStore(event.target.error);
                        };
                    });
                }

                console.log(`Se han borrado ${clearedCount} almacenes de datos`);
                resolve(true);
            } catch (error) {
                console.error('Error al borrar datos de la base de datos:', error);
                reject(error);
            }
        });
    }
};

// Inicializar la base de datos al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await DB.init();
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
    }
});
