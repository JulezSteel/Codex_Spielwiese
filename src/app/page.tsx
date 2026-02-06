import { Suspense } from "react";
import { ScenarioApp } from "@/components/app";

function getDefaultProvider() {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "mock";
}

function PageInner() {
  return <ScenarioApp defaultProvider={getDefaultProvider()} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}
