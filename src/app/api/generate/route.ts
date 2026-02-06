import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ScenarioConfig } from "@/lib/types";
import { axes } from "@/lib/content";

/* -------------------------------------------------
   Helpers & Validation
-------------------------------------------------- */

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

type NumericAxisKey =
  | "climateC"
  | "workforcePressure"
  | "financialRisk"
  | "socialCohesion"
  | "geopolitics"
  | "governanceInfo"
  | "techDiffusion";

function validateConfig(input: ScenarioConfig): ScenarioConfig {
  const config: ScenarioConfig = { ...input };

  axes.forEach((axis) => {
    const key = axis.id as NumericAxisKey;
    const value = Number(config[key]);
    config[key] = clamp(
      Number.isFinite(value) ? value : axis.min,
      axis.min,
      axis.max
    );
  });

  if (config.language !== "en" && config.language !== "de") {
    config.language = "en";
  }

  if (!["openai", "gemini", "mock"].includes(config.provider)) {
    config.provider = "mock";
  }

  return config;
}

/* -------------------------------------------------
   Prompt construction
-------------------------------------------------- */

function buildPrompt(config: ScenarioConfig) {
  const language = config.language;

  const system =
    language === "de"
      ? "Du bist eine fundierte Zukunftsanalystin. Schreibe eine plausible Erzählung für das Jahr 2050. Länge 180–280 Wörter. Ende mit 5 Bullet Points unter 'Was das für dich bedeutet'."
      : "You are a grounded future analyst. Write a plausible 2050 narrative. Length 180–280 words. End with exactly 5 bullet points under 'What this means for you'.";

  const axisLines = axes
    .map((axis) => {
      const value = Number(config[axis.id]).toFixed(axis.step < 1 ? 1 : 0);
      return `${axis.title[language]}: ${value}`;
    })
    .join("\n");

  const user =
    language === "de"
      ? `Hier sind die Kalibrierungen:\n${axisLines}\nSchreibe die Erzählung.`
      : `Here are the calibrations:\n${axisLines}\nWrite the narrative.`;

  return { system, user };
}

/* -------------------------------------------------
   Mock fallback
-------------------------------------------------- */

function mockNarrative(config: ScenarioConfig) {
  const language = config.language;
  if (language === "de") {
    return `Das Jahr 2050 ist ein Balanceakt. Die Welt ist im Wandel.\n\nWas das für dich bedeutet\n- Sei anpassungsfähig.\n- Plane langfristig.\n- Baue Resilienz auf.\n- Pflege Netze.\n- Bleib aufmerksam.`;
  }
  return `2050 is a balancing act. The world is changing.\n\nWhat this means for you\n- Stay adaptable.\n- Plan long-term.\n- Build resilience.\n- Socialize.\n- Stay engaged.`;
}

/* -------------------------------------------------
   API Route
-------------------------------------------------- */

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as ScenarioConfig;
  const config = validateConfig(payload);
  const { system, user } = buildPrompt(config);

  try {
    // 1. OpenAI Handler
    if (config.provider === "openai" && process.env.OPENAI_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.7
      });
      return NextResponse.json({ text: completion.choices[0]?.message?.content?.trim() });
    }

    // 2. Gemini Handler (Fixed Logic)
    if (config.provider === "gemini" && process.env.GEMINI_API_KEY) {
      const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: `System Instructions: ${system}\n\nUser Request: ${user}` }],
          }],
          generationConfig: { temperature: 0.7 },
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Gemini API Error:", response.status, errorData);
        return NextResponse.json({ text: "Error: Gemini API key invalid or rate limited." }, { status: 500 });
      }

      const data = await response.json();
      // Beginners: This is the specific part that finds the text in Gemini's complicated data structure
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) {
        return NextResponse.json({ text: "Gemini blocked the response. Try different slider settings." }, { status: 500 });
      }

      return NextResponse.json({ text });
    }

    // 3. Fallback to Mock
    return NextResponse.json({ text: mockNarrative(config) });

  } catch (error) {
    console.error("General API Error:", error);
    return NextResponse.json({ text: mockNarrative(config), warning: "Using fallback narrative." });
  }
}
