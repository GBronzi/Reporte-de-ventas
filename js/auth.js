// Gestión de autenticación
const Auth = {
    currentUser: null,
    sessionTimeout: 4 * 60 * 60 * 1000, // 4 horas en milisegundos
    sessionCheckInterval: null,

    // Inicializar la autenticación
    async init() {
        try {
            console.log('Inicializando autenticación...');

            // Asegurarse de que la base de datos esté inicializada primero
            if (!DB.db) {
                console.log('Base de datos no inicializada en Auth, inicializando...');
                await DB.init();
            }

            // Crear usuario administrador por defecto (solo si no existe)
            await this.createDefaultAdmin();

            // Verificar si hay un usuario en localStorage (persiste entre sesiones del navegador)
            const storedUser = localStorage.getItem('currentUser');
            const lastActivity = localStorage.getItem('lastActivity');

            if (storedUser && lastActivity) {
                // Verificar si la sesión ha expirado
                const now = new Date().getTime();
                const lastActivityTime = parseInt(lastActivity, 10);

                if (now - lastActivityTime > this.sessionTimeout) {
                    // La sesión ha expirado
                    console.log('La sesión ha expirado');
                    this.logout();
                } else {
                    try {
                        // La sesión sigue activa
                        const parsedUser = JSON.parse(storedUser);

                        // Verificar que el usuario existe en la base de datos
                        const dbUser = await DB.getUsuarioByEmail(parsedUser.email);

                        if (dbUser) {
                            // Usuario válido, establecer como usuario actual
                            this.currentUser = parsedUser;
                            console.log('Usuario recuperado de localStorage:', this.currentUser.email);

                            // Actualizar tiempo de actividad
                            this.updateLastActivity();

                            // Iniciar verificación periódica de sesión
                            this.startSessionCheck();
                        } else {
                            // El usuario no existe en la base de datos
                            console.warn('Usuario almacenado no encontrado en la base de datos');
                            this.logout();
                        }
                    } catch (parseError) {
                        console.error('Error al procesar datos de usuario almacenados:', parseError);
                        this.logout();
                    }
                }
            }

            // Configurar eventos de autenticación
            this.setupAuthEvents();

            // Mostrar la página correspondiente según el estado de autenticación
            this.updateAuthUI();

            console.log('Autenticación inicializada correctamente');
        } catch (error) {
            console.error('Error al inicializar autenticación:', error);
            console.error('Detalles del error:', error.stack);
            // No mostrar alerta para evitar interrumpir la experiencia del usuario
        }
    },

    // Configurar eventos de autenticación
    setupAuthEvents() {
        // Formulario de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;

                try {
                    await this.login(email, password);
                } catch (error) {
                    this.showError(error.message);
                }
            });
        }

        // Formulario de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const nombre = document.getElementById('register-name').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;

                if (password !== confirmPassword) {
                    this.showRegisterError('Las contraseñas no coinciden');
                    return;
                }

                try {
                    await this.register(nombre, email, password);
                } catch (error) {
                    this.showRegisterError(error.message);
                }
            });
        }

        // Botón de logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Enlaces de navegación entre login y registro deshabilitados
        // El registro solo se puede hacer desde la página de administración
    },

    // Iniciar sesión
    async login(email, password) {
        try {
            console.log(`Intentando iniciar sesión con email: ${email}`);
            const user = await DB.getUsuarioByEmail(email);

            if (!user || user.password !== password) {
                throw new Error('Email o contraseña incorrectos');
            }

            // Guardar usuario en memoria y localStorage (sin la contraseña)
            const { password: _, ...userWithoutPassword } = user;
            this.currentUser = userWithoutPassword;

            // Guardar en localStorage para persistencia entre sesiones
            localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
            console.log(`Usuario ${email} autenticado correctamente`);

            // Registrar tiempo de actividad
            this.updateLastActivity();

            // Iniciar verificación periódica de sesión
            this.startSessionCheck();

            // Actualizar UI
            this.updateAuthUI();

            return userWithoutPassword;
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    },

    // Registrar nuevo usuario
    async register(nombre, email, password) {
        try {
            // Verificar si el email ya está registrado
            const existingUser = await DB.getUsuarioByEmail(email);

            if (existingUser) {
                throw new Error('El email ya está registrado');
            }

            // Crear nuevo usuario
            const newUser = {
                nombre,
                email,
                password,
                rol: 'usuario', // Por defecto, todos los usuarios nuevos son 'usuario'
            };

            const createdUser = await DB.createUsuario(newUser);

            // Mostrar mensaje de éxito
            document.getElementById('register-container').innerHTML = `
                <div class="login-card">
                    <h2>Registro Exitoso</h2>
                    <p class="text-center mt-3">
                        Su cuenta ha sido creada exitosamente.
                    </p>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" id="go-to-login">
                        Ir a Iniciar Sesión
                    </button>
                </div>
            `;

            // Configurar evento para volver al login
            document.getElementById('go-to-login').addEventListener('click', () => {
                document.getElementById('register-container').style.display = 'none';
                document.getElementById('login-container').style.display = 'flex';
            });

            return createdUser;
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            throw error;
        }
    },

    // Cerrar sesión
    logout() {
        console.log('Cerrando sesión...');
        this.currentUser = null;

        // Eliminar datos de sesión de localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastActivity');

        // También limpiar sessionStorage por si acaso
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('lastActivity');

        // Detener verificación periódica de sesión
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }

        console.log('Sesión cerrada correctamente');
        this.updateAuthUI();
    },

    // Actualizar UI según el estado de autenticación
    updateAuthUI() {
        console.log('Actualizando UI según el estado de autenticación...');

        const loginContainer = document.getElementById('login-container');
        const registerContainer = document.getElementById('register-container');
        const appContainer = document.getElementById('app-container');

        if (this.currentUser) {
            console.log('Usuario autenticado:', this.currentUser.email, 'Rol:', this.currentUser.rol);

            // Usuario autenticado
            if (loginContainer) loginContainer.style.display = 'none';
            if (registerContainer) registerContainer.style.display = 'none';
            if (appContainer) appContainer.style.display = 'block';

            // Actualizar nombre de usuario en todos los lugares donde aparece
            const userNameElements = document.querySelectorAll('#user-name');
            userNameElements.forEach(element => {
                if (element) {
                    element.textContent = this.currentUser.nombre || this.currentUser.email;
                }
            });

            // Mostrar/ocultar enlace de administración según el rol
            const adminLink = document.getElementById('admin-link');
            if (adminLink) {
                const isAdmin = this.currentUser.rol === 'admin';
                adminLink.style.display = isAdmin ? 'block' : 'none';
                console.log(`Enlace de administración ${isAdmin ? 'mostrado' : 'ocultado'}`);
            }

            // Mostrar/ocultar acciones de administrador
            const adminActionsMonto = document.getElementById('admin-actions-monto');
            const adminActionsUnidades = document.getElementById('admin-actions-unidades');

            if (adminActionsMonto) {
                adminActionsMonto.style.display = this.currentUser.rol === 'admin' ? 'block' : 'none';
            }

            if (adminActionsUnidades) {
                adminActionsUnidades.style.display = this.currentUser.rol === 'admin' ? 'block' : 'none';
            }

            // Mostrar la página de dashboard por defecto solo si no hay una página activa
            const activePage = document.querySelector('.page[style*="display: block"]');
            if (!activePage) {
                console.log('No hay página activa, mostrando dashboard por defecto');
                App.showPage('dashboard');
            } else {
                console.log('Manteniendo la página activa actual:', activePage.id);
            }
        } else {
            console.log('Usuario no autenticado, mostrando pantalla de login');

            // Usuario no autenticado
            if (loginContainer) loginContainer.style.display = 'flex';
            if (registerContainer) registerContainer.style.display = 'none';
            if (appContainer) appContainer.style.display = 'none';

            // Limpiar campos de login
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            if (emailInput) emailInput.value = '';
            if (passwordInput) passwordInput.value = '';
        }
    },

    // Mostrar mensaje de error en el formulario de login
    showError(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    },

    // Mostrar mensaje de error en el formulario de registro
    showRegisterError(message) {
        const errorElement = document.getElementById('register-error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    },

    // Verificar si el usuario actual es administrador
    isAdmin() {
        return this.currentUser && this.currentUser.rol === 'admin';
    },

    // Obtener el ID del usuario actual
    getCurrentUserId() {
        return this.currentUser ? this.currentUser.id : null;
    },

    // Obtener el usuario actual
    getCurrentUser() {
        return this.currentUser;
    },

    // Hashear contraseña (simulado)
    async hashPassword(password) {
        // En una aplicación real, usaríamos bcrypt o similar
        // Aquí solo simulamos un hash simple para demostración
        return password; // En producción, NUNCA almacenar contraseñas en texto plano
    },

    // Crear usuario administrador por defecto
    async createDefaultAdmin() {
        try {
            console.log('Verificando si existe un usuario administrador...');

            // Verificar si ya existe un usuario administrador específico
            const adminEmail = 'g.bronzi91@gmail.com';
            const existingAdmin = await DB.getUsuarioByEmail(adminEmail);

            if (existingAdmin) {
                console.log('Usuario administrador ya existe:', adminEmail);
                return;
            }

            // Verificar si hay otros usuarios con rol de administrador
            const usuarios = await DB.getAllUsuarios();
            const adminExists = usuarios.some(usuario => usuario.rol === 'admin');

            if (!adminExists) {
                console.log('Creando usuario administrador por defecto...');
                // Crear usuario administrador por defecto
                const admin = {
                    email: adminEmail,
                    password: 'Magibro1991', // En una aplicación real, esto debería estar hasheado
                    nombre: 'Administrador',
                    rol: 'admin',
                    created_at: new Date().toISOString()
                };

                await DB.saveUsuario(admin);
                console.log('Usuario administrador creado por defecto');
            } else {
                console.log('Ya existe al menos un usuario con rol de administrador');
            }
        } catch (error) {
            console.error('Error al crear usuario administrador por defecto:', error);
        }
    },

    // Actualizar tiempo de última actividad
    updateLastActivity() {
        const now = new Date().getTime();
        localStorage.setItem('lastActivity', now.toString());
        console.log('Tiempo de actividad actualizado:', new Date(now).toLocaleTimeString());
    },

    // Iniciar verificación periódica de sesión
    startSessionCheck() {
        // Limpiar intervalo anterior si existe
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }

        // Verificar cada minuto si la sesión ha expirado
        this.sessionCheckInterval = setInterval(() => {
            const lastActivity = localStorage.getItem('lastActivity');
            if (lastActivity && this.currentUser) {
                const now = new Date().getTime();
                const lastActivityTime = parseInt(lastActivity, 10);

                // Calcular tiempo restante
                const timeElapsed = now - lastActivityTime;
                const timeRemaining = this.sessionTimeout - timeElapsed;

                // Si quedan menos de 5 minutos, mostrar advertencia
                if (timeRemaining < 5 * 60 * 1000 && timeRemaining > 0) {
                    this.showSessionWarning(Math.ceil(timeRemaining / 60000));
                }

                // Si ha pasado el tiempo de inactividad, cerrar sesión
                if (timeElapsed > this.sessionTimeout) {
                    console.log('Sesión expirada por inactividad');
                    this.logout();
                    this.showSessionExpiredMessage();
                    clearInterval(this.sessionCheckInterval);
                }
            }
        }, 60000); // Verificar cada minuto

        // Configurar eventos para detectar actividad del usuario
        this.setupActivityTracking();
    },

    // Configurar seguimiento de actividad del usuario
    setupActivityTracking() {
        // Lista de eventos a monitorear
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        // Función para actualizar tiempo de actividad
        const activityHandler = () => {
            if (this.currentUser) {
                this.updateLastActivity();
            }
        };

        // Agregar listeners para cada evento
        events.forEach(event => {
            document.addEventListener(event, activityHandler, { passive: true });
        });
    },

    // Mostrar advertencia de sesión por expirar
    showSessionWarning(minutesRemaining) {
        // Verificar si ya existe una advertencia
        if (document.getElementById('session-warning')) {
            return;
        }

        const warning = document.createElement('div');
        warning.id = 'session-warning';
        warning.className = 'session-warning';
        warning.innerHTML = `
            <div class="session-warning-content">
                <h3>Advertencia de Sesión</h3>
                <p>Su sesión expirará en ${minutesRemaining} minuto${minutesRemaining > 1 ? 's' : ''}.</p>
                <div class="session-warning-actions">
                    <button class="btn btn-secondary" id="session-logout">Cerrar Sesión</button>
                    <button class="btn btn-primary" id="session-continue">Continuar Sesión</button>
                </div>
            </div>
        `;

        document.body.appendChild(warning);

        // Configurar eventos de botones
        document.getElementById('session-logout').addEventListener('click', () => {
            this.logout();
            warning.remove();
        });

        document.getElementById('session-continue').addEventListener('click', () => {
            this.updateLastActivity();
            warning.remove();
        });

        // Eliminar automáticamente después de 1 minuto si no hay interacción
        setTimeout(() => {
            if (document.getElementById('session-warning')) {
                warning.remove();
            }
        }, 60000);
    },

    // Mostrar mensaje de sesión expirada
    showSessionExpiredMessage() {
        const message = document.createElement('div');
        message.className = 'session-expired';
        message.innerHTML = `
            <div class="session-expired-content">
                <h3>Sesión Expirada</h3>
                <p>Su sesión ha expirado por inactividad.</p>
                <button class="btn btn-primary" id="session-login">Iniciar Sesión</button>
            </div>
        `;

        document.body.appendChild(message);

        document.getElementById('session-login').addEventListener('click', () => {
            message.remove();
            window.location.reload();
        });
    }
};
