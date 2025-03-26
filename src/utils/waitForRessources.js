/**
 * Waits for all resources (images, etc.) to be fully loaded.
 */
export async function waitForResourcesReady() {
  while (document.readyState !== "complete") {
    await new Promise((resolve) =>
      window.addEventListener("load", resolve, { once: true })
    );
  }
}
