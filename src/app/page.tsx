import { ScenarioApp } from "@/components/app";

function getDefaultProvider() {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return "mock";
}

export default function HomePage() {
  return <ScenarioApp defaultProvider={getDefaultProvider()} />;
}
