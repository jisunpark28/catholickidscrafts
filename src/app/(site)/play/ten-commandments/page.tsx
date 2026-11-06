import CommandmentsVillage from '@/components/commandments/CommandmentsVillage';
import { pageMetadata } from '@/lib/site-metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbNode, playAppNode } from '@/lib/structured-data';
import Link from 'next/link';
export const metadata = pageMetadata({ title: 'Love Your Neighbor Village — Ten Commandments Game', description: 'Explore 200 Catholic everyday-choice missions at church, home, school, and the playground. A free five-mission game for families and classrooms.', path: '/play/ten-commandments' });
export default function TenCommandmentsPage() {
  return <div className="min-w-0"><JsonLd nodes={[breadcrumbNode([{name:'Play & Learn',path:'/play'},{name:'Love Your Neighbor Village',path:'/play/ten-commandments'}]), playAppNode({name:'Love Your Neighbor Village',description:'A Catholic Ten Commandments game with 200 everyday-choice missions.',path:'/play/ten-commandments',kind:'game'})]} /><Link href="/play" className="mb-5 inline-block text-sm font-semibold text-[var(--color-link)] hover:underline">← Play & learn</Link><CommandmentsVillage /></div>;
}
