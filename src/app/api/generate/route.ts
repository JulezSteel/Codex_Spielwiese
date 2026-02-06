import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { ScenarioConfig } from "@/lib/types";
import { axes } from "@/lib/content";

export async function POST(request: NextRequest) {
  try {
    const config: ScenarioConfig = await request.json();
    const language = config.language || "en";
    
    // 1. Build the prompts
    const systemPrompt = language === "de" 
      ? "Du bist eine Zukunftsanalystin. Schreibe eine plausible Erzählung für das Jahr 2050 (180-280 Wörter). Ende mit 5 Bullet Points." 
      : "You are a future analyst. Write a plausible 2050 narrative (180-280 words). End with 5 bullet points.";

    const axisData = axes.map(a => `${a.title[language]}: ${config[a.id as keyof ScenarioConfig]}`).join("\n");
    const userPrompt = `Calibrations:\n${axisData}\nGenerate the narrative now.`;

    // 2. OpenAI Provider
    if (config.provider === "openai" && process.env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const result = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      });
      return NextResponse.json({ text: result.choices[0]?.message?.content?.trim() });
    }

    // 3. Gemini Provider
    if (config.provider === "gemini" && process.env.GEMINI_API_KEY) {
      const geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent";
      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }]
        })
      });

      if (!geminiResponse.ok) {
        return NextResponse.json({ text: "Gemini API error. Verify your API key in Vercel settings." }, { status: 500 });
      }

      const data = await geminiResponse.json();
      const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return NextResponse.json({ text: outputText || "No content generated." });
    }

    // 4. Default Fallback
    const fallback = language === "de" ? "Vorschau-Modus aktiv." : "Preview mode active.";
    return NextResponse.json({ text: fallback });

  } catch (err) {
    console.error("API Route Error:", err);
    return NextResponse.json({ text: "A server error occurred." }, { status: 500 });
  }
}
