import { validateURI } from "../../../utils.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import TurndownService from "https://cdn.skypack.dev/turndown@7.1.2";
import { gfm } from "https://cdn.skypack.dev/@guyplusplus/turndown-plugin-gfm@1.0.7";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

async function fetchWebPage(url: string): Promise<string> {
  const response = await fetch(url);
  const html = await response.text();
  return html;
}

export default async (request: Request): Promise<Response> => {
  const json = await request.json();
  const source: string = json["note"]?.source || "";
  const { passes, error } = validateURI(source);
  if (!passes) {
    return new Response(error, { status: 400 });
  }
  const html = await fetchWebPage(source);
  try {
    const dom = new DOMParser().parseFromString(html, "text/html");
    const article = new Readability(dom).parse();
    if (!article?.content) {
      throw new Error("Source cannot be read");
    }

    const domWithReadability = new DOMParser().parseFromString(
      article?.content,
      "text/html",
    );
    const turndownService = new TurndownService();
    turndownService.use(gfm);
    const markdown = turndownService.turndown(domWithReadability);
    return new Response(markdown);
  } catch (e) {
    console.log(e);
    return new Response(e, { status: 400 });
  }
};
