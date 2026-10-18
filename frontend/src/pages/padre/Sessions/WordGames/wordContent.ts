export const wordItems = [
  ['cat','Gato','ga-to','animal'], ['dog','Perro','pe-rro','animal'],
  ['apple','Manzana','man-za-na','fruta'], ['banana','Banana','ba-na-na','fruta'],
  ['ball','Pelota','pe-lo-ta','juguete'], ['car','Carro','ca-rro','transporte'],
  ['boat','Barco','bar-co','transporte'], ['tree','Árbol','ár-bol','naturaleza'],
  ['house','Casa','ca-sa','lugar'], ['sun','Sol','sol','naturaleza'],
  ['moon','Luna','lu-na','naturaleza'], ['flower','Flor','flor','naturaleza'],
  ['shoe','Zapato','za-pa-to','ropa'], ['book','Libro','li-bro','escuela'],
  ['fish','Pez','pez','animal'], ['bird','Pájaro','pá-ja-ro','animal'],
  ['rabbit','Conejo','co-ne-jo','animal'], ['carrot','Zanahoria','za-na-ho-ria','verdura'],
  ['star','Estrella','es-tre-lla','naturaleza'], ['butterfly','Mariposa','ma-ri-po-sa','animal'],
  ['bag','Mochila','mo-chi-la','escuela'], ['cup','Taza','ta-za','objeto'],
  ['tomato','Tomate','to-ma-te','verdura'], ['grapes','Uvas','u-vas','fruta'],
  ['snail','Caracol','ca-ra-col','animal'], ['drum','Tambor','tam-bor','juguete'],
] as const;
export type WordId = typeof wordItems[number][0];
export const words = Object.fromEntries(wordItems.map(([id,name,syllables,category]) => [id, {
  id, name, syllables: syllables.split('-'), category, image: `/words/island/${id}.webp`,
}])) as Record<WordId, { id: WordId; name: string; syllables: string[]; category: string; image: string }>;
export type WordPlayMode = 'gentle' | 'challenge';
export const wordGames = [
  { id:'treasure', title:'El tesoro de palabras', detail:'Encuentra tres tesoros con pistas.', skill:'Vocabulario', art:'bag', color:'#FCE1A4', action:'Buscar', goal:'Encuentra tres tesoros para tu cofre.', steps:['Escucha la pista.','Toca la imagen que buscas.','Guarda tu tesoro y sigue.'], learned:'Encontraste palabras a partir de sus pistas.' },
  { id:'memory', title:'Parejas escondidas', detail:'Mira, recuerda y encuentra las parejas.', skill:'Memoria visual', art:'cat', color:'#DFD0FB', action:'Descubrir', goal:'Ayuda a cada dibujo a encontrar su pareja.', steps:['Mira los dibujos antes de empezar.','Da la vuelta a dos cartas.','Busca los dibujos iguales.'], learned:'Recordaste dónde estaban los dibujos.' },
  { id:'sort', title:'Cestas de colores', detail:'Ayuda a ordenar la isla.', skill:'Categorías', art:'apple', color:'#FFCFC3', action:'Clasificar', goal:'Lleva cada dibujo a su familia.', steps:['Mira un dibujo.','Busca una cesta con dibujos parecidos.','Toca la cesta o arrastra el dibujo.'], learned:'Agrupaste dibujos por lo que tienen en común.' },
  { id:'story', title:'Una pequeña historia', detail:'Crea una historia con tres imágenes.', skill:'Secuencias', art:'flower', color:'#C6EDDB', action:'Ordenar', goal:'Descubre qué pasa primero, después y al final.', steps:['Mira las tres imágenes.','Tócalas en el orden de la historia.','Escucha la historia que has creado.'], learned:'Ordenaste los pasos de una pequeña historia.' },
  { id:'opposites', title:'Amigos al revés', detail:'Descubre qué es lo contrario.', skill:'Opuestos', art:'sun', color:'#FFE8AB', action:'Conectar', goal:'Encuentra tres parejas de contrarios.', steps:['Mira el dibujo de arriba.','Busca lo contrario entre los dibujos.','Escucha cómo se llaman.'], learned:'Descubriste palabras que significan lo contrario.' },
  { id:'syllables', title:'El taller de sílabas', detail:'Juega con los trocitos de las palabras.', skill:'Palabras y palmadas', art:'butterfly', color:'#E6D1F7', action:'Dar palmadas', goal:'Escucha las palabras y juega con sus trocitos.', steps:['Escucha una palabra por partes.','Da una palmada por cada trocito.','Comprueba tus palmadas.'], learned:'Jugaste con los trocitos que forman las palabras.' },
  { id:'count', title:'La merienda de la isla', detail:'Una fruta para cada amigo.', skill:'Cantidades', art:'banana', color:'#D1EDD1', action:'Preparar', goal:'Prepara la merienda sin que falte ni sobre fruta.', steps:['Mira cuántos amigos vienen.','Pon una fruta para cada amigo.','Comprueba si todos tienen merienda.'], learned:'Contaste y preparaste una fruta para cada amigo.' },
  { id:'positions', title:'¿Dónde está mi amigo?', detail:'Juega dentro, fuera, arriba y abajo.', skill:'Posiciones', art:'rabbit', color:'#C7E9F5', action:'Colocar', goal:'Ayuda a tu amigo a encontrar su lugar.', steps:['Escucha dónde quiere estar.','Toca un lugar o arrastra a tu amigo.','Mira dónde ha quedado.'], learned:'Practicaste dónde están las cosas.' },
  { id:'rhymes', title:'Palabras que riman', detail:'Escucha palabras que terminan parecido.', skill:'Rimas', art:'shoe', color:'#F7CCE1', action:'Escuchar', goal:'Encuentra tres parejas que suenan parecido al final.', steps:['Escucha la primera palabra.','Escucha los dibujos de abajo.','Elige la que termina parecido.'], learned:'Escuchaste cómo terminan las palabras.' },
  { id:'sentence', title:'El tren de las frases', detail:'Dibujos que cuentan lo que pasa.', skill:'Frases con imágenes', art:'car', color:'#CFDDFB', action:'Crear', goal:'Construye tres frases en el tren.', steps:['Escucha lo que pasa.','Elige quién, qué hace y dónde o qué.','Escucha tu frase completa.'], learned:'Juntaste ideas para contar lo que pasa.' },
] as const;
export const gameIllustration = (id: string) => `/words/games/${id}-v104.webp`;
export type WordGameId = typeof wordGames[number]['id'];
export function shuffle<T>(values: readonly T[]): T[] {
  const result=[...values];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export interface VocabularyRound { target:WordId; options:WordId[]; clue:string; hint:string }
export const vocabulary: VocabularyRound[] = [
 {target:'cat',options:['dog','cat','rabbit'],clue:'Busca al gato. ¡Dice miau!',hint:'Tiene bigotes y dice miau.'},
 {target:'boat',options:['car','boat','house'],clue:'Busca lo que viaja por el agua.',hint:'Un barco flota en el agua.'},
 {target:'flower',options:['tree','butterfly','flower'],clue:'Busca la flor del jardín.',hint:'Tiene pétalos y un tallo verde.'},
 {target:'shoe',options:['shoe','book','cup'],clue:'¿Qué te pones en el pie?',hint:'El zapato cuida tu pie cuando caminas.'},
 {target:'book',options:['ball','book','apple'],clue:'¿Dónde encontramos cuentos?',hint:'Abrimos sus páginas para ver historias.'},
 {target:'carrot',options:['banana','carrot','grapes'],clue:'Busca lo que le gusta comer al conejo.',hint:'Es una verdura naranja y alargada.'},
 {target:'sun',options:['moon','sun','star'],clue:'Busca lo que nos ilumina de día.',hint:'El sol se ve en el cielo durante el día.'},
 {target:'ball',options:['car','ball','cup'],clue:'Busca lo que rueda y rebota.',hint:'La pelota es redonda y puedes jugar con ella.'},
];
export const rhymes: {target:WordId; answer:WordId; options:WordId[]; ending:string}[] = [
 {target:'cat',answer:'shoe',options:['shoe','apple','book'],ending:'ato'},
 {target:'sun',answer:'snail',options:['snail','dog','cup'],ending:'ol'},
 {target:'flower',answer:'drum',options:['drum','car','banana'],ending:'or'},
 {target:'apple',answer:'banana',options:['banana','dog','cup'],ending:'ana'},
];
export const sentenceRounds = [
 {art:'cat' as WordId,words:['El gato','duerme','en casa'],phrase:'El gato duerme en casa.',pictures:['cat','moon','house'] as WordId[]},
 {art:'bird' as WordId,words:['El pájaro','vuela','por el cielo'],phrase:'El pájaro vuela por el cielo.',pictures:['bird','butterfly','sun'] as WordId[]},
 {art:'rabbit' as WordId,words:['El conejo','come','zanahoria'],phrase:'El conejo come zanahoria.',pictures:['rabbit','apple','carrot'] as WordId[]},
 {art:'dog' as WordId,words:['El perro','juega','con la pelota'],phrase:'El perro juega con la pelota.',pictures:['dog','ball','ball'] as WordId[]},
];
export function pickRounds<T>(values: readonly T[], count=3):T[] { return shuffle(values).slice(0,count); }
export function choiceWords(target:WordId, options:readonly WordId[], mode:WordPlayMode):WordId[] {
 return shuffle([target,...shuffle(options.filter(id=>id!==target)).slice(0,mode==='gentle'?1:2)]);
}
