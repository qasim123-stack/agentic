import { NextRequest } from "next/server";

const mockCreate = jest.fn();

jest.mock("openai", () =>
  jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  }))
);

import { POST } from "@/app/api/analyze/route";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/analyze", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const validAnalysis = {
  overall_score: 72,
  summary: "Policy has critical MFA and encryption gaps.",
  gaps: [
    {
      id: "§164.312(a)",
      title: "MFA not enforced",
      severity: "critical",
      fine_exposure_usd: 1900000,
      description: "MFA missing on 12 devices.",
      remediation: "Mandate MFA for all ePHI access.",
    },
  ],
};

beforeEach(() => jest.clearAllMocks());

describe("POST /api/analyze", () => {
  it("returns 400 when no text is provided", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("No text provided");
  });

  it("returns parsed analysis JSON on success", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(validAnalysis) } }],
    });

    const res = await POST(makeRequest({ text: "This is a sample HIPAA policy document." }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.overall_score).toBe(72);
    expect(body.gaps).toHaveLength(1);
    expect(body.gaps[0].severity).toBe("critical");
  });

  it("returns 500 when OpenAI response is not valid JSON", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "not json at all" } }],
    });

    const res = await POST(makeRequest({ text: "some policy" }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Could not parse response");
  });

  it("truncates text to 8000 chars before sending to OpenAI", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(validAnalysis) } }],
    });

    await POST(makeRequest({ text: "x".repeat(20000) }));

    const calledWith = mockCreate.mock.calls[0][0];
    const userMsg = calledWith.messages.find((m: { role: string }) => m.role === "user");
    // The user message contains the prompt prefix + up to 8000 chars of text
    expect(userMsg.content).toContain("x".repeat(100));
    expect(userMsg.content.length).toBeLessThanOrEqual(8100);
  });

  it("returns 500 when OpenAI throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("network error"));

    const res = await POST(makeRequest({ text: "some policy" }));
    expect(res.status).toBe(500);
  });
});
