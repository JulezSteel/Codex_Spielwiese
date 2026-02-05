import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ScenarioConfig } from "@/lib/types";
import { axes } from "@/lib/content";

/* -------------------------------------------------
   Helpers
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

/* -------------------------------------------------
   Validation
-------------------------------------------------- */

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
      ? "Du bist eine fundierte Zukunftsanalystin. Schreibe eine plausible, intern konsistente 2050-Erzählung. Verwende probabilistische Sprache, keine Gewissheiten. Ton: klar, bodenständig, leicht optimistisch aber ehrlich. Länge 180–280 Wörter. Beziehe jede Achse explizit ein: Klima, Demografie/Arbeitskräfte, Finanzstabilität, sozialer Zusammenhalt, Geopolitik, Regierungsfähigkeit/Informationsordnung, Technologie-Diffusion. Ende mit genau 5 Bullet Points unter der Überschrift 'Was das für dich bedeutet'."
      : "You are a grounded future analyst. Write a plausible, internally consistent 2050 narrative. Use probabilistic language, no absolutes. Tone: clear, grounded, slightly optimistic but honest. Length 180–280 words. Explicitly reflect every axis: climate, demography/workforce, financial stability, social cohesion, geopolitics, governance/info order, technology diffusion. End with exactly 5 bullet points under the heading 'What this means for you'.";

  const axisLines = axes
    .map((axis) => {
      const value = Number(config[axis.id]).toFixed(axis.step < 1 ? 1 : 0);
      return `${axis.title[language]}: ${axis.label[language]} = ${value} (${axis.leftLabel[language]} ↔ ${axis.rightLabel[language]})`;
    })
    .join("\n");

  const user =
    language === "de"
      ? `Hier sind die Kalibrierungen:\n${axisLines}\nSchreibe die Erzählung basierend auf diesen Werten.`
      : `Here are the calibrations:\n${axisLines}\nWrite the narrative based on these values.`;

  return { system, user };
}

/* -------------------------------------------------
   Mock fallback
-------------------------------------------------- */

function mockNarrative(config: ScenarioConfig) {
  const language = config.language;
  const climate = config.climateC.toFixed(1);

  if (language === "de") {
    return `Das Jahr 2050 fühlt sich nach einem vorsichtigen Balanceakt an. Die Erwärmung liegt bei etwa ${climate}°C. Die Welt ist nicht stabil, aber handlungsfähig. Institutionen stehen unter Druck, doch technologische und gesellschaftliche Anpassung eröffnen weiterhin Spielräume.\n\nWas das für dich bedeutet\n- Investiere in anpassungsfähige Fähigkeiten.\n- Plane langfristiger.\n- Baue Resilienz auf.\n- Pflege soziale Netze.\n- Bleib politisch aufmerksam.`;
  }

  return `2050 feels like a careful balancing act. Warming sits near ${climate}°C. The world is strained but still capable of adaptation. Institutions are under pressure, yet technology and social learning keep options open.\n\nWhat this means for you\n- Invest in adaptable skills.\n- Plan long-term.\n- Build resilience.\n- Strengthen social ties.\n- Stay civically engaged.`;
}

/* -------------------------------------------------
   API Route
-------------------------------------------------- */

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as ScenarioConfig;
  const config = validateConfig(payload);
  const { system, user } = buildPrompt(config);

  try {
    if (config.provider === "openai" && process.env.OPENAI_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

      const completion = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ],
        temperature: 0.7
      });

      const text = completion.choices[0]?.message?.content?.trim();
      if (!text) throw new Error("Empty response from OpenAI.");
      return NextResponse.json({ text });
    }

    if (config.provider === "gemini" && process.env.GEMINI_API_KEY) {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.GEMINI_API_KEY
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: `${system}\n\n${user}` }]
              }
            ],
            generationConfig: { temperature: 0.7 }
          })
        }
      );

      if (!response.ok) {
        throw new Error("Gemini request failed.");
      }

      const data = await response.json();
      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) throw new Error("Empty response from Gemini.");
      return NextResponse.json({ text });
    }

    return NextResponse.json({ text: mockNarrative(config) });
  } catch (error) {
    return NextResponse.json(
      {
        text: mockNarrative(config),
        warning:
          error instanceof Error
            ? error.message
            : "Generation failed, using mock."
      },
      { status: 200 }
    );
  }
}
