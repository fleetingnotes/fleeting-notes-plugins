import { OpenAI } from "https://deno.land/x/openai@1.3.4/mod.ts";

export async function chatGpt3(text: string, systemPrompt?: string) : Promise<string> {
  const apiKey = Deno.env.get("OPEN_AI_KEY")!;
  const openAI = new OpenAI(apiKey);
  const messages: {role: "system" | "user", content: string}[] = (systemPrompt) ? [
    {"role": "system", "content": systemPrompt}
  ] : [];
  messages.push({"role": "user", "content": text})
  
  const chatCompletion = await openAI.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });
  const message : string | undefined = chatCompletion.choices?.[0]?.message.content;
  return message || '';
}
