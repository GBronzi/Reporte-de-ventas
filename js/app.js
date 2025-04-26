// Aplicación principal
const App = {
    // Inicializar la aplicación
    async init() {
        try {
            console.log('Inicializando aplicación...');

            // Inicializar sistema de instancia única
            // Intentar inicializar el sistema de instancia única
            try {
                if (!SingleInstance.init()) {
                    console.log('No se continuará con la inicialización debido a que ya hay una instancia activa');
                    return;
                }

                console.log('Instancia única verificada, continuando con la inicialización...');
            } catch (error) {
                // Si hay algún error con el sistema de instancia única, continuar de todos modos
                console.error('Error en el sistema de instancia única, continuando de todos modos:', error);
            }

            // Inicializar sistema de seguridad
            console.log('Inicializando sistema de seguridad...');
            Security.init();
            console.log('Sistema de seguridad inicializado correctamente');

            // Inicializar base de datos
            console.log('Inicializando base de datos...');
            await DB.init();
            console.log('Base de datos inicializada correctamente');

            // Inicializar la autenticación
            console.log('Inicializando autenticación...');
            await Auth.init();
            console.log('Autenticación inicializada correctamente');

            // Inicializar sistema de actualizaciones
            console.log('Inicializando sistema de actualizaciones...');
            Updater.init();
            console.log('Sistema de actualizaciones inicializado correctamente');

            // Configurar eventos de navegación
            this.setupNavigation();

            // Inicializar componentes
            this.initComponents();

            // Llenar selectores de año
            this.fillYearSelectors();

            console.log('Aplicación inicializada correctamente');
        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            alert('Error al inicializar la aplicación: ' + error.message);
        }
    },

    // Configurar eventos de navegación
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Enlaces en las tarjetas del dashboard
        const cardLinks = document.querySelectorAll('.card-link');

        cardLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
    },

    // Inicializar componentes
    async initComponents() {
        try {
            console.log('Inicializando componentes...');

            // Inicializar componentes específicos de cada página
            // Inicializar el dashboard al final para asegurar que otros componentes estén listos
            await ObjetivosMonto.init();
            await ObjetivosUnidades.init();
            await Creditos.init();
            await Contacto.init();
            await Admin.init();

            // Esperar un momento antes de inicializar el dashboard
            await new Promise(resolve => setTimeout(resolve, 500));

            // Inicializar el dashboard
            console.log('Inicializando dashboard...');
            await Dashboard.init();
            console.log('Dashboard inicializado correctamente');

            // Forzar una carga de datos del dashboard después de un breve retraso
            setTimeout(async () => {
                console.log('Forzando carga de datos del dashboard...');
                await Dashboard.loadData();

                // Verificar si los datos se cargaron correctamente
                setTimeout(() => {
                    Dashboard.forceDataRefresh();
                }, 1000);
            }, 1000);
        } catch (error) {
            console.error('Error al inicializar componentes:', error);
            console.error('Detalles del error:', error.stack);
        }
    },

    // Mostrar una página específica
    showPage(pageName) {
        // Ocultar todas las páginas
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.style.display = 'none';
        });

        // Mostrar la página seleccionada
        const selectedPage = document.getElementById(`${pageName}-page`);
        if (selectedPage) {
            selectedPage.style.display = 'block';
        }

        // Actualizar enlaces de navegación
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Actualizar datos de la página
        switch (pageName) {
            case 'dashboard':
                Dashboard.loadData();
                break;
            case 'objetivos-monto':
                ObjetivosMonto.loadData();
                break;
            case 'objetivos-unidades':
                ObjetivosUnidades.loadData();
                break;
            case 'creditos':
                Creditos.loadData();
                break;
            case 'admin':
                Admin.loadData();
                break;
            case 'contacto':
                // No necesita cargar datos específicos
                break;
        }
    },

    // Llenar selectores de año
    fillYearSelectors() {
        const currentYear = new Date().getFullYear();
        const yearSelectors = [
            document.getElementById('monto-anio'),
            document.getElementById('unidades-anio'),
            document.getElementById('creditos-anio'),
            document.getElementById('dashboard-anio')
        ];

        yearSelectors.forEach(selector => {
            if (selector) {
                // Añadir opciones para los últimos 2 años y los próximos 2 años
                for (let year = currentYear - 2; year <= currentYear + 2; year++) {
                    const option = document.createElement('option');
                    option.value = year;
                    option.textContent = year;

                    // Seleccionar el año actual por defecto
                    if (year === currentYear) {
                        option.selected = true;
                    }

                    selector.appendChild(option);
                }
            }
        });

        // Establecer mes actual en todos los selectores de mes
        this.setCurrentMonthInSelectors();
    },

    // Establecer mes actual en todos los selectores de mes
    setCurrentMonthInSelectors() {
        console.log('Estableciendo mes actual en todos los selectores...');
        const currentMonth = new Date().getMonth() + 1; // getMonth() devuelve 0-11

        const monthSelectors = [
            document.getElementById('dashboard-mes'),
            document.getElementById('monto-mes'),
            document.getElementById('unidades-mes'),
            document.getElementById('creditos-mes')
        ];

        monthSelectors.forEach(selector => {
            if (selector) {
                console.log(`Estableciendo mes ${currentMonth} en selector ${selector.id}`);
                selector.value = currentMonth;
            } else {
                console.log(`Selector no encontrado`);
            }
        });
    },

    // Formatear moneda
    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    },

    // Formatear fecha
    formatDate(dateString) {
        // Asegurarse de que la fecha se interprete correctamente en la zona horaria local
        // Para fechas en formato YYYY-MM-DD, añadimos 'T12:00:00' para evitar problemas con zonas horarias
        let date;
        if (dateString.includes('T')) {
            // Si ya tiene formato ISO completo
            date = new Date(dateString);
        } else {
            // Si es solo YYYY-MM-DD, añadir tiempo para evitar problemas de zona horaria
            date = new Date(dateString + 'T12:00:00');
        }

        return date.toLocaleDateString('es-CO', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
};

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    // Verificar si venimos de la página de agradecimiento
    if (sessionStorage.getItem('fromThanksPage') === 'true') {
        // Limpiar el indicador
        sessionStorage.removeItem('fromThanksPage');

        // Mostrar la página de dashboard después de un breve retraso para permitir que todo se inicialice
        setTimeout(() => {
            App.showPage('dashboard');
        }, 100);
    }

    // Verificar si hay un hash en la URL (por ejemplo, #dashboard)
    if (window.location.hash) {
        const pageName = window.location.hash.substring(1); // Eliminar el símbolo #
        setTimeout(() => {
            App.showPage(pageName);
        }, 100);
    }

    // Forzar actualización de datos después de un tiempo para asegurar que todo se muestre correctamente
    setTimeout(async () => {
        console.log('Forzando actualización de datos desde el evento DOMContentLoaded...');

        // Obtener mes y año actuales
        const currentDate = new Date();
        const mes = currentDate.getMonth() + 1;
        const anio = currentDate.getFullYear();

        // Forzar actualización específica de la tarjeta de objetivo mensual
        if (Dashboard && typeof Dashboard.forceMonthlyGoalCardUpdate === 'function') {
            await Dashboard.forceMonthlyGoalCardUpdate(mes, anio);
        }

        // Forzar actualización general de datos
        if (Dashboard && typeof Dashboard.forceDataRefresh === 'function') {
            await Dashboard.forceDataRefresh();
        }
    }, 2000);
});
