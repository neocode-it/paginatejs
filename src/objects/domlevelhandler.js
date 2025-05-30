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
