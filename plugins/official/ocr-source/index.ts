import { validateURI } from "../../../utils.ts";
import { recognize } from "https://deno.land/x/tesseract@1.0.1/mod.ts";

export default async (request: Request): Promise<Response> => {
  const json = await request.json();
  const source: string = json["note"]?.source || "";
  const { passes, error } = validateURI(source);
  if (!passes) {
    return new Response(error, { status: 400 });
  }

  try {
    const output = await recognize(
      source,
    );
    return new Response(output);
  } catch (e) {
    return new Response(e, { status: 400 });
  }
};
