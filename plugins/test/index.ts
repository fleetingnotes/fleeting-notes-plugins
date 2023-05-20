export default (request: Request) : Response => {
  if (request.method == 'GET') {
    return new Response("hello world");
  }
  var exampleNote = {
    "note": {
      "content": "asdf"
    }
  }
  return new Response(JSON.stringify(exampleNote));
}
