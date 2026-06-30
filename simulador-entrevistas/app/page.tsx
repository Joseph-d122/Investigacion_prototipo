"use client";

import { useState, useEffect, useRef } from "react";

const TOTAL_PREGUNTAS = 5;

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function SimuladorEntrevistaTecnica() {
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [contextoDocumento, setContextoDocumento] = useState("");

  const [started, setStarted] = useState(false);
  const [turnCount, setTurnCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [lastFeedback, setLastFeedback] = useState("");
  const [finalReport, setFinalReport] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Efecto de máquina de escribir, propio de una consola de logs
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
        inputRef.current?.focus();
      }
    }, 18);
    return () => clearInterval(intervalId);
  }, [currentQuestion]);

  const startInterview = async () => {
    if (!companyName.trim() || isProcessing) return;
    setIsProcessing(true);
    setSetupError("");

    try {
      let resumen = "";

      if (file) {
        const base64 = await fileToBase64(file);
        const res = await fetch("/api/analizar-documento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileBase64: base64,
            mimeType: file.type,
            companyName,
            position,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        resumen = data.resumenContexto || "";
        setContextoDocumento(resumen);
      }

      const res = await fetch("/api/entrevistador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userResponse: "",
          currentQuestion: "",
          turnCount: 1,
          companyName,
          position,
          contextoDocumento: resumen,
        }),
      });
      const data = await res.json();
      if (!data.nextQuestion) throw new Error("Respuesta vacía del entrevistador.");

      setStarted(true);
      setTurnCount(1);
      setCurrentQuestion(data.nextQuestion);
    } catch {
      setSetupError(
        "No se pudo iniciar la entrevista (revisa tu conexión o la API key). Intenta de nuevo."
      );
    } finally {
      setIsProcessing(false);
    }
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
          companyName,
          position,
          contextoDocumento,
        }),
      });

      const data = await res.json();
      setUserInput("");
      setLastFeedback(data.feedback);

      if (data.nextQuestion === "FIN") {
        setFinalReport(data.finalReport);
        setTurnCount(TOTAL_PREGUNTAS + 1);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setTurnCount(nextCount);
      }
    } catch {
      setCurrentQuestion("// ERROR: no se pudo conectar con el entrevistador. Intenta de nuevo.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ---------- PANTALLA DE CONFIGURACIÓN ----------
  if (!started) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-md rounded-lg border border-console-border bg-console-panel shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-console-border bg-black/30">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-rose/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-amber/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-teal/70" />
            <span className="ml-2 text-xs text-muted font-[var(--font-display)] tracking-wide">
              Entrevistador IA
            </span>
          </div>

          <div className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-accent-teal font-[var(--font-display)] mb-2">
              Consola de Entrevista Técnica
            </p>
            <h1 className="text-foreground text-xl font-[var(--font-display)] mb-1">
              ¿Para qué empresa y puesto simulamos?
            </h1>
            <p className="text-sm text-muted mb-5">
              Las preguntas serán técnicas, directas, y se ajustarán a lo que la IA sepa de la
              empresa y al cargo que indiques.
            </p>

            <label className="block text-xs text-muted mb-1 font-[var(--font-display)]">
              Empresa --nombre
            </label>
            <input
              className="w-full bg-black/40 text-foreground p-3 rounded mb-3 border border-console-border focus:outline-none focus:border-accent-teal font-[var(--font-display)] text-sm"
              placeholder="Ej. Microsoft, una startup local, etc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <label className="block text-xs text-muted mb-1 font-[var(--font-display)]">
              Cargo --aplicado
            </label>
            <input
              className="w-full bg-black/40 text-foreground p-3 rounded mb-3 border border-console-border focus:outline-none focus:border-accent-teal font-[var(--font-display)] text-sm"
              placeholder="Ej. Desarrollador Backend Jr."
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />

            <label className="block text-xs text-muted mb-1 font-[var(--font-display)]">
              Documento --opcional (CV o vacante)
            </label>
            <label className="flex items-center justify-between w-full bg-black/40 text-sm p-3 rounded mb-1 border border-console-border cursor-pointer hover:border-accent-teal transition-colors">
              <span className={file ? "text-foreground" : "text-muted"}>
                {file ? file.name : "Adjuntar PDF, imagen o texto…"}
              </span>
              <span className="text-accent-teal font-[var(--font-display)] text-xs">
                {file ? "cambiar" : "subir"}
              </span>
              <input
                type="file"
                accept=".pdf,.txt,image/*"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="text-xs text-muted mb-5">
              Si subes la vacante real o tu CV, la IA prioriza ese contenido sobre su
              conocimiento general de la empresa.
            </p>

            {setupError && (
              <p className="text-xs text-accent-rose mb-4 font-[var(--font-display)]">
                {setupError}
              </p>
            )}

            <button
              onClick={startInterview}
              disabled={!companyName.trim() || isProcessing}
              className="w-full bg-accent-teal text-black py-3 rounded font-bold font-[var(--font-display)] text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {isProcessing ? "preparando…" : "Iniciar entrevista →"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- PANTALLA DE REPORTE FINAL ----------
  if (turnCount > TOTAL_PREGUNTAS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-2xl rounded-lg border border-console-border bg-console-panel shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-console-border bg-black/30">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-rose/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-amber/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-teal/70" />
            <span className="ml-2 text-xs text-muted font-[var(--font-display)] tracking-wide">
              reporte_final.log
            </span>
          </div>
          <div className="p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-accent-teal font-[var(--font-display)] mb-3">
              Entrevista finalizada · {companyName}
              {position ? ` · ${position}` : ""}
            </p>
            <pre className="whitespace-pre-wrap text-sm text-foreground leading-relaxed font-[var(--font-body)] bg-black/30 border border-console-border rounded p-4">
              {finalReport || "No se generó reporte final."}
            </pre>
            <button
              onClick={() => {
                setStarted(false);
                setTurnCount(0);
                setCompanyName("");
                setPosition("");
                setFile(null);
                setContextoDocumento("");
                setLastFeedback("");
                setFinalReport("");
              }}
              className="mt-5 text-sm text-accent-teal font-[var(--font-display)] hover:underline"
            >
              ← Nueva sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- PANTALLA DE ENTREVISTA (escena + HUD técnico) ----------
  return (
    <main className="min-h-[100dvh] w-full relative overflow-hidden bg-background">
      {/* Escena de fondo: oficina */}
      <div className="absolute inset-0 bg-[url('/oficina.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/85" />

      {/* Personaje del reclutador: anclado abajo, 20% más grande y sin desplazamiento vertical */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center pointer-events-none">
        <img
          src="/empresario.png"
          alt="Reclutador"
          className="h-[72vh] lg:h-[84vh] object-contain object-bottom drop-shadow-2xl"
        />
      </div>

      {/* HUD superior: ficha de la sesión */}
      <div className="absolute top-0 inset-x-0 z-30 flex flex-wrap items-start justify-between gap-3 p-4 lg:p-6">
        <div className="flex items-center gap-2 rounded-lg border border-console-border bg-console-panel/90 backdrop-blur px-4 py-2 shadow-lg">
          <span className="h-2 w-2 rounded-full bg-accent-teal animate-pulse" />
          <div className="font-[var(--font-display)] text-xs leading-tight">
            <p className="text-foreground">{companyName}</p>
            {position && <p className="text-muted">{position}</p>}
          </div>
          {contextoDocumento && (
            <span className="ml-2 text-[10px] text-accent-teal font-[var(--font-display)] border border-accent-teal/40 rounded-full px-2 py-0.5">
              doc ✓
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-console-border bg-console-panel/90 backdrop-blur px-3 py-2 shadow-lg">
          {Array.from({ length: TOTAL_PREGUNTAS }, (_, idx) => {
            const n = idx + 1;
            const status = n < turnCount ? "done" : n === turnCount ? "active" : "queued";
            return (
              <span
                key={n}
                title={`Pregunta ${n}`}
                className={`h-2 w-5 rounded-full transition-colors ${
                  status === "done"
                    ? "bg-accent-teal"
                    : status === "active"
                    ? "bg-accent-amber animate-pulse"
                    : "bg-console-border"
                }`}
              />
            );
          })}
          <span className="ml-2 text-[10px] text-muted font-[var(--font-display)]">
            {Math.min(turnCount, TOTAL_PREGUNTAS)}/{TOTAL_PREGUNTAS}
          </span>
        </div>
      </div>

      {/* Feedback flotante */}
      {lastFeedback && (
        <div className="fade-in-line absolute top-20 lg:top-24 right-4 lg:right-6 z-30 max-w-xs lg:max-w-sm">
          <div className="border-l-2 border-accent-amber bg-console-panel/90 backdrop-blur rounded px-4 py-3 shadow-lg max-h-[30vh] overflow-y-auto">
            <p className="text-xs text-accent-amber font-[var(--font-display)] mb-1">// feedback</p>
            <p className="text-sm text-foreground leading-relaxed">{lastFeedback}</p>
          </div>
        </div>
      )}

      {/* Cuadro de diálogo técnico */}
      <div className="absolute bottom-0 inset-x-0 z-20 flex justify-center px-4 pb-4 lg:pb-6">
        <div className="w-full max-w-3xl rounded-lg border border-console-border bg-console-panel/95 backdrop-blur shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-console-border bg-black/30">
            <span className="h-2.5 w-2.5 rounded-full bg-accent-rose/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-amber/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-accent-teal/70" />
            <span className="ml-2 text-xs text-muted font-[var(--font-display)] tracking-wide truncate">
              entrevista · {companyName}
            </span>
          </div>

          <div className="p-5 lg:p-6">
            <p className="text-lg text-foreground leading-relaxed font-[var(--font-body)] min-h-[3.5rem] max-h-[22vh] overflow-y-auto">
              {displayedText}
              {isTyping && <span className="cursor-blink text-accent-teal">▌</span>}
            </p>

            {!isTyping && (
              <form onSubmit={handleSubmit} className="mt-5 flex items-center gap-2">
                <span className="text-accent-teal font-[var(--font-display)]">{">"}</span>
                <input
                  ref={inputRef}
                  autoFocus
                  className="flex-1 bg-transparent border-b border-console-border text-foreground py-2 focus:outline-none focus:border-accent-teal font-[var(--font-body)] text-sm"
                  placeholder="Escribe tu respuesta técnica..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={isProcessing}
                />
                <button
                  disabled={isProcessing || !userInput.trim()}
                  className="text-accent-teal font-bold font-[var(--font-display)] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                >
                  {isProcessing ? "evaluando…" : "enviar →"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}