import "https://deno.land/std@0.188.0/dotenv/load.ts";
import { format } from "https://deno.land/x/date_fns@v2.15.0/index.js";


export default async (request: Request) : Promise<Response> => {
  const json = await request.json();
  const metadata: string = json['metadata'];
  const note = json['note'];
  if (!note) {
    return new Response("Couldn't find note in request", { status: 400 });
  }
  const formatString = metadata ? metadata : "yyyy-MM-dd HH:mm:ss";
  try {
    note.content = `${note.content} ${format(new Date(), formatString, { timeZone: 'UTC' })}`;
    return new Response(JSON.stringify({note}));
  } catch (e) {
    return new Response(e, {status: 400});
  }
}
