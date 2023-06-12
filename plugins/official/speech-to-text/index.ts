import { download } from "https://deno.land/x/download@v2.0.2/mod.ts";
import { chatGpt3Whisper, validateURI } from "../../../utils.ts";

export default async (request: Request): Promise<Response> => {
  const json = await request.json();
  const source: string = json["note"]?.source || "";
  const { passes, error } = validateURI(source);
  if (!passes) {
    return new Response(error, { status: 400 });
  }
  try {
    const { fullPath } = await download(source);
    console.log(fullPath);
    const message = await chatGpt3Whisper(fullPath);
    return new Response(message);
  } catch (e) {
    return new Response(e, { status: 400 });
  }
};
