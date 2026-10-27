/** Styles for the printable Gospel sheet, scoped under `.gs`. Ported from the approved mockup. */
export const GOSPEL_SHEET_CSS = `
.gs, .gs *{box-sizing:border-box}
.gs{font-family:"Comic Sans MS","Chalkboard SE","Trebuchet MS",sans-serif;color:#111}
.gs-page{width:8.5in;height:11in;margin:16px auto;background:#fff;padding:.5in;box-shadow:0 2px 8px #0003;overflow:hidden;display:flex;flex-direction:column;gap:10px}
/* Base capture: slightly tighter so footer/prayer stay on the letter page. */
.gs.gs-base .gs-page{gap:6px}
.gs header{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:3px solid #111;padding-bottom:6px}
.gs h1{margin:0;font-size:24px;font-weight:700;line-height:1.2}
.gs .gs-sub{font-size:14px}
.gs .gs-meta{font-size:14px;text-align:right}
.gs header>div:first-child{flex:1 1 auto;min-width:48%;padding-right:10px}
.gs .gs-meta{max-width:52%}
.gs .gs-meta-long{font-size:11px;line-height:1.25}
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
.gs .gs-ph{border:2px dashed #a58bc9;border-radius:10px;color:#6b4f99;background:#f7f3fc;font-size:10px;display:flex;align-items:center;justify-content:center;text-align:center;padding:2px;word-break:break-all}
.gs .gs-ph-main{float:right;width:2.1in;height:1.4in;margin:0 0 6px 10px}
.gs .gs-ph-heart{align-self:flex-end;padding:1px 8px}
.gs .gs-ph-icons{display:flex;gap:10px;justify-content:center}
.gs .gs-ph-icon{width:.65in;height:.65in;font-size:8px}
.gs .gs-act>*:last-child{flex:1;min-height:0}
.gs .gs-act-split{display:flex;gap:14px;align-items:stretch;min-height:0}
.gs .gs-act-split .gs-chk{align-self:center;font-size:16px}
.gs .gs-act-wf1{display:flex;flex-direction:column;justify-content:space-evenly}
.gs .gs-act-wf1-row{display:flex;justify-content:space-between;align-items:center;gap:16px}
.gs .gs-act-letters{font-size:30px;letter-spacing:12px;font-weight:700;font-family:"Courier New",monospace}
.gs .gs-act-find{font-size:16px;border:2px solid #111;border-radius:8px;padding:2px 10px}
.gs .gs-act-code{display:flex;flex-direction:column;justify-content:space-around;gap:8px}
.gs .gs-act-key{display:flex;flex-wrap:wrap;gap:4px;justify-content:center;border:1.5px dashed #777;border-radius:8px;padding:6px}
.gs .gs-act-keycell{display:inline-flex;flex-direction:column;align-items:center;min-width:26px;font-size:13px;border-right:1px solid #ccc;padding:0 3px}
.gs .gs-act-keycell b{font-size:16px}
.gs .gs-act-msg{display:flex;flex-wrap:wrap;gap:6px 16px;justify-content:center}
.gs .gs-act-word{display:inline-flex;gap:3px}
.gs .gs-act-slot{display:inline-flex;flex-direction:column;align-items:center;width:24px}
.gs .gs-act-slot b{font-size:14px}
.gs .gs-act-slot i{display:block;width:22px;height:26px;border-bottom:2px solid #111}
.gs .gs-act-slot-l1{width:34px}.gs .gs-act-slot-l1 b{font-size:22px}.gs .gs-act-slot-l1 i{width:30px;height:34px}
.gs .gs-act-punct{align-self:flex-end;font-size:20px}
.gs .gs-act-fb{display:flex;flex-direction:column;justify-content:space-evenly}
.gs .gs-act-fb p{margin:0;line-height:2.1;text-align:center}
.gs .gs-act-fb-l1 p{font-size:30px}.gs .gs-act-fb-l2 p{font-size:20px}
.gs .gs-act-blank{display:inline-block;border-bottom:2px solid #111;height:1em;margin:0 4px;vertical-align:baseline}
.gs .gs-act-bank{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center;font-size:15px}
.gs .gs-act-chip{border:2px solid #111;border-radius:999px;padding:3px 12px;font-size:15px}
.gs .gs-act-seq1{display:flex;gap:10px;padding:10px 0 0 8px}
.gs .gs-act-frame{flex:1;display:flex;flex-direction:column;border:2px solid #111;border-radius:10px;padding:6px;position:relative;min-height:0}
.gs .gs-act-frame p{margin:4px 0 0;font-size:11.5px;line-height:1.25}
.gs .gs-act-draw{flex:1;min-height:40px;border:1.5px dashed #999;border-radius:8px}
.gs .gs-act-num{display:inline-block;width:28px;height:28px;border:2px solid #111;border-radius:50%;flex:none}
.gs .gs-act-frame .gs-act-num{position:absolute;top:-8px;left:-8px;background:#fff}
.gs .gs-act-seq2{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;justify-content:space-evenly}
.gs .gs-act-seq2 li{display:flex;gap:10px;align-items:center;font-size:14px;line-height:1.35}
.gs .gs-act-match{display:flex;justify-content:space-between}
.gs .gs-act-match>div{display:flex;flex-direction:column;justify-content:space-evenly;width:38%}
.gs .gs-act-mitem{position:relative;border:2px solid #111;border-radius:10px;padding:4px 10px;font-size:14px}
.gs .gs-act-match-l1 .gs-act-mitem{font-size:22px;text-align:center}
.gs .gs-act-match-l2 .gs-act-mitem{padding:2px 10px;font-size:13px;line-height:1.25}
.gs .gs-act-mleft:after,.gs .gs-act-mright:before{content:"";position:absolute;top:50%;width:10px;height:10px;margin-top:-5px;border-radius:50%;background:#111}
.gs .gs-act-mleft:after{right:-18px}.gs .gs-act-mright:before{left:-18px}
.gs .gs-act-pic{height:40px;margin:0 auto;width:84px}
.gs .gs-act-wlist{column-gap:22px;font-size:15px}.gs .gs-act-wlist li{break-inside:avoid}
.gs .gs-act-clues{list-style:none}
.gs .gs-act-sort{display:flex;flex-direction:column;gap:10px}
.gs .gs-act-cols{flex:1;display:flex;gap:16px;min-height:0}
.gs .gs-act-basket{flex:1;border:2.5px solid #111;border-radius:6px 6px 24px 24px;padding:6px 10px;text-align:center;font-size:17px;display:flex;flex-direction:column;justify-content:space-evenly}
.gs .gs-act-sort-l1 .gs-act-basket{justify-content:flex-end}
.gs .gs-act-scene{flex:1.8;min-height:0}
.gs .gs-act-drawscene{display:flex;flex-direction:column;gap:4px}
.gs .gs-act-prompt{font-size:13px;font-style:italic}
.gs .gs-act-prayer{display:flex;flex-direction:column;justify-content:space-evenly}
.gs .gs-act-pline{display:flex;gap:8px;align-items:flex-end;font-size:17px}
.gs .gs-act-prayer-l1 .gs-act-pline{font-size:21px}
.gs .gs-act-fill{flex:1;border-bottom:2px dotted #777;height:26px}
.gs .gs-act-clues{margin:0;padding-left:22px;flex:1;display:flex;flex-direction:column;justify-content:space-evenly}
.gs .gs-act-bingo{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);border:2.5px solid #111}
.gs .gs-act-bingo>div{border:1px solid #111;display:flex;align-items:center;justify-content:center;text-align:center;font-weight:700}
.gs .gs-act-table{width:100%;border-collapse:collapse;table-layout:fixed}
.gs .gs-act-table th,.gs .gs-act-table td{border:1.5px solid #111;text-align:center;padding:2px 4px;font-size:14px}
@media print{
  .gs-page{margin:0;box-shadow:none;padding:0;width:auto;height:9.95in}
  .gs-screen-only{display:none !important}
}
`;

/** Only on the print route: letter paper, 0.5in margins. */
export const GOSPEL_SHEET_PAGE_CSS = `@page{size:letter;margin:.5in}
@media print{html,body{background:#fff !important}}`;
