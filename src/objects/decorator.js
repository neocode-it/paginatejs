/**
 * Post-render decorator that populates headers, footers, and resolves
 * paginate-source/paginate-target elements for dynamic content like page numbers.
 */
export class Decorator {
  /**
   * @param {Page[]} pages - Array of rendered Page instances to decorate
   */
  constructor(pages) {
    this.reservedKeys = ["pageNumber", "totalPages"];
    this.pages = pages;
  }

  /**
   * Decorates all pages with headers, footers, and resolved target values.
   * Parses source elements and applies them to corresponding targets.
   */
  decorate() {
    const sources = this.#parsePages(this.pages);

    this.#renderHeader(sources);
    this.#renderFooter(sources);
  }

  /**
   * Renders headers for all pages using accumulated source references.
   * @param {Object[]} sources - Array of source reference objects per page
   */
  #renderHeader(sources) {
    this.pages.forEach((page, i) => {
      this.#renderPageHeader(page, sources[i - 1], sources[i], i + 1);
    });
  }

  /**
   * Renders header for a single page, resolving paginate-target elements.
   * @param {Page} page - Page to render header for
   * @param {Object} prevSources - Source references from previous page
   * @param {Object} sources - Source references from current page
   * @param {number} pageNumber - 1-based page number
   */
  #renderPageHeader(page, prevSources, sources, pageNumber) {
    // First page?
    // Add first header found on page 1
    if (pageNumber == 1) {
      const firstHeader = page.content.querySelectorAll(
        'paginate-source[data-key="header"]'
      )[0];
      if (firstHeader) {
        page.header.innerHTML = firstHeader.innerHTML;
      }
    } else {
      // Else add current header if any
      const header = prevSources[this.hash("header")];

      if (header) {
        page.header.innerHTML = header.innerHTML;
      }
    }

    // If page isn't first one, set paginate source data to previous page,
    // in order to allow the header to show past content only
    const pageSource = pageNumber == 1 ? sources : prevSources;

    let targets = page.header.querySelectorAll(
      'paginate-target:not([data-status="solved"])'
    );

    // Resolve targets until there is none left
    while (targets.length) {
      targets.forEach((target) => {
        const key = target.getAttribute("data-key") ?? "empty-key";

        // Always take page numer from current page
        if (key === "pageNumber" || key === "totalPages") {
          target.innerHTML = sources[this.hash(key)]?.innerHTML ?? "";
        }
        // If key is header, this will cause a infinite loop
        else if (key !== "header") {
          target.innerHTML = pageSource[this.hash(key)]?.innerHTML ?? "";
        }

        target.setAttribute("data-status", "solved");
      });

      targets = page.header.querySelectorAll(
        'paginate-target:not([data-status="solved"])'
      );
    }
  }

  /**
   * Renders footers for all pages using source references.
   * @param {Object[]} sources - Array of source reference objects per page
   */
  #renderFooter(sources) {
    this.pages.forEach((page, i) => {
      this.#renderPageFooter(page, sources[i]);
    });
  }

  /**
   * Renders footer for a single page, resolving paginate-target elements.
   * @param {Page} page - Page to render footer for
   * @param {Object} sources - Source references for this page
   */
  #renderPageFooter(page, sources) {
    const footer = sources[this.hash("footer")];

    if (footer) {
      page.footer.innerHTML = footer.innerHTML;
    }

    let targets = page.footer.querySelectorAll(
      'paginate-target:not([data-status="solved"])'
    );

    // Resolve targets until there is none left
    while (targets.length) {
      targets.forEach((target) => {
        const key = target.getAttribute("data-key") ?? "empty-key";

        // If key is header, this will cause a infinite loop
        if (key !== "footer") {
          target.innerHTML = sources[this.hash(key)]?.innerHTML ?? "";
        }

        target.setAttribute("data-status", "solved");
      });

      targets = page.footer.querySelectorAll(
        'paginate-target:not([data-status="solved"])'
      );
    }
  }

  /**
   * Builds cumulative source references for each page, including page numbers.
   * @param {Page[]} pages - Array of pages to parse
   * @returns {Object[]} Array of reference objects, one per page
   */
  #parsePages(pages) {
    let referencePages = [];
    let previousReferences = {};
    for (let i = 0; i < pages.length; i++) {
      let pagePreference = this.parseCurrentPage(pages[i]);

      // add previous references to this page too
      pagePreference = Object.assign(
        {},
        previousReferences,
        this.parseCurrentPage(pages[i])
      );

      // Insert page to preferences list and update previousReference for next page
      referencePages.push(pagePreference);
      previousReferences = pagePreference;
    }

    this.insertPageNumberReference(referencePages);

    return referencePages;
  }

  /**
   * Extracts paginate-source elements from a page into a hash-keyed object.
   * @param {Page} page - Page to extract sources from
   * @returns {Object} Map of hashed data-key to source element
   */
  parseCurrentPage(page) {
    // This will fetch all source-elements in a recursive way, starting from the beinning of the page
    const sources = page.content.querySelectorAll("paginate-source");

    let references = {};
    // Let's parse the sources and overrite existing ones
    sources.forEach((source) => {
      // Get key of this source-element
      const dataKey = source.getAttribute("data-key");

      // Check if the key attribute exists and is not empty or reservedKey
      if (
        dataKey &&
        dataKey.trim() !== "" &&
        !this.reservedKeys.includes(dataKey)
      ) {
        // create hash of dataKey in oder to prevent invalid Object keys
        const hash = this.hash(dataKey);
        references[hash] = source;
      }
    });

    return references;
  }

  /**
   * Adds pageNumber and totalPages references to each page's source map.
   * @param {Object[]} referencePages - Array of reference objects to augment
   */
  insertPageNumberReference(referencePages) {
    const totalPages = document.createElement("span");
    totalPages.innerHTML = referencePages.length;
    const pageNumberHash = this.hash("pageNumber");
    const totalPagesHash = this.hash("totalPages");

    for (let i = 0; i < referencePages.length; i++) {
      const pageNumber = document.createElement("span");
      pageNumber.innerHTML = i + 1;

      referencePages[i][pageNumberHash] = pageNumber;
      referencePages[i][totalPagesHash] = totalPages;
    }
  }

  /**
   * Generates a 32-bit hash from a string (Java's hashCode algorithm).
   * Not recommended for security applications! insecure.
   * @param {string} str - String to hash
   * @returns {number} 32-bit integer hash
   */
  hash(str) {
    let hash = 0;
    for (let i = 0, len = str.length; i < len; i++) {
      let chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}
