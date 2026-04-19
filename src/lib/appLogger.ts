export type AppLogLevel = "info" | "warn" | "error";

export interface AppLogContext {
  [key: string]: unknown;
}

export function logAppEvent(
  scope: string,
  level: AppLogLevel,
  message: string,
  context?: AppLogContext,
) {
  const prefix = `[${scope}] ${message}`;

  if (level === "error") {
    console.error(prefix, context ?? {});
    return;
  }

  if (level === "warn") {
    console.warn(prefix, context ?? {});
    return;
  }

  console.info(prefix, context ?? {});
}

export function getErrorMessage(error: unknown, fallback = "Erro inesperado.") {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  if (
    typeof error === "object"
    && error !== null
    && "message" in error
    && typeof error.message === "string"
    && error.message.trim()
  ) {
    return error.message.trim();
  }

  return fallback;
}
