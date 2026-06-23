import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Recibimos la transcripción de la voz del estudiante
    const body = await req.json();
    const { userResponse, currentQuestion } = body;

    const systemPrompt = `Eres un reclutador corporativo experto. Estás realizando una entrevista laboral simulada a un estudiante universitario próximo a realizar pasantías[cite: 1, 2].
    
    Tus objetivos de evaluación (basados en rúbricas estrictas) son:
    1. Comunicación asertiva: Evalúa claridad, estructura, tono y pertinencia[cite: 1].
    2. Capacidad de síntesis: Revisa si hay proporción de ideas relevantes sin extenderse demasiado[cite: 1].
    3. Empatía interactiva: Respuestas que adecúan el mensaje al contexto corporativo[cite: 1].
    
    Pregunta que hiciste: "${currentQuestion}"
    Respuesta del estudiante: "${userResponse}"
    
    Debes responder ÚNICAMENTE en formato JSON válido con dos claves:
    - "feedback": Un comentario constructivo, formativo y directo (máximo 2 líneas) sobre su respuesta, mencionando sus puntos fuertes y áreas de mejora[cite: 1]. Evita diagnósticos psicológicos[cite: 1].
    - "nextQuestion": La siguiente pregunta conductual para la entrevista (hazla retadora para evaluar manejo de presión)[cite: 1, 2].`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt }
      ],
      response_format: { type: "json_object" }, // Obligamos a la IA a devolver un JSON
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error en /api/entrevistador:", error);
    return NextResponse.json(
      { error: "Error al generar la retroalimentación." },
      { status: 500 }
    );
  }
}