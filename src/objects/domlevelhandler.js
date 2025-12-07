/**
 * Tracks DOM nesting levels during pagination to restore element hierarchy on page breaks.
 * Handles special cases like table headers that must repeat across pages.
 */
export class DomLevelHandler {
  /** Creates a new handler with empty level stack. */
  constructor() {
    this.domLevels = [];
    this.target = null;
  }

  /**
   * Pushes an element onto the DOM level stack.
   * For tables, also captures thead for repetition on new pages.
   * @param {HTMLElement} element - Element to track in the hierarchy
   */
  addToDomLevel(element) {
    let before = [];
    let after = [];

    // Add table header & footer as element too if required
    if (element.tagName === "TBODY") {
      this.#handleTables(before, element, after);
    }

    const level = {
      before: before,
      main: element,
      after: after,
    };

    this.domLevels.push(level);
  }

  /**
   * Captures table thead element for repetition on page breaks.
   * @param {HTMLElement[]} before - Array to store elements rendered before tbody
   * @param {HTMLElement} element - The tbody element being processed
   * @param {HTMLElement[]} after - Array to store elements rendered after tbody
   */
  #handleTables(before, element, after) {
    let prevSibling = element.previousElementSibling;
    let nextSibling = element.nextElementSibling;

    // Check for thead
    while (prevSibling) {
      if (prevSibling.tagName === "THEAD") {
        var win = prevSibling.ownerDocument.defaultView;
        const style = win.getComputedStyle(prevSibling);

        if (style.display === "table-header-group") {
          before.push(prevSibling);
          break;
        }
      }
      // Move to the next previous sibling
      prevSibling = prevSibling.previousElementSibling;
    }

  popLevel() {
    this.domLevels.pop();
  }

  /**
   * Reconstructs the DOM hierarchy on a new page by cloning all tracked levels.
   * @param {Page} page - The page to render levels into
   * @returns {HTMLElement} Deepest nested element to continue inserting content
   */
  renderLevels(page) {
    let target = page.content;

    this.domLevels.forEach((level) => {
      level.before.forEach((beforeElement) => {
        target.appendChild(beforeElement.cloneNode(true));
      });

      const newTarget = level.main.cloneNode(false);
      target.appendChild(newTarget);

      level.after.forEach((afterElement) => {
        target.appendChild(afterElement.cloneNode(true));
      });

      target = newTarget;
    });

    return target;
  }
}
