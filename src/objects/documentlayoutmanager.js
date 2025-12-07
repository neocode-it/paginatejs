import { Page } from "./page.js";
/**
 * Manages document layout preparation for pagination.
 * Handles CSS normalization, page wrapper creation, and print styles.
 */
export class DocumentLayoutManager {
  /**
   * @param {HTMLElement} parentElement - Container to render paginated content into
   */
  constructor(parentElement) {
    this.parentElement = parentElement;
    this.targetDocument = parentElement.ownerDocument;
  }

  /**
   * Prepares the document for pagination. Normalizes CSS, creates page wrapper,
   * and calculates page dimensions from stylesheets.
   */
  preparePrintLayout() {
    this.#addPrintWrapper();
    this.#ensureCssAccess();
    this.#convertExternalStyleSheetsInline();
    this.#moveStylesToHead();
    this.#replaceInvalidStyleRules();
    // this.#removeMediaPrintRules();
    this.#addBasePrintStyles();
    this.#determinePageDimensions();
    this.#setPrintPageSize();
  }

  /**
   * Finalizes print layout after content rendering.
   * Adjusts last page height to prevent blank page in print.
   */
  finishPrintLayout() {
    this.#adjustLastPage();
  }

  /** Reduces last page height by 2px to prevent extra blank page in print. */
  #adjustLastPage() {
    const lastPage = this.wrapper.lastElementChild;

    if (!lastPage) return;

    lastPage.style.height = lastPage.offsetHeight - 2 + "px";
    lastPage.style.maxHeight = lastPage.style.height;
  }

  /**
   * Creates and inserts a new page into the wrapper.
   * @param {string[]} [pageRange=[]] - CSS classes to apply to the page
   * @returns {Page} The newly created Page instance
   */
  insertPage(pageRange = []) {
    return new Page(this.wrapper, this.pageWidth, this.pageHeight, pageRange);
  }

  /**
   * Ensures CSS stylesheets are accessible for JS parsing.
   * Fetches external stylesheets via XHR if CORS blocks direct access.
   */
  #ensureCssAccess() {
    const targetDocument = this.targetDocument;
    targetDocument
      .querySelectorAll('link[rel="stylesheet"]')
      .forEach((link) => {
        const sheet = [...targetDocument.styleSheets].find(
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
            `PaginateJS is unable to access stylesheet rules from ${link.href}, likely due to CORS restrictions.`,
            "Ensure that the external stylesheets have the correct `Access-Control-Allow-Origin` header set on the server to allow JavaScript to read the CSS rules.",
            "Network/Browser error details:",
            error
          );
          link.remove();
        }
      });
  }

  /** Converts external stylesheets to inline <style> tags for easier manipulation. */
  #convertExternalStyleSheetsInline() {
    let cssText = "";
    const externalStylesheets = [...this.targetDocument.styleSheets].filter(
      (sheet) => sheet.href
    );

    externalStylesheets.forEach((styleSheet) => {
      try {
        cssText = "";
        Array.from(styleSheet.cssRules).forEach((rule) => {
          cssText += rule.cssText + "\n";
        });

        // Insert stlysheets inline
        let newStyleTag = document.createElement("style");
        newStyleTag.innerHTML = cssText;

        const linkTag = styleSheet.ownerNode;
        linkTag.parentNode.insertBefore(newStyleTag, linkTag);
      } catch (e) {
        console.error(
          `Could not access and replace stylesheet: ${styleSheet.href}`,
          e
        );
      }
    });

    // Remove the external stylesheet after replacing,
    // ensureing even if the stylesheet was not accessible, it will be removed
    this.targetDocument
      .querySelectorAll("link[rel='stylesheet']")
      .forEach((styleTag) => {
        styleTag.remove();
      });
  }

  /**
   * Moves all styles and stylesheets to the head of the document.
   * This is necessary to ensure that styles won't be copied with the paged content.
   * In addition, it will ensure that all styles keep beeing applied after edits document.styleSheets
   */
  #moveStylesToHead() {
    const head = this.targetDocument.head;
    const stylesAndLinks = this.targetDocument.querySelectorAll(
      'style, link[rel="stylesheet"]'
    );

    stylesAndLinks.forEach((element) => {
      if (!head.contains(element)) {
        head.appendChild(element);
      }
    });
  }

  /**
   * Converts viewport units (vw/vh) to fixed pixel values.
   * @param {string} string - CSS value string containing viewport units
   * @returns {string} CSS string with viewport units replaced by pixels
   */
  #replaceViewportSizeWithAbsolute(string) {
    const convertedStyle = string.replace(
      /(-?\d+|-?\d*\.\d+)(vw|vh)/g,
      (match, value, unit) => {
        const numericValue = parseFloat(value);
        let pxValue;

        if (unit === "vw") {
          pxValue = (numericValue / 100) * 1080; // Convert vw to px
        } else if (unit === "vh") {
          pxValue = (numericValue / 100) * 720; // Convert vh to px
        }

        return `${Math.round(pxValue)}px`; // Replace with pixel value
      }
    );
    return convertedStyle;
  }

  /** Normalizes styles by converting viewport units to pixels in all elements and stylesheets. */
  #replaceInvalidStyleRules() {
    // Check all elements with style attribute
    this.targetDocument.querySelectorAll("[style]").forEach((element) => {
      let style = element.getAttribute("style");

      style = this.#replaceViewportSizeWithAbsolute(style);

      element.setAttribute("style", style);
    });

    // Check all stylesheets and replace invalid rules for PaginateJS
    Array.from(this.targetDocument.styleSheets).forEach((styleSheet) => {
      try {
        for (let i = 0; i < styleSheet.cssRules.length; i++) {
          this.#recursiveRemoveRules(styleSheet, i); // Call the function for each rule
        }
      } catch (e) {
        console.error(`Could not access stylesheet: ${styleSheet.href}`, e);
      }
    });
  }

  /**
   * Recursively processes CSS rules to remove undesired css rules
   * like remove media queries or convert vw/vh units to pixels.
   *
   * This function will edit the stylesheets directly,
   * so the passed rule index should be re-checked after returning if he is still valid.
   *
   * @param {CSSRule} styleSheet - parent rule/stylesheet to process
   * @param {int} ruleIndex - index of the rule to process
   * @returns {void}
   */
  #recursiveRemoveRules(styleSheet, ruleIndex) {
    // Ensure rule exists
    let rule = styleSheet.cssRules[ruleIndex];
    if (!rule) return;

    // Neutralize media queries -> apply rules always
    if (rule.media && rule.type === CSSRule.MEDIA_RULE) {
      // Insert inner rules right after the media rule
      Array.from(rule.cssRules).forEach((innerRule, i) => {
        styleSheet.insertRule(innerRule.cssText, ruleIndex + i + 1);
      });

      // Remove the original media rule
      styleSheet.deleteRule(ruleIndex);

      // Re-fetch the rule after insertion
      rule = styleSheet.cssRules[ruleIndex];
    }

    // If the rule is a style rule, process its styles
    // This will convert relative vw/vh to absolute pixels
    if (rule.style) {
      for (let i = 0; i < rule.style.length; i++) {
        let property = rule.style[i];
        let value = rule.style.getPropertyValue(property);

        // Convert `vw` to pixels
        if (value.includes("vw") || value.includes("vh")) {
          value = this.#replaceViewportSizeWithAbsolute(value);
          rule.style.setProperty(property, value);
        }
      }
    }
    // Recursively check for nested rules
    if (rule.cssRules) {
      for (let i = 0; i < rule.cssRules.length; i++) {
        this.#recursiveRemoveRules(rule, i);
      }
    }
    return;
  }

  /** Removes @media print rules from stylesheets. Currently unused. */
  #removeMediaPrintRules() {
    this.#ensureCssAccess();

    const targetDocument = this.parentElement.ownerDocument;
    // Prevent @media print rules
    // Loop through all style sheets
    for (let i = targetDocument.styleSheets.length - 1; i >= 0; i--) {
      const styleSheet = targetDocument.styleSheets[i];

      try {
        // Loop through the CSS rules in the stylesheet
        for (let j = styleSheet.cssRules.length - 1; j >= 0; j--) {
          const rule = styleSheet.cssRules[j];

          if (!rule.media) {
            // If the rule is not a media rule, continue to the next rule
            continue;
          }

          const mediaText = rule.media.mediaText.toLowerCase();

          if (mediaText === "print") {
            styleSheet.deleteRule(j);
          } else if (/min-width|max-width/.test(mediaText)) {
            styleSheet.deleteRule(j);
          }
        }
      } catch (e) {
        // Catch SecurityError for cross-origin stylesheets
        console.error(
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

  /** Creates and appends the main paginate.js wrapper element. */
  #addPrintWrapper() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("paginatejs", "paginatejs-pages");
    this.parentElement.appendChild(wrapper);

    this.wrapper = wrapper;
  }

  /** Injects base CSS for page layout, flexbox structure, and print behavior. */
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

  /** Calculates page dimensions by measuring an off-screen test element. */
  #determinePageDimensions() {
    const offPage = document.createElement("div");
    offPage.classList.add("page", "default");
    offPage.style.position = "absolute";
    offPage.style.top = "-9999px";
    offPage.style.left = "-9999px";

    this.wrapper.appendChild(offPage);
    const height = offPage.offsetHeight;
    const width = offPage.offsetWidth;
    offPage.remove();

    this.pageHeight = height;
    this.pageWidth = width;
  }

  /** Sets @page CSS rule with calculated dimensions and zero margins. */
  #setPrintPageSize() {
    const size = "size: " + this.pageWidth + "px " + this.pageHeight + "px;";
    const style = document.createElement("style");

    style.innerHTML = "@page{ " + size + " margin: 0}";

    const targetDocument = this.parentElement.ownerDocument;
    targetDocument.head.appendChild(style);
  }
}
