import { serve } from "https://deno.land/std@0.155.0/http/server.ts";
import importModule from './routes-manifest.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.11.0"
import { PostHog } from "https://esm.sh/posthog-node";
import "https://deno.land/std@0.188.0/dotenv/load.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);
const posthog = new PostHog(Deno.env.get("POSTHOG_CLIENT_KEY") || '');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function handler(req: Request): Promise<Response> {
  const token = req.headers?.get("Authorization")?.replace("Bearer ", "") ?? '';
  const { data } = await supabase.auth.getUser(token);
  if (!data.user) {
    return new Response('Permission Denied~', { status: 403, headers: corsHeaders })
  }
  const pathname = new URL(req.url).pathname;
  const module = importModule(`.${pathname.replace(/\/$/, '')}/index.ts`);
  posthog.capture({
    distinctId: data.user.id,
    event: `plugin called`,
    properties: {
      pathname: pathname,
      $set: {
        email: data.user.email,
      }
    }
  });

  // call module
  if (module) {
    const res =  module.default(req);
    for (const [key, value] of Object.entries(corsHeaders)) {
      res.headers.set(key as string, value as string);
    }
    return res;
  }
  return new Response('Function Not Found~', { status: 404, headers: corsHeaders })
}

serve(handler);
