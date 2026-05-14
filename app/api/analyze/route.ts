import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a HIPAA compliance expert specializing in the 2025 HIPAA Security Rule NPRM.
Analyze the provided policy document and identify compliance gaps against the new mandatory requirements.

The 2025 NPRM makes ALL 180 specifications mandatory (eliminating "addressable" opt-outs) and adds:
- Mandatory MFA for all ePHI access
- Full encryption at rest and in transit (AES-256)
- Annual vendor/BAA audits
- 24-hour breach notification
- Technology asset inventory
- Documented risk analysis updated annually

Return ONLY valid JSON with this exact structure:
{
  "overall_score": <number 0-100>,
  "summary": "<one sentence summary>",
  "gaps": [
    {
      "id": "<NPRM section e.g. §164.312(a)>",
      "title": "<short gap title>",
      "severity": "critical" | "warning" | "pass",
      "fine_exposure_usd": <number>,
      "description": "<what is missing or broken>",
      "remediation": "<exact policy language to add>"
    }
  ]
}

Be specific. Cite actual NPRM sections. Return at least 6 gaps total across all severity levels.`;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: `Analyze this HIPAA policy document:\n\n${text.slice(0, 8000)}` }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Could not parse response" }, { status: 500 });

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
