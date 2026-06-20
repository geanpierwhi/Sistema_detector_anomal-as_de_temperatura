import json
import random
from datetime import datetime, timedelta

# Configuración de los sensores
SENSORES = [
    {"id": "esp32_01", "negocio": "Panadería Central", "temp_base": 28.0, "variacion": 3.0, "limite_critico": 35.0},
    {"id": "esp32_02", "negocio": "Farmacia Salud", "temp_base": 20.0, "variacion": 1.5, "limite_critico": 25.0},
    {"id": "esp32_03", "negocio": "Almacén de Carnes", "temp_base": 4.0, "variacion": 2.0, "limite_critico": 10.0}
]

def generar_datos():
    dataset_completo = []
    tiempo_actual = datetime.now()

    # Generar 1000 iteraciones (ticks de tiempo)
    for i in range(1000):
        # Simulamos que cada lectura ocurre con 2 segundos de diferencia
        tiempo_str = (tiempo_actual + timedelta(seconds=i*2)).strftime("%H:%M:%S")
        lecturas_del_tick = []

        for sensor in SENSORES:
            # 8% de probabilidad de generar una anomalía por lectura
            if random.random() < 0.08:
                temp = sensor["temp_base"] + random.uniform(sensor["variacion"] + 4, sensor["variacion"] + 12)
            else:
                temp = sensor["temp_base"] + random.uniform(-sensor["variacion"], sensor["variacion"])

            temp = round(temp, 1)
            
            # Evaluar estado
            estado = "Normal"
            clase_estado = "normal"
            if temp >= sensor["limite_critico"]:
                estado = "Anomalía"
                clase_estado = "peligro"
            elif temp >= sensor["limite_critico"] - 2:
                estado = "Advertencia"
                clase_estado = "advertencia"

            lecturas_del_tick.append({
                "id": sensor["id"],
                "negocio": sensor["negocio"],
                "temperatura": temp,
                "estado": estado,
                "clase_estado": clase_estado,
                "hora": tiempo_str
            })
            
        dataset_completo.append(lecturas_del_tick)

    # Exportar a un archivo físico
    with open('dataset_simulacion.json', 'w', encoding='utf-8') as f:
        json.dump(dataset_completo, f, indent=4)
        
    print(f"Éxito: Se generó 'dataset_simulacion.json' con {len(dataset_completo)} bloques de lecturas.")

if __name__ == '__main__':
    generar_datos()