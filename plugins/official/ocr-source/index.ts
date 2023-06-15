import { validateURI } from "../../../utils.ts";
import { auth, Vision } from "https://googleapis.deno.dev/v1/vision:v1.ts";
import { contentType } from "https://deno.land/std@0.191.0/media_types/mod.ts";

const authCredential = auth.fromJSON(
  JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY") as string),
);

async function fetchImage(url: string) {
  const response = await fetch(
    url,
  );
  const headers = response.headers;
  const mimeType = headers.get("content-type");
  if (mimeType && !contentType(mimeType)?.startsWith("image/")) {
    throw new Error("Source is not an image file");
  }
  const imageBuffer = new Uint8Array(await response.arrayBuffer());
  return imageBuffer;
}

export default async (request: Request): Promise<Response> => {
  const json = await request.json();
  const source: string = json["note"]?.source || "";
  const { passes, error } = validateURI(source);
  if (!passes) {
    return new Response(error, { status: 400 });
  }

  try {
    const vision = new Vision(authCredential);
    const data = await fetchImage(source);
    const output = await vision.imagesAnnotate({
      "requests": [
        {
          "image": {
            "content": data,
          },
          "features": [
            {
              "type": "TEXT_DETECTION",
            },
          ],
        },
      ],
    });
    if (!output?.responses || output?.responses.length === 0) {
      throw new Error("Error getting response try with another source");
    }
    return new Response(
      output?.responses[0].fullTextAnnotation?.text,
    );
  } catch (e) {
    return new Response(e, { status: 400 });
  }
};
