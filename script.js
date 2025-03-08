document.addEventListener("DOMContentLoaded", () => {
  renderer = new Renderer(document.querySelector("template").content);

  const start = performance.now();

  renderer.processContent();

  const end = performance.now();
  const timeTaken = end - start;
  console.log(`Time taken: ${timeTaken}ms`);
});

class Renderer {
  constructor(content, renderTo = document.body) {
    this.content = content;
    this.renderTo = renderTo;

    // Current page targetElement to copy nodes into
    this.targetParent = this.page;
    // Dom depth which will be added in case of a page-break
    this.parentList = [];
    this.maxHeight = 300;

    this.prepareTarget();
  }

  prepareTarget() {
    // Add first page
    this.newPage();

    // Create current domtree
    this.targetParent = this.page;
  }

  }

