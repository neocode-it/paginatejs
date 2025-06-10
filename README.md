> [!WARNING]
> This project is still in development so expect breaking changes!

# paginatejs
Display html content in a paginated view & generate exact print-previews with focus on reliability & performance. Paginate.js does not aim to replicate the dynamic behavior of a browser's print preview. Instead, it converts the html content into a static, paginated preview, ensuring that the layout remains consistent and unaltered when printed. For even more cross-browser consistency, you may consider using an css-normalizer/reset like [modern-normalize.css](https://github.com/sindresorhus/modern-normalize) on top.

## Limitations
Paginate.js is focussed on broad css support. However, there are some slight limitations in favour of simplicity and cross-browser compatibility:
- "break-before", "break-inside" and "break-after" css rules are limited to "auto" and "page"/"avoid" (in case of break-inside).
- Repeating footer using "display: table-footer-group" won't work yet, since their implementation turned out to be difficult

## Current progress
This library is still under development, but the core functionality is already working fine so far.

### TODO
- Add option for text-splitting
- ~~Add option for table headers~~
- ~~Prevent @media-print rules and page-break rules~~
- ~~Implement general page layout~~
- ~~Improve structure if possible~~
- Handle edge-cases: Vertical overflow & single element without beeing able to break -> planned to just scale those elements
- ~~Running header/footer/content~~
- ~~Presets (how to set page size, how to realize dynamic header...)~~
- Fix: Remove media rules at all, don't just replace with media screen (won't apply in print!)

### Optional features
- Page ranges (in order to apply different layout to specific pages) -> WIP

### Planned approach
Two custom html elements, which will receive the content of the first/previous source element with the same key:

- `<paginate-target data-key=""> `
- `<paginate-source data-key="">`

This source-element-keys will be reserved: 
- "pageNumber"
- "totalPages"
This target-string-keys will be reserved too:
- "header"
- "footer"

## How is Paginate.js structured?

Paginate.js is split into four main Classes:

### Renderer Class

Rendere is responsible for the core parts of Paginate.js: Create empty pages and split the content accross those.

### DocumentLayoutManager

DocumentLayoutManager handles the paginated view's overall layout and styling. It also prepares the stylesheets and replaces unsupported css rules (mainly media rules and relative units).

### Decorator Class

Decorator is responsible for the header and footer rendering including all the running-elements. After rendering the pages, decorator will parse all pages and create header/footer depending on them.

Please note: Decorator is not directly accessible, instead beeing utilized by Renderer directly.

### Page

The Page class represents a single page of content within a paginated view.
