import { useEffect, useState } from 'react';
import { Ear, Footprints, Hand, Heart, MessageCircle, Pause, Sparkles, Volume2, Waves } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FluencyGameId } from './fluencyContent';
import { fluencyDemoCues } from './fluencyContent';

const demoIcons: Record<FluencyGameId, readonly LucideIcon[]> = {
  beat: [Hand, Hand, Heart], islands: [Waves, Pause, Footprints], turns: [Ear, Pause, MessageCircle],
  train: [Ear, Pause, MessageCircle], echo: [Volume2, MessageCircle, Sparkles], chat: [Ear, MessageCircle, Heart],
  wordpath: [Footprints, Footprints, Heart], story: [Sparkles, MessageCircle, Heart], listen: [Ear, Pause, MessageCircle],
  bridge: [MessageCircle, Pause, MessageCircle], round: [Heart, Ear, MessageCircle],
};

const trainLabels = ['Escuchar', 'Esperar', 'Responder'];

export function FluencyGameDemo({ gameId }: { gameId: FluencyGameId }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    setPhase(0);
    const timer = window.setInterval(() => setPhase(value => (value + 1) % 3), 1900);
    return () => window.clearInterval(timer);
  }, [gameId]);

  if (gameId === 'train') return <div className="fluency-demo fluency-demo-train" data-phase={phase} aria-label="Demostración del tren de la conversación">
    <div className="fluency-demo-engine" aria-hidden="true">🚂</div>
    <ol>{trainLabels.map((label, index) => <li key={label}><span>{index + 1}</span><strong>{label}</strong></li>)}</ol>
    <p>{fluencyDemoCues[gameId][phase]}</p>
  </div>;

  const Icon = demoIcons[gameId][phase];
  return <div className={`fluency-demo fluency-demo-${gameId}`} data-phase={phase} aria-label={`Demostración: ${fluencyDemoCues[gameId][phase]}`}>
    <div className="fluency-demo-orbit" aria-hidden="true">
      {demoIcons[gameId].map((StepIcon, index) => <span className={index === phase ? 'is-active' : ''} key={index}><StepIcon size={25}/></span>)}
      <i className="fluency-demo-cursor"><Icon size={24}/></i>
    </div>
    <p>{fluencyDemoCues[gameId][phase]}</p>
    {gameId === 'beat' && <div className="fluency-demo-syllables" aria-hidden="true"><span>ma</span><span>ri</span><span>po</span><span>sa</span></div>}
    {gameId === 'bridge' && <div className="fluency-demo-bridge" aria-hidden="true"><span>Una idea</span><i>🌉</i><span>otra idea</span></div>}
    {gameId === 'wordpath' && <div className="fluency-demo-path" aria-hidden="true"><i>●</i><i>●</i><i>●</i><i>●</i></div>}
    {gameId === 'chat' && <div className="fluency-demo-chat" aria-hidden="true"><span>💬</span><span>💬</span></div>}
    {gameId === 'story' && <div className="fluency-demo-story" aria-hidden="true"><span>🌞</span><span>🌼</span><span>🦋</span></div>}
  </div>;
}
