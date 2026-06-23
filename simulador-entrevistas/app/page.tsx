"use client";

import { useState, useRef, useEffect } from "react";
// Importamos el hook para el micrófono
import useAudioRecorder from "../hooks/useAudioRecorder";

export default function SimuladorEntrevistas() {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  
  const [currentQuestion, setCurrentQuestion] = useState("¡Hola! Para empezar, cuéntame sobre una situación reciente en la que tuviste que trabajar bajo mucha presión.");
  const [feedback, setFeedback] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [metrics, setMetrics] = useState({
    latency: 0,
    duration: 0,
    fillerWords: 0,
  });

  const questionStartTime = useRef(Date.now());
  const answerStartTime = useRef(0);

  // Reiniciamos el reloj de latencia cada vez que la IA lanza una nueva pregunta
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentQuestion]);

  const handleStart = () => {
    // Cálculo de la latencia en segundos (Manejo de presión)[cite: 1, 2]
    const latencyCalc = (Date.now() - questionStartTime.current) / 1000;
    setMetrics((prev) => ({ ...prev, latency: Number(latencyCalc.toFixed(2)) }));
    
    answerStartTime.current = Date.now();
    startRecording();
  };

  const handleStop = async () => {
    // Cálculo de la duración de la respuesta (Capacidad de síntesis)[cite: 1, 2]
    const durationCalc = (Date.now() - answerStartTime.current) / 1000;
    setMetrics((prev) => ({ ...prev, duration: Number(durationCalc.toFixed(2)) }));
    
    setIsProcessing(true);
    
    const audioBlob = await stopRecording();

    if (audioBlob) {
      await processAudio(audioBlob);
    } else {
      console.error("No se generó el archivo de audio.");
      setIsProcessing(false);
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      // 1. Transcribimos la voz usando el endpoint de Whisper
      const formData = new FormData();
      formData.append("audio", blob, "audio.webm");

      const transResponse = await fetch("/api/transcribir", {
        method: "POST",
        body: formData,
      });

      if (!transResponse.ok) {
        throw new Error("Error en la API de transcripción (Verifica tu saldo de OpenAI)");
      }

      const transData = await transResponse.json();
      const text = transData.text || "";
      setTranscript(text);

      // 2. Extracción de métricas conductuales: Muletillas (Actualizado con Regex)[cite: 1, 2]
      const fillerRegex = /\b(e+|m+|est[e]+|bueno|o sea|pues|digamos|como dec[ií]a+)\b/gi;
      const cleanText = text.toLowerCase().replace(/[.,?!]/g, "");
      const matches = cleanText.match(fillerRegex);
      const fillerCount = matches ? matches.length : 0;
      
      setMetrics((prev) => ({ ...prev, fillerWords: fillerCount }));

      // 3. Enviamos el texto transcrito a GPT-4o para obtener feedback y la siguiente pregunta
      const interviewResponse = await fetch("/api/entrevistador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userResponse: text, currentQuestion }),
      });
      
      if (!interviewResponse.ok) {
        throw new Error("Error en la API del entrevistador (Verifica tu saldo de OpenAI)");
      }

      const interviewData = await interviewResponse.json();
      
      // Actualizamos la UI con los datos de la IA
      setFeedback(interviewData.feedback || "Respuesta registrada correctamente.");
      setCurrentQuestion(interviewData.nextQuestion || "Gracias por tus respuestas. Hemos finalizado la entrevista piloto.");

    } catch (error) {
      console.error("Error procesando la entrevista:", error);
      setTranscript("Error: No se pudo procesar el audio.");
      setFeedback("Hubo un error de conexión al evaluar tus métricas. Es probable que necesites revisar el saldo de tu cuenta de OpenAI (Error 429).");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <header className="text-center">
          <h1 className="text-3xl font-bold text-blue-900">Simulador de Entrevistas 2D</h1>
          <p className="text-gray-500 mt-2">Entrenamiento y Evaluación Automatizada de Habilidades Blandas</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Módulo del Entrevistador (Avatar) */}
          <section className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center space-y-4">
            <div className="w-32 h-32 bg-indigo-100 rounded-full flex items-center justify-center border-4 border-indigo-500">
              <span className="text-4xl">🧑‍💼</span>
            </div>
            <h2 className="text-xl font-semibold text-indigo-900">Reclutador IA</h2>
            <div className="bg-indigo-50 p-4 rounded-lg w-full border border-indigo-100 min-h-[100px] flex items-center justify-center">
              <p className="text-lg italic">"{currentQuestion}"</p>
            </div>
          </section>

          {/* Módulo del Usuario (Estudiante) */}
          <section className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center justify-center space-y-6">
            <h2 className="text-xl font-semibold">Tu Turno</h2>
            
            <button 
              onClick={isRecording ? handleStop : handleStart}
              disabled={isProcessing}
              className={`px-8 py-4 rounded-full font-bold text-white transition-all transform hover:scale-105 ${
                isProcessing ? "bg-gray-400 cursor-not-allowed" 
                : isRecording ? "bg-red-500 animate-pulse" 
                : "bg-green-600 hover:bg-green-700 shadow-lg"
              }`}
            >
              {isProcessing ? "Analizando métricas..." : isRecording ? "⏹ Detener y Enviar" : "🎙️ Responder Pregunta"}
            </button>

            {isRecording && <p className="text-red-500 text-sm font-medium">Grabando audio...</p>}
          </section>

        </div>

        {/* Panel de Retroalimentación Basado en Datos */}
        <section className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500 space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">Panel de Retroalimentación</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="text-sm text-gray-500 uppercase font-bold tracking-wider">Latencia</h4>
              <p className="text-2xl font-black text-blue-600">{metrics.latency} <span className="text-sm font-normal">seg</span></p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="text-sm text-gray-500 uppercase font-bold tracking-wider">Duración</h4>
              <p className="text-2xl font-black text-blue-600">{metrics.duration} <span className="text-sm font-normal">seg</span></p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="text-sm text-gray-500 uppercase font-bold tracking-wider">Muletillas</h4>
              <p className="text-2xl font-black text-red-500">{metrics.fillerWords} <span className="text-sm font-normal">detectadas</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-gray-700 border-b pb-1">Transcripción (Speech-to-Text):</h4>
              <p className="text-gray-600 mt-2">{transcript || "Esperando tu primera respuesta..."}</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-700 border-b pb-1">Feedback Cualitativo (Asertividad/Síntesis):</h4>
              <p className="text-gray-600 mt-2 whitespace-pre-wrap">{feedback || "Aquí aparecerán las observaciones de la IA."}</p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}