const CLEAN_URLS_ENABLED = false; // Toggle OFF in dev if needed

document.addEventListener("DOMContentLoaded", () => {
  if (CLEAN_URLS_ENABLED) {
    document.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (
        href &&
        href.includes(".html") &&
        !href.startsWith("http") &&
        !href.startsWith("#") &&
        !href.startsWith("mailto:")
      ) {
        const cleanHref = href.replace(/\.html$/, "");
        link.setAttribute("href", cleanHref);
      }
    });
  }
});
