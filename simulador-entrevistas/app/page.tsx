"use client";

import { useState, useEffect } from "react";

export default function SimuladorVisualNovel() {
  const [companyName, setCompanyName] = useState("");
  const [started, setStarted] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFeedback, setLastFeedback] = useState("");

  // Efecto de máquina de escribir
  useEffect(() => {
    if (!currentQuestion) return;
    let i = 0;
    setDisplayedText("");
    setIsTyping(true);
    const intervalId = setInterval(() => {
      setDisplayedText(currentQuestion.slice(0, i + 1));
      i++;
      if (i >= currentQuestion.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 30);
    return () => clearInterval(intervalId);
  }, [currentQuestion]);

  const startInterview = async () => {
    if (!companyName.trim()) return;
    setStarted(true);
    setTurnCount(1);
    setCurrentQuestion(`Hola, bienvenido a la entrevista para ${companyName}. ¿Qué habilidades consideras clave para el éxito en nuestro sector?`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isProcessing) return;

    setIsProcessing(true);
    const nextCount = turnCount + 1;

    try {
      const res = await fetch("/api/entrevistador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userResponse: userInput, 
          currentQuestion, 
          turnCount: nextCount, 
          companyName 
        }),
      });

      const data = await res.json();
      setUserInput("");
      setLastFeedback(data.feedback);

      if (data.nextQuestion === "FIN") {
        setCurrentQuestion("Entrevista finalizada. Reporte final: " + data.finalReport);
        setTurnCount(6);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setTurnCount(nextCount);
      }
    } catch (error) {
      setCurrentQuestion("Error al conectar con el reclutador.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!started) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-950 p-6">
        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 w-full max-w-md text-center">
          <h1 className="text-2xl text-white font-bold mb-6">Configurar Entrevista</h1>
          <input 
            className="w-full bg-slate-800 text-white p-3 rounded mb-4 border border-slate-600"
            placeholder="Nombre de la empresa"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
          />
          <button onClick={startInterview} className="w-full bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-500">
            Comenzar Entrevista
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen w-full relative overflow-hidden bg-slate-900 flex flex-col justify-between">
      <div className="absolute inset-0 bg-[url('/oficina.jpg')] bg-cover bg-center opacity-40"></div>

      <div className="relative z-20 w-full p-6 flex justify-end">
        {lastFeedback && (
          <div className="bg-black/60 border-l-4 border-blue-500 p-4 rounded text-sm text-gray-200 max-w-sm">
            <p className="font-bold text-blue-400">Feedback:</p>
            {lastFeedback}
          </div>
        )}
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-end pb-2">
        <img src="/empresario.png" alt="Reclutador" className="h-[30rem] object-contain drop-shadow-2xl" />
      </div>

      <div className="relative z-20 w-full flex justify-center pb-8 px-4">
        <div className="w-full max-w-4xl bg-black/90 border border-slate-600 rounded-2xl p-6 shadow-2xl">
          <div className="text-2xl text-white mb-6 leading-relaxed">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </div>

          {!isTyping && turnCount <= 5 && (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                autoFocus
                className="flex-1 bg-transparent border-b border-slate-500 text-white p-2 focus:outline-none"
                placeholder="Escribe tu respuesta..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
              />
              <button disabled={isProcessing} className="text-blue-400 font-bold">Enviar</button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}