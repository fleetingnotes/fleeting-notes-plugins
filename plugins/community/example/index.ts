export default async (request: Request) : Promise<Response> => {
  if (request.method == 'GET') {
    return new Response("hello world");
  }
  var exampleNote = {
    "note": {
      "content": "asdf",
      "source": "hello world",
    }
  }
  return new Response(JSON.stringify(exampleNote));
}
