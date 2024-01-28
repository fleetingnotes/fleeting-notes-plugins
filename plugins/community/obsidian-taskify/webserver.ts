import { serve } from "https://deno.land/std@0.155.0/http/server.ts";
import myPlugin from "./index.ts"
serve(myPlugin);
