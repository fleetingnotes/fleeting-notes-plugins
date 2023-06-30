import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import handler from "../index.ts";

describe("Current timestamp handler", () => {
  it("Should return error if the source is empty", async () => {
    const request = new Request("http://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const expectedResponse = new Response(
      "Source field empty",
      {
        status: 400,
      },
    );

    const response = await handler(request);
    assertEquals(await response.text(), await expectedResponse.text());
  });

  it("Should return error if the source is not valid", async () => {
    const request = new Request("http://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note: { source: "example" } }),
    });

    const expectedResponse = new Response(
      "Source field is not a valid Url",
      {
        status: 400,
      },
    );

    const response = await handler(request);
    assertEquals(await response.text(), await expectedResponse.text());
  });
});
