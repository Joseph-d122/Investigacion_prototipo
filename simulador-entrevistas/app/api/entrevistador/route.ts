import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const TOTAL_PREGUNTAS = 5;

export async function POST(req: NextRequest) {
  try {
    const {
      userResponse,
      currentQuestion,
      turnCount,
      companyName,
      position,
      contextoDocumento,
    } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const isFirstTurn = turnCount <= 1;
    const isLastTurn = turnCount >= TOTAL_PREGUNTAS;

    const prompt = `Eres un Investigador Técnico Senior y un entrevistador estricto. Tu objetivo es evaluar los conocimientos técnicos reales de un candidato que aplica al puesto de "${position || "un puesto técnico"}" en la empresa "${companyName}".

REGLAS ESTRICTAS DE INTERACCIÓN:
1. Haz SOLO UNA pregunta a la vez. Nunca hagas preguntas abiertas, generales ni de opinión (evita frases como "¿qué opinas...", "¿qué piensas...", "¿cómo te sientes..."). En su lugar, pide definiciones exactas de conceptos técnicos o plantea un escenario concreto que el candidato deba resolver.
2. Contextualiza tus preguntas usando lo que realmente sabes sobre "${companyName}" (su industria, escala, tipo de producto, tecnologías típicas del sector) y sobre las exigencias habituales del puesto de "${position || "el puesto indicado"}". Si no tienes información verificada y específica sobre esta empresa, no inventes datos concretos (cifras, nombres de productos, eventos o clientes) que no conozcas con certeza; en ese caso, construye un escenario realista para su industria sin presentarlo como un hecho específico de la empresa.
${
  contextoDocumento
    ? `3. Prioriza el siguiente contexto extraído de un documento que el candidato compartió (CV o descripción de la vacante) por encima de cualquier suposición general: """${contextoDocumento}"""`
    : ""
}
4. Antes de avanzar a la siguiente pregunta, evalúa con rigor la respuesta anterior del candidato: señala errores técnicos concretos y corrígelos con la explicación correcta. Sé constructivo pero exigente, sin ser condescendiente.
5. Cada pregunta debe ser concisa (máximo 25 palabras) pero técnicamente específica y aplicada.
6. Nunca menciones, ejemplifiques con, ni bases ningún escenario en una empresa distinta a "${companyName}". No sustituyas el nombre de la empresa por ningún otro, sin importar qué empresas hayas usado como ejemplo en el pasado.
${isFirstTurn ? "Esta es la primera pregunta de la entrevista: no hay respuesta previa que evaluar, deja \"feedback\" como una cadena vacía." : ""}
${isLastTurn ? "Esta es la última pregunta del proceso." : ""}

${
  !isFirstTurn
    ? `Respuesta anterior del candidato: "${userResponse}"
Pregunta anterior: "${currentQuestion}"`
    : ""
}

Responde ÚNICAMENTE en JSON con esta estructura exacta:
- "feedback": Evaluación técnica breve y directa de la respuesta anterior (cadena vacía si es la primera pregunta).
- "nextQuestion": Tu siguiente pregunta técnica directa (o "FIN" si ya se completaron los turnos).
- "finalReport": Si es el último turno, un resumen con 3 recomendaciones técnicas concretas de mejora. Si no, deja "".`;

    const result = await model.generateContent(prompt);
    const parsedResult = JSON.parse(result.response.text());

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("Error en /api/entrevistador:", error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}