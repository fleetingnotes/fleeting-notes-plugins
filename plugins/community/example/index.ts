export default async (request: Request) : Promise<Response> => {
  var json = await request.json()
  var metadata = json['metadata'];
  var note = json['note'];
  if (!note) {
    return new Response("Couldn't find note in request", { status: 400 });
  }
  note.content = `${note.content}\nhello from the example plugin!\nhere is ur metdata: ${metadata}`;
  return new Response(JSON.stringify(note));
}
