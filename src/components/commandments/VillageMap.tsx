import type { Location } from '@/lib/commandments/model';
import { LABELS, LOCATIONS } from '@/lib/commandments/model';
/** Original SVG artwork. Text controls remain real, keyboard-operable buttons. */
export function Flower({ filled = false }: { filled?: boolean }) {
  return <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><g fill={filled ? '#89a655' : '#f6f2db'} stroke="#799344" strokeWidth="1.1">{[0,60,120,180,240,300].map(a => <ellipse key={a} cx="20" cy="11" rx="6" ry="9" transform={`rotate(${a} 20 20)`} />)}<circle cx="20" cy="20" r="5" fill={filled ? '#eac15e' : '#f6f2db'} /></g></svg>;
}
export function VillageMap({ selected, onSelect, grown }: { selected: Location | null; onSelect: (l: Location) => void; grown: number }) {
  return <div className="nv-map" aria-label="Village locations">
    <svg className="nv-map-art" viewBox="0 0 600 500" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="nv-sky" x2="0" y2="1"><stop stopColor="#dbe9e3"/><stop offset="1" stopColor="#fff9e8"/></linearGradient>
        <linearGradient id="nv-grass" x2="0" y2="1"><stop stopColor="#d8e4a7"/><stop offset="1" stopColor="#9bb665"/></linearGradient>
        <linearGradient id="nv-roof" x2="0" y2="1"><stop stopColor="#6795a1"/><stop offset="1" stopColor="#3e6e79"/></linearGradient>
        <linearGradient id="nv-red" x2="0" y2="1"><stop stopColor="#dc9167"/><stop offset="1" stopColor="#a8503b"/></linearGradient>
        <linearGradient id="nv-wall" x2="0" y2="1"><stop stopColor="#fff9df"/><stop offset="1" stopColor="#e6d7ab"/></linearGradient>
        <filter id="nv-paper"><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="14"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".055"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter>
        <filter id="nv-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#5c7044" floodOpacity=".22"/></filter>
        <g id="nv-tree"><path d="M0 0v-65" stroke="#8c7650" strokeWidth="9" strokeLinecap="round"/><path d="M0-24-14-43M0-33 14-51" stroke="#8c7650" strokeWidth="4"/><g fill="#8faa59" stroke="#6d9047" strokeWidth="1"><circle cy="-65" r="26"/><circle cx="-18" cy="-50" r="21"/><circle cx="19" cy="-51" r="21"/><circle cx="-11" cy="-79" r="17"/></g><circle cx="-17" cy="-64" r="15" fill="#afc873" opacity=".7"/></g>
        <g id="nv-bush"><ellipse rx="24" ry="13" fill="#7e9d51"/><circle cx="-13" cy="-6" r="11" fill="#a9bf6c"/><circle cx="7" cy="-9" r="15" fill="#92ae5e"/></g>
        <g id="nv-window"><path d="M-10 0v-19a10 10 0 0 1 20 0V0z" fill="#7caaa9" stroke="#9b815c" strokeWidth="3"/><path d="M0-27V0M-10-13h20" stroke="#f7edca" strokeWidth="2"/></g>
        <g id="nv-flower"><path d="M0 2v-14m0 9 7-4" stroke="#668943" strokeWidth="2"/><g fill="#e9b35b"><circle cy="-17" r="4"/><circle cx="-4" cy="-13" r="4"/><circle cx="4" cy="-13" r="4"/></g><circle cy="-13" r="2.5" fill="#fff4b9"/></g>
      </defs>
      <g filter="url(#nv-paper)">
        <path d="M30 130Q105 35 183 87T345 72T575 119L590 450H10Z" fill="url(#nv-sky)"/>
        <path d="M5 207Q94 115 185 160T361 144T594 188L590 460H10Z" fill="#cedbb6"/>
        <path d="M16 262Q59 166 173 199T340 183T579 230L593 430Q567 482 439 479T231 486T18 445Z" fill="url(#nv-grass)"/>
        <g opacity=".65"><use href="#nv-tree" transform="translate(55 246) scale(.75)"/><use href="#nv-tree" transform="translate(541 254) scale(.9)"/><use href="#nv-tree" transform="translate(300 215) scale(.55)"/><use href="#nv-tree" transform="translate(239 220) scale(.6)"/></g>
        {/* Winding paths connect the four locations */}
        <path d="M295 483Q376 439 329 394T305 298Q329 255 443 219M307 296Q233 264 154 214M311 358Q201 362 124 388M330 400Q412 382 465 365" fill="none" stroke="#a6a76a" strokeWidth="40" opacity=".28"/>
        <path d="M295 483Q376 439 329 394T305 298Q329 255 443 219M307 296Q233 264 154 214M311 358Q201 362 124 388M330 400Q412 382 465 365" fill="none" stroke="#f4e7bd" strokeWidth="31" strokeLinecap="round"/>
        <path d="M300 479Q375 439 329 394" fill="none" stroke="#fffae2" strokeWidth="4" opacity=".6"/>
        {/* Church */}
        <g filter="url(#nv-shadow)" stroke="#8b8059" strokeLinejoin="round">
          <path d="M87 213v-65l57-33 57 33v65z" fill="url(#nv-wall)" strokeWidth="2"/>
          <path d="m75 152 69-48 69 48-13 4-56-36-56 36z" fill="url(#nv-roof)" strokeWidth="2"/>
          <path d="M122 207v-97h44v97" fill="#f5eac9" strokeWidth="2"/>
          <path d="m113 110 31-48 31 48z" fill="url(#nv-roof)" strokeWidth="2"/>
          <path d="M144 62V36m-10 10h20" fill="none" stroke="#706e52" strokeWidth="4"/>
          <path d="M135 110V94a9 9 0 0 1 18 0v16z" fill="#626b58"/><path d="M140 97v8h8v-8" fill="#d8ae59"/>
          <path d="M131 210v-28a13 13 0 0 1 26 0v28" fill="#b48d55" strokeWidth="2"/><path d="M144 171v39"/><circle cx="149" cy="193" r="1.5" fill="#f7e5b0"/>
          <use href="#nv-window" transform="translate(105 188) scale(.7)"/><use href="#nv-window" transform="translate(183 188) scale(.7)"/>
          <path d="M126 215h36m-40 5h44" stroke="#b7ae87" strokeWidth="5"/>
        </g>
        {/* Home */}
        <g filter="url(#nv-shadow)" stroke="#97764f" strokeLinejoin="round">
          <path d="M392 220v-79l65-35 65 35v79z" fill="#f1d3a0" strokeWidth="2"/>
          <path d="m377 146 80-61 80 61-15 6-65-48-65 48z" fill="url(#nv-roof)" strokeWidth="2"/>
          <path d="M492 115V83h16v44" fill="#d4a97e" strokeWidth="2"/><path d="M489 82h22" strokeWidth="5"/>
          <path d="M443 220v-35a14 14 0 0 1 28 0v35" fill="#9f7850" strokeWidth="2"/><circle cx="463" cy="202" r="2" fill="#f8dc8a"/>
          <use href="#nv-window" transform="translate(415 191)"/><use href="#nv-window" transform="translate(499 191)"/>
          <circle cx="457" cy="137" r="12" fill="#8eb5ad" strokeWidth="3"/><path d="M457 125v24m-12-12h24" stroke="#fff2d1" strokeWidth="2"/>
          <path d="M429 226h56m-60 6h64" stroke="#c1b18a" strokeWidth="5"/>
        </g>
        {/* Playground swing + slide */}
        <g filter="url(#nv-shadow)" strokeLinecap="round" strokeLinejoin="round">
          <path d="m60 396 24-100 25 100m80 0-24-100-25 100M84 296h81" fill="none" stroke="#a0784f" strokeWidth="6"/>
          <path d="M105 300v61m38-61v61" stroke="#6a7662" strokeWidth="2"/><path d="M100 363h48" stroke="#76989c" strokeWidth="8"/>
          <path d="M211 390V326h37v13q-10 8-7 24t33 31q10 8-6 10-53-17-51-59h-6" fill="#7fa5a5" stroke="#507f85" strokeWidth="3"/>
          <path d="m199 327 31-31 31 31z" fill="#e2b763" stroke="#aa8b4e" strokeWidth="2"/>
          <path d="M201 333v60m1-42h14m-14 16h14m-14 16h14" stroke="#a8844e" strokeWidth="4"/>
        </g>
        {/* School */}
        <g filter="url(#nv-shadow)" stroke="#9e7454" strokeLinejoin="round">
          <path d="M395 399v-79h135v79z" fill="#f2d5ab" strokeWidth="2"/>
          <path d="m383 325 38-43h85l37 43z" fill="url(#nv-red)" strokeWidth="2"/>
          <path d="m432 321 30-38 32 38v78h-62z" fill="#f9e7c4" strokeWidth="2"/>
          <path d="M449 399v-30a13 13 0 0 1 26 0v30" fill="#b98d62" strokeWidth="2"/>
          <circle cx="462" cy="333" r="13" fill="#fff6d9" strokeWidth="2"/><path d="M462 323v11l7 4" fill="none" strokeWidth="2"/>
          <use href="#nv-window" transform="translate(414 369) scale(.75)"/><use href="#nv-window" transform="translate(512 369) scale(.75)"/>
          <path d="M445 405h35m-40 6h45" stroke="#b4a17e" strokeWidth="5"/>
        </g>
        {/* Garden, shrubs and scattered wildflowers */}
        {[ [63,273],[223,259],[365,238],[553,300],[82,440],[216,440],[529,445],[376,462] ].map(([x,y],i) => <use key={i} href="#nv-bush" transform={`translate(${x} ${y})`} />)}
        {[ [49,265],[68,278],[218,257],[366,236],[553,297],[72,437],[202,437],[540,446] ].map(([x,y],i) => <use key={i} href="#nv-flower" transform={`translate(${x} ${y}) scale(.8)`} />)}
        <ellipse cx="279" cy="332" rx="38" ry="19" fill="#66864c" opacity=".5"/>
        {Array.from({length:5},(_,i) => <g key={i} transform={`translate(${253+i*13} ${329+(i%2)*6})`} opacity={i < grown ? 1 : .2}><use href="#nv-flower" /></g>)}
        <g fill="#c6c6a7" stroke="#929879"><ellipse cx="350" cy="453" rx="14" ry="9"/><ellipse cx="369" cy="455" rx="10" ry="7"/></g>
      </g>
    </svg>
    {LOCATIONS.map(l => <button key={l} type="button" className={`nv-map-stop nv-stop-${l}`} onClick={() => onSelect(l)} aria-pressed={selected === l} aria-label={`Play five missions at ${LABELS[l]}`}><span>{LABELS[l]}</span><small>50 missions</small></button>)}
  </div>;
}
export function ScenarioArt({ location }: { location: Location }) {
  return <div className={`nv-scene nv-scene-${location}`} aria-hidden="true"><svg viewBox="0 0 400 145" focusable="false">
    <defs><linearGradient id="nv-scene-bg" x2="0" y2="1"><stop stopColor="#edf3dc"/><stop offset="1" stopColor="#fff3d7"/></linearGradient></defs>
    <rect width="400" height="145" rx="18" fill="url(#nv-scene-bg)"/>
    <circle cx="340" cy="34" r="38" fill="#f4d87d" opacity=".35"/><path d="M0 125Q80 90 160 123T400 112v33H0" fill="#cfdbad"/>
    {location === 'school' ? <g stroke="#8c7552" strokeWidth="2"><path d="M44 111h310v9H44z" fill="#d8b78c"/><rect x="113" y="55" width="161" height="55" rx="16" fill="#aa8cbb"/><path d="M122 69h142m-130 0v9"/><path d="m147 84 6-9 5 9 10 2-8 7 2 11-9-5-9 5 2-11-8-7z" fill="#f4d580"/><circle cx="223" cy="86" r="9" fill="#e9b7bb"/><path d="M283 110V42h10v68m5 0V33h10v77" fill="#e7b85e"/><rect x="43" y="26" width="51" height="56" rx="5" fill="#76a5a5"/><path d="M51 35h34m-34 10h34m-34 10h20" stroke="#f9edc8"/></g> : location === 'church' ? <g stroke="#96774d" strokeWidth="2"><path d="M160 115V47l40-23 40 23v68z" fill="#f6e7c4"/><path d="m147 51 53-37 53 37" fill="none" stroke="#6f959b" strokeWidth="9"/><path d="M187 115V85a13 13 0 0 1 26 0v30" fill="#bda077"/><path d="M200 31v26m-10-15h20" strokeWidth="4"/><path d="M78 111V77h20v34m205 0V77h20v34" fill="#fff8da"/><path d="M88 73q-9-12 0-23 10 13 0 23m225 0q-9-12 0-23 10 13 0 23" fill="#edb64f"/></g> : location === 'home' ? <g stroke="#8e7754" strokeWidth="2"><path d="M124 115V57l77-30 77 30v58z" fill="#f1d4a4"/><path d="m112 62 89-44 89 44" fill="none" stroke="#71989e" strokeWidth="10"/><rect x="141" y="74" width="35" height="29" rx="5" fill="#97b5ab"/><path d="M195 115V81a16 16 0 0 1 32 0v34" fill="#ad895c"/><path d="M200 71c-25-15-13-33 1-21 14-12 26 6-1 21" fill="#dca49b"/><path d="M64 117v-20m-10 10h20m248 10V93m-10 12h20" stroke="#82a552" strokeWidth="4"/></g> : <g strokeLinecap="round" strokeLinejoin="round"><path d="m90 122 26-89 26 89m83 0-26-89-26 89m-57-89h83" stroke="#9c7c55" strokeWidth="5" fill="none"/><path d="M136 37v57m40-57v57" stroke="#7e8c68" strokeWidth="2"/><path d="M131 96h50" stroke="#7fa0a4" strokeWidth="7"/><circle cx="285" cy="101" r="22" fill="#edc976" stroke="#a8874e" strokeWidth="2"/><path d="m285 80 8 16-10 14-18-2m18 2 6 12m4-26 14 3" stroke="#fff6df" strokeWidth="3" fill="none"/></g>}
  </svg><span>{LABELS[location]}</span></div>;
}
