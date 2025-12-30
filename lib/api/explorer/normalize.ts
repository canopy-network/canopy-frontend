type ExplorerPayload<T> = T | { data: T } | { data: { data: T } };

export const unwrapExplorerPayload = <T>(response: unknown): T | null => {
  if (!response) return null;

  const payload = (response as { data?: ExplorerPayload<T> }).data ?? response;

  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: ExplorerPayload<T> }).data;
    if (nested && typeof nested === "object" && "data" in nested) {
      return (nested as { data?: T }).data ?? null;
    }
    return (nested as T) ?? null;
  }

  return payload as T;
};

export const unwrapExplorerList = <T>(response: unknown): T[] => {
  const payload = unwrapExplorerPayload<unknown>(response);
  if (Array.isArray(payload)) {
    return payload as T[];
  }
  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    return Array.isArray(nested) ? (nested as T[]) : [];
  }
  return [];
};

export const unwrapExplorerPagination = (response: unknown) => {
  const value = response as { pagination?: unknown; data?: { pagination?: unknown } };
  return value?.pagination ?? value?.data?.pagination ?? null;
};
