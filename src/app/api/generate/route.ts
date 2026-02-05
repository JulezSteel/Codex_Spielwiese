import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScenarioConfig } from "@/lib/types";
import { axes } from "@/lib/content";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function validateConfig(input: ScenarioConfig): ScenarioConfig {
  const config = { ...input };
  axes.forEach((axis) => {
    const value = Number(config[axis.id]);
    config[axis.id] = clamp(
      Number.isFinite(value) ? value : axis.min,
      axis.min,
      axis.max
    ) as ScenarioConfig[typeof axis.id];
  });
  if (config.language !== "en" && config.language !== "de") {
    config.language = "en";
  }
  if (!["openai", "gemini", "mock"].includes(config.provider)) {
    config.provider = "mock";
  }
  return config;
}

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

function mockNarrative(config: ScenarioConfig) {
  const language = config.language;
  const climate = config.climateC.toFixed(1);
  const workforce = config.workforcePressure;
  const finance = config.financialRisk;
  const cohesion = config.socialCohesion;
  const geopolitics = config.geopolitics;
  const governance = config.governanceInfo;
  const tech = config.techDiffusion;
  if (language === "de") {
    return `Das Jahr 2050 fühlt sich nach einem vorsichtigen Balanceakt an. Die Erwärmung liegt bei etwa ${climate}°C, was spürbare Risiken bringt, aber durch fortgesetzte Anpassung in Schach gehalten werden könnte. Der Arbeitsmarkt steht unter einem Druckwert von ${workforce}, sodass Automatisierung, Migration und längere Erwerbsbiografien vermutlich zusammenwirken müssen, um Lücken zu schließen. Finanzmärkte wirken mit einem Risiko von ${finance} volatil genug, dass Vorsicht im Kreditzyklus angesagt bleibt. Der soziale Zusammenhalt liegt bei ${cohesion}, was auf gemischte, aber noch tragfähige Institutionen hindeutet. Geopolitische Fragmentierung (${geopolitics}) lässt Handelsregeln weniger berechenbar erscheinen, während Governance und Informationsintegrität (${governance}) den Ton angeben, ob Koordination gelingt. Technologie-Diffusion (${tech}) bestimmt, ob Produktivitätsgewinne breit ankommen.\n\nWas das für dich bedeutet\n- Investiere Zeit in resiliente Fähigkeiten und lebenslanges Lernen.\n- Plane Energie- und Mobilitätsentscheidungen langfristiger.\n- Baue finanzielle Puffer für volatile Phasen auf.\n- Engagiere dich lokal, um Vertrauen und Zusammenhalt zu stärken.\n- Unterstütze Politik für sichere digitale Informationsräume.`;
  }
  return `2050 feels like a careful balancing act. Warming sits near ${climate}°C, which raises tangible risks yet could remain manageable with continued adaptation. Workforce pressure at ${workforce} suggests automation, migration, and longer careers are likely needed to keep services staffed. Financial volatility around ${finance} means credit cycles stay cautious and shocks remain possible. Social cohesion at ${cohesion} signals institutions are mixed but still capable of inclusion. Geopolitical fragmentation (${geopolitics}) makes trade rules less predictable, while governance and information integrity (${governance}) decide whether coordination holds. Technology diffusion at ${tech} will shape whether productivity gains spread broadly.\n\nWhat this means for you\n- Invest in resilient skills and continuous learning.\n- Plan energy and mobility choices with longer horizons.\n- Build buffers for volatile financial periods.\n- Engage locally to strengthen trust and cohesion.\n- Support policies that protect digital information spaces.`;
}

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
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent([
        { text: system },
        { text: user }
      ]);
      const text = result.response.text().trim();
      if (!text) throw new Error("Empty response from Gemini.");
      return NextResponse.json({ text });
    }

    return NextResponse.json({ text: mockNarrative(config) });
  } catch (error) {
    return NextResponse.json(
      {
        text: mockNarrative(config),
        warning:
          error instanceof Error ? error.message : "Generation failed, using mock."
      },
      { status: 200 }
    );
  }
}
