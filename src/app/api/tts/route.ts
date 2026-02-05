import { NextRequest, NextResponse } from "next/server";

const MAX_TTS_CHARS = 1500;

function truncateText(text: string) {
  if (text.length <= MAX_TTS_CHARS) return text;
  const truncated = text.slice(0, MAX_TTS_CHARS);
  const lastPeriod = truncated.lastIndexOf(".");
  if (lastPeriod > 200) {
    return truncated.slice(0, lastPeriod + 1);
  }
  return truncated + "...";
}

export async function POST(request: NextRequest) {
  if (!process.env.ELEVENLABS_API_KEY) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_API_KEY for TTS generation." },
      { status: 501 }
    );
  }

  const body = (await request.json()) as {
    text?: string;
    language?: "en" | "de";
    voiceId?: string;
  };

  if (!body.text) {
    return NextResponse.json({ error: "Text is required." }, { status: 400 });
  }

  const voiceId =
    body.voiceId || process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
        Accept: "audio/mpeg"
      },
      body: JSON.stringify({
        text: truncateText(body.text),
        model_id: body.language === "de" ? "eleven_multilingual_v2" : undefined,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.8
        }
      })
    }
  );

  if (!response.ok) {
    const message = await response.text();
    return NextResponse.json(
      { error: message || "TTS request failed." },
      { status: response.status }
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return NextResponse.json({ audioBase64: base64, mimeType: "audio/mpeg" });
}
