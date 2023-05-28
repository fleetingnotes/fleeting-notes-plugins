export default async (request: Request) : Promise<Response> => {
  const json = await request.json()
  const metadata = json['metadata'];
  const note = json['note'];
  if (!note) {
    return new Response("Couldn't find note in request", { status: 400 });
  }
  note.content = `${note.content}\nhello from the example plugin!\nhere is ur metdata: ${metadata}`;
  return new Response(JSON.stringify({note}));
}
