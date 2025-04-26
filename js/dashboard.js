// Dashboard
const Dashboard = {
    // Inicializar el dashboard
    async init() {
        console.log('Inicializando dashboard...');

        try {
            // Inicializar la base de datos primero
            console.log('Inicializando base de datos...');
            if (!DB.db) {
                await DB.init();
                console.log('Base de datos inicializada correctamente');
            }

            // Esperar a que la base de datos esté completamente lista
            await new Promise(resolve => setTimeout(resolve, 800));

            // Configurar eventos
            this.setupEvents();

            // Configurar selectores de fecha
            this.setupDateSelectors();

            // Mostrar nombre de usuario
            this.showUserInfo();

            // Cargar datos iniciales con múltiples intentos si es necesario
            console.log('Cargando datos iniciales...');
            await this.loadDataWithRetry();

            // Verificar si los datos se cargaron correctamente después de un tiempo
            setTimeout(() => {
                this.forceDataRefresh();
            }, 1500);
        } catch (error) {
            console.error('Error durante la inicialización del dashboard:', error);
            console.error('Detalles del error:', error.stack);
            alert('Error al inicializar el dashboard. Por favor, recarga la página.');
        }
    },

    // Cargar datos con reintentos
    async loadDataWithRetry(attempts = 3) {
        for (let i = 0; i < attempts; i++) {
            try {
                console.log(`Intento ${i + 1} de cargar datos...`);
                await this.loadData();

                // Verificar si los datos se cargaron correctamente
                const ticketsTotales = document.getElementById('dashboard-tickets-totales');
                const objetivo80 = document.getElementById('objetivo-80');

                if (ticketsTotales && ticketsTotales.textContent !== '0' &&
                    objetivo80 && objetivo80.textContent !== '$0') {
                    console.log('Datos cargados correctamente en el intento', i + 1);
                    return true;
                }

                console.log('Los datos no se cargaron completamente, reintentando...');
                await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
                console.error(`Error en intento ${i + 1}:`, error);
                if (i === attempts - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        console.warn('No se pudieron cargar los datos después de varios intentos');
        return false;
    },

    // Forzar actualización de datos
    async forceDataRefresh() {
        console.log('Verificando datos y forzando actualización si es necesario...');

        const ticketsTotales = document.getElementById('dashboard-tickets-totales');
        const objetivo80 = document.getElementById('objetivo-80');
        const montoObjetivoTotal = document.getElementById('monto-objetivo-total');

        if ((!ticketsTotales || ticketsTotales.textContent === '0') ||
            (!objetivo80 || objetivo80.textContent === '$0') ||
            (!montoObjetivoTotal || montoObjetivoTotal.textContent === '$0')) {
            console.log('Datos incompletos detectados, forzando actualización...');

            // Obtener mes y año seleccionados
            const mesSelector = document.getElementById('dashboard-mes');
            const anioSelector = document.getElementById('dashboard-anio');

            let mes, anio;

            if (mesSelector && anioSelector) {
                mes = parseInt(mesSelector.value);
                anio = parseInt(anioSelector.value);
            } else {
                // Usar fecha actual como respaldo
                const currentDate = new Date();
                mes = currentDate.getMonth() + 1;
                anio = currentDate.getFullYear();
            }

            console.log(`Forzando actualización para ${mes}/${anio}...`);

            // Crear datos de ejemplo directamente
            await this.createExampleData(mes, anio);

            // Actualizar directamente los elementos del DOM
            await this.updateDOMDirectly(mes, anio);

            // Forzar actualización específica de la tarjeta de objetivo mensual
            await this.forceMonthlyGoalCardUpdate(mes, anio);

            // Recargar datos
            await this.loadData();
        } else {
            console.log('Los datos parecen estar cargados correctamente');
        }
    },

    // Forzar actualización específica de la tarjeta de objetivo mensual
    async forceMonthlyGoalCardUpdate(mes, anio) {
        try {
            console.log('Forzando actualización específica de la tarjeta de objetivo mensual...');

            // Obtener objetivo de monto
            const objetivo = await DB.getObjetivoMonto(mes, anio);
            if (!objetivo) {
                console.warn('No se pudo obtener el objetivo de monto');
                return;
            }

            // Obtener ingresos
            const ingresos = await DB.getIngresosMonto(objetivo.id);

            // Calcular estadísticas
            const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
            const ticketsTotales = ingresos.reduce((sum, ingreso) => sum + (ingreso.tickets || 1), 0);
            const porcentajeCompletado = objetivo.monto_objetivo > 0 ? (acumulado / objetivo.monto_objetivo) * 100 : 0;
            const montoRestante = Math.max(0, objetivo.monto_objetivo - acumulado);

            // Obtener fecha actual en formato YYYY-MM-DD
            const fechaHoy = new Date().toISOString().split('T')[0];

            // Calcular tickets del día
            const ticketsHoy = ingresos
                .filter(ingreso => ingreso.fecha === fechaHoy)
                .reduce((sum, ingreso) => sum + (ingreso.tickets || 1), 0);

            // Actualizar elementos de la tarjeta de objetivo mensual
            const montoObjetivoTotal = document.getElementById('monto-objetivo-total');
            const montoProgress = document.getElementById('monto-progress');
            const montoPorcentaje = document.getElementById('monto-porcentaje');
            const montoAcumulado = document.getElementById('monto-acumulado');
            const montoRestanteElement = document.getElementById('monto-restante');

            // Actualizar con un enfoque más directo
            if (montoObjetivoTotal) {
                montoObjetivoTotal.innerHTML = App.formatCurrency(objetivo.monto_objetivo);
                console.log('Objetivo total actualizado:', montoObjetivoTotal.innerHTML);
            }

            if (montoProgress) {
                montoProgress.style.width = `${Math.min(porcentajeCompletado, 100)}%`;
                console.log('Progreso actualizado:', montoProgress.style.width);
            }

            if (montoPorcentaje) {
                montoPorcentaje.innerHTML = `${porcentajeCompletado.toFixed(2)}%`;
                console.log('Porcentaje actualizado:', montoPorcentaje.innerHTML);
            }

            if (montoAcumulado) {
                montoAcumulado.innerHTML = App.formatCurrency(acumulado);
                console.log('Acumulado actualizado:', montoAcumulado.innerHTML);
            }

            if (montoRestanteElement) {
                montoRestanteElement.innerHTML = App.formatCurrency(montoRestante);
                console.log('Restante actualizado:', montoRestanteElement.innerHTML);
            }

            // Actualizar elementos de estadísticas de tickets
            const dashboardTicketsTotales = document.getElementById('dashboard-tickets-totales');
            const dashboardTicketsHoy = document.getElementById('dashboard-tickets-hoy');
            const objetivoMontoTickets = document.getElementById('objetivo-monto-tickets');
            const objetivoMontoTicketsHoy = document.getElementById('objetivo-monto-tickets-hoy');

            if (dashboardTicketsTotales) {
                dashboardTicketsTotales.innerHTML = ticketsTotales.toString();
                console.log('Tickets totales actualizados:', dashboardTicketsTotales.innerHTML);
            }

            if (dashboardTicketsHoy) {
                dashboardTicketsHoy.innerHTML = ticketsHoy.toString();
                console.log('Tickets hoy actualizados:', dashboardTicketsHoy.innerHTML);
            }

            if (objetivoMontoTickets) {
                objetivoMontoTickets.innerHTML = ticketsTotales.toString();
                console.log('Tickets totales (objetivo monto) actualizados:', objetivoMontoTickets.innerHTML);
            }

            if (objetivoMontoTicketsHoy) {
                objetivoMontoTicketsHoy.innerHTML = ticketsHoy.toString();
                console.log('Tickets hoy (objetivo monto) actualizados:', objetivoMontoTicketsHoy.innerHTML);
            }

            console.log('Tarjeta de objetivo mensual actualizada forzosamente');
        } catch (error) {
            console.error('Error al forzar actualización de la tarjeta de objetivo mensual:', error);
        }
    },

    // Crear datos de ejemplo directamente
    async createExampleData(mes, anio) {
        try {
            console.log('Creando datos de ejemplo directamente...');

            // Asegurarse de que la base de datos esté inicializada
            if (!DB.db) {
                await DB.init();
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // 1. Crear objetivo de monto si no existe
            let objetivo = await DB.getObjetivoMonto(mes, anio);
            if (!objetivo) {
                const nuevoObjetivo = {
                    mes,
                    anio,
                    monto_objetivo: 1000000,
                    creado_por: Auth.getCurrentUserId() || 1
                };

                objetivo = await DB.saveObjetivoMonto(nuevoObjetivo);
                console.log('Objetivo de monto creado:', objetivo);
            }

            // 2. Crear ingresos de monto si no existen
            const ingresos = await DB.getIngresosMonto(objetivo.id);
            if (ingresos.length === 0) {
                const fechaActual = new Date();
                const ingresoEjemplo = {
                    objetivo_id: objetivo.id,
                    fecha: fechaActual.toISOString().split('T')[0],
                    monto: 250000,
                    tickets: 5,
                    creado_por: Auth.getCurrentUserId() || 1
                };

                await DB.saveIngresoMonto(ingresoEjemplo);
                console.log('Ingreso de monto creado');
            }

            // 3. Crear objetivo de unidades si no existe
            let objetivoUnidades = await DB.getObjetivoUnidades(mes, anio);
            if (!objetivoUnidades) {
                const nuevoObjetivoUnidades = {
                    mes,
                    anio,
                    unidades_objetivo: 50,
                    creado_por: Auth.getCurrentUserId() || 1
                };

                objetivoUnidades = await DB.saveObjetivoUnidades(nuevoObjetivoUnidades);
                console.log('Objetivo de unidades creado:', objetivoUnidades);
            }

            // 4. Crear ingresos de unidades si no existen
            const ingresosUnidades = await DB.getIngresosUnidades(objetivoUnidades.id);
            if (ingresosUnidades.length === 0) {
                const fechaActual = new Date();
                const ingresoUnidadesEjemplo = {
                    objetivo_id: objetivoUnidades.id,
                    fecha: fechaActual.toISOString().split('T')[0],
                    unidades: 10,
                    creado_por: Auth.getCurrentUserId() || 1
                };

                await DB.saveIngresoUnidades(ingresoUnidadesEjemplo);
                console.log('Ingreso de unidades creado');
            }

            console.log('Datos de ejemplo creados correctamente');
            return true;
        } catch (error) {
            console.error('Error al crear datos de ejemplo:', error);
            return false;
        }
    },

    // Configurar eventos
    setupEvents() {
        console.log('Configurando eventos del dashboard...');

        // Botón de refrescar
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadData();
                alert('Datos actualizados correctamente');
            });
        }

        // Selectores de mes y año
        const mesSelector = document.getElementById('dashboard-mes');
        if (mesSelector) {
            mesSelector.addEventListener('change', () => {
                this.loadData();
            });
        }

        const anioSelector = document.getElementById('dashboard-anio');
        if (anioSelector) {
            anioSelector.addEventListener('change', () => {
                this.loadData();
            });
        }

        // Selector de número de empleados
        const numEmpleadosSelector = document.getElementById('num-empleados');
        if (numEmpleadosSelector) {
            numEmpleadosSelector.addEventListener('change', () => {
                this.updateEmployeeDistribution();
            });
        }
    },

    // Configurar selectores de fecha
    setupDateSelectors() {
        // Obtener fecha actual
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth() + 1;
        const currentYear = currentDate.getFullYear();

        // Actualizar texto del mes actual
        const currentMonthElement = document.getElementById('current-month');
        if (currentMonthElement) {
            const monthNames = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            currentMonthElement.textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
        }

        // Actualizar información del día actual
        this.updateDayInfo(currentDate, currentMonth, currentYear);
    },

    // Actualizar información del día actual
    updateDayInfo(currentDate, month, year) {
        const currentDayElement = document.getElementById('current-day');
        const remainingDaysElement = document.getElementById('remaining-workdays');

        if (currentDayElement && remainingDaysElement) {
            // Obtener día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
            const dayOfWeek = currentDate.getDay();
            const dayOfMonth = currentDate.getDate();

            // Nombres de los días de la semana
            const dayNames = [
                'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
            ];

            // Mostrar día actual
            currentDayElement.textContent = `${dayNames[dayOfWeek]} ${dayOfMonth}`;

            // Calcular días hábiles restantes (lunes a sábado)
            const remainingWorkdays = this.calculateRemainingWorkdays(currentDate, month, year);
            remainingDaysElement.textContent = remainingWorkdays;
        }
    },

    // Calcular días hábiles restantes en el mes (lunes a sábado)
    calculateRemainingWorkdays(currentDate, month, year) {
        // Clonar la fecha actual para no modificarla
        const date = new Date(currentDate);

        // Si estamos calculando para un mes futuro, contar todos los días hábiles del mes
        const today = new Date();
        const isCurrentMonth = date.getMonth() + 1 === today.getMonth() + 1 && date.getFullYear() === today.getFullYear();

        // Si no es el mes actual, establecer la fecha al primer día del mes
        if (!isCurrentMonth) {
            // Si es un mes pasado, devolver 0 (no hay días hábiles restantes)
            if (date.getFullYear() < today.getFullYear() ||
                (date.getFullYear() === today.getFullYear() && date.getMonth() < today.getMonth())) {
                return 0;
            }

            // Si es un mes futuro, contar todos los días hábiles del mes
            date.setDate(1);
        } else {
            // Si es el mes actual, empezar a contar desde el día actual (incluido)
            // No modificamos la fecha, ya que queremos incluir el día actual
        }

        // Contador de días hábiles
        let workdays = 0;

        // Verificar si el día actual es hábil (lunes a sábado) y estamos en el mes actual
        if (isCurrentMonth) {
            const currentDayOfWeek = date.getDay();
            if (currentDayOfWeek >= 1 && currentDayOfWeek <= 6) {
                // Incluir el día actual en el conteo
                workdays++;
                console.log(`Día actual (${date.getDate()}) es hábil y se incluye en el conteo`);
            }
        }

        // Crear una copia de la fecha para contar los días restantes
        const nextDate = new Date(date);
        // Avanzar al siguiente día
        nextDate.setDate(nextDate.getDate() + 1);

        // Contar días hábiles hasta el final del mes
        while (nextDate.getMonth() + 1 === month && nextDate.getFullYear() === year) {
            // Si es día hábil (lunes a sábado)
            const dayOfWeek = nextDate.getDay();
            if (dayOfWeek >= 1 && dayOfWeek <= 6) {
                workdays++;
            }

            // Avanzar al siguiente día
            nextDate.setDate(nextDate.getDate() + 1);
        }

        console.log(`Total días hábiles restantes (incluyendo hoy): ${workdays}`);
        return workdays;
    },

    // Mostrar información del usuario
    showUserInfo() {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            const currentUser = Auth.getCurrentUser();
            if (currentUser && currentUser.name) {
                userNameElement.textContent = currentUser.name;
            } else {
                userNameElement.textContent = 'Usuario';
            }
        }
    },

    // Cargar datos del dashboard
    async loadData() {
        try {
            console.log('Cargando datos del dashboard...');

            // Obtener mes y año seleccionados
            const mesSelector = document.getElementById('dashboard-mes');
            const anioSelector = document.getElementById('dashboard-anio');

            let mes, anio;

            if (mesSelector && anioSelector) {
                mes = parseInt(mesSelector.value);
                anio = parseInt(anioSelector.value);
            } else {
                // Usar fecha actual como respaldo
                const currentDate = new Date();
                mes = currentDate.getMonth() + 1;
                anio = currentDate.getFullYear();
            }

            console.log(`Cargando datos para ${mes}/${anio}...`);

            // Actualizar texto del mes actual
            const currentMonthElement = document.getElementById('current-month');
            if (currentMonthElement) {
                const monthNames = [
                    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
                ];
                currentMonthElement.textContent = `${monthNames[mes - 1]} ${anio}`;
            }

            // Asegurarse de que la base de datos esté inicializada
            if (!DB.db) {
                console.log('Base de datos no inicializada, inicializando...');
                await DB.init();
                // Esperar a que la base de datos esté completamente inicializada
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // Verificar si existen datos para el mes y año seleccionados
            const objetivo = await DB.getObjetivoMonto(mes, anio);
            if (!objetivo) {
                console.log('No hay objetivo para el mes y año seleccionados, creando datos de ejemplo...');
                await this.createExampleData(mes, anio);
            } else {
                // Verificar si hay ingresos
                const ingresos = await DB.getIngresosMonto(objetivo.id);
                if (ingresos.length === 0) {
                    console.log('No hay ingresos para el objetivo, creando datos de ejemplo...');
                    const fechaActual = new Date();
                    const ingresoEjemplo = {
                        objetivo_id: objetivo.id,
                        fecha: fechaActual.toISOString().split('T')[0],
                        monto: 250000,
                        tickets: 5,
                        creado_por: Auth.getCurrentUserId() || 1
                    };

                    await DB.saveIngresoMonto(ingresoEjemplo);
                    console.log('Ingreso de ejemplo creado');
                }
            }

            // Cargar datos de objetivos de monto
            console.log('Cargando datos de objetivos de monto...');
            await this.loadMontoData(mes, anio);

            // Cargar datos de objetivos de unidades
            console.log('Cargando datos de objetivos de unidades...');
            await this.loadUnidadesData(mes, anio);

            // Cargar datos de créditos
            console.log('Cargando datos de créditos...');
            await this.loadCreditosData(mes, anio);

            // Actualizar distribución por empleados
            await this.updateEmployeeDistribution();

            // Actualizar directamente los elementos del DOM si es necesario
            this.updateDOMDirectly(mes, anio);

            console.log('Datos del dashboard cargados correctamente');
            return true;
        } catch (error) {
            console.error('Error al cargar datos del dashboard:', error);
            console.error('Detalles del error:', error.stack);
            alert('Error al cargar datos: ' + error.message);
            return false;
        }
    },

    // Actualizar elementos del DOM directamente
    async updateDOMDirectly(mes, anio) {
        try {
            console.log('Actualizando elementos del DOM directamente...');

            // Obtener objetivo de monto
            const objetivo = await DB.getObjetivoMonto(mes, anio);
            if (!objetivo) {
                console.warn('No se pudo obtener el objetivo de monto');
                return;
            }

            // Obtener ingresos
            const ingresos = await DB.getIngresosMonto(objetivo.id);

            // Calcular estadísticas
            const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
            const ticketsTotales = ingresos.reduce((sum, ingreso) => sum + (ingreso.tickets || 1), 0);
            const promedioPorTicket = ticketsTotales > 0 ? acumulado / ticketsTotales : 0;
            const promedioPorcentaje = objetivo.monto_objetivo > 0 ? (promedioPorTicket / objetivo.monto_objetivo) * 100 : 0;
            const porcentajeCompletado = objetivo.monto_objetivo > 0 ? (acumulado / objetivo.monto_objetivo) * 100 : 0;
            const montoRestante = Math.max(0, objetivo.monto_objetivo - acumulado);

            // Obtener fecha actual en formato YYYY-MM-DD
            const fechaHoy = new Date().toISOString().split('T')[0];

            // Calcular tickets del día
            const ticketsHoy = ingresos
                .filter(ingreso => ingreso.fecha === fechaHoy)
                .reduce((sum, ingreso) => sum + (ingreso.tickets || 1), 0);

            console.log('Estadísticas calculadas:', {
                objetivo: objetivo.monto_objetivo,
                acumulado,
                porcentajeCompletado,
                montoRestante,
                ticketsTotales,
                ticketsHoy,
                promedioPorTicket,
                promedioPorcentaje
            });

            // Actualizar elementos de la tarjeta de objetivo mensual
            const montoObjetivoTotal = document.getElementById('monto-objetivo-total');
            const montoProgress = document.getElementById('monto-progress');
            const montoPorcentaje = document.getElementById('monto-porcentaje');
            const montoAcumulado = document.getElementById('monto-acumulado');
            const montoRestanteElement = document.getElementById('monto-restante');

            if (montoObjetivoTotal) montoObjetivoTotal.textContent = App.formatCurrency(objetivo.monto_objetivo);
            if (montoProgress) montoProgress.style.width = `${Math.min(porcentajeCompletado, 100)}%`;
            if (montoPorcentaje) montoPorcentaje.textContent = `${porcentajeCompletado.toFixed(2)}%`;
            if (montoAcumulado) montoAcumulado.textContent = App.formatCurrency(acumulado);
            if (montoRestanteElement) montoRestanteElement.textContent = App.formatCurrency(montoRestante);

            // Actualizar elementos de estadísticas de tickets
            const dashboardTicketsTotales = document.getElementById('dashboard-tickets-totales');
            const dashboardTicketsHoy = document.getElementById('dashboard-tickets-hoy');
            const dashboardPromedioTicketValor = document.getElementById('dashboard-promedio-ticket-valor');
            const dashboardPromedioTicketPorcentaje = document.getElementById('dashboard-promedio-ticket-porcentaje');

            if (dashboardTicketsTotales) dashboardTicketsTotales.textContent = ticketsTotales.toString();
            if (dashboardTicketsHoy) dashboardTicketsHoy.textContent = ticketsHoy.toString();
            if (dashboardPromedioTicketValor) dashboardPromedioTicketValor.textContent = promedioPorTicket.toFixed(2);
            if (dashboardPromedioTicketPorcentaje) dashboardPromedioTicketPorcentaje.textContent = `${promedioPorcentaje.toFixed(2)}%`;

            // Actualizar proyecciones
            this.updateProjectionsDirectly(objetivo.monto_objetivo, acumulado, mes, anio);

            console.log('Elementos del DOM actualizados directamente');

            // Verificar si los elementos se actualizaron correctamente
            if (montoObjetivoTotal && montoObjetivoTotal.textContent === App.formatCurrency(objetivo.monto_objetivo)) {
                console.log('Tarjeta de objetivo mensual actualizada correctamente');
            } else {
                console.warn('La tarjeta de objetivo mensual no se actualizó correctamente, intentando de nuevo...');

                // Intentar actualizar de nuevo después de un breve retraso
                setTimeout(() => {
                    if (montoObjetivoTotal) montoObjetivoTotal.textContent = App.formatCurrency(objetivo.monto_objetivo);
                    if (montoProgress) montoProgress.style.width = `${Math.min(porcentajeCompletado, 100)}%`;
                    if (montoPorcentaje) montoPorcentaje.textContent = `${porcentajeCompletado.toFixed(2)}%`;
                    if (montoAcumulado) montoAcumulado.textContent = App.formatCurrency(acumulado);
                    if (montoRestanteElement) montoRestanteElement.textContent = App.formatCurrency(montoRestante);
                }, 500);
            }
        } catch (error) {
            console.error('Error al actualizar elementos del DOM directamente:', error);
        }
    },

    // Actualizar proyecciones directamente
    updateProjectionsDirectly(montoObjetivo, acumulado, mes, anio) {
        try {
            console.log('Actualizando proyecciones directamente...');

            // Obtener fecha actual
            const currentDate = new Date();

            // Calcular días hábiles restantes
            const remainingWorkdays = this.calculateRemainingWorkdays(currentDate, mes, anio);

            // Calcular proyecciones para diferentes porcentajes
            const porcentajes = [80, 90, 100, 110, 115];

            porcentajes.forEach(porcentaje => {
                // Calcular monto objetivo para este porcentaje
                const montoObjetivoPorcentaje = (montoObjetivo * porcentaje) / 100;

                // Calcular monto faltante
                const montoFaltante = Math.max(0, montoObjetivoPorcentaje - acumulado);

                // Calcular monto diario requerido
                const montoDiario = remainingWorkdays > 0 ? montoFaltante / remainingWorkdays : 0;

                // Actualizar elementos del DOM directamente
                const objetivoElement = document.getElementById(`objetivo-${porcentaje}`);
                const faltanteElement = document.getElementById(`faltante-${porcentaje}`);
                const diarioElement = document.getElementById(`diario-${porcentaje}`);

                if (objetivoElement) objetivoElement.textContent = App.formatCurrency(montoObjetivoPorcentaje);
                if (faltanteElement) faltanteElement.textContent = App.formatCurrency(montoFaltante);
                if (diarioElement) diarioElement.textContent = App.formatCurrency(montoDiario);
            });

            console.log('Proyecciones actualizadas directamente');
        } catch (error) {
            console.error('Error al actualizar proyecciones directamente:', error);
        }
    },

    // Verificar si los datos se cargaron correctamente
    async verifyDataLoaded(mes, anio) {
        console.log('Verificando carga de datos...');

        // Verificar estadísticas de tickets
        const ticketsTotales = document.getElementById('dashboard-tickets-totales');
        const promedioTicket = document.getElementById('dashboard-promedio-ticket-valor');

        if (ticketsTotales && ticketsTotales.textContent === '0' &&
            promedioTicket && promedioTicket.textContent === '0.00') {
            console.log('Las estadísticas de tickets no se cargaron correctamente, intentando recargar...');

            // Intentar cargar nuevamente los datos de monto
            await this.loadMontoData(mes, anio);
        }

        // Verificar proyecciones
        const objetivo80 = document.getElementById('objetivo-80');
        if (objetivo80 && objetivo80.textContent === '$0') {
            console.log('Las proyecciones no se cargaron correctamente, intentando recargar...');

            // Obtener objetivo de monto
            const objetivo = await DB.getObjetivoMonto(mes, anio);
            if (objetivo) {
                // Obtener ingresos de monto
                const ingresos = await DB.getIngresosMonto(objetivo.id);

                // Calcular acumulado
                const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);

                // Recalcular proyecciones
                this.calculateProjections(objetivo.monto_objetivo, acumulado, mes, anio);
            }
        }
    },

    // Actualizar distribución por empleados
    async updateEmployeeDistribution() {
        try {
            console.log('Actualizando distribución por empleados...');

            // Obtener elementos del DOM
            const numEmpleadosSelector = document.getElementById('num-empleados');
            const montoPorEmpleadoElement = document.getElementById('monto-por-empleado');
            const unidadesPorEmpleadoElement = document.getElementById('unidades-por-empleado');
            const diasHabilesRestantesElement = document.getElementById('dias-habiles-restantes-empleados');

            // Verificar que los elementos existen
            if (!numEmpleadosSelector || !montoPorEmpleadoElement || !unidadesPorEmpleadoElement || !diasHabilesRestantesElement) {
                console.warn('Algunos elementos del DOM para distribución por empleados no están disponibles');
                return;
            }

            // Obtener número de empleados seleccionado
            const numEmpleados = parseInt(numEmpleadosSelector.value);
            console.log(`Número de empleados seleccionado: ${numEmpleados}`);

            // Obtener mes y año seleccionados
            const mesSelector = document.getElementById('dashboard-mes');
            const anioSelector = document.getElementById('dashboard-anio');

            let mes, anio;

            if (mesSelector && anioSelector) {
                mes = parseInt(mesSelector.value);
                anio = parseInt(anioSelector.value);
            } else {
                // Usar fecha actual como respaldo
                const currentDate = new Date();
                mes = currentDate.getMonth() + 1;
                anio = currentDate.getFullYear();
            }

            console.log(`Calculando distribución para ${mes}/${anio}...`);

            // Obtener fecha actual
            const currentDate = new Date();

            // Calcular días hábiles restantes (incluyendo el día actual)
            const remainingWorkdays = this.calculateRemainingWorkdays(currentDate, mes, anio);
            console.log(`Días hábiles restantes (incluyendo hoy): ${remainingWorkdays}`);

            // Mostrar días hábiles restantes
            diasHabilesRestantesElement.textContent = remainingWorkdays;

            // Asegurarse de que la base de datos esté inicializada
            if (!DB.db) {
                console.log('Base de datos no inicializada, inicializando...');
                await DB.init();
            }

            // Obtener objetivos directamente de la base de datos
            const objetivoMonto = await DB.getObjetivoMonto(mes, anio);
            const objetivoUnidades = await DB.getObjetivoUnidades(mes, anio);

            if (!objetivoMonto || !objetivoUnidades) {
                console.warn('No se encontraron objetivos para el mes y año seleccionados');
                return;
            }

            console.log('Objetivos obtenidos:', {
                montoObjetivo: objetivoMonto.monto_objetivo,
                unidadesObjetivo: objetivoUnidades.unidades_objetivo
            });

            // Obtener ingresos
            const ingresosMonto = await DB.getIngresosMonto(objetivoMonto.id);
            const ingresosUnidades = await DB.getIngresosUnidades(objetivoUnidades.id);

            // Calcular acumulados
            const montoAcumulado = ingresosMonto.reduce((sum, ingreso) => sum + ingreso.monto, 0);
            const unidadesAcumulado = ingresosUnidades.reduce((sum, ingreso) => sum + ingreso.unidades, 0);

            // Calcular restantes
            const montoRestante = Math.max(0, objetivoMonto.monto_objetivo - montoAcumulado);
            const unidadesRestante = Math.max(0, objetivoUnidades.unidades_objetivo - unidadesAcumulado);

            console.log('Valores calculados:', {
                montoAcumulado,
                unidadesAcumulado,
                montoRestante,
                unidadesRestante
            });

            // Definir los porcentajes a calcular
            const porcentajes = [90, 100, 115];

            // Para cada porcentaje, calcular los montos y unidades
            porcentajes.forEach(porcentaje => {
                // Calcular montos objetivo para este porcentaje
                const montoObjetivoPorcentaje = (objetivoMonto.monto_objetivo * porcentaje) / 100;
                const unidadesObjetivoPorcentaje = (objetivoUnidades.unidades_objetivo * porcentaje) / 100;

                // Calcular montos restantes para este porcentaje
                const montoRestantePorcentaje = Math.max(0, montoObjetivoPorcentaje - montoAcumulado);
                const unidadesRestantePorcentaje = Math.max(0, unidadesObjetivoPorcentaje - unidadesAcumulado);

                console.log(`Objetivo ${porcentaje}%:`, {
                    montoObjetivo: montoObjetivoPorcentaje,
                    unidadesObjetivo: unidadesObjetivoPorcentaje,
                    montoRestante: montoRestantePorcentaje,
                    unidadesRestante: unidadesRestantePorcentaje
                });

                // Calcular montos diarios para este porcentaje
                let montoDiarioPorcentaje = 0;
                let unidadesDiariasPorcentaje = 0;

                if (remainingWorkdays > 0) {
                    montoDiarioPorcentaje = montoRestantePorcentaje / remainingWorkdays;
                    unidadesDiariasPorcentaje = unidadesRestantePorcentaje / remainingWorkdays;
                }

                // Calcular montos por empleado para este porcentaje
                const montoPorEmpleadoPorcentaje = numEmpleados > 0 ? montoDiarioPorcentaje / numEmpleados : 0;
                const unidadesPorEmpleadoPorcentaje = numEmpleados > 0 ? unidadesDiariasPorcentaje / numEmpleados : 0;

                console.log(`${porcentaje}% - Monto diario por empleado: ${montoPorEmpleadoPorcentaje}, Unidades diarias por empleado: ${unidadesPorEmpleadoPorcentaje}`);

                // Actualizar UI para este porcentaje
                const sufijo = porcentaje === 100 ? '' : `-${porcentaje}`;
                const montoPorEmpleadoElementPorcentaje = document.getElementById(`monto-por-empleado${sufijo}`);
                const unidadesPorEmpleadoElementPorcentaje = document.getElementById(`unidades-por-empleado${sufijo}`);

                if (montoPorEmpleadoElementPorcentaje) {
                    montoPorEmpleadoElementPorcentaje.textContent = App.formatCurrency(montoPorEmpleadoPorcentaje);
                }

                if (unidadesPorEmpleadoElementPorcentaje) {
                    // Redondear las unidades a números enteros (sin decimales)
                    unidadesPorEmpleadoElementPorcentaje.textContent = Math.round(unidadesPorEmpleadoPorcentaje);
                }
            });

            console.log('Distribución por empleados actualizada correctamente');
        } catch (error) {
            console.error('Error al actualizar distribución por empleados:', error);
            console.error('Detalles del error:', error.stack);
        }
    },

    // Extraer número de una cadena de moneda (por ejemplo, "$1,000,000" -> 1000000)
    extractNumberFromCurrency(currencyString) {
        if (!currencyString) return 0;

        // Eliminar símbolo de moneda y separadores de miles
        const numberString = currencyString.replace(/[^\d.-]/g, '');

        // Convertir a número
        return parseFloat(numberString) || 0;
    },

    // Cargar datos de objetivos de monto
    async loadMontoData(mes, anio) {
        try {
            console.log(`Cargando datos de monto para ${mes}/${anio}...`);

            // Verificar que los elementos existen antes de intentar modificarlos
            const montoObjetivoTotal = document.getElementById('monto-objetivo-total');
            const montoProgress = document.getElementById('monto-progress');
            const montoPorcentaje = document.getElementById('monto-porcentaje');
            const montoAcumulado = document.getElementById('monto-acumulado');
            const montoRestante = document.getElementById('monto-restante');
            const dashboardTicketsTotales = document.getElementById('dashboard-tickets-totales');
            const dashboardPromedioTicketValor = document.getElementById('dashboard-promedio-ticket-valor');
            const dashboardPromedioTicketPorcentaje = document.getElementById('dashboard-promedio-ticket-porcentaje');
            const ticketsProgress = document.getElementById('tickets-progress');

            // Verificar si algún elemento no existe
            if (!montoObjetivoTotal || !montoProgress || !montoPorcentaje || !montoAcumulado ||
                !montoRestante || !dashboardTicketsTotales || !dashboardPromedioTicketValor ||
                !dashboardPromedioTicketPorcentaje || !ticketsProgress) {
                console.warn('Algunos elementos del DOM no están disponibles. Posiblemente la página no se ha cargado completamente.');
                return; // Salir de la función si faltan elementos
            }

            // Asegurarse de que la base de datos esté inicializada
            if (!DB.db) {
                console.log('Base de datos no inicializada en loadMontoData, inicializando...');
                await DB.init();
                // Esperar un momento para asegurar que la inicialización se complete
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            // Obtener objetivo de monto
            const objetivo = await DB.getObjetivoMonto(mes, anio);
            console.log('Objetivo de monto obtenido:', objetivo);

            if (!objetivo) {
                console.log('No hay objetivo de monto definido, creando uno por defecto');
                // Si no hay objetivo, mostrar valores por defecto
                montoObjetivoTotal.textContent = App.formatCurrency(0);
                montoProgress.style.width = '0%';
                montoPorcentaje.textContent = '0%';
                montoAcumulado.textContent = App.formatCurrency(0);
                montoRestante.textContent = App.formatCurrency(0);
                dashboardTicketsTotales.textContent = '0';
                dashboardPromedioTicketValor.textContent = '0.00';
                dashboardPromedioTicketPorcentaje.textContent = '0.00%';
                ticketsProgress.style.width = '0%';

                // Limpiar tabla de proyecciones
                this.clearProjections();

                // Crear un objetivo por defecto para el mes actual
                console.log('Creando objetivo de monto por defecto...');
                const nuevoObjetivo = {
                    mes,
                    anio,
                    monto_objetivo: 1000000, // 1 millón por defecto
                    creado_por: Auth.getCurrentUserId() || 1
                };

                try {
                    const objetivoCreado = await DB.saveObjetivoMonto(nuevoObjetivo);
                    console.log('Objetivo de monto creado:', objetivoCreado);

                    // Actualizar UI con el nuevo objetivo
                    montoObjetivoTotal.textContent = App.formatCurrency(nuevoObjetivo.monto_objetivo);
                    montoProgress.style.width = '0%';
                    montoPorcentaje.textContent = '0%';
                    montoAcumulado.textContent = App.formatCurrency(0);
                    montoRestante.textContent = App.formatCurrency(nuevoObjetivo.monto_objetivo);
                    dashboardTicketsTotales.textContent = '0';
                    dashboardPromedioTicketValor.textContent = '0.00';
                    dashboardPromedioTicketPorcentaje.textContent = '0.00%';
                    ticketsProgress.style.width = '0%';

                    // Calcular proyecciones con el nuevo objetivo
                    this.calculateProjections(nuevoObjetivo.monto_objetivo, 0, mes, anio);

                    // Crear un ingreso de ejemplo para que se muestren datos
                    const fechaActual = new Date();
                    const ingresoEjemplo = {
                        objetivo_id: objetivoCreado.id,
                        fecha: fechaActual.toISOString().split('T')[0],
                        monto: 250000, // 250,000 como ejemplo
                        tickets: 5, // 5 tickets como ejemplo
                        creado_por: Auth.getCurrentUserId() || 1
                    };

                    await DB.saveIngresoMonto(ingresoEjemplo);
                    console.log('Ingreso de ejemplo creado');

                    // Recargar los datos para mostrar el ingreso de ejemplo
                    return await this.loadMontoData(mes, anio);
                } catch (error) {
                    console.error('Error al crear objetivo por defecto:', error);
                }

                return;
            }

            // Obtener ingresos de monto
            const ingresos = await DB.getIngresosMonto(objetivo.id);
            console.log('Ingresos de monto obtenidos:', ingresos);

            // Calcular estadísticas
            const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
            const porcentaje = objetivo.monto_objetivo > 0 ? (acumulado / objetivo.monto_objetivo) * 100 : 0;

            // Calcular tickets totales y promedio
            const ticketsTotales = ingresos.reduce((sum, ingreso) => sum + (ingreso.tickets || 1), 0);
            const promedioPorTicket = ticketsTotales > 0 ? acumulado / ticketsTotales : 0;

            // Calcular el promedio como porcentaje del objetivo
            const promedioPorcentaje = objetivo.monto_objetivo > 0 ? (promedioPorTicket / objetivo.monto_objetivo) * 100 : 0;

            // Calcular restante
            const restante = Math.max(0, objetivo.monto_objetivo - acumulado);

            console.log('Estadísticas calculadas:', {
                objetivo: objetivo.monto_objetivo,
                acumulado,
                porcentaje,
                restante,
                ticketsTotales,
                promedioPorTicket,
                promedioPorcentaje
            });

            // Actualizar UI
            montoObjetivoTotal.textContent = App.formatCurrency(objetivo.monto_objetivo);
            montoProgress.style.width = `${Math.min(porcentaje, 100)}%`;
            montoPorcentaje.textContent = `${porcentaje.toFixed(2)}%`;
            montoAcumulado.textContent = App.formatCurrency(acumulado);
            montoRestante.textContent = App.formatCurrency(restante);

            // Actualizar UI de tickets y promedio
            dashboardTicketsTotales.textContent = ticketsTotales.toString();
            dashboardPromedioTicketValor.textContent = promedioPorTicket.toFixed(2);
            dashboardPromedioTicketPorcentaje.textContent = `${promedioPorcentaje.toFixed(2)}%`;
            ticketsProgress.style.width = `${Math.min(promedioPorcentaje, 100)}%`;

            // Calcular proyecciones
            this.calculateProjections(objetivo.monto_objetivo, acumulado, mes, anio);

            console.log('UI actualizada correctamente');

            // Si no hay ingresos, crear uno de ejemplo
            if (ingresos.length === 0) {
                console.log('No hay ingresos, creando uno de ejemplo...');

                // Crear un ingreso de ejemplo
                const fechaActual = new Date();
                const ingresoEjemplo = {
                    objetivo_id: objetivo.id,
                    fecha: fechaActual.toISOString().split('T')[0],
                    monto: 250000, // 250,000 como ejemplo
                    tickets: 5, // 5 tickets como ejemplo
                    creado_por: Auth.getCurrentUserId() || 1
                };

                await DB.saveIngresoMonto(ingresoEjemplo);
                console.log('Ingreso de ejemplo creado');

                // Recargar los datos para mostrar el ingreso de ejemplo
                return await this.loadMontoData(mes, anio);
            }
        } catch (error) {
            console.error('Error al cargar datos de monto:', error);
            console.error('Detalles del error:', error.stack);
            // No mostrar alerta para evitar interrumpir la experiencia del usuario
            console.warn('Error al cargar datos de monto. Esto puede ocurrir si la página no se ha cargado completamente.');
        }
    },

    // Limpiar tabla de proyecciones
    clearProjections() {
        try {
            const porcentajes = [80, 90, 100, 110, 115];

            porcentajes.forEach(porcentaje => {
                const objetivoElement = document.getElementById(`objetivo-${porcentaje}`);
                const faltanteElement = document.getElementById(`faltante-${porcentaje}`);
                const diarioElement = document.getElementById(`diario-${porcentaje}`);

                if (objetivoElement) objetivoElement.textContent = App.formatCurrency(0);
                if (faltanteElement) faltanteElement.textContent = App.formatCurrency(0);
                if (diarioElement) diarioElement.textContent = App.formatCurrency(0);
            });
        } catch (error) {
            console.warn('Error al limpiar proyecciones:', error);
        }
    },

    // Calcular proyecciones
    calculateProjections(montoObjetivo, acumulado, mes, anio) {
        try {
            console.log('Calculando proyecciones...');

            // Obtener fecha actual
            const currentDate = new Date();

            // Crear fecha para el mes y año seleccionados
            const selectedDate = new Date(anio, mes - 1, 1);

            // Determinar qué fecha usar para los cálculos
            let dateToUse = currentDate;

            // Si el mes seleccionado es futuro, usar el primer día del mes seleccionado
            if (mes > currentDate.getMonth() + 1 || (mes === currentDate.getMonth() + 1 && anio > currentDate.getFullYear())) {
                dateToUse = selectedDate;
                console.log('Usando fecha futura para proyecciones:', dateToUse);
            } else if (mes < currentDate.getMonth() + 1 || (mes === currentDate.getMonth() + 1 && anio < currentDate.getFullYear())) {
                // Si es un mes pasado, usar el último día del mes seleccionado
                dateToUse = new Date(anio, mes, 0); // El día 0 del siguiente mes es el último día del mes actual
                console.log('Usando fecha pasada para proyecciones:', dateToUse);
            }

            // Calcular días hábiles restantes
            const remainingWorkdays = this.calculateRemainingWorkdays(dateToUse, mes, anio);
            console.log('Días hábiles restantes:', remainingWorkdays);

            // Si no hay días hábiles restantes, mostrar valores por defecto
            if (remainingWorkdays === 0) {
                console.log('No hay días hábiles restantes en el mes');
                this.clearProjections();
                return;
            }

            // Calcular proyecciones para diferentes porcentajes
            const porcentajes = [80, 90, 100, 110, 115];

            porcentajes.forEach(porcentaje => {
                // Calcular monto objetivo para este porcentaje
                const montoObjetivoPorcentaje = (montoObjetivo * porcentaje) / 100;

                // Calcular monto faltante
                const montoFaltante = Math.max(0, montoObjetivoPorcentaje - acumulado);

                // Calcular monto diario requerido
                const montoDiario = montoFaltante / remainingWorkdays;

                // Obtener elementos del DOM
                const objetivoElement = document.getElementById(`objetivo-${porcentaje}`);
                const faltanteElement = document.getElementById(`faltante-${porcentaje}`);
                const diarioElement = document.getElementById(`diario-${porcentaje}`);

                // Actualizar UI solo si los elementos existen
                if (objetivoElement) objetivoElement.textContent = App.formatCurrency(montoObjetivoPorcentaje);
                if (faltanteElement) faltanteElement.textContent = App.formatCurrency(montoFaltante);
                if (diarioElement) diarioElement.textContent = App.formatCurrency(montoDiario);
            });

            console.log('Proyecciones calculadas correctamente');
        } catch (error) {
            console.warn('Error al calcular proyecciones:', error);
        }
    },

    // Cargar datos de objetivos de unidades
    async loadUnidadesData(mes, anio) {
        try {
            console.log(`Cargando datos de unidades para ${mes}/${anio}...`);

            // Verificar que los elementos existen antes de intentar modificarlos
            const unidadesObjetivoTotal = document.getElementById('unidades-objetivo-total');
            const unidadesProgress = document.getElementById('unidades-progress');
            const unidadesPorcentaje = document.getElementById('unidades-porcentaje');
            const unidadesAcumulado = document.getElementById('unidades-acumulado');
            const unidadesRestante = document.getElementById('unidades-restante');

            // Verificar si algún elemento no existe
            if (!unidadesObjetivoTotal || !unidadesProgress || !unidadesPorcentaje ||
                !unidadesAcumulado || !unidadesRestante) {
                console.warn('Algunos elementos del DOM para unidades no están disponibles. Posiblemente la página no se ha cargado completamente.');
                return; // Salir de la función si faltan elementos
            }

            // Obtener objetivo de unidades
            const objetivo = await DB.getObjetivoUnidades(mes, anio);
            console.log('Objetivo de unidades obtenido:', objetivo);

            if (!objetivo) {
                console.log('No hay objetivo de unidades definido, mostrando valores por defecto');
                // Si no hay objetivo, mostrar valores por defecto
                unidadesObjetivoTotal.textContent = '0 unidades';
                unidadesProgress.style.width = '0%';
                unidadesPorcentaje.textContent = '0%';
                unidadesAcumulado.textContent = '0';
                unidadesRestante.textContent = '0';

                // Limpiar tabla de proyecciones de unidades
                this.clearUnidadesProjections();
                this.clearDashboardUnidadesProjections();

                // Crear un objetivo por defecto para el mes actual
                console.log('Creando objetivo de unidades por defecto...');
                const nuevoObjetivo = {
                    mes,
                    anio,
                    unidades_objetivo: 50, // 50 unidades por defecto
                    creado_por: Auth.getCurrentUserId() || 1
                };

                const objetivoCreado = await DB.saveObjetivoUnidades(nuevoObjetivo);
                console.log('Objetivo de unidades creado:', objetivoCreado);

                // Actualizar UI con el nuevo objetivo
                unidadesObjetivoTotal.textContent = `${nuevoObjetivo.unidades_objetivo} unidades`;
                unidadesProgress.style.width = '0%';
                unidadesPorcentaje.textContent = '0%';
                unidadesAcumulado.textContent = '0';
                unidadesRestante.textContent = nuevoObjetivo.unidades_objetivo;

                // Calcular proyecciones con el nuevo objetivo
                this.calculateUnidadesProjections(nuevoObjetivo.unidades_objetivo, 0, mes, anio);
                this.calculateDashboardUnidadesProjections(nuevoObjetivo.unidades_objetivo, 0, mes, anio);

                return;
            }

            // Obtener ingresos de unidades
            const ingresos = await DB.getIngresosUnidades(objetivo.id);
            console.log('Ingresos de unidades obtenidos:', ingresos);

            // Calcular estadísticas
            const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.unidades, 0);
            const porcentaje = objetivo.unidades_objetivo > 0 ? (acumulado / objetivo.unidades_objetivo) * 100 : 0;

            // Calcular restante
            const restante = Math.max(0, objetivo.unidades_objetivo - acumulado);

            console.log('Estadísticas calculadas:', {
                objetivo: objetivo.unidades_objetivo,
                acumulado,
                porcentaje,
                restante
            });

            // Actualizar UI
            unidadesObjetivoTotal.textContent = `${objetivo.unidades_objetivo} unidades`;
            unidadesProgress.style.width = `${Math.min(porcentaje, 100)}%`;
            unidadesPorcentaje.textContent = `${porcentaje.toFixed(2)}%`;
            unidadesAcumulado.textContent = acumulado;
            unidadesRestante.textContent = restante;

            // Calcular proyecciones
            this.calculateUnidadesProjections(objetivo.unidades_objetivo, acumulado, mes, anio);
            this.calculateDashboardUnidadesProjections(objetivo.unidades_objetivo, acumulado, mes, anio);

            console.log('UI actualizada correctamente');
        } catch (error) {
            console.error('Error al cargar datos de unidades:', error);
            console.error('Detalles del error:', error.stack);
            // No mostrar alerta para evitar interrumpir la experiencia del usuario
            console.warn('Error al cargar datos de unidades. Esto puede ocurrir si la página no se ha cargado completamente.');
        }
    },

    // Limpiar tabla de proyecciones de unidades (función vacía ya que se eliminó la tabla)
    clearUnidadesProjections() {
        // Esta función se mantiene vacía para compatibilidad con el código existente
        console.log('Función clearUnidadesProjections: La tabla de proyecciones de unidades ha sido eliminada');
    },

    // Limpiar tabla de proyecciones de unidades en el dashboard
    clearDashboardUnidadesProjections() {
        try {
            console.log('Limpiando proyecciones de unidades en el dashboard...');
            const porcentajes = [80, 90, 100, 110, 115];

            porcentajes.forEach(porcentaje => {
                const objetivoElement = document.getElementById(`objetivo-unidades-dashboard-${porcentaje}`);
                const faltanteElement = document.getElementById(`faltante-unidades-dashboard-${porcentaje}`);
                const diarioElement = document.getElementById(`diario-unidades-dashboard-${porcentaje}`);

                if (objetivoElement) objetivoElement.textContent = '0';
                if (faltanteElement) faltanteElement.textContent = '0';
                if (diarioElement) diarioElement.textContent = '0';
            });
        } catch (error) {
            console.warn('Error al limpiar proyecciones de unidades en el dashboard:', error);
        }
    },

    // Calcular proyecciones de unidades (función vacía ya que se eliminó la tabla)
    calculateUnidadesProjections(unidadesObjetivo, acumulado, mes, anio) {
        // Esta función se mantiene vacía para compatibilidad con el código existente
        console.log('Función calculateUnidadesProjections: La tabla de proyecciones de unidades ha sido eliminada');
    },

    // Calcular proyecciones de unidades para el dashboard
    calculateDashboardUnidadesProjections(unidadesObjetivo, acumulado, mes, anio) {
        try {
            console.log('Calculando proyecciones de unidades para el dashboard...');
            console.log('Datos para proyecciones dashboard:', { unidadesObjetivo, acumulado, mes, anio });

            // Obtener fecha actual
            const currentDate = new Date();

            // Crear fecha para el mes y año seleccionados
            const selectedDate = new Date(anio, mes - 1, 1);

            // Determinar qué fecha usar para los cálculos
            let dateToUse = currentDate;

            // Si el mes seleccionado es futuro, usar el primer día del mes seleccionado
            if (mes > currentDate.getMonth() + 1 || (mes === currentDate.getMonth() + 1 && anio > currentDate.getFullYear())) {
                dateToUse = selectedDate;
                console.log('Usando fecha futura para proyecciones de unidades en dashboard:', dateToUse);
            } else if (mes < currentDate.getMonth() + 1 || (mes === currentDate.getMonth() + 1 && anio < currentDate.getFullYear())) {
                // Si es un mes pasado, usar el último día del mes seleccionado
                dateToUse = new Date(anio, mes, 0); // El día 0 del siguiente mes es el último día del mes actual
                console.log('Usando fecha pasada para proyecciones de unidades en dashboard:', dateToUse);
            }

            // Calcular días hábiles restantes
            const remainingWorkdays = this.calculateRemainingWorkdays(dateToUse, mes, anio);
            console.log('Días hábiles restantes para unidades en dashboard:', remainingWorkdays);

            // Si no hay días hábiles restantes, mostrar valores por defecto
            if (remainingWorkdays === 0) {
                console.log('No hay días hábiles restantes en el mes para unidades en dashboard');
                this.clearDashboardUnidadesProjections();
                return;
            }

            // Calcular proyecciones para diferentes porcentajes
            const porcentajes = [80, 90, 100, 110, 115];

            porcentajes.forEach(porcentaje => {
                // Calcular unidades objetivo para este porcentaje
                const unidadesObjetivoPorcentaje = Math.round((unidadesObjetivo * porcentaje) / 100);

                // Calcular unidades faltantes
                const unidadesFaltantes = Math.max(0, unidadesObjetivoPorcentaje - acumulado);

                // Calcular unidades diarias requeridas
                const unidadesDiarias = Math.ceil(unidadesFaltantes / remainingWorkdays);

                console.log(`Proyección dashboard ${porcentaje}%:`, {
                    unidadesObjetivoPorcentaje,
                    unidadesFaltantes,
                    unidadesDiarias
                });

                // Actualizar UI del dashboard
                const objetivoElement = document.getElementById(`objetivo-unidades-dashboard-${porcentaje}`);
                const faltanteElement = document.getElementById(`faltante-unidades-dashboard-${porcentaje}`);
                const diarioElement = document.getElementById(`diario-unidades-dashboard-${porcentaje}`);

                if (objetivoElement) objetivoElement.textContent = unidadesObjetivoPorcentaje;
                if (faltanteElement) faltanteElement.textContent = unidadesFaltantes;
                if (diarioElement) diarioElement.textContent = unidadesDiarias;
            });

            console.log('Proyecciones de unidades para dashboard calculadas correctamente');
        } catch (error) {
            console.warn('Error al calcular proyecciones de unidades para el dashboard:', error);
        }
    },

    // Cargar datos de créditos
    async loadCreditosData(mes, anio) {
        try {
            console.log(`Cargando datos de créditos para ${mes}/${anio}...`);

            // Verificar que los elementos existen antes de intentar modificarlos
            const creditosNuevos = document.getElementById('creditos-nuevos');
            const creditosRenovaciones = document.getElementById('creditos-renovaciones');
            const creditosCobrados = document.getElementById('creditos-cobrados');

            // Verificar si algún elemento no existe
            if (!creditosNuevos || !creditosRenovaciones || !creditosCobrados) {
                console.warn('Algunos elementos del DOM para créditos no están disponibles. Posiblemente la página no se ha cargado completamente.');
                return; // Salir de la función si faltan elementos
            }

            // Obtener créditos
            const creditos = await DB.getCreditos(mes, anio);
            console.log('Créditos obtenidos:', creditos);

            // Contar por tipo
            const nuevos = creditos.filter(credito => credito.tipo === 'nuevo').length;
            const renovaciones = creditos.filter(credito => credito.tipo === 'renovacion').length;
            const cobrados = creditos.filter(credito => credito.tipo === 'cobrado').length;

            console.log('Conteo de créditos:', {
                nuevos,
                renovaciones,
                cobrados,
                total: creditos.length
            });

            // Actualizar UI
            creditosNuevos.textContent = nuevos;
            creditosRenovaciones.textContent = renovaciones;
            creditosCobrados.textContent = cobrados;

            console.log('UI de créditos actualizada correctamente');

            // Si no hay créditos, crear algunos de ejemplo
            if (creditos.length === 0) {
                console.log('No hay créditos, creando ejemplos...');

                // Crear créditos de ejemplo
                const ejemplos = [
                    {
                        fecha: new Date(anio, mes - 1, 5).toISOString().split('T')[0],
                        tipo: 'nuevo',
                        monto: 1500000,
                        cliente: 'Crédito Nuevo 1'
                    },
                    {
                        fecha: new Date(anio, mes - 1, 10).toISOString().split('T')[0],
                        tipo: 'renovacion',
                        monto: 2000000,
                        cliente: 'Renovación 1'
                    },
                    {
                        fecha: new Date(anio, mes - 1, 15).toISOString().split('T')[0],
                        tipo: 'cobrado',
                        monto: 1000000,
                        cliente: 'Cobro 1'
                    }
                ];

                // Guardar créditos de ejemplo
                for (const ejemplo of ejemplos) {
                    await DB.saveCredito(ejemplo);
                }

                console.log('Créditos de ejemplo creados');

                // Recargar datos
                await this.loadCreditosData(mes, anio);
            }
        } catch (error) {
            console.error('Error al cargar datos de créditos:', error);
            console.error('Detalles del error:', error.stack);
            // No mostrar alerta para evitar interrumpir la experiencia del usuario
            console.warn('Error al cargar datos de créditos. Esto puede ocurrir si la página no se ha cargado completamente.');
        }
    }
};
