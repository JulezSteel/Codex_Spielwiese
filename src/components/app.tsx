"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { axes, axisSummaryLabels, defaultScenario, uiCopy } from "@/lib/content";
import { ScenarioConfig } from "@/lib/types";
import {
  applyQueryToConfig,
  configToQuery,
  loadStoredConfig,
  saveStoredConfig
} from "@/lib/storage";
import { cn } from "@/lib/utils";

type Props = {
  defaultProvider: ScenarioConfig["provider"];
};

type GenerationState = "idle" | "loading" | "success" | "error";

export function ScenarioApp({ defaultProvider }: Props) {
  const searchParams = useSearchParams();
  const [step, setStep] = React.useState(0);
  const [config, setConfig] = React.useState<ScenarioConfig>(() => ({
    ...defaultScenario,
    provider: defaultProvider
  }));
  const [narrative, setNarrative] = React.useState("");
  const [audioUrl, setAudioUrl] = React.useState<string | null>(null);
  const [voiceId, setVoiceId] = React.useState("");
  const [textState, setTextState] = React.useState<GenerationState>("idle");
  const [audioState, setAudioState] = React.useState<GenerationState>("idle");
  const [textError, setTextError] = React.useState<string | null>(null);
  const [audioError, setAudioError] = React.useState<string | null>(null);

  const copy = uiCopy[config.language];

  React.useEffect(() => {
    const stored = loadStoredConfig();
    if (stored) {
      setConfig((current) => ({ ...current, ...stored }));
    }
  }, []);

  React.useEffect(() => {
    if (!searchParams) return;
    setConfig((current) => applyQueryToConfig(searchParams, current));
  }, [searchParams?.toString()]);

  React.useEffect(() => {
    saveStoredConfig(config);
  }, [config]);

  const updateConfig = <K extends keyof ScenarioConfig>(
    key: K,
    value: ScenarioConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const shareLink = React.useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = configToQuery(config);
    return `${window.location.origin}?${params}`;
  }, [config]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(narrative);
    } catch {
      // no-op
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      // no-op
    }
  };

  const requestNarrative = async () => {
    setTextState("loading");
    setTextError(null);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate text.");
      }
      const data = (await response.json()) as { text: string };
      setNarrative(data.text);
      setTextState("success");
      return data.text;
    } catch (error) {
      setTextState("error");
      setTextError(
        error instanceof Error ? error.message : copy.errorText
      );
      return null;
    }
  };

  const requestAudio = async (text: string) => {
    setAudioState("loading");
    setAudioError(null);
    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          language: config.language,
          voiceId: voiceId || undefined
        })
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Failed to generate audio.");
      }
      const data = (await response.json()) as {
        audioBase64: string;
        mimeType: string;
      };
      const byteChars = atob(data.audioBase64);
      const byteNumbers = new Array(byteChars.length)
        .fill(0)
        .map((_, index) => byteChars.charCodeAt(index));
      const blob = new Blob([new Uint8Array(byteNumbers)], {
        type: data.mimeType
      });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setAudioState("success");
    } catch (error) {
      setAudioState("error");
      setAudioError(
        error instanceof Error ? error.message : copy.errorAudio
      );
    }
  };

  const handleGenerateAll = async () => {
    const text = await requestNarrative();
    if (text) {
      await requestAudio(text);
    }
  };

  const stepTitles = [copy.stepIntro, copy.stepCalibrate, copy.stepResults];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight">
              {copy.introTitle}
            </h1>
            <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
              {stepTitles[step]}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {stepTitles.map((title, index) => (
              <div key={title} className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                    index <= step
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-transparent text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium",
                    index === step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {title}
                </span>
                {index < stepTitles.length - 1 ? (
                  <div className="h-px w-10 bg-border" />
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {step === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{copy.introTitle}</CardTitle>
              <CardDescription>{copy.introBody}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <p className="text-sm text-muted-foreground">{copy.introExplain}</p>
              <Button size="lg" onClick={() => setStep(1)}>
                {copy.startCta}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{copy.calibrateTitle}</CardTitle>
                <CardDescription>
                  {config.language === "en"
                    ? "Tune the sliders and choose your narrative provider."
                    : "Stimme die Regler ab und wähle deinen Narrative-Anbieter."}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{copy.languageLabel}</span>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.language === "de"}
                      onChange={(event) =>
                        updateConfig(
                          "language",
                          event.target.checked ? "de" : "en"
                        )
                      }
                      label={config.language === "de" ? "DE" : "EN"}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium">{copy.providerLabel}</span>
                  <Select
                    value={config.provider}
                    onChange={(event) =>
                      updateConfig(
                        "provider",
                        event.target.value as ScenarioConfig["provider"]
                      )
                    }
                  >
                    <option value="openai">{copy.providerOpenAI}</option>
                    <option value="gemini">{copy.providerGemini}</option>
                    <option value="mock">{copy.providerMock}</option>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {axes.map((axis) => (
                <Card key={axis.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      {axis.title[config.language]}
                    </CardTitle>
                    <CardDescription>
                      {axis.description[config.language]}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium">
                        {axis.label[config.language]}
                      </span>
                      <span className="rounded-md border border-border px-2 py-1 text-sm font-semibold">
                        {config[axis.id].toFixed(axis.step < 1 ? 1 : 0)}
                      </span>
                    </div>
                    <Slider
                      value={Number(config[axis.id])}
                      min={axis.min}
                      max={axis.max}
                      step={axis.step}
                      onValueChange={(value) =>
                        updateConfig(axis.id, value as ScenarioConfig[typeof axis.id])
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{axis.leftLabel[config.language]}</span>
                      <span>{axis.rightLabel[config.language]}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={() => setStep(0)}>
                {copy.stepIntro}
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  setStep(2);
                  if (!narrative) {
                    void handleGenerateAll();
                  }
                }}
              >
                {copy.generateScenario}
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{copy.resultsTitle}</CardTitle>
                <CardDescription>{copy.sliderSummary}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {axes.map((axis) => (
                  <div
                    key={axis.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>{axisSummaryLabels[axis.id][config.language]}</span>
                    <span className="font-semibold">
                      {config[axis.id].toFixed(axis.step < 1 ? 1 : 0)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{copy.resultsTitle}</CardTitle>
                <CardDescription>
                  {config.language === "en"
                    ? "Narrative output based on your calibration."
                    : "Erzählung basierend auf deiner Kalibrierung."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {textState === "loading" ? (
                  <p className="text-sm text-muted-foreground">
                    {copy.loadingText}
                  </p>
                ) : null}
                {textState === "error" ? (
                  <p className="text-sm text-destructive">
                    {textError ?? copy.errorText}
                  </p>
                ) : null}
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {narrative || (textState === "loading" ? "" : "")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Audio</CardTitle>
                <CardDescription>
                  {config.language === "en"
                    ? "Generate and replay narration."
                    : "Erstelle und höre die Narration."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    {config.language === "en"
                      ? "Voice ID (optional)"
                      : "Voice-ID (optional)"}
                  </label>
                  <input
                    value={voiceId}
                    onChange={(event) => setVoiceId(event.target.value)}
                    placeholder="elevenlabs voice id"
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                {audioState === "loading" ? (
                  <p className="text-sm text-muted-foreground">
                    {copy.loadingAudio}
                  </p>
                ) : null}
                {audioState === "error" ? (
                  <p className="text-sm text-destructive">
                    {audioError ?? copy.errorAudio}
                  </p>
                ) : null}
                {audioUrl ? (
                  <audio controls src={audioUrl} className="w-full" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {copy.audioUnavailable}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleGenerateAll} size="lg">
                {copy.regenerateAll}
              </Button>
              <Button variant="secondary" onClick={requestNarrative}>
                {copy.regenerateText}
              </Button>
              <Button
                variant="secondary"
                onClick={() => requestAudio(narrative)}
                disabled={!narrative}
              >
                {copy.regenerateAudio}
              </Button>
              <Button variant="outline" onClick={handleCopy} disabled={!narrative}>
                {copy.copyText}
              </Button>
              <Button variant="outline" onClick={handleShare}>
                {copy.shareLink}
              </Button>
              <Button variant="ghost" onClick={() => setStep(1)}>
                {copy.backToSliders}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
