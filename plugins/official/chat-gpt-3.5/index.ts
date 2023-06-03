import { chatGpt3 } from "../../../utils.ts";
import "https://deno.land/std@0.188.0/dotenv/load.ts";

export default async (request: Request) : Promise<Response> => {
  const json = await request.json()
  const metadata: string = json['metadata'];
  const note = json['note'];
  if (!note) {
    return new Response("Couldn't find note in request", { status: 400 });
  }
  const noteContent: string = note['content'] || '';
  try {
    const message = await chatGpt3(noteContent, metadata);
    if (!message) return new Response('No message from OpenAI', { status: 400 });
    return new Response(message);
  } catch (e) {
    return new Response(e, {status: 400});
  }
}
