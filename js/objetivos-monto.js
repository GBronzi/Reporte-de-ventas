// Objetivos de Monto
const ObjetivosMonto = {
    charts: {
        ingresos: null,
        acumulado: null,
        modal: null
    },

    // Inicializar la página de objetivos de monto
    init() {
        // Configurar eventos
        this.setupEvents();

        // Inicializar modal de gráficas
        this.setupModal();

        // Establecer fecha actual en el campo oculto
        this.setCurrentDate();
    },

    // Establecer fecha actual en el campo oculto
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        const fechaInput = document.getElementById('ingreso-monto-fecha');
        if (fechaInput) {
            fechaInput.value = today;
        }
    },

    // Configurar modal de gráficas
    setupModal() {
        // Botón para cerrar el modal
        const cerrarModalBtn = document.getElementById('cerrar-modal-grafica');
        if (cerrarModalBtn) {
            cerrarModalBtn.addEventListener('click', () => {
                document.getElementById('modal-grafica').style.display = 'none';
            });
        }

        // Cerrar modal al hacer clic fuera del contenido
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('modal-grafica');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    },

    // Configurar eventos
    setupEvents() {
        // Selector de mes
        const mesSelector = document.getElementById('monto-mes');
        if (mesSelector) {
            mesSelector.addEventListener('change', () => {
                this.loadData();
            });
        }

        // Selector de año
        const anioSelector = document.getElementById('monto-anio');
        if (anioSelector) {
            anioSelector.addEventListener('change', () => {
                this.loadData();
            });
        }

        // Botón de exportar
        const exportarBtn = document.getElementById('exportar-monto');
        if (exportarBtn) {
            exportarBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Botón de modificar objetivo (admin)
        const modificarBtn = document.getElementById('modificar-objetivo-monto');
        if (modificarBtn) {
            modificarBtn.addEventListener('click', () => {
                document.getElementById('objetivo-monto-content').style.display = 'none';
                document.getElementById('objetivo-monto-form').style.display = 'block';
            });
        }

        // Botón de editar objetivo (para todos los usuarios)
        const editarBtn = document.getElementById('editar-objetivo-monto');
        if (editarBtn) {
            editarBtn.addEventListener('click', () => {
                this.editarObjetivo();
            });
        }

        // Botón de guardar objetivo
        const guardarBtn = document.getElementById('guardar-objetivo-monto');
        if (guardarBtn) {
            guardarBtn.addEventListener('click', () => {
                this.saveObjetivo();
            });
        }

        // Formulario de ingreso
        const ingresoForm = document.getElementById('form-ingreso-monto');
        if (ingresoForm) {
            ingresoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveIngreso();
            });
        }

        // Botón para borrar datos del día
        const borrarDiaBtn = document.getElementById('borrar-dia-monto');
        if (borrarDiaBtn) {
            borrarDiaBtn.addEventListener('click', () => {
                this.borrarDatosDia();
            });
        }

        // Botón para borrar datos del mes
        const borrarMesBtn = document.getElementById('borrar-mes-monto');
        if (borrarMesBtn) {
            borrarMesBtn.addEventListener('click', () => {
                this.borrarDatosMes();
            });
        }

        // Botón para ampliar gráfica de ingresos
        const ampliarIngresosBtn = document.getElementById('ampliar-grafica-ingresos');
        if (ampliarIngresosBtn) {
            ampliarIngresosBtn.addEventListener('click', () => {
                this.mostrarGraficaAmpliada('ingresos');
            });
        }

        // Botón para ampliar gráfica de acumulado
        const ampliarAcumuladoBtn = document.getElementById('ampliar-grafica-acumulado');
        if (ampliarAcumuladoBtn) {
            ampliarAcumuladoBtn.addEventListener('click', () => {
                this.mostrarGraficaAmpliada('acumulado');
            });
        }
    },

    // Mostrar gráfica ampliada
    mostrarGraficaAmpliada(tipo) {
        const modal = document.getElementById('modal-grafica');
        const titulo = document.getElementById('modal-grafica-titulo');

        // Establecer título según el tipo de gráfica
        if (tipo === 'ingresos') {
            titulo.textContent = 'Ingresos Diarios';
        } else if (tipo === 'acumulado') {
            titulo.textContent = 'Acumulado';
        }

        // Mostrar modal
        modal.style.display = 'block';

        // Obtener datos de la gráfica original
        const chartData = this.charts[tipo].data;
        const chartOptions = this.charts[tipo].options;

        // Crear gráfica ampliada
        const ctx = document.getElementById('chart-modal');

        // Destruir gráfica existente si hay una
        if (this.charts.modal) {
            this.charts.modal.destroy();
        }

        // Crear nueva gráfica
        this.charts.modal = new Chart(ctx, {
            type: tipo === 'ingresos' ? 'bar' : 'line',
            data: chartData,
            options: {
                ...chartOptions,
                responsive: true,
                maintainAspectRatio: false
            }
        });
    },

    // Cargar datos de objetivos de monto
    async loadData() {
        try {
            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('monto-mes').value);
            const anio = parseInt(document.getElementById('monto-anio').value);

            // Obtener objetivo de monto
            const objetivo = await DB.getObjetivoMonto(mes, anio);

            if (objetivo) {
                // Mostrar contenido del objetivo
                document.getElementById('objetivo-monto-content').style.display = 'block';
                document.getElementById('objetivo-monto-form').style.display = 'none';

                // Actualizar valores del objetivo
                document.getElementById('objetivo-monto-valor').textContent = App.formatCurrency(objetivo.monto_objetivo);

                // Obtener ingresos
                const ingresos = await DB.getIngresosMonto(objetivo.id);

                // Calcular estadísticas
                const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
                const porcentaje = objetivo.monto_objetivo > 0 ? (acumulado / objetivo.monto_objetivo) * 100 : 0;

                // Calcular tickets totales y promedio
                const ticketsTotales = ingresos.reduce((sum, ingreso) => sum + (ingreso.tickets || 1), 0);
                const promedioPorTicket = ticketsTotales > 0 ? acumulado / ticketsTotales : 0;

                // Obtener fecha actual en formato YYYY-MM-DD
                const fechaHoy = new Date().toISOString().split('T')[0];

                // Calcular tickets del día
                const ticketsHoy = ingresos
                    .filter(ingreso => ingreso.fecha === fechaHoy)
                    .reduce((sum, ingreso) => sum + (ingreso.tickets || 1), 0);

                // Calcular el promedio como porcentaje del objetivo
                const promedioPorcentaje = objetivo.monto_objetivo > 0 ? (promedioPorTicket / objetivo.monto_objetivo) * 100 : 0;

                // Determinar nivel de cumplimiento
                let nivelCumplimiento = 'bajo';
                if (porcentaje >= 115) {
                    nivelCumplimiento = '115%';
                } else if (porcentaje >= 110) {
                    nivelCumplimiento = '110%';
                } else if (porcentaje >= 100) {
                    nivelCumplimiento = '100%';
                } else if (porcentaje >= 90) {
                    nivelCumplimiento = '90%';
                } else if (porcentaje >= 80) {
                    nivelCumplimiento = '80%';
                }

                // Actualizar UI
                document.getElementById('objetivo-monto-acumulado').textContent = App.formatCurrency(acumulado);
                document.getElementById('objetivo-monto-porcentaje').textContent = `${porcentaje.toFixed(2)}%`;
                document.getElementById('objetivo-monto-progress').style.width = `${Math.min(porcentaje, 100)}%`;
                document.getElementById('objetivo-monto-nivel').textContent = nivelCumplimiento;
                document.getElementById('objetivo-monto-tickets').textContent = ticketsTotales;
                document.getElementById('objetivo-monto-tickets-hoy').textContent = ticketsHoy;
                document.getElementById('objetivo-monto-promedio-valor').textContent = promedioPorTicket.toFixed(2);
                document.getElementById('objetivo-monto-promedio-porcentaje').textContent = `${promedioPorcentaje.toFixed(2)}%`;

                // Actualizar tabla de ingresos
                this.updateIngresosTable(ingresos);

                // Actualizar gráficos
                this.updateCharts(ingresos);
            } else {
                // Mostrar formulario para crear objetivo
                document.getElementById('objetivo-monto-content').style.display = 'none';
                document.getElementById('objetivo-monto-form').style.display = 'block';

                // Limpiar tabla de ingresos
                document.getElementById('tabla-ingresos-monto').innerHTML = `
                    <tr>
                        <td colspan="2" class="text-center">No hay registros</td>
                    </tr>
                `;

                // Actualizar total
                document.getElementById('tabla-monto-acumulado').textContent = App.formatCurrency(0);

                // Limpiar gráficos
                this.updateCharts([]);
            }
        } catch (error) {
            console.error('Error al cargar datos de objetivos de monto:', error);
        }
    },

    // Editar objetivo
    async editarObjetivo() {
        try {
            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('monto-mes').value);
            const anio = parseInt(document.getElementById('monto-anio').value);

            // Obtener objetivo actual
            const objetivo = await DB.getObjetivoMonto(mes, anio);

            if (!objetivo) {
                alert('No hay objetivo definido para este mes');
                return;
            }

            // Solicitar nuevo valor
            const nuevoMonto = prompt('Ingrese el nuevo monto objetivo:', objetivo.monto_objetivo);

            if (nuevoMonto === null) {
                // El usuario canceló
                return;
            }

            const montoObjetivo = parseFloat(nuevoMonto);

            if (isNaN(montoObjetivo) || montoObjetivo <= 0) {
                alert('Por favor ingrese un monto válido');
                return;
            }

            // Actualizar objeto de objetivo
            objetivo.monto_objetivo = montoObjetivo;
            objetivo.actualizado_por = Auth.getCurrentUserId();
            objetivo.updated_at = new Date().toISOString();

            // Guardar objetivo
            await DB.saveObjetivoMonto(objetivo);

            // Recargar datos
            this.loadData();

            alert('Objetivo actualizado correctamente');
        } catch (error) {
            console.error('Error al editar objetivo:', error);
            alert('Error al editar el objetivo');
        }
    },

    // Guardar objetivo
    async saveObjetivo() {
        try {
            // Obtener valores
            const mes = parseInt(document.getElementById('monto-mes').value);
            const anio = parseInt(document.getElementById('monto-anio').value);
            const montoObjetivo = parseFloat(document.getElementById('nuevo-objetivo-monto').value);

            if (isNaN(montoObjetivo) || montoObjetivo <= 0) {
                alert('Por favor ingrese un monto válido');
                return;
            }

            // Crear objeto de objetivo
            const objetivo = {
                mes,
                anio,
                monto_objetivo: montoObjetivo,
                creado_por: Auth.getCurrentUserId()
            };

            // Guardar objetivo
            await DB.saveObjetivoMonto(objetivo);

            // Recargar datos
            this.loadData();
        } catch (error) {
            console.error('Error al guardar objetivo:', error);
            alert('Error al guardar el objetivo');
        }
    },

    // Guardar ingreso
    async saveIngreso() {
        try {
            console.log('Guardando ingreso de monto...');

            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('monto-mes').value);
            const anio = parseInt(document.getElementById('monto-anio').value);

            // Obtener objetivo
            const objetivo = await DB.getObjetivoMonto(mes, anio);

            if (!objetivo) {
                alert('Debe definir un objetivo antes de registrar ingresos');
                return;
            }

            // Obtener valores del formulario
            let fecha = document.getElementById('ingreso-monto-fecha').value;
            const monto = parseFloat(document.getElementById('ingreso-monto-valor').value);
            const tickets = parseInt(document.getElementById('ingreso-monto-tickets').value);

            // Si no hay fecha seleccionada, usar la fecha actual
            if (!fecha) {
                // Usar la fecha actual en formato YYYY-MM-DD con zona horaria local
                const hoy = new Date();
                fecha = hoy.toISOString().split('T')[0];
                console.log('Usando fecha actual:', fecha);
            } else {
                console.log('Fecha seleccionada:', fecha);
            }

            if (isNaN(monto) || monto <= 0) {
                alert('Por favor ingrese un monto válido');
                return;
            }

            if (isNaN(tickets) || tickets < 1) {
                alert('Por favor ingrese una cantidad de tickets válida');
                return;
            }

            // Crear objeto de ingreso con fecha corregida
            const ingreso = {
                fecha,
                monto,
                tickets,
                objetivo_id: objetivo.id
            };

            console.log('Guardando ingreso:', ingreso);

            // Guardar ingreso
            await DB.saveIngresoMonto(ingreso);

            // Limpiar formulario
            document.getElementById('ingreso-monto-fecha').value = '';
            document.getElementById('ingreso-monto-valor').value = '';

            // Recargar datos
            this.loadData();

            alert('Ingreso guardado correctamente');
        } catch (error) {
            console.error('Error al guardar ingreso:', error);
            alert('Error al guardar el ingreso: ' + error.message);
        }
    },

    // Actualizar tabla de ingresos
    updateIngresosTable(ingresos) {
        const tbody = document.getElementById('tabla-ingresos-monto');
        const acumuladoElement = document.getElementById('tabla-monto-acumulado');
        const ticketsAcumuladoElement = document.getElementById('tabla-tickets-acumulado');

        if (!tbody || !acumuladoElement || !ticketsAcumuladoElement) return;

        // Limpiar tabla
        tbody.innerHTML = '';

        if (ingresos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-center">No hay registros</td>
                </tr>
            `;
            acumuladoElement.textContent = App.formatCurrency(0);
            ticketsAcumuladoElement.textContent = '0';
            return;
        }

        // Ordenar ingresos por fecha (más reciente primero)
        ingresos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Calcular acumulados
        const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
        const ticketsTotales = ingresos.reduce((sum, ingreso) => sum + (ingreso.tickets || 1), 0);

        // Llenar tabla
        ingresos.forEach(ingreso => {
            const tickets = ingreso.tickets || 1;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${App.formatDate(ingreso.fecha)}</td>
                <td>${App.formatCurrency(ingreso.monto)}</td>
                <td>${tickets}</td>
            `;
            tbody.appendChild(row);
        });

        // Actualizar acumulados
        acumuladoElement.textContent = App.formatCurrency(acumulado);
        ticketsAcumuladoElement.textContent = ticketsTotales;
    },

    // Actualizar gráficos
    updateCharts(ingresos) {
        // Ordenar ingresos por fecha
        ingresos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        // Preparar datos para gráficos
        const fechas = ingresos.map(ingreso => App.formatDate(ingreso.fecha));
        const montos = ingresos.map(ingreso => ingreso.monto);

        // Calcular acumulados
        const acumulados = [];
        let acumulado = 0;

        ingresos.forEach(ingreso => {
            acumulado += ingreso.monto;
            acumulados.push(acumulado);
        });

        // Actualizar gráfico de ingresos
        this.updateIngresosChart(fechas, montos);

        // Actualizar gráfico de acumulado
        this.updateAcumuladoChart(fechas, acumulados);
    },

    // Actualizar gráfico de ingresos
    updateIngresosChart(fechas, montos) {
        const ctx = document.getElementById('chart-ingresos-monto');

        if (!ctx) return;

        // Destruir gráfico existente si hay uno
        if (this.charts.ingresos) {
            this.charts.ingresos.destroy();
        }

        // Crear nuevo gráfico
        this.charts.ingresos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: fechas,
                datasets: [{
                    label: 'Ingresos Diarios',
                    data: montos,
                    backgroundColor: '#3b82f6',
                    borderColor: '#2563eb',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return App.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return App.formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    },

    // Actualizar gráfico de acumulado
    updateAcumuladoChart(fechas, acumulados) {
        const ctx = document.getElementById('chart-acumulado-monto');

        if (!ctx) return;

        // Destruir gráfico existente si hay uno
        if (this.charts.acumulado) {
            this.charts.acumulado.destroy();
        }

        // Crear nuevo gráfico
        this.charts.acumulado = new Chart(ctx, {
            type: 'line',
            data: {
                labels: fechas,
                datasets: [{
                    label: 'Acumulado',
                    data: acumulados,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return App.formatCurrency(value);
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return App.formatCurrency(context.raw);
                            }
                        }
                    }
                }
            }
        });
    },

    // Borrar datos del día
    async borrarDatosDia() {
        try {
            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('monto-mes').value);
            const anio = parseInt(document.getElementById('monto-anio').value);

            // Obtener objetivo
            const objetivo = await DB.getObjetivoMonto(mes, anio);

            if (!objetivo) {
                alert('No hay objetivo definido para este mes');
                return;
            }

            // Obtener fecha actual
            const hoy = new Date().toISOString().split('T')[0];

            // Confirmar borrado
            if (!confirm(`¿Está seguro de borrar los datos del día ${App.formatDate(hoy)}?`)) {
                return;
            }

            // Borrar datos del día
            const result = await DB.borrarIngresosMontoPorFecha(objetivo.id, hoy);

            if (result) {
                alert('Datos del día borrados correctamente');
                this.loadData(); // Recargar datos
            } else {
                alert('No se encontraron datos para el día de hoy');
            }
        } catch (error) {
            console.error('Error al borrar datos del día:', error);
            alert('Error al borrar datos del día');
        }
    },

    // Borrar datos del mes
    async borrarDatosMes() {
        try {
            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('monto-mes').value);
            const anio = parseInt(document.getElementById('monto-anio').value);

            // Obtener objetivo
            const objetivo = await DB.getObjetivoMonto(mes, anio);

            if (!objetivo) {
                alert('No hay objetivo definido para este mes');
                return;
            }

            // Confirmar borrado
            if (!confirm(`¿Está seguro de borrar TODOS los datos del mes de ${this.getNombreMes(mes)} ${anio}?`)) {
                return;
            }

            // Borrar datos del mes
            const result = await DB.borrarIngresosMontoDelMes(objetivo.id);

            if (result) {
                alert('Datos del mes borrados correctamente');
                this.loadData(); // Recargar datos
            } else {
                alert('No se encontraron datos para este mes');
            }
        } catch (error) {
            console.error('Error al borrar datos del mes:', error);
            alert('Error al borrar datos del mes');
        }
    },

    // Obtener nombre del mes
    getNombreMes(mes) {
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];
        return meses[mes - 1];
    },

    // Exportar datos
    async exportData() {
        try {
            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('monto-mes').value);
            const anio = parseInt(document.getElementById('monto-anio').value);

            // Obtener objetivo
            const objetivo = await DB.getObjetivoMonto(mes, anio);

            if (!objetivo) {
                alert('No hay datos para exportar');
                return;
            }

            // Obtener ingresos
            const ingresos = await DB.getIngresosMonto(objetivo.id);

            // Calcular estadísticas
            const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.monto, 0);
            const porcentaje = objetivo.monto_objetivo > 0 ? (acumulado / objetivo.monto_objetivo) * 100 : 0;

            // Calcular tickets totales y promedio
            const ticketsTotales = ingresos.reduce((sum, ingreso) => sum + (ingreso.tickets || 1), 0);
            const promedioPorTicket = ticketsTotales > 0 ? acumulado / ticketsTotales : 0;

            // Preparar datos para exportar
            const resumen = [
                {
                    Concepto: 'Objetivo Mensual',
                    Valor: objetivo.monto_objetivo
                },
                {
                    Concepto: 'Acumulado',
                    Valor: acumulado
                },
                {
                    Concepto: 'Porcentaje de Cumplimiento',
                    Valor: `${porcentaje.toFixed(2)}%`
                },
                {
                    Concepto: 'Tickets Totales',
                    Valor: ticketsTotales
                },
                {
                    Concepto: 'Promedio por Ticket',
                    Valor: promedioPorTicket
                }
            ];

            const ingresosData = ingresos.map(ingreso => {
                const tickets = ingreso.tickets || 1;

                return {
                    Fecha: App.formatDate(ingreso.fecha),
                    Monto: ingreso.monto,
                    Tickets: tickets
                };
            });

            // Mostrar menú de exportación
            Export.showExportMenu(
                document.getElementById('exportar-monto'),
                [...resumen, ...ingresosData],
                `objetivos-monto-${mes}-${anio}`
            );
        } catch (error) {
            console.error('Error al exportar datos:', error);
            alert('Error al exportar datos');
        }
    }
};
