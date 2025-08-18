// Type declarations for Deno imports
declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

// Global Deno namespace
declare namespace Deno {
  namespace env {
    function get(key: string): string | undefined;
  }
}

// Make Deno available globally
declare const Deno: typeof Deno;