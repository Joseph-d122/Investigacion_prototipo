# 🎙️ Simulador Digital Interactivo de Entrevistas Laborales (2D)

## 📌 Descripción del Proyecto
Este proyecto es un prototipo de **simulador digital interactivo** diseñado para el entrenamiento y la evaluación automatizada de habilidades blandas en entrevistas laborales, enfocado en estudiantes universitarios. 

A través de la integración de Inteligencia Artificial (procesamiento de lenguaje natural y reconocimiento de voz), la plataforma crea un entorno de alta presión donde los usuarios pueden practicar respuestas conductuales estructuradas, recibiendo retroalimentación objetiva e inmediata sobre su desempeño.

---

## 🚀 Lo que hace (Funcionalidades Principales)
El sistema actúa como un reclutador corporativo estricto pero formativo, evaluando competencias socioemocionales clave: **comunicación asertiva, manejo de presión, capacidad de síntesis y empatía interactiva**[cite: 1, 2].

* **Simulación Conversacional Continua:** La IA formula preguntas conductuales dinámicas basadas en la respuesta anterior del estudiante.
* **Captura de Voz en Tiempo Real:** Interfaz amigable que graba el audio directamente desde el micrófono del navegador y lo transcribe a texto con alta precisión.
* **Cálculo de Métricas Conductuales (Automatizadas)[cite: 1, 2]:**
  * **Latencia de respuesta:** Mide en segundos el tiempo que tarda el estudiante en empezar a hablar tras escuchar la pregunta (indicador de manejo de presión).
  * **Duración de la respuesta:** Evalúa la capacidad de síntesis midiendo los segundos de habla continua[cite: 1, 2].
  * **Frecuencia de Muletillas:** Sistema basado en Expresiones Regulares (Regex) para identificar y contar palabras de relleno (ej. *eh, mmm, este, bueno*).
* **Retroalimentación Cualitativa:** Un panel muestra feedback generado por la IA enfocado en la estructura de la respuesta y áreas de mejora sin emitir diagnósticos psicológicos[cite: 1].

---

## 🛠️ Tecnologías y Arquitectura Implementada
Este MVP (Producto Mínimo Viable) se desarrolló migrando de una propuesta inicial en Realidad Virtual (3D) a un entorno web bidimensional interactivo para acelerar la validación de las métricas centrales de la investigación.

* **Frontend:** React.js y Next.js (App Router) con TypeScript.
* **Estilos:** Tailwind CSS para una interfaz limpia, responsiva y estructurada.
* **Manejo de Hardware:** `MediaRecorder API` mediante Custom Hooks para gestionar el flujo de audio (blob) desde el navegador.
* **Backend y APIs (Cerebro IA):**
  * **OpenAI Whisper-1:** Endpoint `/api/transcribir` encargado de la transcripción de audio a texto (Speech-to-Text).
  * **OpenAI GPT-4o:** Endpoint `/api/entrevistador` configurado con un *System Prompt* estructurado según la rúbrica de la investigación académica para generar preguntas y feedback.

---

## ⚙️ Instalación y Uso (Desarrollo Local)

1. Clonar el repositorio:
```bash
   git clone [https://github.com/tu-usuario/Investigacion_prototipo.git](https://github.com/tu-usuario/Investigacion_prototipo.git)
   cd simulador-entrevistas
