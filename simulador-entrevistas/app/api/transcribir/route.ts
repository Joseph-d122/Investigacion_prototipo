import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const transcription = await openai.audio.transcriptions.create({
      file: audio,
      model: "whisper-1",
    });

    return NextResponse.json({
      text: transcription.text,
    });
  } catch (error) {
    console.error("Error en /api/transcribir:", error);

    return NextResponse.json(
      { error: "Error al transcribir el audio." },
      { status: 500 }
    );
  }
}