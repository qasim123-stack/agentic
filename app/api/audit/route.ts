import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const client = new OpenAI();

const SYSTEM_PROMPT = `You are an OCR (Office for Civil Rights) investigator conducting a HIPAA Security Rule compliance audit.
You ask exactly 5 questions from OCR's official audit protocol, one at a time.
Focus areas: risk analysis, access controls, encryption, incident response, BAA management.

For each question exchange:
- If this is the START (no previous answers), ask the FIRST question only. Return JSON: { "question": "...", "question_num": 1, "done": false }
- If you receive an answer, score it 0-20, give brief feedback, then ask the next question.
  Return JSON: { "score": <0-20>, "feedback": "...", "question": "...", "question_num": <next>, "done": false }
- After the 5th answer is scored, return: { "score": <0-20>, "feedback": "...", "done": true, "verdict": "Pass"|"Fail", "top_risks": ["risk1","risk2","risk3"] }

Make the questions SHARP and specific — not generic. Examples of good questions:
- "Which specific systems handling ePHI are currently EXCLUDED from your MFA policy, and what documented justification exists for each exclusion under the new mandatory requirements?"
- "Walk me through exactly what your team does in the first 24 hours after discovering a potential PHI breach at 2am on a Saturday."
- "When did you last review your BAA with your cloud storage provider? Can you confirm it contains a 24-hour breach notification clause?"

Return ONLY valid JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...(messages.length === 0
          ? [{ role: "user" as const, content: "Begin the audit. Ask the first question." }]
          : messages),
      ],
    });

    const raw = response.choices[0].message.content ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Parse error" }, { status: 500 });

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}
