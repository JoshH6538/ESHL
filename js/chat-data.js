const CHAT_HISTORY_KEY = "chatHistory";

export function getCachedChat() {
  const cached = sessionStorage.getItem(CHAT_HISTORY_KEY);
  // console.log("Cached chat:", cached);
  if (!cached) {
    return { history: [] };
  }
  try {
    // console.log("Parsing:", cached);
    return {
      history: cached && cached !== null ? JSON.parse(cached) : [],
    };
  } catch {
    console.warn("Failed to parse chat cache.");
    clearCachedChat();
    return { history: [] };
  }
}

export function cacheChat(history) {
  sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
}

export function clearCachedChat() {
  sessionStorage.removeItem(CHAT_HISTORY_KEY);
}
