export const CONTENUS_STORAGE_KEY = 'jdr-contenus';

export function chargerContenus(stockage = window.localStorage) {
  const texte = stockage.getItem(CONTENUS_STORAGE_KEY);
  if (texte === null) return [];
  const contenus = JSON.parse(texte);
  if (!Array.isArray(contenus) || !contenus.every(contenu => contenu
    && typeof contenu.id === 'string' && contenu.id.length > 0
    && ['lieu', 'objet', 'indice'].includes(contenu.type)
    && typeof contenu.nom === 'string' && typeof contenu.commentaire === 'string'
    && (contenu.archive === undefined || typeof contenu.archive === 'boolean')
    && typeof contenu[contenu.type === 'indice' ? 'texte' : 'description'] === 'string')
    || new Set(contenus.map(contenu => contenu.id)).size !== contenus.length) {
    throw new Error('Bibliothèque invalide.');
  }
  return contenus;
}

export function sauvegarderContenus(contenus, stockage = window.localStorage) {
  stockage.setItem(CONTENUS_STORAGE_KEY, JSON.stringify(contenus));
}

export function contenusDisponibles(contenus, type) {
  return contenus.filter(contenu => contenu.type === type && !contenu.archive);
}

export function choixContenus(contenus, type, references = []) {
  const liste = contenusDisponibles(contenus, type);
  for (const id of new Set(references)) {
    if (!liste.some(contenu => contenu.id === id)) {
      const contenu = contenus.find(element => element.id === id && element.type === type);
      liste.push({ id, type, nom: contenu ? `${contenu.nom} (retiré de la bibliothèque)` : `Référence indisponible (${id})`, archive: true });
    }
  }
  return liste;
}

// Conserver la définition pour les inventaires et chapitres qui la référencent.
export function archiverContenu(contenus, id) {
  return contenus.map(contenu => contenu.id === id ? { ...contenu, archive: true } : contenu);
}
