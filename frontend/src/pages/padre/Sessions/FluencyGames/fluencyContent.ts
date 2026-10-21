export const fluencyGames = [
  { id: 'beat', title: 'Tambor de sílabas', detail: 'Escucha y repite los trocitos, si quieres.', action: 'Escuchar y marcar el ritmo', art: 'drum', color: '#F7C66A', goal: 'Escucha los trocitos de mariposa y marca cada uno en el tambor.', steps: ['Toca un tambor para escuchar su trocito.', 'Repítelo en voz alta si quieres.', 'Avanza cuando estés listo.'] },
  { id: 'islands', title: 'Islas para hacer una pausa', detail: 'Un pequeño espacio entre ideas.', action: 'Encontrar pausas', art: 'boat', color: '#9EDBE0', goal: 'Descubre dónde una idea termina y otra puede comenzar.', steps: ['Mira la frase y sus dos ideas.', 'Pon una isla entre las ideas.', 'Cruza cuando estés listo.'] },
  { id: 'turns', title: 'Pasa el turno', detail: 'Escuchamos y compartimos.', action: 'Compartir turnos', art: 'rabbit', color: '#D4B6EF', goal: 'Acompaña una conversación escuchando y esperando tu turno.', steps: ['Escucha lo que cuenta tu amigo.', 'Espera a que termine.', 'Después puedes compartir tu idea.'] },
  { id: 'train', title: 'Tren de la conversación', detail: 'Cada momento tiene su vagón.', action: 'Armar el tren', art: 'car', color: '#B8D5F6', goal: 'Arma el tren: escuchar, esperar y responder.', steps: ['Busca el vagón para escuchar.', 'Después va el vagón de esperar.', 'Por último, llega tu respuesta.'] },
  { id: 'echo', title: 'Eco de palabras', detail: 'Una frase salta de burbuja en burbuja.', action: 'Seguir el eco', art: 'bird', color: '#F5B4C8', goal: 'Acompaña una frase corta siguiendo sus burbujas.', steps: ['Escucha la frase completa.', 'Toca cada burbuja en orden.', 'Repite si quieres, sin apuro.'] },
  { id: 'chat', title: 'Burbujas que conversan', detail: 'Escucha y elige qué decir después.', action: 'Conversar', art: 'cat', color: '#C6E7B8', goal: 'Escucha a tu amigo y elige una respuesta amable.', steps: ['Tu amigo termina de contarte algo.', 'Escucha o mira las respuestas.', 'Elige la que quieras compartir.'] },
  { id: 'wordpath', title: 'Camino de palabras', detail: 'Un paso lleva a otro, a tu manera.', action: 'Recorrer', art: 'snail', color: '#F2D58E', goal: 'Recorre un camino de palabras sin correr.', steps: ['Mira las piedras del camino.', 'Avanza una palabra cada vez.', 'Haz una pausa cuando te apetezca.'] },
  { id: 'story', title: 'Cuento compartido', detail: 'Cada amigo aporta una idea.', action: 'Crear un cuento', art: 'butterfly', color: '#AEDBBE', goal: 'Crea una pequeña historia junto a tus amigos.', steps: ['Mira quién inicia el cuento.', 'Elige qué puede pasar después.', 'Añade tu idea para terminar.'] },
  { id: 'listen', title: 'Orejas que esperan', detail: 'Escucha hasta que llegue tu turno.', action: 'Escuchar', art: 'dog', color: '#D3C4F0', goal: 'Descubre qué puedes hacer mientras un amigo habla.', steps: ['Mira a quien está contando algo.', 'Escucha hasta que termine.', 'Luego elige cómo responder.'] },
  { id: 'bridge', title: 'Puente entre ideas', detail: 'Conecta dos partes de una frase.', action: 'Unir ideas', art: 'boat', color: '#A9DDE5', goal: 'Construye una frase dejando un espacio entre sus ideas.', steps: ['Mira las dos partes de la frase.', 'Pon el puente en el espacio.', 'Lee o escucha la frase completa.'] },
  { id: 'round', title: 'Ronda de amigos', detail: 'Todos encuentran un momento para compartir.', action: 'Dar la vuelta', art: 'flower', color: '#F3C1A1', goal: 'Acompaña una ronda donde cada amigo tiene su turno.', steps: ['Mira quién empieza la ronda.', 'Pasa el turno al siguiente amigo.', 'Escucha la última idea para cerrar.'] },
] as const;

export type FluencyGameId = typeof fluencyGames[number]['id'];

export const fluencyBeatSyllables = ['ma', 'ri', 'po', 'sa'] as const;
export const fluencyBeatPrompts = fluencyBeatSyllables.map(syllable => `Escucha: ${syllable}. Si quieres, repítela: ${syllable}.`);
export const fluencyBeatWordPrompt = 'Escucha la palabra completa: mariposa. Si quieres, repítela: mariposa.';

export const fluencyDemoCues: Record<FluencyGameId, readonly [string, string, string]> = {
  beat: ['Mira la palabra mariposa.', 'Toca cada tambor y escucha su trocito.', 'Repítelo si quieres; avanza a tu ritmo.'],
  islands: ['Lee la primera idea.', 'Coloca una isla en medio.', 'Sigue con la otra idea.'],
  turns: ['Tu amigo está contando.', 'Primero escuchamos.', 'Después llega nuestro turno.'],
  train: ['Escuchar sube al primer vagón.', 'Esperar va en el siguiente.', 'Responder cierra el tren.'],
  echo: ['Escucha la frase.', 'Sigue las burbujas.', 'El eco vuelve a empezar.'],
  chat: ['Tu amigo termina su idea.', 'Mira las respuestas.', 'Elige qué quieres compartir.'],
  wordpath: ['Empieza el camino.', 'Avanza una piedra.', 'Puedes hacer una pausa.'],
  story: ['Un amigo inicia el cuento.', 'Otro añade una idea.', 'El último lo termina.'],
  listen: ['Mira quién habla.', 'Esperamos a que termine.', 'Después respondemos.'],
  bridge: ['Mira las dos ideas.', 'Pon el puente en medio.', 'La frase queda unida.'],
  round: ['La ronda empieza aquí.', 'El turno pasa al amigo.', 'Todos comparten una idea.'],
};
