import { chatGpt3Whisper, validateURI } from "../../../utils.ts";
import { contentType } from "https://deno.land/x/media_types@v2.13.0/mod.ts";

async function fetchFile(url: string) {
  const response = await fetch(url);
  const headers = response.headers;
  const mimeType = headers.get("content-type");
  if (mimeType && !contentType(mimeType).startsWith("audio/")) {
    throw new Error("Source is not an audio file");
  }
  const blob = await response.blob();
  const file = new File([blob], url.substring(url.lastIndexOf("/") + 1));
  return file;
}

export default async (request: Request): Promise<Response> => {
  const json = await request.json();
  const source: string = json["note"]?.source || "";
  const { passes, error } = validateURI(source);
  if (!passes) {
    return new Response(error, { status: 400 });
  }
  try {
    const data = await fetchFile(source);
    const message = await chatGpt3Whisper(data);
    return new Response(message);
  } catch (e) {
    return new Response(e, { status: 400 });
  }
};
