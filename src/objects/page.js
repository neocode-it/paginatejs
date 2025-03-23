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
    const pageWidth = page.offsetWidth;
    page.style.width = pageWidth + "px";
    page.style.maxWidth = pageWidth + "px";

    const pageHeight = page.offsetHeight;
    page.style.height = pageHeight + "px";
    // Add little offset of .4px
    // in order to prevent empty last page in Firefox
    page.style.maxHeight = pageHeight - 0.4 + "px";

    const headerHeight = header.offsetHeight;
    header.style.height = headerHeight + "px";
    header.style.maxHeight = headerHeight + "px";

    const footerHeight = footer.offsetHeight;
    footer.style.height = footerHeight + "px";
    footer.style.maxHeight = footerHeight + "px";

    const contentHeight = content.offsetHeight;
    content.style.height = contentHeight + "px";
    content.style.maxHeight = contentHeight + "px";

    this.height = pageHeight;
    this.width = pageWidth;
    this.headerHeight = headerHeight;
    this.contentHeight = contentHeight;
    this.footerHeight = footerHeight;
  }
