
/**
 * Minimal error formatter to extract helpful messages from Supabase/Postgrest errors
 * without changing any UI. Keeps it small and focused.
 */
export function formatError(err: unknown): string {
  try {
    if (!err) return 'Unknown error';

    if (typeof err === 'string') return err;

    if (err instanceof Error && err.message) {
      return err.message;
    }

    if (typeof err === 'object') {
      const anyErr = err as Record<string, any>;

      const message =
        anyErr.message ||
        anyErr.error ||
        anyErr.msg ||
        (typeof anyErr.toString === 'function' ? String(anyErr) : '');

      const details = anyErr.details || anyErr.detail;
      const code = anyErr.code || anyErr.status || anyErr.statusCode;

      let out = message || 'Unknown error';
      if (details && typeof details === 'string') {
        out += ` - ${details}`;
      }
      if (code) {
        out += ` [${code}]`;
      }
      return out;
    }

    return 'Unknown error';
  } catch {
    return 'Unknown error';
  }
}
