import { Decorator } from "./decorator";
import { DocumentLayoutManager } from "./documentlayoutmanager";
import { Page } from "./page";
import { Skeleton } from "./skeleton";

import { waitForResourcesReady } from "../utils/waitForRessources";
import { DomLevelHandler } from "./domlevelhandler";

export class Renderer {
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

  prepareTarget(renderTo) {
    this.layoutManager = new DocumentLayoutManager(renderTo);

    // Insert wrapper and base styles
    this.layoutManager.preparePrintLayout();
    this.renderTo = this.layoutManager.wrapper;

    // Add first page
    this.newPage();
  }

  render() {
    waitForResourcesReady(this.content.ownerDocument);
    this.prepareTarget(this.renderTo);
    this.processContent();
    this.layoutManager.finishPrintLayout();

    new Decorator(this.pages).decorate();
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

  insertAndCheckNode(node) {
    this.targetParent.appendChild(node.cloneNode(true));
    return this.currentPage.content.scrollHeight;
  }

  newPage() {
    const page = this.layoutManager.insertPage();

    this.pages.push(page);
    this.currentPage = page;

    // Create current domtree
    this.targetParent = this.currentPage.content;

    this.targetParent = this.domLevelHandler.renderLevels(page);
  }

  removeLastChildNode() {
    if (this.targetParent.lastChild) {
      // Removes the last child, including text nodes
      this.targetParent.removeChild(this.targetParent.lastChild);
    }
  }
}
