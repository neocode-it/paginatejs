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
  }

}
