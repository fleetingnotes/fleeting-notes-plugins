import { serve } from "https://deno.land/std@0.155.0/http/server.ts";
import importModule from './routes-manifest.ts'


function handler(_req: Request): Response {
  const pathname = new URL(_req.url).pathname;
  const module = importModule(`.${pathname.replace(/\/$/, '')}/index.ts`);
  if (module) {
    return module.default(_req);
  }
  return new Response(_req.headers.get('host') ?? 'unknown');
}

serve(handler);
