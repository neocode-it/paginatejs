export class Page {
  /**
   * Creates a new page inside parent
   *
   * @param {HTMLElement} parent - Paginatejs wrapper
   * @param {int} pageWidth - Page width in px
   * @param {int} pageHeight - Page width in px
   * @param {string[]} [pageRange] - Current page range
   */
  constructor(parent, pageWidth, pageHeight, pageRange = []) {
    this.parent = parent;
    this.pageRange = pageRange;

    this.width = pageWidth;
    this.height = pageHeight;

    this.page = this.createPage();
  }

  /**
   * Creates an empty, new page element
   *
   * @returns {null}
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
   * Calculates & locks the page heights of header, content and footer
   * in order to prevent accidental changes after content has been added
   *
   * @param {HTMLElement} page - The (empty) rendered page
   * @param {HTMLElement} header - The (empty) header element of the page
   * @param {HTMLElement} conten - The (empty) content element of the page
   * @param {HTMLElement} footer - The (empty) footer element of the page
   *
   * @returns {null}
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

