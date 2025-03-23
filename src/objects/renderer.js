import { Page } from "./page";
import { Skeleton } from "./skeleton";

export class Renderer {
  constructor(content, renderTo = document.body) {
    this.content = content;
    this.renderTo = renderTo;
    this.pages = [];

    // Current page targetElement to copy nodes into
    this.targetParent = this.page;
    // Dom depth which will be added in case of a page-break
    this.parentList = [];

    this.prepareTarget(renderTo);
    // this.newPage();
  }

  prepareTarget(renderTo) {
    // Insert pages wrapper & set rendering target to this
    const wrapper = Skeleton.getPagesWrapper();
    renderTo.appendChild(wrapper);
    this.renderTo = wrapper;

    // Insert base styles (required to layout pages e.g.)
    document.head.insertBefore(
      Skeleton.getBaseStyleElement(),
      document.head.firstChild
    );

    // Add first page
    this.newPage();
  }

  /**
   * Processes the content of parent as a recursive function and distrubutes the content throughout all pages
   *
   * @param {Node} parentNode - parent of the current depth which will be processed into pages
   * @returns {null}
   */
  processContent(parentNode = this.content) {
    // iterate through all direct children
    for (let i = 0; i < parentNode.childNodes.length; i++) {
      const node = parentNode.childNodes[i];

      let breakInside = false;
      let breakBefore = false;
      let breakAfter = false;

      if (node instanceof Element) {
        const style = window.getComputedStyle(node);
        breakBefore = style.breakBefore === "always";
        breakInside = style.breakInside === "always";
        breakAfter = style.breakAfter === "always";
      }

      if (breakBefore) {
        this.newPage();
      }

      if (node.hasChildNodes() && !breakInside) {
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
        let height = this.insertAndCheckNode(node);

        if (height > this.currentPage.contentHeight) {
          // Remove overflowing node
          this.removeLastChildNode();

          // There's no further way to break down the children, we create a Break page
          this.newPage();

          // Re-insert this node
          let height = this.insertAndCheckNode(node);

          // Still overflowing? Element can't be broken even more... MAYDAY :)
          if (height > this.currentPage.contentHeight) {
            console.log(
              "Element cannot be rendered to page, does overflow by itself..." +
                node.textContent
            );
          }
        }
      }

      if (breakAfter) {
        this.newPage();
      }
    }
  }

  insertAndCheckNode(node) {
    this.targetParent.appendChild(node.cloneNode(true));
    return this.currentPage.content.scrollHeight;
  }

  newPage() {
    const page = new Page(this.renderTo);

    this.pages.push(page);
    this.currentPage = page;

    // Create current domtree
    this.targetParent = this.currentPage.content;

    this.parentList.forEach((node) => {
      let newNode = node.cloneNode(false);
      this.targetParent.appendChild(newNode);
      this.targetParent = newNode;
    });
  }

  removeLastChildNode() {
    if (this.targetParent.lastChild) {
      // Removes the last child, including text nodes
      this.targetParent.removeChild(this.targetParent.lastChild);
    }
  }
}
