import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// Inicializamos Gemini con tu clave de entorno
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audio = formData.get("audio");

    if (!audio || !(audio instanceof File)) {
      return NextResponse.json(
        { error: "Archivo de audio no encontrado." },
        { status: 400 }
      );
    }

    // Aquí convertimos el archivo a un formato que Gemini entienda
    const arrayBuffer = await audio.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Enviamos el audio a Gemini para que lo transcriba
    const result = await model.generateContent([
      "Por favor, transcribe este audio con precisión.",
      {
        inlineData: {
          data: base64Data,
          mimeType: audio.type,
        },
      },
    ]);

    const transcription = result.response.text();

    return NextResponse.json({
      text: transcription,
    });
  } catch (error) {
    console.error("Error en /api/transcribir con Gemini:", error);
    return NextResponse.json(
      { error: "Error al transcribir el audio." },
      { status: 500 }
    );
  }
}