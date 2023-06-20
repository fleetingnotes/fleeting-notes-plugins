import { chatGpt3, validateURI } from "../../../utils.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";
import { Readability } from "https://esm.sh/@mozilla/readability@0.4.4";
import "https://deno.land/std@0.188.0/dotenv/load.ts";

const TRANSCRIPT_YOUTUBE_URI =
  "https://www.youtube.com/youtubei/v1/get_transcript";

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

function isYouTubeURL(url: string): boolean {
  const youtubeURLPattern =
    /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+/;
  return youtubeURLPattern.test(url);
}

function generateNonce(length: number): string {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charsetLength = charset.length;

  let nonce = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charsetLength);
    nonce += charset[randomIndex];
  }

  return nonce;
}

function generateRequest(page: string) {
  const params = page.split('"serializedShareEntity":"')[1]?.split('"')[0];
  const visitorData = page.split('"VISITOR_DATA":"')[1]?.split('"')[0];
  const sessionId = page.split('"sessionId":"')[1]?.split('"')[0];
  const clickTrackingParams = page
    ?.split('"clickTrackingParams":"')[1]
    ?.split('"')[0];
  return {
    context: {
      client: {
        hl: "en",
        gl: "US",
        visitorData,
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36,gzip(gfe)",
        clientName: "WEB",
        clientVersion: "2.20200925.01.00",
        osName: "Macintosh",
        osVersion: "10_15_4",
        browserName: "Chrome",
        browserVersion: "85.0f.4183.83",
        screenWidthPoints: 1440,
        screenHeightPoints: 770,
        screenPixelDensity: 2,
        utcOffsetMinutes: 120,
        userInterfaceTheme: "USER_INTERFACE_THEME_LIGHT",
        connectionType: "CONN_CELLULAR_3G",
      },
      request: {
        sessionId,
        internalExperimentFlags: [],
        consistencyTokenJars: [],
      },
      user: {},
      clientScreenNonce: generateNonce(16),
      clickTracking: {
        clickTrackingParams,
      },
    },
    params,
  };
}

async function transcriptYoutubeVideo(html: string): Promise<string> {
  const innerTubeApiKey = html
    .toString()
    .split('"INNERTUBE_API_KEY":"')[1]
    .split('"')[0];
  if (!innerTubeApiKey) {
    throw new Error("Source Youtube API key not found");
  }

  const transcriptData = await fetch(
    `${TRANSCRIPT_YOUTUBE_URI}?key=${innerTubeApiKey}`,
    {
      method: "POST",
      body: JSON.stringify(generateRequest(html.toString())),
    },
  );
  const body = await transcriptData.json();
  if (!body.responseContext || !body.actions) {
    throw new Error("Transcript is disabled on this source");
  }

  const transcripts = body.actions[0].updateEngagementPanelAction.content
    .transcriptRenderer.body.transcriptBodyRenderer.cueGroups;

  const text = transcripts.map((
    cue: any,
  ) => (cue.transcriptCueGroupRenderer.cues[0].transcriptCueRenderer
    .cue.simpleText)
  );
  const transcript = text.join(" ");
  if (transcript.length == 0) {
    throw new Error("Failed to transcript text from source");
  }
  return transcript;
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
