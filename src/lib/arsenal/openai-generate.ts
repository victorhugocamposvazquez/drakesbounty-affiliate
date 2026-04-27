import { z } from "zod";

const resultSchema = z.object({
  variants: z
    .array(z.string().min(1).max(600))
    .min(1)
    .max(5),
});

export type ArsenalCopyKind =
  | "panel"
  | "stream"
  | "bio"
  | "compliance"
  | "hook";

const KIND_USER_EN: Record<ArsenalCopyKind, string> = {
  panel:
    "One line for a stream panel or overlay (short, can include · separators).",
  stream: "A short on-stream disclaimer about gambling / legal / 18+.",
  bio: "A hook for link-in-bio (2–3 short sentences max).",
  compliance:
    "A reminder that the creator only promotes contracted brands, discloses paid partnerships, and does not promise wins.",
  hook: "A punchy CTA line for social (single sentence or two very short ones).",
};

const KIND_USER_ES: Record<ArsenalCopyKind, string> = {
  panel:
    "Una línea para panel u overlay (breve, puede usar separadores ·).",
  stream: "Disclaimer breve en directo (apuestas, legal, 18+).",
  bio: "Gancho para link-in-bio (2–3 frases cortas).",
  compliance:
    "Recordatorio: solo marcas con contrato, colaboraciones declaradas, sin prometer premios.",
  hook: "CTA punchy para redes (una frase o dos muy cortas).",
};

function systemPrompt(): string {
  return [
    "You are a copy assistant for Drake's Bounty, a licensed affiliate / creator platform for iGaming and similar verticals.",
    "You MUST respond with a single JSON object only, no markdown fences, with key \"variants\" whose value is an array of exactly 3 short strings in the same language the user specified.",
    "Each variant must be original, on-brand, and suitable for the requested format. Keep lines concise.",
    "Compliance: never guarantee wins or returns; do not offer financial or investment advice; for gambling content, remind that it is 18+ (or 'solo adultos') and only where legal; encourage responsible play; mention paid partnerships or disclosure when relevant.",
    "Do not invent real operator, casino, or person names. If the user notes mention a brand, you may refer generically to 'the partner' or 'the offer' unless the note is clearly fictional.",
  ].join(" ");
}

function userPayload(
  locale: "en" | "es",
  kind: ArsenalCopyKind,
  notes: string,
): string {
  const kMap = locale === "es" ? KIND_USER_ES : KIND_USER_EN;
  const targetLang = locale === "es" ? "Spanish" : "English";
  const trimmed = notes.trim().slice(0, 800);
  const extra = trimmed
    ? `\n\nCreator notes (optional context, do not quote verbatim; stay compliant):\n${trimmed}`
    : "";
  return [
    `Output language: ${targetLang}.`,
    `Request type: ${kMap[kind]}`,
    extra,
  ].join("\n");
}

export function getArsenalOpenAIKey(): string | null {
  const k =
    process.env.ARSENAL_OPENAI_API_KEY?.trim() ||
    process.env.OPENAI_API_KEY?.trim();
  return k || null;
}

export function getArsenalOpenAIModel(): string {
  return (
    process.env.ARSENAL_OPENAI_MODEL?.trim() || "gpt-4o-mini"
  );
}

export type GenerateArsenalResult =
  | { ok: true; variants: string[] }
  | { ok: false; error: "no_key" | "upstream" | "parse" | "http" | "empty" };

export async function generateArsenalCopyLines(input: {
  locale: "en" | "es";
  kind: ArsenalCopyKind;
  notes: string;
}): Promise<GenerateArsenalResult> {
  const key = getArsenalOpenAIKey();
  if (!key) {
    return { ok: false, error: "no_key" };
  }

  const model = getArsenalOpenAIModel();
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.65,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt() },
        {
          role: "user",
          content: userPayload(input.locale, input.kind, input.notes),
        },
      ],
    }),
  });

  if (!res.ok) {
    return { ok: false, error: "http" };
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    return { ok: false, error: "empty" };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, error: "parse" };
  }

  const check = resultSchema.safeParse(parsed);
  if (!check.success) {
    return { ok: false, error: "parse" };
  }

  const v = check.data.variants;
  if (v.length < 1) {
    return { ok: false, error: "parse" };
  }

  return { ok: true, variants: v };
}
