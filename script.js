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
  processContent(parentNode = this.content) {
    // iterate through all direct children
    for (let i = 0; i < parentNode.childNodes.length; i++) {
      const node = parentNode.childNodes[i];

      let height = this.insertAndCheckNode(node);

      // Overflow present?
      if (height > this.maxHeight) {
        // Remove overflowing node
        this.removeLastChildNode();

        // Does node has children?
        if (node.hasChildNodes()) {
          let prevTargetParent = this.targetParent;

          // increse current dom depth
          // Add node shallow again
          let newParent = node.cloneNode(false);
          this.targetParent.appendChild(newParent);
          this.targetParent = newParent;
          this.parentList.push(node);

          this.processContent(node);

          // remove current dom depth
          this.parentList.pop();
          this.targetParent = this.targetParent.parentNode;

          // In case there is none, There has been a page-break and the children are on the new page.
          // -> No need to render the (empty) wrapping parent in this case then..
          if (!newParent.hasChildNodes()) {
            newParent.remove();
          }
        } else {
          // There's no further way to break down the children, we create a Break page
          this.newPage();

          let height = this.insertAndCheckNode(node);
          if (height > this.maxHeight) {
            console.log(
              "Element cannot be rendered to page, does overflow by itself..."
            );
          }
        }
      }
    }
  }

