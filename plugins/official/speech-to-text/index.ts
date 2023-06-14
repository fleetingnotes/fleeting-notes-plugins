import { chatGpt3Whisper, validateURI } from "../../../utils.ts";

async function fetchFile(url: string) {
  const response = await fetch(url);
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
