// Lightweight AsyncStorage shim for web/SSR builds so @metamask/sdk can bundle without RN deps
const fallbackStore = new Map<string, string>()

const safeGetItem = (key: string): string | null => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallbackStore.get(key) ?? null
  }

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const safeSetItem = (key: string, value: string) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    fallbackStore.set(key, value)
    return
  }

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore storage errors
  }
}

const safeRemoveItem = (key: string) => {
  if (typeof window === 'undefined' || !window.localStorage) {
    fallbackStore.delete(key)
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore storage errors
  }
}

export const AsyncStorage = {
  getItem: async (key: string) => safeGetItem(key),
  setItem: async (key: string, value: string) => {
    safeSetItem(key, value)
  },
  removeItem: async (key: string) => {
    safeRemoveItem(key)
  },
}

export default AsyncStorage
