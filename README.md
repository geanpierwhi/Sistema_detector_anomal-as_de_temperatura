# Sistema Inteligente para Monitoreo y Detección de Anomalías de Temperatura
### Simulación educativa con ESP32

## Requisitos
- Python 3.8 o superior
- Flask

## Instalación

```bash
cd sistema_temperatura
pip install flask
```

## Ejecución

```bash
python app.py
```

Luego abre tu navegador en:

```
http://127.0.0.1:5000
```

## ¿Qué hace el sistema?

- Simula **6 ESP32** instalados en negocios locales distintos (panadería,
  farmacia, minimarket, restaurante, cibercafé, floristería), cada uno con
  su propio rango de temperatura normal de operación.
- Un hilo en segundo plano (`threading`) genera una nueva lectura cada
  **3 segundos** por sensor, usando una caminata aleatoria realista y,
  ocasionalmente, inyecta anomalías simuladas (picos, derivas o
  desconexiones) para poder demostrar la detección automática.
- El backend clasifica cada lectura como **normal**, **advertencia**,
  **crítico** u **offline**, y registra un log de alertas con descripción
  legible de cada anomalía.
- El frontend (HTML/CSS/JS + Chart.js + Font Awesome) consulta la API cada
  3 segundos mediante `fetch` y actualiza tarjetas de sensor, KPIs, gráfico
  de historial y feed de alertas sin recargar la página.

## Endpoints disponibles

| Método | Ruta                              | Descripción                                   |
|--------|-----------------------------------|------------------------------------------------|
| GET    | `/`                                | Dashboard principal                             |
| GET    | `/api/sensores`                   | Estado actual de todos los sensores             |
| GET    | `/api/historial/<sensor_id>`      | Últimas 60 lecturas de un sensor                |
| GET    | `/api/alertas`                    | Log de anomalías detectadas                     |
| GET    | `/api/resumen`                    | KPIs agregados (totales por estado, promedio)   |
| POST   | `/api/reiniciar`                  | Reinicia toda la simulación                     |
| POST   | `/api/forzar_anomalia/<sensor_id>`| Fuerza una anomalía manual (demo en clase)      |

## Notas
- Todos los datos viven **en memoria** (diccionarios y listas de Python);
  no hay archivos `.db`, ni SQLite, ni conexiones externas.
- No se requiere conexión a internet salvo para cargar Chart.js y
  Font Awesome desde CDN, y las fuentes web (Google Fonts).
