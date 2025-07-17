const CHAT_HISTORY_KEY = "chatHistory";

export function getCachedChat() {
  const cached = sessionStorage.getItem(CHAT_HISTORY_KEY);

  try {
    return {
      history: cached ? JSON.parse(cached) : [],
    };
  } catch {
    console.warn("Failed to parse chat cache.");
    clearCachedChat();
    return { history: [], role: "homeLoans" };
  }
}

export function cacheChat(history) {
  sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

export function clearCachedChat() {
  sessionStorage.removeItem(CHAT_HISTORY_KEY);
}
