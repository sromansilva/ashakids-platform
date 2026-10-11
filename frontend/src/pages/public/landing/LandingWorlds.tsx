import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { learningGames } from '@/services/learningGames';
import type { WorldArea } from '@/types/clinical';
import { RemoteFeedback } from '@/components/common/RemoteFeedback';
import { WorldCards } from './WorldCards';
import { PublicDialog } from './PublicDialog';
import '../Public/public-mundo.css';

export function LandingWorlds() {
  const catalog = useQuery({ queryKey: ['public-basic-worlds'], queryFn: ({ signal }) => learningGames.catalog(signal) });
  const { role, isLoading, sessionError, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<WorldArea | null>(null);
  const restricted = Boolean(role && role !== 'PADRE');
  useEffect(() => {
    if (selected && role === 'PADRE' && !isLoading && !sessionError) navigate(`/mundo-asha?world=${selected}`);
  }, [selected, role, isLoading, sessionError, navigate]);
  function explore(world: WorldArea) {
    if (role === 'PADRE' && !sessionError) navigate(`/mundo-asha?world=${world}`);
    else setSelected(world);
  }
  return <section id="landing-worlds" className="landing-section landing-worlds"><div className="landing-container">
    <div className="landing-section-heading"><h2>Descubre <span>Mundo ASHA</span></h2><p>Cinco mundos para explorar, practicar y acompañar el desarrollo del lenguaje a través del juego.</p></div>
    <ul className="landing-world-indicators"><li>5 mundos de práctica</li><li>3 niveles por mundo</li><li>Actividades seleccionadas por el terapeuta</li></ul>
    <p className="landing-world-note">El profesional selecciona los mundos de cada niño; los juegos definitivos se desarrollarán después. Las actividades básicas son simulaciones y no miden progreso clínico.</p>
    <RemoteFeedback pending={catalog.isPending} error={catalog.error} retry={() => void catalog.refetch()}/>
    <WorldCards items={catalog.data ?? []} onExplore={explore} disabled={isLoading}/>
    {selected && <PublicDialog title={sessionError ? 'Verifiquemos tu sesión' : restricted ? 'Este espacio es para familias' : '¡Una aventura te espera!'} onClose={() => setSelected(null)}>
      <p>{sessionError || (restricted ? 'Las actividades se habilitan desde la cuenta familiar según el plan de cada niño. Puedes seguir conociendo los mundos aquí.' : 'Inicia sesión para acceder a las actividades de Mundo ASHA y continuar aprendiendo. Las cuentas se solicitan a la administración de ASHAKids.')}</p>
      <div className="landing-dialog-actions">
        {sessionError ? <button className="asha-btn" onClick={() => void refreshUser()}>Verificar sesión</button> : !restricted && <>
          <button className="asha-btn" onClick={() => navigate('/login', { state: { from: { pathname: '/mundo-asha', search: `?world=${selected}` } } })}>Iniciar sesión</button>
        </>}
        <button className="landing-context-link" onClick={() => setSelected(null)}>Ahora no</button>
      </div>
    </PublicDialog>}
  </div></section>;
}
