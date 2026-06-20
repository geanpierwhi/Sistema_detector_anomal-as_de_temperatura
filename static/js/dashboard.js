document.addEventListener("DOMContentLoaded", () => {
    const gridContenedor = document.getElementById("sensores-grid");
    const ctx = document.getElementById('temperaturaChart').getContext('2d');
    
    const maxPuntosEnPantalla = 30; // Límite de puntos visibles simultáneamente en el gráfico
    const coloresDataset = ['#3498db', '#9b59b6', '#1abc9c'];
    
    // Inicialización base de Chart.js
    let configuracionGrafico = {
        type: 'line',
        data: {
            labels: [],
            datasets: []
        },
        options: {
            responsive: true,
            animation: { duration: 300 },
            scales: {
                y: { beginAtZero: false, title: { display: true, text: 'Temperatura (°C)' } },
                x: { title: { display: true, text: 'Línea de Tiempo' } }
            }
        }
    };
    
    let tempChart = new Chart(ctx, configuracionGrafico);

    // Renderiza las tarjetas de estado del panel con la última información
    function actualizarTarjetasUI(datosSensores) {
        gridContenedor.innerHTML = ""; 

        datosSensores.forEach(sensor => {
            let icono = "fa-temperature-half";
            if(sensor.clase_estado === "peligro") icono = "fa-temperature-high fa-beat";
            if(sensor.clase_estado === "normal") icono = "fa-temperature-low";

            const tarjetaHtml = `
                <div class="sensor-card ${sensor.clase_estado}">
                    <div class="card-header">
                        <h3>${sensor.negocio}</h3>
                        <span class="sensor-id">ID: ${sensor.id}</span>
                    </div>
                    <div class="temp-display ${sensor.clase_estado}">
                        <i class="fa-solid ${icono}"></i>
                        <span class="temp-value">${sensor.temperatura}°C</span>
                    </div>
                    <div class="status-badge ${sensor.clase_estado}">
                        <i class="fa-solid fa-triangle-exclamation"></i> Estado: ${sensor.estado}
                    </div>
                    <div style="text-align: right; margin-top: 10px; font-size: 0.8em; color: #7f8c8d;">
                        Sincronizado: ${sensor.hora}
                    </div>
                </div>
            `;
            gridContenedor.insertAdjacentHTML('beforeend', tarjetaHtml);
        });
    }

    // Paso 1: Cargar el dataset inicial pre-poblado por Python
    async function cargarDatasetPrevio() {
        try {
            const respuesta = await fetch('/api/dataset/inicial');
            const datasetHistorial = await respuesta.json();
            
            let sensorIds = Object.keys(datasetHistorial);
            if (sensorIds.length === 0) return;

            // Mapear los tiempos basándonos en los registros del primer sensor disponible
            const primerSensorId = sensorIds[0];
            tempChart.data.labels = datasetHistorial[primerSensorId].map(registro => registro.hora);

            // Inyectar las series completas de datos al gráfico por cada negocio
            sensorIds.forEach((id, index) => {
                const listaLecturas = datasetHistorial[id];
                const nombreNegocio = listaLecturas[0].negocio;
                const arrayTemperaturas = listaLecturas.map(registro => registro.temperatura);

                tempChart.data.datasets.push({
                    label: nombreNegocio,
                    data: arrayTemperaturas,
                    borderColor: coloresDataset[index % coloresDataset.length],
                    backgroundColor: coloresDataset[index % coloresDataset.length] + '15', // Transparencia
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                });
            });

            tempChart.update();

            // Extraer el último elemento de cada sensor para actualizar las tarjetas dinámicas iniciales
            const ultimosEstados = sensorIds.map(id => {
                const registros = datasetHistorial[id];
                return registros[registros.length - 1];
            });
            actualizarTarjetasUI(ultimosEstados);

        } catch (error) {
            console.error("Error cargando el dataset base de Python:", error);
        }
    }

    // Paso 2: Escuchar las actualizaciones periódicas en tiempo real
    async function simularFlujoTiempoReal() {
        try {
            const respuesta = await fetch('/api/dataset/actualizar');
            const nuevasLecturas = await respuesta.json();
            
            // Actualizar el estado visual de los paneles
            actualizarTarjetasUI(nuevasLecturas);

            // Agregar la estampa de tiempo al eje X del gráfico
            const horaActual = nuevasLecturas[0].hora;
            tempChart.data.labels.push(horaActual);

            // Insertar el nuevo valor en cada serie correspondiente
            nuevasLecturas.forEach((sensor, index) => {
                if (tempChart.data.datasets[index]) {
                    tempChart.data.datasets[index].data.push(sensor.temperatura);
                }
            });

            // Si los datos superan el límite configurado en pantalla, remover el elemento más antiguo (efecto scroll)
            if (tempChart.data.labels.length > maxPuntosEnPantalla) {
                tempChart.data.labels.shift();
                tempChart.data.datasets.forEach(dataset => {
                    dataset.data.shift();
                });
            }

            tempChart.update();
            
        } catch (error) {
            console.error("Error al asimilar la lectura en tiempo real:", error);
        }
    }

    // Orquestación del arranque del sistema
    async function inicializarMonitoreo() {
        await cargarDatasetPrevio(); // Carga las lecturas pasadas simuladas
        setInterval(simularFlujoTiempoReal, 2500); // Polling activo cada 2.5 segundos
    }

    inicializarMonitoreo();
});