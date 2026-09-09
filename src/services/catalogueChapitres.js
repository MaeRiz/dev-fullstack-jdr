// Données de démonstration à remplacer par les données communes du groupe.
export const campagnes = [
  { id: 'demo-foret', nom: 'La forêt oubliée' },
  { id: 'demo-citadelle', nom: 'Les secrets de la citadelle' },
];
export const objets = [
  { id: 'cle', nom: 'Clé' },
  { id: 'potion', nom: 'Potion de soin' },
  { id: 'corde', nom: 'Corde' },
  { id: 'torche', nom: 'Torche' },
  { id: 'epee', nom: 'Épée' },
];
export const indices = [
  { id: 'demo-carte', nom: 'Carte du passage secret' },
  { id: 'demo-message', nom: 'Message du gardien' },
];
export const modelesQuetes = [
  { id: 'demo-explorer', nom: 'Explorer les ruines' },
  { id: 'demo-gardien', nom: 'Rencontrer le gardien' },
  { id: 'demo-coffre', nom: 'Retrouver le coffre' },
];
export function libelle(catalogue, id) {
  return catalogue.find(element => element.id === id)?.nom ?? `Référence indisponible (${id})`;
}
