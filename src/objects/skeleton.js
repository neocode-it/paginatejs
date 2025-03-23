export class Skeleton {
  static getBaseStyleElement() {
    const style = document.createElement("style");
    style.innerHTML = `
          *, ::after, ::before {
            box-sizing: border-box;
          }
          .paginatejs-pages {
            display: flex;
            flex-direction: column;
            gap: 0.5cm;
          }
          .page {
            width: 210mm;
            height: 297mm;
          }
          .page .header,
          .page .footer {
            width: 100%;
            height: 2cm;
          }
          .page .content {
            width: 100%;
            height: 100%;
          }
          @media print {
            .paginatejs * {
              break-after: unset !important;
              break-before: unset !important;
              break-inline: unset !important;
            }
            .paginatejs{
              gap: 0px;
            }
          }
        `;
    return style;
  }
