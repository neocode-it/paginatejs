/**
 * Represents a single paginated page with header, content, and footer sections.
 */
export class Page {
  /**
   * Creates and renders a new page element.
   * @param {HTMLElement} parent - Paginate.js wrapper to append page to
   * @param {number} pageWidth - Page width in pixels
   * @param {number} pageHeight - Page height in pixels
   * @param {string[]} [pageRange=[]] - CSS classes to apply to the page
   */
  constructor(parent, pageWidth, pageHeight, pageRange = []) {
    this.parent = parent;
    this.pageRange = pageRange;

    this.width = pageWidth;
    this.height = pageHeight;

    this.page = this.createPage();
  }

  /**
   * Creates the page DOM structure with header, content, and footer sections.
   * Appends to parent and locks dimensions after creation.
   */
  createPage() {
    if (this.pageRange.length == 0) {
      this.pageRange.push("default");
    }

    const page = document.createElement("div");
    page.classList.add("page", ...this.pageRange);
    page.style.margin = "0";
    page.style.display = "flex";
    page.style.flexDirection = "column";
    page.style.overflow = "hidden";

    const header = document.createElement("div");
    header.classList.add("header");
    header.style.margin = "0";
    header.style.width = "100%";

    const content = document.createElement("div");
    content.classList.add("content");
    content.style.margin = "0";
    content.style.width = "100%";
    content.style.height = "unset";
    content.style.flexGrow = "1";
    content.style.overflow = "hidden";

    const footer = document.createElement("div");
    footer.classList.add("footer");
    footer.style.margin = "0";
    footer.style.width = "100%";

    page.append(header, content, footer);

    this.parent.appendChild(page);

    // Set height explicitly in order to avoid accidental
    // changes after content has been added
    this.calculateAndLockHeights(page, header, content, footer);

    this.page = page;
    this.header = header;
    this.content = content;
    this.footer = footer;
  }

  /**
   * Locks page dimensions by setting explicit height/maxHeight on all sections.
   * Prevents layout shifts when content is added.
   * @param {HTMLElement} page - Page container element
   * @param {HTMLElement} header - Header section element
   * @param {HTMLElement} content - Content section element
   * @param {HTMLElement} footer - Footer section element
   */
  calculateAndLockHeights(page, header, content, footer) {
    page.style.width = this.width + "px";
    page.style.maxWidth = this.width + "px";

    page.style.height = this.height + "px";
    page.style.maxHeight = this.height + "px";

    const headerHeight = header.offsetHeight;
    header.style.height = headerHeight + "px";
    header.style.maxHeight = headerHeight + "px";

    const footerHeight = footer.offsetHeight;
    footer.style.height = footerHeight + "px";
    footer.style.maxHeight = footerHeight + "px";

    const contentHeight = content.offsetHeight;
    content.style.height = contentHeight + "px";
    content.style.maxHeight = contentHeight + "px";

    this.headerHeight = headerHeight;
    this.contentHeight = contentHeight;
    this.footerHeight = footerHeight;
  }
}
