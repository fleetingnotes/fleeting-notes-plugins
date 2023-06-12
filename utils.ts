import { OpenAI } from "https://deno.land/x/openai@1.3.4/mod.ts";

export async function chatGpt3(
  text: string,
  systemPrompt?: string,
): Promise<string> {
  const API_KEY = Deno.env.get("OPEN_AI_KEY")!;
  const openAI = new OpenAI(API_KEY);
  const messages: { role: "system" | "user"; content: string }[] =
    (systemPrompt)
      ? [
        { "role": "system", "content": systemPrompt },
      ]
      : [];
  messages.push({ "role": "user", "content": text });

  const chatCompletion = await openAI.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: messages,
  });
  const message: string | undefined =
    chatCompletion.choices?.[0]?.message.content;
  return message || "";
}

export async function chatGpt3Whisper(audioFile: string): Promise<string> {
  const API_KEY = Deno.env.get("OPEN_AI_KEY")!;
  const openAI = new OpenAI(API_KEY);

  const transcription = await openAI.createTranscription({
    model: "whisper-1",
    file: audioFile,
  });
  return transcription.text.trim();
}

type ErrorMessage = {
  passes: boolean;
  error: string | null;
};
export function validateURI(uri: string): ErrorMessage {
  if (!uri) {
    return { passes: false, error: "Source field empty" };
  }
  try {
    new URL(uri);
    return { passes: true, error: null };
  } catch (e) {
    console.log(e);
    return { passes: false, error: "Source field is not a valid Url" };
  }
}
