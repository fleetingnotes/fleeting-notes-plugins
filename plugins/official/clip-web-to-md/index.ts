import { validateURI } from "../../../utils.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import TurndownService from "https://cdn.skypack.dev/turndown@7.1.1";
import { gfm } from "https://cdn.skypack.dev/@guyplusplus/turndown-plugin-gfm@1.0.7";
import { JSDOM } from "https://jspm.dev/jsdom@16.6.0";

declare global {
  // deno-lint-ignore no-explicit-any
  const document: any;
  interface Window {
    // deno-lint-ignore no-explicit-any
    document: any;
  }
}

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
    window.document = new JSDOM().window.document;
    const dom = new JSDOM(html);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const turndownService = new TurndownService();
    turndownService.use(gfm);
    const markdown = turndownService.turndown(article?.content);
    return new Response(markdown);
  } catch (e) {
    return new Response(e, { status: 400 });
  }
};
