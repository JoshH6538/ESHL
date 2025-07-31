export function generateLoader(messages, options = {}) {
  const { selector = ".loader-message", interval = 2500 } = options;

  const messageEl = document.querySelector(selector);
  if (!messageEl || !messages?.length) return;

  let i = 0;
  messageEl.textContent = messages[i];
  messageEl.classList.add("slide-in");

  const intervalId = setInterval(() => {
    i = i + 1;

    if (i >= messages.length) {
      clearInterval(intervalId);
      return;
    }

    // Update text
    messageEl.textContent = messages[i];

    // Re-trigger animation
    messageEl.classList.remove("slide-in");
    void messageEl.offsetWidth; // force reflow
    messageEl.classList.add("slide-in");
  }, interval);

  return intervalId;
}
