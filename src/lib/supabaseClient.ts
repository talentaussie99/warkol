import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL || "https://jzxjpdmijpuxkbbqfhad.supabase.co";
let cleanUrl = rawUrl.trim();
if (cleanUrl.endsWith("/rest/v1/")) {
  cleanUrl = cleanUrl.slice(0, -9);
} else if (cleanUrl.endsWith("/rest/v1")) {
  cleanUrl = cleanUrl.slice(0, -8);
}
if (cleanUrl.endsWith("/")) {
  cleanUrl = cleanUrl.slice(0, -1);
}

const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6eGpwZG1panB1eGtiYnFmaGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzNzcxNjAsImV4cCI6MjA5Njk1MzE2MH0.ttjm4P3fXEcRgNSgvbfPDwuS3CsWz3UfGB5hN5JLtxo";

export const supabase = createClient(cleanUrl, supabaseAnonKey);
