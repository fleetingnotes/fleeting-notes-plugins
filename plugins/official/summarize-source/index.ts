import { chatGpt3, validateURI } from "../../../utils.ts";
import { isYouTubeURL, transcriptYoutubeVideo } from "./youtubeTranscript.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import "https://deno.land/std@0.188.0/dotenv/load.ts";

function extractContent(html: string) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const article = new Readability(doc).parse();
  return article?.textContent || "";
}

async function fetchWebPage(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  return html;
}

async function summarizeText(text: string, systemPrompt: string) {
  if (text.length < 12000) {
    return chatGpt3(text, systemPrompt);
  } else if (text.length > 100000) {
    throw new Error("Source is too long (> 100k characters)");
  }
  const chunks = text.match(/[\s\S]{1,12000}/g) || [];
  const responses = await Promise.all(chunks.map((c: string) => {
    return chatGpt3("Summarize:\n" + c);
  }));
  return chatGpt3(responses.join("\n"), systemPrompt);
}

export default async (request: Request): Promise<Response> => {
  const json = await request.json();
  const source: string = json["note"]?.source || "";
  const metadata: string = json["metadata"];
  const { passes, error } = validateURI(source);
  if (!passes) {
    return new Response(error, { status: 400 });
  }
  let textToSummarize = "";
  const html = await fetchWebPage(source);
  if (isYouTubeURL(source)) {
    const text = await transcriptYoutubeVideo(html);
    textToSummarize = text;
  } else {
    const text = extractContent(html);
    if (text.length == 0) {
      return new Response("Failed to extract text from source", {
        status: 400,
      });
    }
    textToSummarize = text;
  }

  const systemPrompt = metadata ||
    "Summarize the following text with the most unique and helpful points, into a bullet list of key points and takeaways";

  try {
    const message = await summarizeText(textToSummarize, systemPrompt);
    if (!message) {
      return new Response("No message from OpenAI", { status: 400 });
    }
    return new Response(message);
  } catch (e) {
    return new Response(e, { status: 400 });
  }
};
