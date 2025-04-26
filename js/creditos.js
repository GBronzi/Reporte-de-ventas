// Créditos
const Creditos = {
    charts: {
        distribucion: null,
        montos: null
    },

    // Inicializar la página de créditos
    init() {
        console.log('Inicializando página de créditos...');

        // Configurar eventos
        this.setupEvents();

        // Inicializar gráficos vacíos
        this.initEmptyCharts();

        // Establecer fecha actual en el formulario
        this.setCurrentDate();

        // Cargar datos iniciales
        setTimeout(() => {
            this.loadData();
        }, 500);
    },

    // Establecer fecha actual en los formularios
    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];

        // Establecer fecha en formulario de nuevos créditos
        const fechaNuevo = document.getElementById('credito-nuevo-fecha');
        if (fechaNuevo) {
            fechaNuevo.value = today;
        }

        // Establecer fecha en formulario de renovaciones
        const fechaRenovacion = document.getElementById('credito-renovacion-fecha');
        if (fechaRenovacion) {
            fechaRenovacion.value = today;
        }

        // Establecer fecha en formulario de cobros
        const fechaCobrado = document.getElementById('credito-cobrado-fecha');
        if (fechaCobrado) {
            fechaCobrado.value = today;
        }
    },

    // Inicializar gráficos vacíos
    initEmptyCharts() {
        // Inicializar gráfico de distribución
        const ctxDistribucion = document.getElementById('chart-distribucion-creditos');
        if (ctxDistribucion && !this.charts.distribucion) {
            this.charts.distribucion = new Chart(ctxDistribucion, {
                type: 'pie',
                data: {
                    labels: ['Nuevos', 'Renovaciones', 'Cobrados'],
                    datasets: [{
                        data: [0, 0, 0],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                        borderColor: ['#2563eb', '#059669', '#d97706'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Inicializar gráfico de montos
        const ctxMontos = document.getElementById('chart-montos-creditos');
        if (ctxMontos && !this.charts.montos) {
            this.charts.montos = new Chart(ctxMontos, {
                type: 'bar',
                data: {
                    labels: ['Nuevos', 'Renovaciones', 'Cobrados'],
                    datasets: [{
                        label: 'Montos por Tipo',
                        data: [0, 0, 0],
                        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                        borderColor: ['#2563eb', '#059669', '#d97706'],
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
                    }
                }
            });
        }
    },

    // Configurar eventos
    setupEvents() {
        console.log('Configurando eventos de créditos...');

        // Selector de mes
        const mesSelector = document.getElementById('creditos-mes');
        if (mesSelector) {
            mesSelector.addEventListener('change', () => {
                this.loadData();
            });
        } else {
            console.error('Elemento no encontrado: creditos-mes');
        }

        // Selector de año
        const anioSelector = document.getElementById('creditos-anio');
        if (anioSelector) {
            anioSelector.addEventListener('change', () => {
                this.loadData();
            });
        } else {
            console.error('Elemento no encontrado: creditos-anio');
        }

        // Botón de exportar
        const exportarBtn = document.getElementById('exportar-creditos');
        if (exportarBtn) {
            exportarBtn.addEventListener('click', () => {
                this.exportData();
            });
        } else {
            console.error('Elemento no encontrado: exportar-creditos');
        }

        // Formulario de nuevos créditos
        const formNuevo = document.getElementById('form-credito-nuevo');
        if (formNuevo) {
            console.log('Configurando evento submit para form-credito-nuevo');
            formNuevo.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Formulario de nuevo crédito enviado');
                this.saveCreditoNuevo();
            });
        } else {
            console.error('Elemento no encontrado: form-credito-nuevo');
        }

        // Formulario de renovaciones
        const formRenovacion = document.getElementById('form-credito-renovacion');
        if (formRenovacion) {
            console.log('Configurando evento submit para form-credito-renovacion');
            formRenovacion.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Formulario de renovación enviado');
                this.saveCreditoRenovacion();
            });
        } else {
            console.error('Elemento no encontrado: form-credito-renovacion');
        }

        // Formulario de cobros
        const formCobrado = document.getElementById('form-credito-cobrado');
        if (formCobrado) {
            console.log('Configurando evento submit para form-credito-cobrado');
            formCobrado.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Formulario de cobro enviado');
                this.saveCreditoCobrado();
            });
        } else {
            console.error('Elemento no encontrado: form-credito-cobrado');
        }

        // Botones de editar
        this.setupEditButtons();

        // Botones de eliminar créditos
        const eliminarDiaBtn = document.getElementById('eliminar-creditos-dia');
        if (eliminarDiaBtn) {
            eliminarDiaBtn.addEventListener('click', () => {
                this.eliminarCreditosPorDia();
            });
        } else {
            console.error('Elemento no encontrado: eliminar-creditos-dia');
        }

        const eliminarMesBtn = document.getElementById('eliminar-creditos-mes');
        if (eliminarMesBtn) {
            eliminarMesBtn.addEventListener('click', () => {
                this.eliminarCreditosPorMes();
            });
        } else {
            console.error('Elemento no encontrado: eliminar-creditos-mes');
        }

        // Filtro de créditos
        const filtroCreditos = document.getElementById('filtro-creditos');
        if (filtroCreditos) {
            filtroCreditos.addEventListener('change', () => {
                this.filterCreditos();
            });
        } else {
            console.error('Elemento no encontrado: filtro-creditos');
        }
    },

    // Configurar botones de editar
    setupEditButtons() {
        // Botón de editar nuevos créditos
        const editarNuevoBtn = document.getElementById('editar-credito-nuevo');
        if (editarNuevoBtn) {
            editarNuevoBtn.addEventListener('click', () => {
                this.editarCredito('nuevo');
            });
        }

        // Botón de editar renovaciones
        const editarRenovacionBtn = document.getElementById('editar-credito-renovacion');
        if (editarRenovacionBtn) {
            editarRenovacionBtn.addEventListener('click', () => {
                this.editarCredito('renovacion');
            });
        }

        // Botón de editar cobros
        const editarCobradoBtn = document.getElementById('editar-credito-cobrado');
        if (editarCobradoBtn) {
            editarCobradoBtn.addEventListener('click', () => {
                this.editarCredito('cobrado');
            });
        }
    },

    // Guardar nuevo crédito
    async saveCreditoNuevo() {
        try {
            console.log('Guardando nuevo crédito...');

            // Obtener valores del formulario
            const fechaInput = document.getElementById('credito-nuevo-fecha');
            const montoInput = document.getElementById('credito-nuevo-monto');
            const cantidadInput = document.getElementById('credito-nuevo-cantidad');

            if (!fechaInput || !montoInput || !cantidadInput) {
                console.error('Elementos del formulario no encontrados');
                alert('Error: Formulario incompleto');
                return;
            }

            let fecha = fechaInput.value;
            const monto = parseFloat(montoInput.value);
            const cantidad = parseInt(cantidadInput.value);

            // Si no hay fecha seleccionada, usar la fecha actual
            if (!fecha) {
                // Usar la fecha actual en formato YYYY-MM-DD con zona horaria local
                const hoy = new Date();
                fecha = hoy.toISOString().split('T')[0];
                console.log('Usando fecha actual:', fecha);
            } else {
                console.log('Fecha seleccionada:', fecha);
            }

            console.log('Valores del formulario:', { fecha, monto, cantidad });

            if (isNaN(monto) || monto < 0) {
                alert('Por favor ingrese un monto válido');
                return;
            }

            if (isNaN(cantidad) || cantidad < 0 || cantidad > 50) {
                alert('Por favor ingrese una cantidad válida (0-50)');
                return;
            }

            // Si la cantidad es 0, registrar un día sin créditos
            if (cantidad === 0) {
                // Crear un registro de "día sin créditos"
                const credito = {
                    fecha,
                    tipo: 'nuevo',
                    monto: 0,
                    cliente: 'Día sin nuevos créditos',
                    cantidad: 0
                };

                console.log('Guardando registro de día sin créditos:', credito);

                try {
                    // Guardar crédito
                    const resultado = await DB.saveCredito(credito);
                    console.log('Registro guardado:', resultado);

                    // Limpiar formulario
                    montoInput.value = '';
                    cantidadInput.value = '0';

                    // Recargar datos
                    this.loadData();

                    alert('Se ha registrado el día sin nuevos créditos correctamente');
                    return;
                } catch (err) {
                    console.error('Error al guardar registro:', err);
                    throw err;
                }
            }

            // Guardar un solo registro agrupado
            const credito = {
                fecha,
                tipo: 'nuevo',
                monto: monto, // Monto total
                cliente: `Nuevos Créditos (${cantidad})`,
                cantidad: cantidad // Guardar la cantidad para referencia
            };

            console.log('Guardando nuevos créditos agrupados:', credito);

            try {
                // Guardar crédito
                const resultado = await DB.saveCredito(credito);
                console.log('Nuevos créditos guardados:', resultado);

                // Limpiar formulario
                montoInput.value = '';
                cantidadInput.value = '1';

                // Recargar datos
                this.loadData();

                alert(`Se han registrado ${cantidad} nuevos créditos correctamente`);
            } catch (err) {
                console.error('Error al guardar nuevos créditos:', err);
                throw err;
            }

            // Limpiar formulario
            montoInput.value = '';
            cantidadInput.value = '1';

            // Recargar datos
            this.loadData();

            alert(`Se han registrado ${cantidad} nuevos créditos correctamente`);
        } catch (error) {
            console.error('Error al guardar nuevo crédito:', error);
            alert('Error al guardar el nuevo crédito: ' + error.message);
        }
    },

    // Guardar renovación
    async saveCreditoRenovacion() {
        try {
            console.log('Guardando renovación...');

            // Obtener valores del formulario
            const fechaInput = document.getElementById('credito-renovacion-fecha');
            const montoInput = document.getElementById('credito-renovacion-monto');
            const cantidadInput = document.getElementById('credito-renovacion-cantidad');

            if (!fechaInput || !montoInput || !cantidadInput) {
                console.error('Elementos del formulario no encontrados');
                alert('Error: Formulario incompleto');
                return;
            }

            let fecha = fechaInput.value;
            const monto = parseFloat(montoInput.value);
            const cantidad = parseInt(cantidadInput.value);

            // Si no hay fecha seleccionada, usar la fecha actual
            if (!fecha) {
                // Usar la fecha actual en formato YYYY-MM-DD con zona horaria local
                const hoy = new Date();
                fecha = hoy.toISOString().split('T')[0];
                console.log('Usando fecha actual:', fecha);
            } else {
                console.log('Fecha seleccionada:', fecha);
            }

            console.log('Valores del formulario:', { fecha, monto, cantidad });

            if (isNaN(monto) || monto < 0) {
                alert('Por favor ingrese un monto válido');
                return;
            }

            if (isNaN(cantidad) || cantidad < 0 || cantidad > 50) {
                alert('Por favor ingrese una cantidad válida (0-50)');
                return;
            }

            // Si la cantidad es 0, registrar un día sin renovaciones
            if (cantidad === 0) {
                // Crear un registro de "día sin renovaciones"
                const credito = {
                    fecha,
                    tipo: 'renovacion',
                    monto: 0,
                    cliente: 'Día sin renovaciones',
                    cantidad: 0
                };

                console.log('Guardando registro de día sin renovaciones:', credito);

                try {
                    // Guardar crédito
                    const resultado = await DB.saveCredito(credito);
                    console.log('Registro guardado:', resultado);

                    // Limpiar formulario
                    montoInput.value = '';
                    cantidadInput.value = '0';

                    // Recargar datos
                    this.loadData();

                    alert('Se ha registrado el día sin renovaciones correctamente');
                    return;
                } catch (err) {
                    console.error('Error al guardar registro:', err);
                    throw err;
                }
            }

            // Guardar un solo registro agrupado
            const credito = {
                fecha,
                tipo: 'renovacion',
                monto: monto, // Monto total
                cliente: `Renovaciones (${cantidad})`,
                cantidad: cantidad // Guardar la cantidad para referencia
            };

            console.log('Guardando renovaciones agrupadas:', credito);

            try {
                // Guardar crédito
                const resultado = await DB.saveCredito(credito);
                console.log('Renovaciones guardadas:', resultado);

                // Limpiar formulario
                montoInput.value = '';
                cantidadInput.value = '1';

                // Recargar datos
                this.loadData();

                alert(`Se han registrado ${cantidad} renovaciones correctamente`);
            } catch (err) {
                console.error('Error al guardar renovaciones:', err);
                throw err;
            }

            // Limpiar formulario
            montoInput.value = '';
            cantidadInput.value = '1';

            // Recargar datos
            this.loadData();

            alert(`Se han registrado ${cantidad} renovaciones correctamente`);
        } catch (error) {
            console.error('Error al guardar renovación:', error);
            alert('Error al guardar la renovación: ' + error.message);
        }
    },

    // Guardar cuota cobrada
    async saveCreditoCobrado() {
        try {
            console.log('Guardando cuota cobrada...');

            // Obtener valores del formulario
            const fechaInput = document.getElementById('credito-cobrado-fecha');
            const montoInput = document.getElementById('credito-cobrado-monto');
            const cantidadInput = document.getElementById('credito-cobrado-cantidad');

            if (!fechaInput || !montoInput || !cantidadInput) {
                console.error('Elementos del formulario no encontrados');
                alert('Error: Formulario incompleto');
                return;
            }

            let fecha = fechaInput.value;
            const monto = parseFloat(montoInput.value);
            const cantidad = parseInt(cantidadInput.value);

            // Si no hay fecha seleccionada, usar la fecha actual
            if (!fecha) {
                // Usar la fecha actual en formato YYYY-MM-DD con zona horaria local
                const hoy = new Date();
                fecha = hoy.toISOString().split('T')[0];
                console.log('Usando fecha actual:', fecha);
            } else {
                console.log('Fecha seleccionada:', fecha);
            }

            console.log('Valores del formulario:', { fecha, monto, cantidad });

            if (isNaN(monto) || monto < 0) {
                alert('Por favor ingrese un monto válido');
                return;
            }

            if (isNaN(cantidad) || cantidad < 0 || cantidad > 50) {
                alert('Por favor ingrese una cantidad válida (0-50)');
                return;
            }

            // Si la cantidad es 0, registrar un día sin cobros
            if (cantidad === 0) {
                // Crear un registro de "día sin cobros"
                const credito = {
                    fecha,
                    tipo: 'cobrado',
                    monto: 0,
                    cliente: 'Día sin cuotas cobradas',
                    cantidad: 0
                };

                console.log('Guardando registro de día sin cuotas cobradas:', credito);

                try {
                    // Guardar crédito
                    const resultado = await DB.saveCredito(credito);
                    console.log('Registro guardado:', resultado);

                    // Limpiar formulario
                    montoInput.value = '';
                    cantidadInput.value = '0';

                    // Recargar datos
                    this.loadData();

                    alert('Se ha registrado el día sin cuotas cobradas correctamente');
                    return;
                } catch (err) {
                    console.error('Error al guardar registro:', err);
                    throw err;
                }
            }

            // Guardar un solo registro agrupado
            const credito = {
                fecha,
                tipo: 'cobrado',
                monto: monto, // Monto total
                cliente: `Cuotas Cobradas (${cantidad})`,
                cantidad: cantidad // Guardar la cantidad para referencia
            };

            console.log('Guardando cuotas cobradas agrupadas:', credito);

            try {
                // Guardar crédito
                const resultado = await DB.saveCredito(credito);
                console.log('Cuotas cobradas guardadas:', resultado);

                // Limpiar formulario
                montoInput.value = '';
                cantidadInput.value = '1';

                // Recargar datos
                this.loadData();

                alert(`Se han registrado ${cantidad} cuotas cobradas correctamente`);
            } catch (err) {
                console.error('Error al guardar cuotas cobradas:', err);
                throw err;
            }

            // Limpiar formulario
            montoInput.value = '';
            cantidadInput.value = '1';

            // Recargar datos
            this.loadData();

            alert(`Se han registrado ${cantidad} cuotas cobradas correctamente`);
        } catch (error) {
            console.error('Error al guardar cuota cobrada:', error);
            alert('Error al guardar la cuota cobrada: ' + error.message);
        }
    },

    // Editar crédito
    async editarCredito(tipo) {
        try {
            console.log(`Editando crédito de tipo: ${tipo}`);

            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('creditos-mes').value);
            const anio = parseInt(document.getElementById('creditos-anio').value);

            // Obtener créditos del tipo seleccionado
            const creditos = await DB.getCreditos(mes, anio);
            const creditosFiltrados = creditos.filter(credito => credito.tipo === tipo);

            if (creditosFiltrados.length === 0) {
                alert(`No hay créditos de tipo "${tipo}" para editar en este mes`);
                return;
            }

            // Ordenar créditos por fecha (más reciente primero)
            creditosFiltrados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            // Crear lista de créditos para mostrar en el prompt
            let listaCreditos = 'Seleccione el número del crédito a editar:\n\n';

            creditosFiltrados.forEach((credito, index) => {
                const tipoTexto = credito.tipo === 'nuevo' ? 'Nuevo' :
                                 credito.tipo === 'renovacion' ? 'Renovación' : 'Cuota Cobrada';

                listaCreditos += `${index + 1}. ${App.formatDate(credito.fecha)} - ${tipoTexto} - ${App.formatCurrency(credito.monto)} - ${credito.cliente}\n`;
            });

            // Solicitar selección al usuario
            const seleccion = prompt(listaCreditos);

            if (seleccion === null) {
                // El usuario canceló
                return;
            }

            const indice = parseInt(seleccion) - 1;

            if (isNaN(indice) || indice < 0 || indice >= creditosFiltrados.length) {
                alert('Selección inválida');
                return;
            }

            // Obtener crédito seleccionado
            const creditoSeleccionado = creditosFiltrados[indice];

            // Solicitar nuevo monto
            const nuevoMonto = prompt('Ingrese el nuevo monto:', creditoSeleccionado.monto);

            if (nuevoMonto === null) {
                // El usuario canceló
                return;
            }

            const montoEditado = parseFloat(nuevoMonto);

            if (isNaN(montoEditado) || montoEditado < 0) {
                alert('Por favor ingrese un monto válido');
                return;
            }

            // Actualizar crédito
            creditoSeleccionado.monto = montoEditado;
            creditoSeleccionado.updated_at = new Date().toISOString();

            // Guardar crédito actualizado
            await DB.updateCredito(creditoSeleccionado.id, creditoSeleccionado);

            // Recargar datos
            this.loadData();

            alert('Crédito actualizado correctamente');
        } catch (error) {
            console.error('Error al editar crédito:', error);
            alert('Error al editar el crédito: ' + error.message);
        }
    },

    // Cargar datos de créditos
    async loadData() {
        try {
            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('creditos-mes').value);
            const anio = parseInt(document.getElementById('creditos-anio').value);

            // Obtener créditos
            const creditos = await DB.getCreditos(mes, anio);

            // Calcular estadísticas
            const nuevos = creditos.filter(credito => credito.tipo === 'nuevo');
            const renovaciones = creditos.filter(credito => credito.tipo === 'renovacion');
            const cobrados = creditos.filter(credito => credito.tipo === 'cobrado');

            const montoNuevos = nuevos.reduce((sum, credito) => sum + credito.monto, 0);
            const montoRenovaciones = renovaciones.reduce((sum, credito) => sum + credito.monto, 0);
            const montoCobrados = cobrados.reduce((sum, credito) => sum + credito.monto, 0);

            // Actualizar UI
            document.getElementById('creditos-nuevos-cantidad').textContent = nuevos.length;
            document.getElementById('creditos-renovaciones-cantidad').textContent = renovaciones.length;
            document.getElementById('creditos-cobrados-cantidad').textContent = cobrados.length;

            document.getElementById('creditos-nuevos-monto').textContent = App.formatCurrency(montoNuevos);
            document.getElementById('creditos-renovaciones-monto').textContent = App.formatCurrency(montoRenovaciones);
            document.getElementById('creditos-cobrados-monto').textContent = App.formatCurrency(montoCobrados);

            // Actualizar tabla de créditos
            this.updateCreditosTable(creditos);

            // Actualizar gráficos
            this.updateCharts(nuevos.length, renovaciones.length, cobrados.length, montoNuevos, montoRenovaciones, montoCobrados);
        } catch (error) {
            console.error('Error al cargar datos de créditos:', error);
        }
    },



    // Actualizar tabla de créditos
    updateCreditosTable(creditos) {
        const tbody = document.getElementById('tabla-creditos');

        if (!tbody) return;

        // Limpiar tabla
        tbody.innerHTML = '';

        if (creditos.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">No hay créditos registrados</td>
                </tr>
            `;
            return;
        }

        // Ordenar créditos por fecha (más reciente primero)
        creditos.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        // Llenar tabla
        creditos.forEach(credito => {
            const row = document.createElement('tr');
            row.setAttribute('data-tipo', credito.tipo);

            // Mapear tipo a texto más amigable
            let tipoTexto = 'Nuevo';
            let tipoBadge = 'badge-nuevo';

            if (credito.tipo === 'renovacion') {
                tipoTexto = 'Renovación';
                tipoBadge = 'badge-renovacion';
            } else if (credito.tipo === 'cobrado') {
                tipoTexto = 'Cuota Cobrada';
                tipoBadge = 'badge-cobrado';
            }

            // Mostrar la cantidad si está disponible
            const cantidadTexto = credito.cantidad ? `<span class="badge badge-info">${credito.cantidad}</span>` : '';

            row.innerHTML = `
                <td>${App.formatDate(credito.fecha)}</td>
                <td><span class="badge ${tipoBadge}">${tipoTexto}</span></td>
                <td>${App.formatCurrency(credito.monto)}</td>
                <td>${credito.cliente} ${cantidadTexto}</td>
                <td>
                    <button class="btn btn-danger btn-small eliminar-credito" data-id="${credito.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

            tbody.appendChild(row);
        });

        // Configurar eventos de botones de eliminar
        const eliminarButtons = document.querySelectorAll('.eliminar-credito');

        eliminarButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const id = parseInt(button.getAttribute('data-id'));
                this.eliminarCredito(id);
            });
        });

        // Aplicar filtro actual
        this.filterCreditos();
    },

    // Filtrar créditos
    filterCreditos() {
        const filtro = document.getElementById('filtro-creditos').value;
        const rows = document.querySelectorAll('#tabla-creditos tr[data-tipo]');

        rows.forEach(row => {
            if (filtro === 'todos' || row.getAttribute('data-tipo') === filtro) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    },

    // Actualizar gráficos
    updateCharts(nuevos, renovaciones, cobrados, montoNuevos, montoRenovaciones, montoCobrados) {
        // Actualizar gráfico de distribución
        this.updateDistribucionChart(nuevos, renovaciones, cobrados);

        // Actualizar gráfico de montos
        this.updateMontosChart(montoNuevos, montoRenovaciones, montoCobrados);
    },

    // Actualizar gráfico de distribución
    updateDistribucionChart(nuevos, renovaciones, cobrados) {
        const ctx = document.getElementById('chart-distribucion-creditos');

        if (!ctx) return;

        // Destruir gráfico existente si hay uno
        if (this.charts.distribucion) {
            this.charts.distribucion.destroy();
        }

        // Crear nuevo gráfico
        this.charts.distribucion = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Nuevos', 'Renovaciones', 'Cuotas Cobradas'],
                datasets: [{
                    data: [nuevos, renovaciones, cobrados],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                    borderColor: ['#2563eb', '#059669', '#d97706'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Actualizar gráfico de montos
    updateMontosChart(montoNuevos, montoRenovaciones, montoCobrados) {
        const ctx = document.getElementById('chart-montos-creditos');

        if (!ctx) return;

        // Destruir gráfico existente si hay uno
        if (this.charts.montos) {
            this.charts.montos.destroy();
        }

        // Crear nuevo gráfico
        this.charts.montos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Nuevos', 'Renovaciones', 'Cuotas Cobradas'],
                datasets: [{
                    label: 'Montos por Tipo',
                    data: [montoNuevos, montoRenovaciones, montoCobrados],
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                    borderColor: ['#2563eb', '#059669', '#d97706'],
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

    // Eliminar crédito individual
    async eliminarCredito(id) {
        try {
            console.log(`Eliminando crédito con ID ${id}`);

            // Confirmar eliminación
            if (!confirm('¿Está seguro de eliminar este crédito? Esta acción no se puede deshacer.')) {
                return;
            }

            // Eliminar crédito
            await DB.deleteCredito(id);

            // Recargar datos
            this.loadData();

            alert('Crédito eliminado correctamente');
        } catch (error) {
            console.error('Error al eliminar crédito:', error);
            alert('Error al eliminar el crédito: ' + error.message);
        }
    },

    // Eliminar créditos por día
    async eliminarCreditosPorDia() {
        try {
            console.log('Eliminando créditos por día');

            // Solicitar fecha
            const fecha = prompt('Ingrese la fecha (YYYY-MM-DD):');

            if (!fecha) {
                return;
            }

            // Validar formato de fecha
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;

            if (!fechaRegex.test(fecha)) {
                alert('Por favor ingrese una fecha válida en formato YYYY-MM-DD');
                return;
            }

            // Confirmar eliminación
            if (!confirm(`¿Está seguro de eliminar todos los créditos del día ${fecha}? Esta acción no se puede deshacer.`)) {
                return;
            }

            // Eliminar créditos
            const eliminados = await DB.deleteCreditosPorFecha(fecha);

            // Recargar datos
            this.loadData();

            if (eliminados === 0) {
                alert(`No se encontraron créditos para la fecha ${fecha}`);
            } else {
                alert(`Se eliminaron ${eliminados} créditos del día ${fecha} correctamente`);
            }
        } catch (error) {
            console.error('Error al eliminar créditos por día:', error);
            alert('Error al eliminar los créditos: ' + error.message);
        }
    },

    // Eliminar créditos por mes
    async eliminarCreditosPorMes() {
        try {
            console.log('Eliminando créditos por mes');

            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('creditos-mes').value);
            const anio = parseInt(document.getElementById('creditos-anio').value);

            // Confirmar eliminación
            if (!confirm(`¿Está seguro de eliminar TODOS los créditos del mes ${mes}/${anio}? Esta acción no se puede deshacer.`)) {
                return;
            }

            // Eliminar créditos
            const eliminados = await DB.deleteCreditosPorMes(mes, anio);

            // Recargar datos
            this.loadData();

            if (eliminados === 0) {
                alert(`No se encontraron créditos para el mes ${mes}/${anio}`);
            } else {
                alert(`Se eliminaron ${eliminados} créditos del mes ${mes}/${anio} correctamente`);
            }
        } catch (error) {
            console.error('Error al eliminar créditos por mes:', error);
            alert('Error al eliminar los créditos: ' + error.message);
        }
    },

    // Exportar datos
    async exportData() {
        try {
            // Obtener mes y año seleccionados
            const mes = parseInt(document.getElementById('creditos-mes').value);
            const anio = parseInt(document.getElementById('creditos-anio').value);

            // Obtener créditos
            const creditos = await DB.getCreditos(mes, anio);

            if (creditos.length === 0) {
                alert('No hay datos para exportar');
                return;
            }

            // Calcular estadísticas
            const nuevos = creditos.filter(credito => credito.tipo === 'nuevo');
            const renovaciones = creditos.filter(credito => credito.tipo === 'renovacion');
            const cobrados = creditos.filter(credito => credito.tipo === 'cobrado');

            const montoNuevos = nuevos.reduce((sum, credito) => sum + credito.monto, 0);
            const montoRenovaciones = renovaciones.reduce((sum, credito) => sum + credito.monto, 0);
            const montoCobrados = cobrados.reduce((sum, credito) => sum + credito.monto, 0);

            // Preparar datos para exportar
            const resumen = [
                {
                    Tipo: 'Nuevos Créditos',
                    Cantidad: nuevos.length,
                    'Monto Total': montoNuevos
                },
                {
                    Tipo: 'Renovaciones',
                    Cantidad: renovaciones.length,
                    'Monto Total': montoRenovaciones
                },
                {
                    Tipo: 'Cuotas Cobradas',
                    Cantidad: cobrados.length,
                    'Monto Total': montoCobrados
                },
                {
                    Tipo: 'TOTAL',
                    Cantidad: creditos.length,
                    'Monto Total': montoNuevos + montoRenovaciones + montoCobrados
                }
            ];

            const creditosData = creditos.map(credito => ({
                Fecha: App.formatDate(credito.fecha),
                Tipo: credito.tipo === 'nuevo' ? 'Nuevo' :
                      credito.tipo === 'renovacion' ? 'Renovación' : 'Cuota Cobrada',
                Monto: credito.monto,
                Cliente: credito.cliente
            }));

            // Mostrar menú de exportación
            Export.showExportMenu(
                document.getElementById('exportar-creditos'),
                [...resumen, ...creditosData],
                `creditos-${mes}-${anio}`
            );
        } catch (error) {
            console.error('Error al exportar datos:', error);
            alert('Error al exportar datos');
        }
    }
};
