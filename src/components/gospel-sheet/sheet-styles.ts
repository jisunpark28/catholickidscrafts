/** Styles for the printable Gospel sheet, scoped under `.gs`. Ported from the approved mockup. */
export const GOSPEL_SHEET_CSS = `
.gs, .gs *{box-sizing:border-box}
.gs{font-family:"Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif;color:#111}
.gs-page{width:8.5in;height:11in;margin:16px auto;background:#fff;padding:.5in;box-shadow:0 2px 8px #0003;overflow:hidden;display:flex;flex-direction:column;gap:10px}
.gs header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #111;padding-bottom:6px}
.gs h1{margin:0;font-size:24px;font-weight:700;line-height:1.2}
.gs .gs-sub{font-size:14px}
.gs .gs-meta{font-size:14px;text-align:right}
.gs .gs-dot{display:inline-block;width:12px;height:12px;border-radius:50%;border:1.5px solid #111;vertical-align:middle;margin-right:4px;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.gs h2{font-size:15px;margin:0 0 4px;text-transform:uppercase;letter-spacing:.5px;font-weight:700}
.gs .gs-box{border:2px solid #111;border-radius:12px;padding:8px 12px}
.gs .gs-story p{margin:0;font-size:15px;line-height:1.45}
.gs.gs-l1 .gs-story p{font-size:18px}
.gs .gs-trace{font-size:30px;letter-spacing:2px;border-bottom:2px dashed #999;line-height:1.5;color:transparent;-webkit-text-stroke:1.3px #888;font-weight:700}
.gs .gs-copy{font-size:17px;font-weight:700}
.gs .gs-wl{border-bottom:2px dotted #777;height:30px}
.gs .gs-row{display:flex;gap:10px}.gs .gs-row>*{flex:1}
.gs .gs-heart{flex:1;min-height:0;display:flex;flex-direction:column}
.gs svg{display:block;width:100%;height:auto}
.gs svg .ln{fill:none;stroke:#111;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}
.gs svg text{fill:#111;font-family:inherit;font-weight:700}
.gs .gs-q{font-size:14px;margin:4px 0 0}
.gs .gs-chk{list-style:none;padding:0;margin:0;font-size:15px}.gs .gs-chk li{margin:3px 0}
.gs .gs-chk li:before{content:"";display:inline-block;width:16px;height:16px;border:2px solid #111;border-radius:3px;margin-right:8px;vertical-align:-3px}
.gs .gs-prayer{text-align:center;font-size:16px;font-style:italic}
.gs footer{margin-top:auto;text-align:center;font-size:11px;color:#444;border-top:1px solid #999;padding-top:4px}
@media print{
  .gs-page{margin:0;box-shadow:none;padding:0;width:auto;height:9.95in}
  .gs-screen-only{display:none !important}
}
`;

/** Only on the print route: letter paper, 0.5in margins. */
export const GOSPEL_SHEET_PAGE_CSS = `@page{size:letter;margin:.5in}
@media print{html,body{background:#fff !important}}`;
