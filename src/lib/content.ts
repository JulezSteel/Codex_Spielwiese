import { ScenarioConfig } from "@/lib/types";

export const languageLabels = {
  en: "English",
  de: "Deutsch"
};

export const defaultScenario: ScenarioConfig = {
  climateC: 2.2,
  workforcePressure: 45,
  financialRisk: 40,
  socialCohesion: 55,
  geopolitics: 45,
  governanceInfo: 50,
  techDiffusion: 60,
  language: "en",
  provider: "mock"
};

export type AxisConfig = {
  id: keyof ScenarioConfig;
  min: number;
  max: number;
  step: number;
  label: { en: string; de: string };
  title: { en: string; de: string };
  description: { en: string; de: string };
  leftLabel: { en: string; de: string };
  rightLabel: { en: string; de: string };
};

export const axes: AxisConfig[] = [
  {
    id: "climateC",
    min: 1.5,
    max: 3.5,
    step: 0.1,
    label: {
      en: "Global warming by 2050 (°C vs preindustrial)",
      de: "Globale Erwärmung bis 2050 (°C vs. vorindustriell)"
    },
    title: {
      en: "Planetary Boundaries & Material Transition",
      de: "Planetare Grenzen & Materialwende"
    },
    description: {
      en: "The pace of climate mitigation and material transition shapes risks and resource stress.",
      de: "Tempo von Klimaschutz und Materialwende prägt Risiken und Ressourcenstress."
    },
    leftLabel: {
      en: "Strong mitigation & adaptation; climate risks contained",
      de: "Starke Minderung & Anpassung; Klimarisiken begrenzt"
    },
    rightLabel: {
      en: "Weak mitigation; high physical risks & resource stress",
      de: "Schwache Minderung; hohe physische Risiken & Ressourcenstress"
    }
  },
  {
    id: "workforcePressure",
    min: 0,
    max: 100,
    step: 1,
    label: {
      en: "Net workforce pressure index",
      de: "Netto-Arbeitskräfte-Druckindex"
    },
    title: {
      en: "Population, Migration & Lifespan",
      de: "Bevölkerung, Migration & Lebensspanne"
    },
    description: {
      en: "Migration, participation, and healthspan influence how tight labor markets feel.",
      de: "Migration, Teilhabe und gesunde Lebenszeit bestimmen die Spannung am Arbeitsmarkt."
    },
    leftLabel: {
      en: "Workforce stabilized (migration + participation + healthspan gains)",
      de: "Arbeitskräfte stabilisiert (Migration + Teilhabe + Healthspan-Gewinne)"
    },
    rightLabel: {
      en: "Workforce shrinks; strong aging pressure",
      de: "Arbeitskräfte schrumpfen; starker Alterungsdruck"
    }
  },
  {
    id: "financialRisk",
    min: 0,
    max: 100,
    step: 1,
    label: {
      en: "Financial volatility / crisis risk",
      de: "Finanzvolatilität / Krisenrisiko"
    },
    title: {
      en: "Financial Stability & Capital Markets",
      de: "Finanzstabilität & Kapitalmärkte"
    },
    description: {
      en: "Credit cycles and market plumbing decide how shock-prone the system is.",
      de: "Kreditzyklen und Marktinfrastruktur bestimmen die Schockanfälligkeit."
    },
    leftLabel: {
      en: "Stable credit cycle; orderly markets",
      de: "Stabiler Kreditzyklus; geordnete Märkte"
    },
    rightLabel: {
      en: "High bubble/crash risk; repeated liquidity shocks",
      de: "Hohes Blasen-/Crashrisiko; wiederholte Liquiditätsschocks"
    }
  },
  {
    id: "socialCohesion",
    min: 0,
    max: 100,
    step: 1,
    label: {
      en: "Social cohesion",
      de: "Sozialer Zusammenhalt"
    },
    title: {
      en: "Work & Distribution Order / Social Cohesion",
      de: "Arbeits- & Verteilungsordnung / Sozialer Frieden"
    },
    description: {
      en: "Institutions can keep societies inclusive or slide toward polarization.",
      de: "Institutionen können inklusiv bleiben oder in Polarisierung abrutschen."
    },
    leftLabel: {
      en: "High cohesion; inclusive institutions; mobility improves",
      de: "Hoher Zusammenhalt; inklusive Institutionen; Aufstiegschancen steigen"
    },
    rightLabel: {
      en: "Polarization; inequality rises; unrest more likely",
      de: "Polarisierung; Ungleichheit steigt; Unruhen wahrscheinlicher"
    }
  },
  {
    id: "geopolitics",
    min: 0,
    max: 100,
    step: 1,
    label: {
      en: "Geopolitical fragmentation",
      de: "Geopolitische Fragmentierung"
    },
    title: {
      en: "Geo-economics & Security",
      de: "Geoökonomik & Sicherheit"
    },
    description: {
      en: "Trade rules and security dynamics set the tone for supply chains.",
      de: "Handelsregeln und Sicherheitslage prägen Lieferketten."
    },
    leftLabel: {
      en: "Cooperative blocs; predictable trade rules",
      de: "Kooperative Blöcke; verlässliche Handelsregeln"
    },
    rightLabel: {
      en: "Hard blocs; sanctions/war risk; costly supply chains",
      de: "Harte Blöcke; Sanktions-/Kriegsrisiko; teure Lieferketten"
    }
  },
  {
    id: "governanceInfo",
    min: 0,
    max: 100,
    step: 1,
    label: {
      en: "Governance & information integrity",
      de: "Governance & Informationsintegrität"
    },
    title: {
      en: "State Capacity & Information Order",
      de: "Staatsfähigkeit & Informationsordnung"
    },
    description: {
      en: "Trust, cyber resilience, and policy capacity determine coordination.",
      de: "Vertrauen, Cyber-Resilienz und politische Handlungsfähigkeit bestimmen Koordination."
    },
    leftLabel: {
      en: "High trust; effective state; resilient info ecosystem",
      de: "Hohes Vertrauen; effektiver Staat; resilienter Info-Ökosystem"
    },
    rightLabel: {
      en: "Low trust; disinfo/cyber shocks; policy paralysis",
      de: "Niedriges Vertrauen; Desinfo-/Cyberschocks; politische Lähmung"
    }
  },
  {
    id: "techDiffusion",
    min: 0,
    max: 100,
    step: 1,
    label: {
      en: "Tech diffusion breadth",
      de: "Breite der Technologie-Diffusion"
    },
    title: {
      en: "Technology Diffusion & Productivity",
      de: "Technologie-Diffusion & Produktivität"
    },
    description: {
      en: "How broadly technology spreads shapes productivity and inclusion.",
      de: "Wie breit Technologie wirkt, prägt Produktivität und Teilhabe."
    },
    leftLabel: {
      en: "Broad diffusion; productivity gains widely shared",
      de: "Breite Diffusion; Produktivitätsgewinne breit geteilt"
    },
    rightLabel: {
      en: "Narrow diffusion; winner-takes-most; weak spillovers",
      de: "Schmale Diffusion; Winner-takes-most; schwache Spillovers"
    }
  }
];

export const uiCopy = {
  en: {
    introTitle: "The future is open — but not arbitrary.",
introBody:
  "The world feels more uncertain than it has in a long time. Climate risks, geopolitical tensions, technological leaps, and social frictions overlap. At the same time, there are many unknowns — and rarely simple answers.",
introExplain:
  "This tool helps you sketch a plausible picture of life in 2050. By calibrating seven primary axes — from climate and demography to technology diffusion — you generate a coherent scenario narrative (optionally with audio). This is not a prediction, but a thinking tool to make assumptions explicit and explore their consequences.",
startCta: "Start calibrating",
    stepIntro: "Intro",
    stepCalibrate: "Calibrate",
    stepResults: "Results",
    calibrateTitle: "Calibrate your scenario",
    generateScenario: "Generate scenario",
    languageLabel: "Language",
    providerLabel: "Provider",
    providerOpenAI: "OpenAI",
    providerGemini: "Gemini",
    providerMock: "Mock",
    resultsTitle: "Your 2050 Scenario",
    regenerateAll: "Regenerate text + audio",
    regenerateText: "Regenerate text",
    regenerateAudio: "Regenerate audio",
    copyText: "Copy narrative",
    shareLink: "Share link",
    backToSliders: "Back to sliders",
    audioUnavailable: "TTS unavailable",
    loadingText: "Generating narrative…",
    loadingAudio: "Generating audio…",
    errorText: "We hit a snag generating the narrative.",
    errorAudio: "Audio generation failed.",
    sliderSummary: "Scenario summary"
  },
  de: {
    introTitle: "Die Zukunft ist offen – aber nicht beliebig.",
introBody:
  "Die Welt fühlt sich so unsicher an wie lange nicht. Klimarisiken, geopolitische Spannungen, technologische Sprünge und gesellschaftliche Brüche überlagern sich. Gleichzeitig gibt es viele Unbekannte – und selten einfache Antworten.",
introExplain:
  "Dieses Tool hilft dir, ein plausibles Bild davon zu skizzieren, wie das Leben im Jahr 2050 aussehen könnte. Du kalibrierst sieben Primärachsen – von Klima und Demografie bis hin zur Technologie-Diffusion – und erhältst daraus ein konsistentes Zukunftsszenario (optional auch als Audio). Das ist keine Prognose, sondern ein Denkwerkzeug, um Annahmen sichtbar zu machen und ihre Konsequenzen zu durchdenken.",
startCta: "Szenario kalibrieren",
    stepIntro: "Intro",
    stepCalibrate: "Kalibrieren",
    stepResults: "Ergebnis",
    calibrateTitle: "Kalibriere dein Szenario",
    generateScenario: "Szenario erzeugen",
    languageLabel: "Sprache",
    providerLabel: "Anbieter",
    providerOpenAI: "OpenAI",
    providerGemini: "Gemini",
    providerMock: "Mock",
    resultsTitle: "Dein 2050-Szenario",
    regenerateAll: "Text + Audio neu",
    regenerateText: "Text neu",
    regenerateAudio: "Audio neu",
    copyText: "Text kopieren",
    shareLink: "Link teilen",
    backToSliders: "Zurück zu Reglern",
    audioUnavailable: "TTS nicht verfügbar",
    loadingText: "Erzählung wird erstellt…",
    loadingAudio: "Audio wird erstellt…",
    errorText: "Beim Erzeugen der Erzählung ist etwas schiefgelaufen.",
    errorAudio: "Audioerzeugung fehlgeschlagen.",
    sliderSummary: "Szenario-Zusammenfassung"
  }
};

export const axisSummaryLabels: Record<
  keyof ScenarioConfig,
  { en: string; de: string }
> = {
  climateC: { en: "Warming °C", de: "Erwärmung °C" },
  workforcePressure: { en: "Workforce pressure", de: "Arbeitskräfte-Druck" },
  financialRisk: { en: "Financial risk", de: "Finanzrisiko" },
  socialCohesion: { en: "Social cohesion", de: "Zusammenhalt" },
  geopolitics: { en: "Geopolitics", de: "Geopolitik" },
  governanceInfo: { en: "Governance/info", de: "Governance/Info" },
  techDiffusion: { en: "Tech diffusion", de: "Tech-Diffusion" },
  language: { en: "Language", de: "Sprache" },
  provider: { en: "Provider", de: "Anbieter" }
};
