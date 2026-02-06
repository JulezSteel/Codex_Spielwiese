import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ScenarioConfig } from "@/lib/types";
import { axes } from "@/lib/content";

/* -------------------------------------------------
   Validation Logic
-------------------------------------------------- */
function validateConfig(input: ScenarioConfig): ScenarioConfig {
  const config = { ...input };
  axes.forEach((axis) => {
    const key = axis.id as keyof ScenarioConfig;
    const value = Number(config[key]);
    if (isNaN(value)) {
      (config as any)[key] = axis.min;
    }
  });
  if (config.language !== "en" && config.language !== "de") config.language = "en";
  return config;
}

/* -------------------------------------------------
   Prompt Construction
-------------------------------------------------- */
function buildPrompt(config: ScenarioConfig) {
  const language = config.language;
  const system = language === "de" 
    ? "Du bist eine Zukunftsanalystin. Schreibe eine 2050-Erzählung (180-280 Wörter). Ende mit 5 Bullet Points." 
    : "You are a future analyst. Write a 2050 narrative (180-280 words). End with 5 bullet points.";

  const axisLines = axes.map(a => `${a.title[language]}: ${config[a.id as keyof ScenarioConfig]}`).join("\n");
  const user = `Calibrations:\n${axisLines}\nWrite the narrative now.`;

  return { system, user };
}

/* -------------------------------------------------
   Main API Route
-------------------------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const config = validateConfig(payload);
    const { system, user } = buildPrompt(config);

    // 1. OpenAI Handler
    if (config.provider === "openai" && process.env.OPENAI_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      });
      return NextResponse.json({ text: completion.choices[0]?.message?.content?.trim() });
    }

    // 2. Gemini Handler (Fixed Syntax)
    if (config.provider === "gemini" && process.env.GEMINI_API_KEY) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\n${user}` }] }]
        })
      });

      if (!response.ok) {
        return NextResponse.json({ text: "Gemini API error. Check your key." }, { status: 500 });
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return NextResponse.json({ text: text || "No text returned from Gemini." });
    }

    // 3. Fallback to Mock
    const fallbackText = config.language === "de" ? "Dies ist eine Test-Vorschau." : "This is a test preview.";
    return NextResponse.json({ text: fallbackText });

  } catch (error) {
    console.error("Critical Error:", error);
    return NextResponse.json({ text: "A technical error occurred during generation." }, { status: 500 });
  }
}
