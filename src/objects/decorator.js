/**
 * Decorator class will decorate all pages after rendering. It's main purpose:
 * - Parse betterprint elements
 * - Render Header / Footer content
 * - Add page numbers
 */
export class Decorator {
  constructor(pages) {
    this.reservedKeys = ["pageNumber", "totalPages"];
    this.pages = pages;
  }
  #renderFooter(sources) {
    this.pages.forEach((page, i) => {
      this.#renderPageFooter(page, sources[i]);
    });
  }

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
   * Calculates the references of each page individually
   * add default keys to the content like page numbers
   * @param {list[Page]} pages
   * @returns {Array referencePages}
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
   * Searches current page for source content and generates a
   * Object of every reference. References are a hash-value of the data-key attribute
   *
   *
   * @param {Element} page - Page to search for source content
   * @returns {Object references} references
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
   * Insert page number references into each page references
   *
   * @param {Array} references
   * @returns {null}
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
   * Returns a hash code from a string
   * Please note: not recommended for security applications! insecure.
   *
   * @param  {String} str The string to hash.
   * @return {Number}    A 32bit integer
   * @see http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
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
