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

}
