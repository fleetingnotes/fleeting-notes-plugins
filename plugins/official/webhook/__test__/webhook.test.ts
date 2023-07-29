import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.192.0/testing/bdd.ts";
import handler from "../index.ts";

describe("Webhook handler", () => {
  it("Should return 400 status if url is not valid", async () => {
    const request = new Request("http://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata: "invalid format" }),
    });

    const expectedResponse = new Response(
      "Source field is not a valid Url",
      {
        status: 400,
      },
    );

    const response = await handler(request);

    assertEquals(response.status, expectedResponse.status);
    assertEquals(await response.text(), await expectedResponse.text());
  });

  it("Should return 400 status if an invalid method is provided", async () => {
    const request = new Request("http://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata: {
          url: "https://jsonplaceholder.typicode.com/posts/1",
          method: "INVALID",
        },
      }),
    });

    const expectedResponse = new Response('Invalid "method" field.', {
      status: 400,
    });

    const response = await handler(request);

    assertEquals(response.status, expectedResponse.status);
    assertEquals(await response.text(), await expectedResponse.text());
  });

  it("Should fetch data and return 200 status for a valid URL", async () => {
    const request = new Request("http://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata: "https://jsonplaceholder.typicode.com/posts/1",
      }),
    });

    const response = await handler(request);

    assertEquals(response.status, 200);
    const expectedText = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1",
    ).then((res) => res.text());
    assertEquals(await response.text(), expectedText);
  });

  it("Should fetch data and return 200 status for a valid URL in object", async () => {
    const request = new Request("http://example.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        metadata: { url: "https://jsonplaceholder.typicode.com/posts/1" },
      }),
    });

    const response = await handler(request);

    assertEquals(response.status, 200);
    const expectedText = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1",
    ).then((res) => res.text());
    assertEquals(await response.text(), expectedText);
  });
});
