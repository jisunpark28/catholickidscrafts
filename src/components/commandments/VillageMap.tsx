import Image from 'next/image';
import type { Location } from '@/lib/commandments/model';
import { LABELS, LOCATIONS } from '@/lib/commandments/model';

/** Progress flowers remain vector controls; the map and scenes are original generated watercolor images. */
export function Flower({ filled = false }: { filled?: boolean }) {
  return <svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><g fill={filled ? '#89a655' : '#f6f2db'} stroke="#799344" strokeWidth="1.1">{[0,60,120,180,240,300].map(a => <ellipse key={a} cx="20" cy="11" rx="6" ry="9" transform={`rotate(${a} 20 20)`} />)}<circle cx="20" cy="20" r="5" fill={filled ? '#eac15e' : '#f6f2db'} /></g></svg>;
}

export function VillageMap({ selected, onSelect, grown }: { selected: Location | null; onSelect: (l: Location) => void; grown: number }) {
  return <div className="nv-map" aria-label="Village locations">
    <Image className="nv-map-image" src="/games/neighbor-village/village.webp" alt="Watercolor village with a Catholic church at upper left, a home at upper right, a playground at lower left, and a school at lower right, joined by garden paths." width={1024} height={1024} sizes="(max-width: 760px) 90vw, 550px" priority />
    <div className="nv-watercolor-garden" aria-hidden="true">{Array.from({ length: 5 }, (_, i) => <span key={i} style={{ opacity: i < grown ? 1 : 0 }}><Flower filled /></span>)}</div>
    {LOCATIONS.map(l => <button key={l} type="button" className={`nv-map-stop nv-stop-${l}`} onClick={() => onSelect(l)} aria-pressed={selected === l} aria-label={`Play five missions at ${LABELS[l]}`}><span>{LABELS[l]}</span><small>50 missions</small></button>)}
  </div>;
}

const SCENE_ALT: Record<Location, string> = {
  school: 'Representative school illustration: two children at a classroom desk with a purple pencil case and a book.',
  church: 'Representative church illustration: children and adults gathered on a flower-lined path outside a Catholic church.',
  home: 'Representative home illustration: family members drawing and coloring together around a table.',
  playground: 'Representative playground illustration: children, including a child using a wheelchair, gathered with a ball near swings and a slide.',
};

/** Four representative location scenes, not a literal illustration of every individual mission. */
export function ScenarioArt({ location }: { location: Location }) {
  return <div className={`nv-scene nv-scene-${location}`}>
    <Image className="nv-scene-image" src={`/games/neighbor-village/${location}.webp`} alt={SCENE_ALT[location]} width={1280} height={720} sizes="(max-width: 760px) 90vw, 550px" />
    <span>{LABELS[location]}</span>
  </div>;
}
