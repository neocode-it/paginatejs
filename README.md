# paginatejs
Display html content in a paginated view & generate exact print-previews with focus on reliability.

## Current progress
This library is still under development

### TODO
- Add option for text-splitting
- Add option for table headers
- Prevent @media-print rules

### Planning in progress
- Running header/footer/content
- Presets (how to set page size, how to realize dynamic header...)

### Planned approach
Two custom html elements, which will receive the content of the first/previous source element with the same key:

- `<betterprint-target data-key=""> `
- `<betterprint-source data-key="">`

This source-element-keys will be reserved: 
- "pageNumber"
- "totalPages"
This target-string-keys will be reserved too:
- "header"
- "footer"
