import { Decorator } from "./decorator";
import { DocumentLayoutManager } from "./documentlayoutmanager";
import { Page } from "./page";
import { Skeleton } from "./skeleton";

import { waitForResourcesReady } from "../utils/waitForRessources";
import { DomLevelHandler } from "./domlevelhandler";

/**
 * Main entry point for paginate.js. Renders HTML content into paginated pages
 * suitable for print or unifed PDF export.
 */
export class Renderer {
  /**
   * Creates a new Renderer instance.
   * @param {HTMLElement} content - Source element containing content to paginate
   * @param {HTMLElement} [renderTo=document.body] - Target container for rendered pages
   */
  constructor(content, renderTo = document.body) {
    this.content = content;
    this.renderTo = renderTo;
    this.pages = [];

    // Current page targetElement to copy nodes into
    this.targetParent = this.page;
    // Dom depth which will be added in case of a page-break
    this.parentList = [];
    this.domLevelHandler = new DomLevelHandler();
  }

  /**
   * Initializes layout manager and prepares the target container for pagination.
   * @param {HTMLElement} renderTo - Container element to render pages into
   */
  prepareTarget(renderTo) {
    this.layoutManager = new DocumentLayoutManager(renderTo);

    // Insert wrapper and base styles
    this.layoutManager.preparePrintLayout();
    this.renderTo = this.layoutManager.wrapper;

    // Add first page
    this.newPage();
  }

  /**
   * Renders the content into paginated pages. Main public API method.
   * Waits for resources, processes content, and applies header/footer decorations.
   */
  render() {
    waitForResourcesReady(this.content.ownerDocument);
    this.prepareTarget(this.renderTo);
    this.processContent();
    this.layoutManager.finishPrintLayout();

    new Decorator(this.pages).decorate();
  }

  /**
   * Recursively processes child nodes and distributes them across pages.
   * Handles CSS break-before, break-after, and break-inside properties.
   * @param {Node} [parentNode=this.content] - Parent node to process children from
   */
  processContent(parentNode = this.content) {
    // iterate through all direct children
    for (let i = 0; i < parentNode.childNodes.length; i++) {
      const node = parentNode.childNodes[i];

      let avoidBreakInside = false;
      let breakBefore = false;
      let breakAfter = false;

      // important: instanceof can't be used here (won't work in iframes)
      if (node.nodeType === Node.ELEMENT_NODE) {
        var win = node.ownerDocument.defaultView;

        const style = win.getComputedStyle(node);
        breakBefore = style.breakBefore === "page";
        avoidBreakInside = style.breakInside === "avoid";
        breakAfter = style.breakAfter === "page";
      }

      if (breakBefore) {
        this.newPage();
      }

      if (node.hasChildNodes() && !avoidBreakInside) {
        // increse current dom depth
        // Add node shallow again
        let newParent = node.cloneNode(false);
        this.targetParent.appendChild(newParent);

        this.targetParent = newParent;
        this.domLevelHandler.addToDomLevel(node);

        this.processContent(node);

        // remove current dom depth
        this.domLevelHandler.popLevel();
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

  /**
   * Clones and inserts a node into the current page, returning content height.
   * @param {Node} node - Node to clone and insert
   * @returns {number} Scroll height of page content after insertion
   */
  insertAndCheckNode(node) {
    this.targetParent.appendChild(node.cloneNode(true));
    return this.currentPage.content.scrollHeight;
  }

  /**
   * Creates a new page and restores the current DOM nesting structure.
   * Updates targetParent to point to the deepest nested element.
   */
  newPage() {
    const page = this.layoutManager.insertPage();

    this.pages.push(page);
    this.currentPage = page;

    // Create current domtree
    this.targetParent = this.currentPage.content;

    this.targetParent = this.domLevelHandler.renderLevels(page);
  }

  /**
   * Removes the last child from the current target parent.
   * Used to undo insertions that caused overflow.
   */
  removeLastChildNode() {
    if (this.targetParent.lastChild) {
      // Removes the last child, including text nodes
      this.targetParent.removeChild(this.targetParent.lastChild);
    }
  }
}
