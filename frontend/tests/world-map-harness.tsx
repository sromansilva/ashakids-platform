// DEV-only fixture. Default preview never contacts the operational API.
// ?verify=1 is used exclusively by the verifier, which intercepts every API request.
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthContext } from '@/auth/AuthContext';
import AppRouter from '@/app/AppRouter';
import '@/Index.css';

if (import.meta.env.DEV) {
  const verifying = new URLSearchParams(location.search).get('verify') === '1';
  if (!verifying) {
    const nativeFetch = window.fetch.bind(window);
    const ids = ['HABLA','LENGUAJE','FLUIDEZ','VOZ','OROFACIAL'];
    const names = ['Taller de los Sonidos','La Isla de las Palabras','Ritmo de las Palabras','El Estudio de la Voz','Laboratorio de los Gestos'];
    const progress = { id_paciente:901,version:'basica-1',experiencia:0,nivel:1,medallas:[],intentos_totales:0,experiencia_siguiente_nivel:200,
      mundos:ids.map((id,i)=>({id,version:'basica-1',name:names[i],description:'Vista previa de actividades de selección y orden.',asignado:true,completados:[],intentos:0,medalla:false,
        levels:[1,2,3].map(number=>({number,title:['Escucha y elige','Encuentra la palabra','Ordena la historia'][number-1],prompt:'Encuentra el animal que dice miau.',choices:['Gato','Perro','Pato','Conejo'],sequence:false}))})) };
    window.fetch = async (input, options) => {
      const url = new URL(input instanceof Request ? input.url : String(input), location.origin);
      if (!url.pathname.includes('/api/')) return nativeFetch(input, options);
      const method = options?.method || (input instanceof Request ? input.method : 'GET');
      const write = method.toUpperCase() !== 'GET';
      const data = write ? { detail:'Esta vista previa no guarda intentos. Abre Mundo ASHA desde tu sesión familiar para practicar.' } : url.pathname.endsWith('/pacientes') ? [{id_paciente:901,nombres_paciente:'Ana',apellidos_paciente:'Demo',activo:true}] : url.pathname.endsWith('/juegos') ? progress : [];
      return new Response(JSON.stringify(data),{status:write?403:200,headers:{'Content-Type':'application/json','X-Total-Count':'1'}});
    };
  }
  createRoot(document.getElementById('root')!).render(
    <>
    {!verifying && <p style={{padding:'10px 24px',background:'#fff7e8',color:'#704310',fontFamily:'Nunito, sans-serif'}}>Vista previa de diseño · datos de demostración. No se consultan datos reales ni se guardan intentos.</p>}
    <AuthContext.Provider value={{ user: { id_usuario: 900, codigo_usuario: 'fixture', nombres: 'Familia', apellidos: 'Demo', email: 'fixture@example.invalid', rol: 'PADRE', roles: ['PADRE'], activo: true }, role: 'PADRE', isAuthenticated: true, isLoading: false, login: async () => { throw new Error('Sin login real'); }, logout: async () => {}, refreshUser: async () => {} }}>
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter initialEntries={['/mundo-asha']}><AppRouter/></MemoryRouter></QueryClientProvider>
    </AuthContext.Provider></>,
  );
}
