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
