import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { userResponse, currentQuestion, turnCount, companyName } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const isLastTurn = turnCount >= 5; // La entrevista durará 5 preguntas

    const prompt = `Eres un reclutador experto enfocado en la empresa "${companyName}".
    ${isLastTurn ? "Esta es la última pregunta." : ""}
    
    Reglas:
    1. Haz preguntas concisas (máximo 15 palabras) sobre habilidades técnicas y blandas aplicadas a ${companyName}.
    2. Evalúa la respuesta anterior del estudiante de forma breve y constructiva.
    
    Respuesta anterior: "${userResponse}"
    Pregunta anterior: "${currentQuestion}"
    
    Responde en JSON:
    - "feedback": Breve análisis de la respuesta anterior.
    - "nextQuestion": Tu siguiente pregunta (o "FIN" si ya se completaron los turnos).
    - "finalReport": Si es el último turno, genera un resumen con 3 consejos clave de mejora. Si no, pon "".`;

    const result = await model.generateContent(prompt);
    const parsedResult = JSON.parse(result.response.text());

    return NextResponse.json(parsedResult);
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}