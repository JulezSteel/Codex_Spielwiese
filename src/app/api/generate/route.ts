import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ScenarioConfig } from "@/lib/types";
import { axes } from "@/lib/content";

export async function POST(request: NextRequest) {
  try {
    const config: ScenarioConfig = await request.json();
    const lang = config.language === "de" ? "de" : "en";

    const system = lang === "de" 
      ? "Du bist Zukunftsanalystin. Schreibe eine 2050-Erzählung (180-280 Wörter) mit 5 Bullet Points am Ende." 
      : "You are a future analyst. Write a 2050 narrative (180-280 words) with 5 bullet points at the end.";
    
    const axisLines = axes.map(a => `${a.title[lang]}: ${config[a.id as keyof ScenarioConfig]}`).join("\n");
    const userPrompt = `Calibrations:\n${axisLines}\nGenerate narrative.`;

    if (config.provider === "openai" && process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const res = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: system }, { role: "user", content: userPrompt }],
      });
      return NextResponse.json({ text: res.choices[0]?.message?.content?.trim() });
    }

    if (config.provider === "gemini" && process.env.GEMINI_API_KEY) {
      const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const genRes = await fetch(genUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${system}\n\n${userPrompt}` }] }]
        })
      });

      if (!genRes.ok) return NextResponse.json({ text: "Gemini API error." }, { status: 500 });
      const data = await genRes.json();
      return NextResponse.json({ text: data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "No content." });
    }

    return NextResponse.json({ text: lang === "de" ? "Vorschau aktiv." : "Preview active." });
  } catch (err) {
    return NextResponse.json({ text: "Server Error" }, { status: 500 });
  }
}
