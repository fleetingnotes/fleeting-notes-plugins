import { serve } from "https://deno.land/std@0.140.0/http/server.ts";

const getRoutes = async (dir: string): Promise<Map<string, Function>> => {
  const entries = Deno.readDir(dir);
  const routes = new Map();

  for await (const entry of entries) {
    const path = `${dir}/${entry.name}`;

    if (entry.isFile && path.endsWith('.ts')) {
      const module = await import(path);
      const pathname = dir.replace('.', '');
      routes.set(pathname, module.default);
    } else if (entry.isDirectory) {
      const nestedRoutes = await getRoutes(path);
      nestedRoutes.forEach((value, key) => {
        routes.set(key, value);
      });
    }
  }

  return routes;
}

const routes = await getRoutes('./plugins');

function handler(_req: Request): Response {
  const pathname = new URL(_req.url).pathname;
  const handler = routes.get(pathname);

  if (handler) {
    return handler();
  }
  return new Response(_req.headers.get('host') ?? 'unknown');
}

serve(handler);
