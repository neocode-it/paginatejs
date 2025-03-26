/**
 * DocumentLayoutManager is responsible for general tasks such as:
 * - Generate base wrapper for paginate.js pages
 * - Insert base css required for paginate.js
 * - Add media print settings for paginate.js
 * - Responsible to calculate and create new pages with preset layout (size & style)
 */
export class DocumentLayoutManager {
  constructor(parentElement) {
    this.parentElement = parentElement;
  }

  preparePrintLayout() {
    this.removeMediaPrintRules();

  #removeMediaPrintRules() {
    const targetDocument = this.parentElement.ownerDocument;
    // Prevent @media print rules
    // Loop through all style sheets
    for (let i = targetDocument.styleSheets.length - 1; i >= 0; i--) {
      const styleSheet = targetDocument.styleSheets[i];

      try {
        // Loop through the CSS rules in the stylesheet
        for (let j = styleSheet.cssRules.length - 1; j >= 0; j--) {
          if (
            styleSheet.cssRules[j].media &&
            styleSheet.cssRules[j].media.mediaText === "print"
          ) {
            styleSheet.deleteRule(j);
          }
        }
      } catch (e) {
        // Catch SecurityError for cross-origin stylesheets
        console.warn(
          `Unable to access rules in stylesheet: ${styleSheet.href}`
        );
      }
    }

    // Handle inline styles
    targetDocument.querySelectorAll("style").forEach((styleElement) => {
      const sheet = styleElement.sheet;
      try {
        for (let k = sheet.cssRules.length - 1; k >= 0; k--) {
          if (
            sheet.cssRules[k].media &&
            sheet.cssRules[k].media.mediaText === "print"
          ) {
            sheet.deleteRule(k);
          }
        }
      } catch (e) {
        console.warn("Error processing inline style element:", e);
      }
    });
  }

  #addPrintWrapper() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("paginatejs", "paginatejs-pages");
    this.parentElement.appendChild(wrapper);
  }

}
