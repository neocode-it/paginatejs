export class DomLevelHandler {
  constructor() {
    this.domLevels = [];
    this.target = null;
  }
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

}
