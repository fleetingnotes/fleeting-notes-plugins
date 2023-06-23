import "https://deno.land/std@0.188.0/dotenv/load.ts";
import { format } from "https://deno.land/x/date_fns@v2.15.0/index.js";

export default async (request: Request): Promise<Response> => {
  const json = await request.json();
  const metadata: string = json["metadata"];
  const formatString = metadata ? metadata : "yyyy-MM-dd HH:mm:ss";
  try {
    const dateFormatted = format(new Date(), formatString, { timeZone: "UTC" });
    return new Response(dateFormatted);
  } catch (e) {
    return new Response(e, { status: 400 });
  }
};
