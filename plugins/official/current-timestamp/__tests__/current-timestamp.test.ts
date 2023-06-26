import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { format } from "https://deno.land/x/date_fns@v2.15.0/index.js";
import { describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import handler from "../index.ts";

describe("Current timestamp handler", () => {
  it("Should return formatted date with default format if no metadata is provided", async () => {
    const request = new Request("http://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const expectedResponse = new Response(
      format(new Date(), "yyyy-MM-dd HH:mm:ss", { timeZone: "UTC" }),
    );

    const response = await handler(request);
    assertEquals(await response.text(), await expectedResponse.text());
  });
  it("Should return formatted date using provided metadata", async () => {
    const request = new Request("http://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata: "dd/MM/yyyy" }),
    });

    const expectedResponse = new Response(
      format(new Date(), "dd/MM/yyyy", { timeZone: "UTC" }),
    );

    const response = await handler(request);
    assertEquals(await response.text(), await expectedResponse.text());
  });
  it("Should return 400 status if an error occurs", async () => {
    const request = new Request("http://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata: "invalid format" }),
    });

    const expectedResponse = new Response(
      "RangeError: Format string contains an unescaped latin alphabet character `n`",
      {
        status: 400,
      },
    );

    const response = await handler(request);

    assertEquals(response.status, expectedResponse.status);
    assertEquals(await response.text(), await expectedResponse.text());
  });
});
