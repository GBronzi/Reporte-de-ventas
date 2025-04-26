// Objetivos de Unidades
const ObjetivosUnidades = {
    charts: {
        ingresos: null,
        acumulado: null
    },

    // Inicializar la página de objetivos de unidades
    init() {
        // Configurar eventos
        this.setupEvents();

        // Establecer fecha actual en el campo oculto
        this.setCurrentDate();
    },

    // Establecer fecha actual en el campo oculto
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        const fechaInput = document.getElementById('ingreso-unidades-fecha');
        if (fechaInput) {
            fechaInput.value = today;
        }
    },

    // Configurar eventos
    setupEvents() {
        // Selector de mes
        const mesSelector = document.getElementById('unidades-mes');
        if (mesSelector) {
            mesSelector.addEventListener('change', () => {
                this.loadData();
            });
        }

        // Selector de año
        const anioSelector = document.getElementById('unidades-anio');
        if (anioSelector) {
            anioSelector.addEventListener('change', () => {
                this.loadData();
            });
        }

        // Botón de exportar
        const exportarBtn = document.getElementById('exportar-unidades');
        if (exportarBtn) {
            exportarBtn.addEventListener('click', () => {
                this.exportData();
            });
        }

        // Botón de modificar objetivo (admin)
        const modificarBtn = document.getElementById('modificar-objetivo-unidades');
        if (modificarBtn) {
            modificarBtn.addEventListener('click', () => {
                document.getElementById('objetivo-unidades-content').style.display = 'none';
                document.getElementById('objetivo-unidades-form').style.display = 'block';
            });
        }

        // Botón de editar objetivo (para todos los usuarios)
        const editarBtn = document.getElementById('editar-objetivo-unidades');
        if (editarBtn) {
            editarBtn.addEventListener('click', () => {
                this.editarObjetivo();
            });
        }

        // Botón de guardar objetivo
        const guardarBtn = document.getElementById('guardar-objetivo-unidades');
        if (guardarBtn) {
            guardarBtn.addEventListener('click', () => {
                this.saveObjetivo();
            });
        }

        // Formulario de ingreso
        const ingresoForm = document.getElementById('form-ingreso-unidades');
        if (ingresoForm) {
            ingresoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveIngreso();
            });
        }

        // Botón para borrar datos del día
        const borrarDiaBtn = document.getElementById('borrar-dia-unidades');
        if (borrarDiaBtn) {
            borrarDiaBtn.addEventListener('click', () => {
                this.borrarDatosDia();
            });
        }

        // Botón para borrar datos del mes
        const borrarMesBtn = document.getElementById('borrar-mes-unidades');
        if (borrarMesBtn) {
            borrarMesBtn.addEventListener('click', () => {
                this.borrarDatosMes();
            });
        }
    },

    // Cargar datos de objetivos de unidades
    async loadData() {
        try {
            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('unidades-mes').value);
            const anio = parseInt(document.getElementById('unidades-anio').value);

            // Obtener objetivo de unidades
            const objetivo = await DB.getObjetivoUnidades(mes, anio);

            if (objetivo) {
                // Mostrar contenido del objetivo
                document.getElementById('objetivo-unidades-content').style.display = 'block';
                document.getElementById('objetivo-unidades-form').style.display = 'none';

                // Actualizar valores del objetivo
                document.getElementById('objetivo-unidades-valor').textContent = `${objetivo.unidades_objetivo} unidades`;

                // Obtener ingresos
                const ingresos = await DB.getIngresosUnidades(objetivo.id);

                // Calcular estadísticas
                const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.unidades, 0);
                const porcentaje = objetivo.unidades_objetivo > 0 ? (acumulado / objetivo.unidades_objetivo) * 100 : 0;

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
                document.getElementById('objetivo-unidades-acumulado').textContent = `${acumulado} unidades`;
                document.getElementById('objetivo-unidades-porcentaje').textContent = `${porcentaje.toFixed(2)}%`;
                document.getElementById('objetivo-unidades-progress').style.width = `${Math.min(porcentaje, 100)}%`;
                document.getElementById('objetivo-unidades-nivel').textContent = nivelCumplimiento;

                // Actualizar tabla de ingresos
                this.updateIngresosTable(ingresos);

                // Actualizar gráficos
                this.updateCharts(ingresos);
            } else {
                // Mostrar formulario para crear objetivo
                document.getElementById('objetivo-unidades-content').style.display = 'none';
                document.getElementById('objetivo-unidades-form').style.display = 'block';

                // Limpiar tabla de ingresos
                document.getElementById('tabla-ingresos-unidades').innerHTML = `
                    <tr>
                        <td colspan="2" class="text-center">No hay registros</td>
                    </tr>
                `;

                // Actualizar total
                document.getElementById('tabla-unidades-acumulado').textContent = '0';

                // Limpiar gráficos
                this.updateCharts([]);
            }
        } catch (error) {
            console.error('Error al cargar datos de objetivos de unidades:', error);
        }
    },

    // Editar objetivo
    async editarObjetivo() {
        try {
            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('unidades-mes').value);
            const anio = parseInt(document.getElementById('unidades-anio').value);

            // Obtener objetivo actual
            const objetivo = await DB.getObjetivoUnidades(mes, anio);

            if (!objetivo) {
                alert('No hay objetivo definido para este mes');
                return;
            }

            // Solicitar nuevo valor
            const nuevoValor = prompt('Ingrese el nuevo objetivo de unidades:', objetivo.unidades_objetivo);

            if (nuevoValor === null) {
                // El usuario canceló
                return;
            }

            const unidadesObjetivo = parseInt(nuevoValor);

            if (isNaN(unidadesObjetivo) || unidadesObjetivo <= 0) {
                alert('Por favor ingrese un número de unidades válido');
                return;
            }

            // Actualizar objeto de objetivo
            objetivo.unidades_objetivo = unidadesObjetivo;
            objetivo.actualizado_por = Auth.getCurrentUserId();
            objetivo.updated_at = new Date().toISOString();

            // Guardar objetivo
            await DB.saveObjetivoUnidades(objetivo);

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
            const mes = parseInt(document.getElementById('unidades-mes').value);
            const anio = parseInt(document.getElementById('unidades-anio').value);
            const unidadesObjetivo = parseInt(document.getElementById('nuevo-objetivo-unidades').value);

            if (isNaN(unidadesObjetivo) || unidadesObjetivo <= 0) {
                alert('Por favor ingrese un número de unidades válido');
                return;
            }

            // Crear objeto de objetivo
            const objetivo = {
                mes,
                anio,
                unidades_objetivo: unidadesObjetivo,
                creado_por: Auth.getCurrentUserId()
            };

            // Guardar objetivo
            await DB.saveObjetivoUnidades(objetivo);

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
            console.log('Guardando ingreso de unidades...');

            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('unidades-mes').value);
            const anio = parseInt(document.getElementById('unidades-anio').value);

            // Obtener objetivo
            const objetivo = await DB.getObjetivoUnidades(mes, anio);

            if (!objetivo) {
                alert('Debe definir un objetivo antes de registrar ingresos');
                return;
            }

            // Obtener valores del formulario
            let fecha = document.getElementById('ingreso-unidades-fecha').value;
            const unidades = parseInt(document.getElementById('ingreso-unidades-valor').value);

            // Si no hay fecha seleccionada, usar la fecha actual
            if (!fecha) {
                // Usar la fecha actual en formato YYYY-MM-DD con zona horaria local
                const hoy = new Date();
                fecha = hoy.toISOString().split('T')[0];
                console.log('Usando fecha actual:', fecha);
            } else {
                console.log('Fecha seleccionada:', fecha);
            }

            if (isNaN(unidades) || unidades <= 0) {
                alert('Por favor ingrese un número de unidades válido');
                return;
            }

            // Crear objeto de ingreso con fecha corregida
            const ingreso = {
                fecha,
                unidades,
                objetivo_id: objetivo.id
            };

            console.log('Guardando ingreso:', ingreso);

            // Guardar ingreso
            await DB.saveIngresoUnidades(ingreso);

            // Limpiar formulario
            document.getElementById('ingreso-unidades-fecha').value = '';
            document.getElementById('ingreso-unidades-valor').value = '';

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
        const tbody = document.getElementById('tabla-ingresos-unidades');
        const acumuladoElement = document.getElementById('tabla-unidades-acumulado');

        if (!tbody || !acumuladoElement) return;

        // Limpiar tabla
        tbody.innerHTML = '';

        if (ingresos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="2" class="text-center">No hay registros</td>
                </tr>
            `;
            acumuladoElement.textContent = '0';
            return;
        }

        // Ordenar ingresos por fecha (más reciente primero)
        ingresos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Calcular acumulado
        const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.unidades, 0);

        // Llenar tabla
        ingresos.forEach(ingreso => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${App.formatDate(ingreso.fecha)}</td>
                <td>${ingreso.unidades}</td>
            `;
            tbody.appendChild(row);
        });

        // Actualizar acumulado
        acumuladoElement.textContent = acumulado;
    },

    // Actualizar gráficos
    updateCharts(ingresos) {
        // Ordenar ingresos por fecha
        ingresos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        // Preparar datos para gráficos
        const fechas = ingresos.map(ingreso => App.formatDate(ingreso.fecha));
        const unidades = ingresos.map(ingreso => ingreso.unidades);

        // Calcular acumulados
        const acumulados = [];
        let acumulado = 0;

        ingresos.forEach(ingreso => {
            acumulado += ingreso.unidades;
            acumulados.push(acumulado);
        });

        // Actualizar gráfico de ingresos
        this.updateIngresosChart(fechas, unidades);

        // Actualizar gráfico de acumulado
        this.updateAcumuladoChart(fechas, acumulados);
    },

    // Actualizar gráfico de ingresos
    updateIngresosChart(fechas, unidades) {
        const ctx = document.getElementById('chart-ingresos-unidades');

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
                    label: 'Unidades Diarias',
                    data: unidades,
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
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
                            precision: 0
                        }
                    }
                }
            }
        });
    },

    // Actualizar gráfico de acumulado
    updateAcumuladoChart(fechas, acumulados) {
        const ctx = document.getElementById('chart-acumulado-unidades');

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
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderColor: '#10b981',
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
                            precision: 0
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
            const mes = parseInt(document.getElementById('unidades-mes').value);
            const anio = parseInt(document.getElementById('unidades-anio').value);

            // Obtener objetivo
            const objetivo = await DB.getObjetivoUnidades(mes, anio);

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
            const result = await DB.borrarIngresosUnidadesPorFecha(objetivo.id, hoy);

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
            const mes = parseInt(document.getElementById('unidades-mes').value);
            const anio = parseInt(document.getElementById('unidades-anio').value);

            // Obtener objetivo
            const objetivo = await DB.getObjetivoUnidades(mes, anio);

            if (!objetivo) {
                alert('No hay objetivo definido para este mes');
                return;
            }

            // Confirmar borrado
            if (!confirm(`¿Está seguro de borrar TODOS los datos del mes de ${this.getNombreMes(mes)} ${anio}?`)) {
                return;
            }

            // Borrar datos del mes
            const result = await DB.borrarIngresosUnidadesDelMes(objetivo.id);

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
            const mes = parseInt(document.getElementById('unidades-mes').value);
            const anio = parseInt(document.getElementById('unidades-anio').value);

            // Obtener objetivo
            const objetivo = await DB.getObjetivoUnidades(mes, anio);

            if (!objetivo) {
                alert('No hay datos para exportar');
                return;
            }

            // Obtener ingresos
            const ingresos = await DB.getIngresosUnidades(objetivo.id);

            // Calcular estadísticas
            const acumulado = ingresos.reduce((sum, ingreso) => sum + ingreso.unidades, 0);
            const porcentaje = objetivo.unidades_objetivo > 0 ? (acumulado / objetivo.unidades_objetivo) * 100 : 0;

            // Preparar datos para exportar
            const resumen = [
                {
                    Concepto: 'Objetivo Mensual (Unidades)',
                    Valor: objetivo.unidades_objetivo
                },
                {
                    Concepto: 'Acumulado',
                    Valor: acumulado
                },
                {
                    Concepto: 'Porcentaje de Cumplimiento',
                    Valor: `${porcentaje.toFixed(2)}%`
                }
            ];

            const ingresosData = ingresos.map(ingreso => ({
                Fecha: App.formatDate(ingreso.fecha),
                Unidades: ingreso.unidades
            }));

            // Mostrar menú de exportación
            Export.showExportMenu(
                document.getElementById('exportar-unidades'),
                [...resumen, ...ingresosData],
                `objetivos-unidades-${mes}-${anio}`
            );
        } catch (error) {
            console.error('Error al exportar datos:', error);
            alert('Error al exportar datos');
        }
    }
};
