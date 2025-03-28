/**
 * Waits for all resources (images, etc.) to be fully loaded.
 */
export async function waitForResourcesReady(doc = document) {
  while (doc.readyState !== "complete") {
    await new Promise((resolve) =>
      // must be made iframe-save
      document.defaultView.addEventListener("load", resolve, { once: true })
    );
  }
}
