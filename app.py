import json
import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

DATASET_COMPLETO = []
INDICE_SIMULACION = 0
DATASET_HISTORIAL = {"esp32_01": [], "esp32_02": [], "esp32_03": []}

def cargar_dataset_local():
    """Lee el archivo generado y prepara los datos en memoria"""
    global DATASET_COMPLETO, INDICE_SIMULACION
    
    if not os.path.exists('dataset_simulacion.json'):
        print("ADVERTENCIA: No se encontró dataset_simulacion.json. Ejecuta generar_dataset.py primero.")
        return

    with open('dataset_simulacion.json', 'r', encoding='utf-8') as f:
        DATASET_COMPLETO = json.load(f)

    # Tomar los primeros 25 registros para que el gráfico no inicie vacío
    for i in range(25):
        if i < len(DATASET_COMPLETO):
            lecturas = DATASET_COMPLETO[i]
            for lectura in lecturas:
                DATASET_HISTORIAL[lectura["id"]].append(lectura)
            INDICE_SIMULACION += 1

# Ejecutar carga inicial antes de arrancar rutas
cargar_dataset_local()

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/dataset/inicial')
def api_dataset_inicial():
    """Envía el historial base al frontend cuando carga la página"""
    return jsonify(DATASET_HISTORIAL)

@app.route('/api/dataset/actualizar')
def api_dataset_actualizar():
    """Retorna la siguiente lectura del archivo JSON simulando tiempo real"""
    global INDICE_SIMULACION
    
    # Si la simulación termina de leer el archivo, vuelve a empezar (Loop infinito)
    if INDICE_SIMULACION >= len(DATASET_COMPLETO):
        INDICE_SIMULACION = 0 
        
    nuevas_lecturas = DATASET_COMPLETO[INDICE_SIMULACION]
    INDICE_SIMULACION += 1
    
    # Actualizar la memoria del servidor para mantener congruencia
    for lectura in nuevas_lecturas:
        DATASET_HISTORIAL[lectura["id"]].append(lectura)
        if len(DATASET_HISTORIAL[lectura["id"]]) > 50:
            DATASET_HISTORIAL[lectura["id"]].pop(0)
            
    return jsonify(nuevas_lecturas)

if __name__ == '__main__':
    app.run(debug=True, port=5000)