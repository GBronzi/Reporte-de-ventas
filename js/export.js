// Funcionalidades de exportación
const Export = {
    // Exportar a Excel
    toExcel(data, fileName) {
        try {
            // Crear una hoja de cálculo
            const worksheet = XLSX.utils.json_to_sheet(data);
            
            // Crear un libro de trabajo
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
            
            // Guardar el archivo
            XLSX.writeFile(workbook, `${fileName}.xlsx`);
        } catch (error) {
            console.error('Error al exportar a Excel:', error);
            alert('Error al exportar a Excel');
        }
    },
    
    // Exportar a CSV
    toCSV(data, fileName) {
        try {
            // Convertir datos a CSV
            const worksheet = XLSX.utils.json_to_sheet(data);
            const csv = XLSX.utils.sheet_to_csv(worksheet);
            
            // Crear un blob
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
            
            // Guardar el archivo
            saveAs(blob, `${fileName}.csv`);
        } catch (error) {
            console.error('Error al exportar a CSV:', error);
            alert('Error al exportar a CSV');
        }
    },
    
    // Mostrar menú de exportación
    showExportMenu(button, data, fileName) {
        // Crear menú de exportación
        const menu = document.createElement('div');
        menu.className = 'export-menu';
        menu.innerHTML = `
            <button class="export-option" data-format="excel">Exportar a Excel</button>
            <button class="export-option" data-format="csv">Exportar a CSV</button>
        `;
        
        // Posicionar el menú
        menu.style.position = 'absolute';
        menu.style.top = `${button.offsetHeight}px`;
        menu.style.right = '0';
        menu.style.backgroundColor = 'white';
        menu.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
        menu.style.borderRadius = '4px';
        menu.style.zIndex = '1000';
        
        // Añadir el menú al DOM
        button.style.position = 'relative';
        button.appendChild(menu);
        
        // Configurar eventos
        const excelOption = menu.querySelector('[data-format="excel"]');
        const csvOption = menu.querySelector('[data-format="csv"]');
        
        excelOption.addEventListener('click', () => {
            this.toExcel(data, fileName);
            menu.remove();
        });
        
        csvOption.addEventListener('click', () => {
            this.toCSV(data, fileName);
            menu.remove();
        });
        
        // Cerrar el menú al hacer clic fuera de él
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && e.target !== button) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }
};
