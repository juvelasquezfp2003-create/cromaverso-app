const synonymDatabase: Record<string, string[]> = {
  feliz: ['contento', 'alegre', 'dichoso', 'jubiloso', 'radiante'],
  triste: ['melancólico', 'apenado', 'desolado', 'afligido', 'sombrío'],
  hermoso: ['bello', 'precioso', 'magnífico', 'espléndido', 'sublime'],
  grande: ['inmenso', 'vasto', 'colosal', 'descomunal', 'monumental'],
  pequeño: ['diminuto', 'minúsculo', 'reducido', 'exiguo', 'ínfimo'],
  rápido: ['veloz', 'ligero', 'presto', 'raudo', 'acelerado'],
  lento: ['pausado', 'parsimonioso', 'calmoso', 'tardo', 'moroso'],
  amor: ['cariño', 'afecto', 'ternura', 'devoción', 'pasión'],
  caminar: ['deambular', 'pasear', 'transitar', 'andar', 'peregrinar'],
  mirar: ['observar', 'contemplar', 'avistar', 'divisar', 'otear'],
  hablar: ['conversar', 'charlar', 'dialogar', 'platicar', 'departir'],
  casa: ['hogar', 'morada', 'residencia', 'domicilio', 'habitación'],
  luz: ['resplandor', 'fulgor', 'luminosidad', 'claridad', 'brillo'],
  oscuro: ['tenebroso', 'umbrío', 'lóbrego', 'sombrío', 'opaco'],
  tiempo: ['época', 'era', 'periodo', 'momento', 'instante']
};

const metaphorTemplates = [
  'Como {subject} que navega en un mar de sueños',
  'Un susurro de {subject} entre las páginas del destino',
  'El eco de {subject} resonando en catedrales de silencio',
  'Pétalos de {subject} flotando en ríos de tiempo',
  'Un caleidoscopio de {subject} pintando el horizonte',
  'Las alas de {subject} rozando la eternidad',
  'Un ballet de {subject} danzando con las estrellas',
  'El latido de {subject} en el corazón del universo'
];

export function findSynonyms(word: string): string {
  const cleanWord = word.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

  if (synonymDatabase[cleanWord]) {
    return synonymDatabase[cleanWord].join(', ');
  }

  const partialMatch = Object.keys(synonymDatabase).find(key =>
    cleanWord.includes(key) || key.includes(cleanWord)
  );

  if (partialMatch) {
    return `Similares a "${partialMatch}": ${synonymDatabase[partialMatch].join(', ')}`;
  }

  return `No se encontraron sinónimos para "${word}". Intenta con: feliz, triste, hermoso, grande, rápido, amor, caminar, mirar, casa, luz...`;
}

export function suggestMetaphor(context: string): string {
  const words = context.toLowerCase().split(' ').filter(w => w.length > 3);
  const randomWord = words[Math.floor(Math.random() * words.length)] || 'momentos';
  const randomTemplate = metaphorTemplates[Math.floor(Math.random() * metaphorTemplates.length)];

  return randomTemplate.replace('{subject}', randomWord);
}
