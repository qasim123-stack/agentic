import { NextRequest } from "next/server";

const mockCreate = jest.fn();

jest.mock("openai", () =>
  jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  }))
);

import { POST } from "@/app/api/audit/route";

function makeRequest(body: object) {
  return new NextRequest("http://localhost/api/audit", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => jest.clearAllMocks());

describe("POST /api/audit", () => {
  it("starts the audit with the first question when messages is empty", async () => {
    const payload = { question: "Do you have a documented risk analysis?", question_num: 1, done: false };
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(payload) } }],
    });

    const res = await POST(makeRequest({ messages: [] }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.question_num).toBe(1);
    expect(body.done).toBe(false);
    expect(typeof body.question).toBe("string");
  });

  it("injects a default user message when messages array is empty", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify({ question: "Q?", question_num: 1, done: false }) } }],
    });

    await POST(makeRequest({ messages: [] }));

    const calledWith = mockCreate.mock.calls[0][0];
    const userMsg = calledWith.messages.find((m: { role: string; content: string }) =>
      m.role === "user" && m.content.includes("Begin the audit")
    );
    expect(userMsg).toBeDefined();
  });

  it("returns score and next question when an answer is provided", async () => {
    const payload = { score: 15, feedback: "Good answer.", question: "Next question?", question_num: 2, done: false };
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(payload) } }],
    });

    const messages = [
      { role: "user", content: "Begin the audit. Ask the first question." },
      { role: "assistant", content: JSON.stringify({ question: "Q1?", question_num: 1, done: false }) },
      { role: "user", content: "We do annual risk assessments using NIST framework." },
    ];

    const res = await POST(makeRequest({ messages }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.score).toBe(15);
    expect(body.question_num).toBe(2);
  });

  it("returns verdict when done is true", async () => {
    const payload = { score: 18, feedback: "Excellent.", done: true, verdict: "Pass", top_risks: ["risk1", "risk2", "risk3"] };
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(payload) } }],
    });

    const res = await POST(makeRequest({ messages: [{ role: "user", content: "final answer" }] }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.done).toBe(true);
    expect(body.verdict).toBe("Pass");
    expect(body.top_risks).toHaveLength(3);
  });

  it("returns 500 when response is not parseable JSON", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "Sorry, I cannot help with that." } }],
    });

    const res = await POST(makeRequest({ messages: [] }));
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Parse error");
  });

  it("returns 500 when OpenAI throws", async () => {
    mockCreate.mockRejectedValueOnce(new Error("network error"));

    const res = await POST(makeRequest({ messages: [] }));
    expect(res.status).toBe(500);
  });
});
