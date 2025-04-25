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
    this.#addPrintWrapper();
    this.#removeMediaPrintRules();
    this.#addBasePrintStyles();

  #adjustLastPage() {
    const lastPage = this.wrapper.lastElementChild;

    if (!lastPage) return;

    lastPage.style.height = lastPage.offsetHeight - 2 + "px";
    lastPage.style.maxHeight = lastPage.style.height;
  }

  /**
   * Will make sure all referenced css files will be accessible.
   *
   * In case of missing access (e.g. CORS preventing JS to read rules), this method
   * will fetch the stylesheet manually and replace it inline.
   */
  #ensureCssAccess() {
    const targetDocument = this.parentElement.ownerDocument;
    targetDocument
      .querySelectorAll('link[rel="stylesheet"]')
      .forEach((link) => {
        const sheet = [...document.styleSheets].find(
          (s) => s.href === link.href
        );
        try {
          sheet.cssRules; // Attempt to access cssRules
          return; // Skip this stylesheet since read access is available
        } catch {}

        try {
          // Fetch the CSS content synchronously using XMLHttpRequest
          const xhr = new XMLHttpRequest();
          xhr.open("GET", link.href, false);
          xhr.send();

          if (xhr.status === 200) {
            const style = document.createElement("style");
            style.textContent = xhr.responseText;
            link.replaceWith(style); // Replace <link> with <style>
          } else {
            console.error(`Failed to fetch ${link.href}: HTTP ${xhr.status}`);
          }
        } catch (error) {
          console.error(
            `Network/Browser error while fetching ${link.href}, some rules won't be applied: `,
            error
          );
        }
      });
  }

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

  #addBasePrintStyles() {
    const style = document.createElement("style");
    style.innerHTML = `
          *, ::after, ::before {
            box-sizing: border-box;
          }
          paginate-source{
            display: none;
          }
          .paginatejs-pages {
            display: flex;
            flex-direction: column;
            gap: 0.5cm;
          }
          .page {
            width: 210mm;
            height: 297mm;
          }
          .page .header,
          .page .footer {
            width: 100%;
            height: 2cm;
          }
          .page .content {
            width: 100%;
            height: 100%;
          }
          @media print {
            .paginatejs * {
              break-after: unset !important;
              break-before: unset !important;
              break-inline: unset !important;
              page-break-after: unset !important;
              page-break-inside: unset !important;
              page-break-before: unset !important;
            }
            .paginatejs{
              gap: 0px;
            }
            
            .paginatejs .page{
              break-after: page;
            }
          }
      `;
    const targetDocument = this.parentElement.ownerDocument;
    targetDocument.head.insertBefore(style, targetDocument.head.firstChild);
  }
  #setPrintPageSize() {
    const size = "size: " + this.pageWidth + "px " + this.pageHeight + "px;";
    const style = document.createElement("style");

    style.innerHTML = "@page{ " + size + " margin: 0}";

    const targetDocument = this.parentElement.ownerDocument;
    targetDocument.head.appendChild(style);
  }
}
