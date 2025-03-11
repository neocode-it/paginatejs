export class Decorator {
  constructor(parent) {
    this.reservedKeys = ["pageNumber", "totalPages"];
  }

  decorate(parent) {
    const pages = this.parsePages(parent);
  }
  /**
   * Insert page number references into each page references
   *
   * @param {Array} references
   * @returns {null}
   */
  insertPageNumberReference(referencePages) {
    const totalPages = referencePages.length;
    const pageNumberHash = this.hash("pageNumber");
    const totalPagesHash = this.hash("totalPages");

    for (let i = 0; i < referencePages.length; i++) {
      referencePages[i].pageNumberHash = i + 1;
      referencePages[i].totalPagesHash = totalPages;
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
