import { OpenAI } from "https://deno.land/x/openai@1.3.4/mod.ts";
import "https://deno.land/std@0.188.0/dotenv/load.ts";

export default async (request: Request) : Promise<Response> => {
  const json = await request.json()
  const apiKey = Deno.env.get("OPEN_AI_KEY")!;
  const openAI = new OpenAI(apiKey);
  const note = json['note'];
  if (!note) {
    return new Response("Couldn't find note in request", { status: 400 });
  }
  const noteContent = note['content'] || '';
  try {
    const chatCompletion = await openAI.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {"role": "user", "content": noteContent}
      ]
    });
    const message : string | null | undefined = chatCompletion.choices?.[0]?.message.content;
    if (!message) return new Response('No message from OpenAI', { status: 400});
    return new Response(message);
  } catch (e) {
    console.log(e);
    return new Response(e, {status: 400});
  }
}
