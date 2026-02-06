import { Suspense } from "react";
import { ScenarioApp } from "@/components/app";

export const dynamic = "force-dynamic";

function getDefaultProvider() {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "mock";
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <ScenarioApp defaultProvider={getDefaultProvider()} />
    </Suspense>
  );
}
