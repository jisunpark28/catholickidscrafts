'use client';

import { useRef, useState } from 'react';
import { COMMANDMENTS, SOURCES } from '@/lib/commandments/commandments';
import { freshHistory, LABELS, parseHistory, selectRound, STORAGE_KEY, type History, type Mission, type Scope } from '@/lib/commandments/model';
import { Flower, ScenarioArt, VillageMap } from './VillageMap';
import './village.css';

type Round = { scope: Scope; missions: Mission[]; index: number; solved: boolean; completed: number; finished: boolean };
export default function CommandmentsVillage() {
  const [round, setRound] = useState<Round | null>(null);
  const [message, setMessage] = useState('');
  const [wrong, setWrong] = useState<string | null>(null);
  const [storageWarning, setStorageWarning] = useState(false);
  const memory = useRef<History | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const busy = useRef(false);
  const mission = round?.missions[round.index];
  const teaching = mission ? COMMANDMENTS[mission.commandment - 1] : null;

  function focusHeading() { requestAnimationFrame(() => heading.current?.focus()); }
  function begin(scope: Scope) {
    if (busy.current) return;
    busy.current = true;
    let h = memory.current;
    if (!h) {
      try { h = parseHistory(localStorage.getItem(STORAGE_KEY)); }
      catch { h = freshHistory(); setStorageWarning(true); }
    }
    const result = selectRound(scope, h);
    memory.current = result.history;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(result.history)); }
    catch { setStorageWarning(true); }
    setRound({ scope, missions: result.missions, index: 0, solved: false, completed: 0, finished: false });
    setMessage(''); setWrong(null); focusHeading();
    requestAnimationFrame(() => { busy.current = false; });
  }
  function answer(id: string) {
    if (!round || !mission || round.solved || round.finished || busy.current) return;
    if (id !== mission.correctId) {
      setWrong(id);
      setMessage('Not quite. Think about care, safety, and the commandment. You can try again — no points lost.');
      return;
    }
    busy.current = true;
    setWrong(null);
    setMessage(mission.feedback);
    setRound(r => r && !r.solved ? { ...r, solved: true, completed: r.completed + 1 } : r);
    requestAnimationFrame(() => { busy.current = false; });
  }
  function next() {
    if (!round?.solved || busy.current) return;
    busy.current = true;
    setRound(r => r ? r.index === 4 ? { ...r, finished: true } : { ...r, index: r.index + 1, solved: false } : r);
    setWrong(null); setMessage(''); focusHeading();
    requestAnimationFrame(() => { busy.current = false; });
  }
  return <section className="nv-game" aria-label="Love Your Neighbor Village game">
    <header className="nv-heading"><span className="nv-eyebrow">A little village. Everyday choices.</span><h1>Love Your Neighbor Village</h1><p>Discover the Ten Commandments through kind, thoughtful choices.</p></header>
    <div className="nv-columns">
      <div className="nv-explore">
        <div className="nv-progress" aria-label={`${round?.completed ?? 0} of 5 missions completed`}>
          <strong>{round?.finished ? '5 of 5 complete' : round ? `Mission ${round.index + 1} of 5` : 'Five missions per round'}</strong>
          <div className="nv-blooms">{Array.from({ length: 5 }, (_, i) => <Flower key={i} filled={i < (round?.completed ?? 0)} />)}</div>
        </div>
        <VillageMap selected={round && round.scope !== 'tour' ? round.scope : null} grown={round?.completed ?? 0} onSelect={begin} />
        <p className="nv-map-tip">Choose a place for five local missions, or explore a mixed tour.</p>
        <button className="nv-secondary nv-tour" type="button" onClick={() => begin('tour')}>Explore the village · mixed tour</button>
        {round && !round.finished && <p className="nv-small">Choosing a place starts a new round. Your garden grows again with each round.</p>}
      </div>
      <div className="nv-card">
        {!round ? <div className="nv-welcome">
          <ScenarioArt location="school" />
          <h2 ref={heading} tabIndex={-1}>Small choices grow a loving heart.</h2>
          <p>Help neighbors at church, home, school, and the playground. Choose one of three answers, then learn why it matters.</p>
          <ul><li>Five missions, at your own pace.</li><li>Try again when you need to. No timer, penalty, or leaderboard.</li><li>200 situations — 50 at each place.</li></ul>
          <button className="nv-primary" type="button" onClick={() => begin('tour')}>Start village tour <span aria-hidden="true">→</span></button>
        </div> : round.finished ? <div className="nv-finish">
          <div className="nv-success-flower"><Flower filled /></div>
          <h2 ref={heading} tabIndex={-1}>Your garden is blooming!</h2><p>You completed <strong>5 of 5</strong> missions in {LABELS[round.scope].toLowerCase()}.</p>
          <h3>What we practiced</h3>
          <ol className="nv-review">{round.missions.map(m => <li key={m.id}><strong>{m.commandment}. {COMMANDMENTS[m.commandment - 1].title}</strong><p>{m.feedback}</p></li>)}</ol>
          <button className="nv-primary" type="button" onClick={() => begin(round.scope)}>Play another round <span aria-hidden="true">→</span></button>
          <button className="nv-secondary" type="button" onClick={() => begin('tour')}>New village tour</button>
        </div> : mission && teaching ? <>
          <ScenarioArt location={mission.location} />
          <div className="nv-scenario-top"><span>{LABELS[mission.location]}</span><small>Mission {round.index + 1} / 5</small></div>
          <h2 ref={heading} tabIndex={-1} className="nv-question" data-mission-id={mission.id}>{mission.prompt}</h2>
          <div className="nv-answers" role="group" aria-label="Choose the best response">
            {mission.choices.map((c, i) => <button key={`${mission.id}-${c.id}`} type="button" className={`nv-answer ${round.solved && c.id === mission.correctId ? 'nv-answer-correct' : ''} ${wrong === c.id ? 'nv-answer-retry' : ''}`} disabled={round.solved} onClick={() => answer(c.id)}><span className="nv-answer-letter" aria-hidden="true">{round.solved && c.id === mission.correctId ? '✓' : String.fromCharCode(65 + i)}</span><span>{c.text}</span></button>)}
          </div>
          <div className={`nv-feedback ${round.solved ? 'nv-feedback-good' : ''}`} role="status" aria-live="polite" aria-atomic="true">
            {message || 'Choose the most caring, truthful, and safe response.'}
            {round.solved && <><strong>{mission.commandment}. {teaching.title}</strong><p>{teaching.explanation}</p></>}
          </div>
          <div className="nv-actions"><span>Try at your own pace</span>{round.solved && <button type="button" className="nv-primary" onClick={next}>{round.index === 4 ? 'See your garden' : 'Continue'} <span aria-hidden="true">→</span></button>}</div>
          <button className="nv-new-round" type="button" onClick={() => begin(round.scope)}>New game · {LABELS[round.scope]}</button>
        </> : null}
      </div>
    </div>
    <details className="nv-help"><summary>For families & teachers · commandments, replay, and safety</summary>
      <p>These are child-friendly paraphrases using Catholic numbering. Situations introduce a commandment; they do not label a child good or bad. Children are never responsible for fixing adults’ marriages. Different family situations deserve compassion. Honor for adults never requires accepting harm, wrongdoing, or unsafe secrets.</p>
      <p>For commandments 6 and 9, use adult guidance: the sixth concerns faithful marriage; the ninth concerns desires of the heart, especially not coveting another person’s spouse. They are not labels for ordinary toy envy (the tenth). A passing unwanted thought is not a chosen desire. No explicit adult detail is included.</p>
      <p>Questions are reserved when a round begins, including unfinished rounds. Within the chosen place or tour, unused questions come first before recycling. Among unused questions, we favor less-seen commandments and different commandments in a round. A fresh mixed tour covers all ten in its first two rounds; near exhaustion or when switching places, available unused content takes priority. Answer order is shuffled.</p>
      <p>Only question IDs and commandment offering counts are saved on this browser. No child names, free text, scores, or answers are stored or sent. If storage is blocked, replay memory lasts only while this page stays open.</p>
      {storageWarning && <p role="status">Browser storage is unavailable. Recent-question memory is temporary for this page.</p>}
      <ol className="nv-teaching-list">{COMMANDMENTS.map((c, i) => <li key={c.title}><strong>{i + 1}. {c.title}</strong><p>{c.explanation} <small>({c.reference})</small></p></li>)}</ol>
      <p>Teaching sources (for adults): {SOURCES.map(s => <a key={s.href} href={s.href} target="_blank" rel="noreferrer">{s.label} ↗</a>)}</p>
    </details>
  </section>;
}
