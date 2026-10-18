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
] as const;
export type WordId = typeof wordItems[number][0];
export const words = Object.fromEntries(wordItems.map(([id,name,syllables,category]) => [id, {
  id, name, syllables: syllables.split('-'), category, image: `/words/island/${id}.webp`,
}])) as Record<WordId, { id: WordId; name: string; syllables: string[]; category: string; image: string }>;
export const wordGames = [
  { id:'treasure', title:'El tesoro de palabras', detail:'Escucha una palabra y encuentra su imagen.', skill:'Vocabulario', art:'bag', color:'#FCE1A4', action:'Buscar' },
  { id:'memory', title:'Parejas escondidas', detail:'Da la vuelta y descubre quién se repite.', skill:'Memoria visual', art:'cat', color:'#DFD0FB', action:'Descubrir' },
  { id:'sort', title:'Cestas de colores', detail:'Cada imagen tiene una cesta especial.', skill:'Categorías', art:'apple', color:'#FFCFC3', action:'Clasificar' },
  { id:'story', title:'Una pequeña historia', detail:'¿Qué pasa primero? Ordena la aventura.', skill:'Secuencias', art:'flower', color:'#C6EDDB', action:'Ordenar' },
  { id:'opposites', title:'Amigos al revés', detail:'Une las imágenes que dicen lo contrario.', skill:'Opuestos', art:'sun', color:'#FFE8AB', action:'Conectar' },
  { id:'syllables', title:'El taller de sílabas', detail:'Junta las piezas y construye una palabra.', skill:'Sílabas', art:'butterfly', color:'#E6D1F7', action:'Construir' },
  { id:'count', title:'La merienda de la isla', detail:'Lleva la cantidad justa a tu cesta.', skill:'Cantidades', art:'banana', color:'#D1EDD1', action:'Contar' },
  { id:'positions', title:'¿Dónde está mi amigo?', detail:'Mueve a tu amigo hasta su escondite.', skill:'Posiciones', art:'rabbit', color:'#C7E9F5', action:'Colocar' },
  { id:'rhymes', title:'Palabras que riman', detail:'Encuentra palabras que terminan parecido.', skill:'Rimas', art:'shoe', color:'#F7CCE1', action:'Escuchar' },
  { id:'sentence', title:'El tren de las frases', detail:'Cada vagón lleva un pedacito de la frase.', skill:'Expresión', art:'car', color:'#CFDDFB', action:'Crear' },
] as const;
export type WordGameId = typeof wordGames[number]['id'];
export function shuffle<T>(values: readonly T[]): T[] {
  const result=[...values];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export const vocabulary: { target:WordId; options:WordId[] }[] = [
  {target:'cat',options:['dog','cat','rabbit']}, {target:'boat',options:['car','boat','house']},
  {target:'flower',options:['tree','butterfly','flower']},
];
export const rhymes: {target:WordId; answer:WordId; options:WordId[]}[] = [
  {target:'cat',answer:'shoe',options:['shoe','apple','book']},
  {target:'apple',answer:'banana',options:['banana','dog','cup']},
  {target:'shoe',answer:'cat',options:['cat','flower','car']},
];
export const sentenceRounds = [
  {art:'cat' as WordId, words:['El gato','duerme','en casa'], phrase:'El gato duerme en casa.'},
  {art:'bird' as WordId, words:['El pájaro','vuela','muy alto'], phrase:'El pájaro vuela muy alto.'},
  {art:'rabbit' as WordId, words:['El conejo','come','una zanahoria'], phrase:'El conejo come una zanahoria.'},
];
