// Administración
const Admin = {
    // Inicializar la página de administración
    init() {
        // Configurar eventos
        this.setupEvents();
    },

    // Configurar eventos
    setupEvents() {
        // Botón de exportar usuarios
        const exportarBtn = document.getElementById('exportar-usuarios');
        if (exportarBtn) {
            exportarBtn.addEventListener('click', () => {
                this.exportUsuarios();
            });
        }

        // Formulario de nuevo usuario
        const formNuevoUsuario = document.getElementById('form-nuevo-usuario');
        if (formNuevoUsuario) {
            formNuevoUsuario.addEventListener('submit', (e) => {
                e.preventDefault();
                this.crearNuevoUsuario();
            });
        }

        // Botón para borrar la base de datos
        const resetDatabaseBtn = document.getElementById('reset-database');
        if (resetDatabaseBtn) {
            resetDatabaseBtn.addEventListener('click', () => {
                this.resetDatabase();
            });
        }

        // Mostrar versión actual
        const versionElement = document.getElementById('current-version');
        if (versionElement) {
            versionElement.textContent = Updater.currentVersion;
        }

        // Configurar eventos para generación de actualizaciones
        this.setupUpdateGenerationEvents();
    },

    // Configurar eventos para generación de actualizaciones
    setupUpdateGenerationEvents() {
        // Botón para agregar cambio
        const addChangeBtn = document.getElementById('add-change');
        if (addChangeBtn) {
            addChangeBtn.addEventListener('click', () => {
                this.addChangeField();
            });
        }

        // Configurar eventos para botones de eliminar cambio
        this.setupRemoveChangeButtons();

        // Botón para generar actualización
        const generateUpdateBtn = document.getElementById('generate-update');
        if (generateUpdateBtn) {
            generateUpdateBtn.addEventListener('click', () => {
                this.generateUpdate();
            });
        }
    },

    // Agregar campo de cambio
    addChangeField() {
        const container = document.getElementById('update-changes-container');
        if (!container) return;

        const changeItem = document.createElement('div');
        changeItem.className = 'update-change-item';
        changeItem.innerHTML = `
            <input type="text" class="update-change" placeholder="Descripción del cambio">
            <button type="button" class="btn btn-small btn-danger remove-change"><i class="fas fa-times"></i></button>
        `;

        container.appendChild(changeItem);

        // Configurar evento para el nuevo botón de eliminar
        const removeBtn = changeItem.querySelector('.remove-change');
        removeBtn.addEventListener('click', (e) => {
            e.target.closest('.update-change-item').remove();
        });
    },

    // Configurar eventos para botones de eliminar cambio
    setupRemoveChangeButtons() {
        const removeButtons = document.querySelectorAll('.remove-change');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const item = e.target.closest('.update-change-item');
                if (item) {
                    item.remove();
                }
            });
        });
    },

    // Generar archivo de actualización
    async generateUpdate() {
        try {
            // Verificar si el usuario actual es administrador
            if (!Auth.isAdmin()) {
                this.showUpdateGenerationStatus('error', 'Solo los administradores pueden generar actualizaciones');
                return;
            }

            // Obtener versión
            const versionInput = document.getElementById('update-version');
            if (!versionInput || !versionInput.value) {
                this.showUpdateGenerationStatus('error', 'Por favor ingrese una versión válida');
                return;
            }

            const newVersion = versionInput.value.trim();

            // Validar formato de versión (x.y.z)
            const versionRegex = /^\d+\.\d+\.\d+$/;
            if (!versionRegex.test(newVersion)) {
                this.showUpdateGenerationStatus('error', 'El formato de versión debe ser x.y.z (ejemplo: 1.2.0)');
                return;
            }

            // Verificar que la nueva versión sea mayor que la actual
            if (!this.isNewerVersion(newVersion, Updater.currentVersion)) {
                this.showUpdateGenerationStatus('error', `La nueva versión (${newVersion}) debe ser mayor que la versión actual (${Updater.currentVersion})`);
                return;
            }

            // Obtener cambios
            const changeInputs = document.querySelectorAll('.update-change');
            const changes = Array.from(changeInputs)
                .map(input => input.value.trim())
                .filter(value => value !== '');

            if (changes.length === 0) {
                this.showUpdateGenerationStatus('error', 'Por favor ingrese al menos un cambio');
                return;
            }

            // Generar archivo de actualización
            this.showUpdateGenerationStatus('info', 'Generando archivo de actualización...');

            const result = await Updater.generateUpdateFile(newVersion, changes);

            if (result) {
                this.showUpdateGenerationStatus('success', `Archivo de actualización generado correctamente: update-${newVersion}.json`);
            } else {
                this.showUpdateGenerationStatus('error', 'Error al generar archivo de actualización');
            }
        } catch (error) {
            console.error('Error al generar actualización:', error);
            this.showUpdateGenerationStatus('error', 'Error al generar actualización: ' + error.message);
        }
    },

    // Mostrar estado de generación de actualización
    showUpdateGenerationStatus(type, message) {
        const statusElement = document.getElementById('update-generation-status');
        if (!statusElement) return;

        statusElement.className = type;
        statusElement.textContent = message;
        statusElement.style.display = 'block';
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

    // Borrar toda la base de datos
    async resetDatabase() {
        try {
            // Verificar si el usuario actual es administrador
            if (!Auth.isAdmin()) {
                alert('Solo los administradores pueden borrar la base de datos');
                return;
            }

            // Confirmar la acción
            if (!confirm('¿Está seguro de borrar TODOS los datos de objetivos, unidades y créditos? Esta acción no se puede deshacer.')) {
                return;
            }

            // Confirmar nuevamente para evitar acciones accidentales
            if (!confirm('ADVERTENCIA: Esta acción eliminará TODOS los datos excepto los usuarios. ¿Realmente desea continuar?')) {
                return;
            }

            // Borrar la base de datos
            await DB.resetDatabase();

            // Mostrar mensaje de éxito
            alert('Base de datos borrada correctamente. La aplicación se recargará para aplicar los cambios.');

            // Recargar la página para aplicar los cambios
            window.location.reload();
        } catch (error) {
            console.error('Error al borrar la base de datos:', error);
            alert('Error al borrar la base de datos: ' + error.message);
        }
    },

    // Crear nuevo usuario
    async crearNuevoUsuario() {
        try {
            console.log('Creando nuevo usuario desde admin...');

            // Obtener valores del formulario
            const email = document.getElementById('nuevo-usuario-email').value;
            const nombre = document.getElementById('nuevo-usuario-nombre').value;
            const password = document.getElementById('nuevo-usuario-password').value;
            const rol = document.getElementById('nuevo-usuario-rol').value;

            console.log('Valores del formulario:', { email, nombre, rol });

            if (!email || !nombre || !password) {
                alert('Por favor complete todos los campos');
                return;
            }

            // Validar email
            if (!this.validarEmail(email)) {
                alert('Por favor ingrese un email válido');
                return;
            }

            // Validar contraseña
            if (password.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }

            // Verificar si el email ya existe
            const usuarios = await DB.getAllUsuarios();
            const emailExiste = usuarios.some(usuario => usuario.email === email);

            if (emailExiste) {
                alert('El email ya está registrado');
                return;
            }

            // Crear usuario
            const usuario = {
                email,
                nombre,
                password: await Auth.hashPassword(password),
                // Asegurarse de que el rol sea 'admin' o 'usuario'
                rol: rol === 'admin' ? 'admin' : 'usuario',
                created_at: new Date().toISOString()
            };

            console.log('Usuario a guardar:', usuario);

            // Guardar usuario
            const usuarioGuardado = await DB.saveUsuario(usuario);
            console.log('Usuario guardado:', usuarioGuardado);

            // Limpiar formulario
            document.getElementById('nuevo-usuario-email').value = '';
            document.getElementById('nuevo-usuario-nombre').value = '';
            document.getElementById('nuevo-usuario-password').value = '';
            document.getElementById('nuevo-usuario-rol').value = 'usuario';

            // Recargar datos
            this.loadData();

            alert('Usuario creado correctamente');
        } catch (error) {
            console.error('Error al crear usuario:', error);
            alert('Error al crear usuario: ' + error.message);
        }
    },

    // Validar email
    validarEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Cargar datos de administración
    async loadData() {
        try {
            console.log('Cargando datos de administración...');

            // Verificar si el usuario actual es administrador
            if (!Auth.isAdmin()) {
                console.log('Usuario no es administrador, redirigiendo a dashboard');
                App.showPage('dashboard');
                return;
            }

            // Asegurarse de que la base de datos esté inicializada
            if (!DB.db) {
                console.log('Base de datos no inicializada en Admin, inicializando...');
                await DB.init();
            }

            // Obtener usuarios
            console.log('Obteniendo usuarios...');
            const usuarios = await DB.getAllUsuarios();
            console.log('Usuarios obtenidos:', usuarios.length);

            // Actualizar tabla de usuarios
            this.updateUsuariosTable(usuarios);

            // Actualizar estadísticas
            this.updateEstadisticas(usuarios);

            console.log('Datos de administración cargados correctamente');
        } catch (error) {
            console.error('Error al cargar datos de administración:', error);
            alert('Error al cargar datos de administración: ' + error.message);
        }
    },

    // Actualizar tabla de usuarios
    updateUsuariosTable(usuarios) {
        const tbody = document.getElementById('tabla-usuarios');

        if (!tbody) return;

        // Limpiar tabla
        tbody.innerHTML = '';

        if (usuarios.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">No hay usuarios registrados</td>
                </tr>
            `;
            return;
        }

        // Ordenar usuarios por fecha de creación (más reciente primero)
        usuarios.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Llenar tabla
        usuarios.forEach(usuario => {
            const row = document.createElement('tr');

            // Mapear rol a texto más amigable
            let rolTexto = 'Usuario';
            let rolBadge = 'badge-usuario';

            if (usuario.rol === 'admin') {
                rolTexto = 'Administrador';
                rolBadge = 'badge-admin';
            }

            // Solo mostrar botones de acción si no es el usuario actual
            const botonesAccion = usuario.id !== Auth.getCurrentUserId() ? `
                <div class="action-buttons">
                    <button class="btn btn-small ${usuario.rol === 'admin' ? 'btn-danger' : 'btn-primary'} mb-1"
                            data-action="cambiar-rol"
                            data-id="${usuario.id}"
                            data-rol="${usuario.rol === 'admin' ? 'usuario' : 'admin'}">
                        ${usuario.rol === 'admin' ? 'Cambiar a Usuario' : 'Promover a Admin'}
                    </button>
                    <button class="btn btn-small btn-danger"
                            data-action="eliminar-usuario"
                            data-id="${usuario.id}"
                            data-email="${usuario.email}">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            ` : '-';

            row.innerHTML = `
                <td>${usuario.id}</td>
                <td>${usuario.email}</td>
                <td>${usuario.nombre || '-'}</td>
                <td><span class="badge ${rolBadge}">${rolTexto}</span></td>
                <td>${App.formatDate(usuario.created_at)}</td>
                <td>${botonesAccion}</td>
            `;

            tbody.appendChild(row);
        });

        // Configurar eventos de botones de acción
        const cambiarRolButtons = document.querySelectorAll('[data-action="cambiar-rol"]');

        cambiarRolButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                const rol = button.getAttribute('data-rol');

                this.cambiarRolUsuario(id, rol);
            });
        });

        // Configurar eventos de botones de eliminar
        const eliminarButtons = document.querySelectorAll('[data-action="eliminar-usuario"]');

        eliminarButtons.forEach(button => {
            button.addEventListener('click', () => {
                const id = parseInt(button.getAttribute('data-id'));
                const email = button.getAttribute('data-email');

                this.eliminarUsuario(id, email);
            });
        });
    },

    // Actualizar estadísticas
    updateEstadisticas(usuarios) {
        const totalUsuarios = usuarios.length;
        const totalAdmins = usuarios.filter(usuario => usuario.rol === 'admin').length;
        const totalRegulares = usuarios.filter(usuario => usuario.rol === 'usuario').length;

        document.getElementById('total-usuarios').textContent = totalUsuarios;
        document.getElementById('total-admins').textContent = totalAdmins;
        document.getElementById('total-regulares').textContent = totalRegulares;
    },

    // Cambiar rol de usuario
    async cambiarRolUsuario(id, rol) {
        try {
            if (!confirm(`¿Está seguro de cambiar el rol del usuario a ${rol === 'admin' ? 'Administrador' : 'Usuario'}?`)) {
                return;
            }

            // Actualizar usuario
            await DB.updateUsuario(id, { rol });

            // Recargar datos
            this.loadData();
        } catch (error) {
            console.error('Error al cambiar rol de usuario:', error);
            alert('Error al cambiar rol de usuario');
        }
    },

    // Eliminar usuario
    async eliminarUsuario(id, email) {
        try {
            // Verificar si el usuario actual es administrador
            if (!Auth.isAdmin()) {
                alert('Solo los administradores pueden eliminar usuarios');
                return;
            }

            // Confirmar eliminación
            if (!confirm(`¿Está seguro de eliminar al usuario ${email}? Esta acción no se puede deshacer.`)) {
                return;
            }

            // Eliminar usuario
            await DB.deleteUsuario(id);

            // Recargar datos
            this.loadData();

            alert(`Usuario ${email} eliminado correctamente`);
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert('Error al eliminar usuario: ' + error.message);
        }
    },

    // Exportar usuarios
    async exportUsuarios() {
        try {
            // Obtener usuarios
            const usuarios = await DB.getAllUsuarios();

            if (usuarios.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            // Preparar datos para exportar
            const usuariosData = usuarios.map(usuario => ({
                ID: usuario.id,
                Email: usuario.email,
                Nombre: usuario.nombre || '-',
                Rol: usuario.rol === 'admin' ? 'Administrador' : 'Usuario',
                'Fecha de Registro': App.formatDate(usuario.created_at)
            }));

            // Mostrar menú de exportación
            Export.showExportMenu(
                document.getElementById('exportar-usuarios'),
                usuariosData,
                'usuarios'
            );
        } catch (error) {
            console.error('Error al exportar usuarios:', error);
            alert('Error al exportar usuarios');
        }
    }
};
