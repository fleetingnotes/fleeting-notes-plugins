import { OpenAI } from "https://deno.land/x/openai@1.3.4/mod.ts";
import "https://deno.land/std@0.188.0/dotenv/load.ts";

export default async (request: Request) : Promise<Response> => {
  const json = await request.json()
  const apiKey = Deno.env.get("OPEN_AI_KEY")!;
  const openAI = new OpenAI(apiKey);
  const metadata: string = json['metadata'];
  const note = json['note'];
  if (!note) {
    return new Response("Couldn't find note in request", { status: 400 });
  }
  const noteContent: string = note['content'] || '';
  try {
    const messages: {role: "system" | "user", content: string}[] = (metadata) ? [
      {"role": "system", "content": metadata}
    ] : [];
    messages.push({"role": "user", "content": noteContent})
    
    const chatCompletion = await openAI.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    const message : string | null | undefined = chatCompletion.choices?.[0]?.message.content;
    if (!message) return new Response('No message from OpenAI', { status: 400});
    return new Response(message);
  } catch (e) {
    console.log(e);
    return new Response(e, {status: 400});
  }
}
