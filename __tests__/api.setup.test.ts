import { NextRequest } from "next/server";

// Mock supabase admin client
const mockFrom = jest.fn();
jest.mock("@/app/lib/supabase", () => ({
  supabase: {},
  supabaseAdmin: jest.fn(() => ({ from: mockFrom })),
}));

import { POST } from "@/app/api/setup/route";

function chainMock(error: null | { message: string } = null) {
  const obj: Record<string, jest.Mock> = {};
  obj.delete = jest.fn(() => obj);
  obj.neq = jest.fn(() => Promise.resolve({ error }));
  obj.insert = jest.fn(() => Promise.resolve({ error }));
  return obj;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/setup", () => {
  it("returns ok:true and seeds all 4 tables on success", async () => {
    mockFrom.mockImplementation(() => chainMock(null));

    const res = await POST();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);

    // Should have called from() for deletes (4) + inserts (4)
    expect(mockFrom).toHaveBeenCalledWith("staff");
    expect(mockFrom).toHaveBeenCalledWith("systems");
    expect(mockFrom).toHaveBeenCalledWith("vendors");
    expect(mockFrom).toHaveBeenCalledWith("incidents");
  });

  it("returns ok:false with errors when insert fails", async () => {
    // deletes succeed, inserts fail
    mockFrom.mockImplementation((table: string) => {
      const chain = chainMock(null);
      chain.insert = jest.fn(() =>
        Promise.resolve({ error: { message: `insert failed on ${table}` } })
      );
      return chain;
    });

    const res = await POST();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.errors.length).toBeGreaterThan(0);
  });

  it("returns 500 when supabaseAdmin throws", async () => {
    const { supabaseAdmin } = require("@/app/lib/supabase");
    (supabaseAdmin as jest.Mock).mockImplementationOnce(() => {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
    });

    const res = await POST();
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});
