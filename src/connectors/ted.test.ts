import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchTedTenders } from "./ted";

afterEach(() => vi.unstubAllGlobals());

describe("fetchTedTenders", () => {
  it("retrieves 500 unique notices across TED pages", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { page: number; limit: number };
      const start = (body.page - 1) * body.limit;
      const notices = Array.from({ length: body.limit }, (_, index) => {
        const number = String(start + index + 1).padStart(6, "0");
        return {
          "publication-number": `${number}-2026`,
          "notice-title": `Official opportunity ${number}`,
          "publication-date": "2026-08-01",
          "place-of-performance": "DEU",
        };
      });
      return new Response(JSON.stringify({ notices, totalNoticeCount: 500 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchTedTenders(500);

    expect(result).toHaveLength(500);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({ page: 1, limit: 250 });
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toMatchObject({ page: 2, limit: 250 });
  });
});
