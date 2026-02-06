export type ScenarioConfig = {
  climateC: number;
  workforcePressure: number;
  financialRisk: number;
  socialCohesion: number;
  geopolitics: number;
  governanceInfo: number;
  techDiffusion: number;
  language: "en" | "de";
  provider: "openai" | "gemini" | "mock";
};
