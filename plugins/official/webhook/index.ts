import { ErrorMessage, validateURI } from "../../../utils.ts";

interface InputData {
  method?: string;
  url: string;
  headers?: Record<string, string>;
  body?: string | null;
}

function validateInputData(inputData: InputData): ErrorMessage {
  if (!inputData || typeof inputData !== "object") {
    return { passes: false, error: "Invalid input" };
  }

  const validateUrl = validateURI(inputData.url);
  if (!validateUrl.passes) {
    return validateUrl;
  }

  const allowedMethods: string[] = ["GET", "POST", "PUT", "DELETE"]; // Add other allowed methods if needed

  if (
    inputData.method !== undefined && inputData.method !== null &&
    (typeof inputData.method !== "string" ||
      !allowedMethods.includes(inputData.method.toUpperCase()))
  ) {
    return { passes: false, error: 'Invalid "method" field.' };
  }

  if (
    inputData.headers !== undefined && inputData.headers !== null &&
    typeof inputData.headers !== "object"
  ) {
    return { passes: false, error: 'Invalid "headers" field.' };
  }
  return { passes: true, error: null };
}

async function fetchUri(
  { url, method, headers, body }: InputData,
): Promise<string> {
  const response = await fetch(url, {
    method,
    headers,
    body,
  });
  const html = await response.text();
  return html;
}

function parseStringOrJSON(input: string): string | InputData {
  try {
    const parsedObject = JSON.parse(input);
    return parsedObject;
  } catch (_) {
    return input;
  }
}

export default async (request: Request): Promise<Response> => {
  const json = await request.json();
  const metadata = json["metadata"];
  if (!metadata) {
    return new Response("Invalid metadata", { status: 400 });
  }
  const convertedMetadata = parseStringOrJSON(metadata);
  let inputData: InputData;
  if (typeof convertedMetadata === "string") {
    inputData = {
      url: convertedMetadata,
    };
  } else {
    inputData = convertedMetadata;
  }
  const { passes, error } = validateInputData(inputData);
  if (!passes) {
    return new Response(error, { status: 400 });
  }
  try {
    const text = await fetchUri(inputData);
    return new Response(text);
  } catch (e) {
    return new Response(e, { status: 400 });
  }
};
