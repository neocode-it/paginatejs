/**
 * Utility class for creating paginate.js DOM structure and base styles.
 */
export class Skeleton {
  /**
   * @param {HTMLElement} renderTo - Target container for pagination output
   */
  constructor(renderTo) {
    this.renderTo = renderTo;
  }

  /**
   * Creates the main pages wrapper element.
   * @returns {HTMLDivElement} Wrapper div with paginatejs classes
   */
  insertPageWrapper() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("paginatejs", "paginatejs-pages");
    return wrapper;
  }

  /**
   * Creates a style element with base CSS for page layout and print media.
   * @returns {HTMLStyleElement} Style element with base paginate.js styles
   */
  static getBaseStyleElement() {
    const style = document.createElement("style");
    style.innerHTML = `
          *, ::after, ::before {
            box-sizing: border-box;
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
            }
            .paginatejs{
              gap: 0px;
            }
          }
        `;
    return style;
  }

  /**
   * Creates a pages wrapper element (static alternative to insertPageWrapper).
   * @returns {HTMLDivElement} Wrapper div with paginatejs classes
   */
  static getPagesWrapper() {
    const wrapper = document.createElement("div");
    wrapper.classList.add("paginatejs", "paginatejs-pages");
    return wrapper;
  }
}
