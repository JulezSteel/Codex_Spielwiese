import { ScenarioConfig } from "@/lib/types";
import { defaultScenario } from "@/lib/content";

const STORAGE_KEY = "future-scenario-config";

const numberKeys: Array<keyof ScenarioConfig> = [
  "climateC",
  "workforcePressure",
  "financialRisk",
  "socialCohesion",
  "geopolitics",
  "governanceInfo",
  "techDiffusion"
];

export function loadStoredConfig(): ScenarioConfig | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ScenarioConfig;
    return { ...defaultScenario, ...parsed };
  } catch {
    return null;
  }
}

export function saveStoredConfig(config: ScenarioConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function configToQuery(config: ScenarioConfig) {
  const params = new URLSearchParams();
  numberKeys.forEach((key) => {
    params.set(key, String(config[key]));
  });
  params.set("language", config.language);
  params.set("provider", config.provider);
  return params.toString();
}

export function applyQueryToConfig(
  searchParams: URLSearchParams,
  current: ScenarioConfig
): ScenarioConfig {
  const next = { ...current };
  numberKeys.forEach((key) => {
    const value = searchParams.get(key);
    if (value !== null && !Number.isNaN(Number(value))) {
      next[key] = Number(value) as ScenarioConfig[typeof key];
    }
  });
  const language = searchParams.get("language");
  if (language === "en" || language === "de") {
    next.language = language;
  }
  const provider = searchParams.get("provider");
  if (provider === "openai" || provider === "gemini" || provider === "mock") {
    next.provider = provider;
  }
  return next;
}
