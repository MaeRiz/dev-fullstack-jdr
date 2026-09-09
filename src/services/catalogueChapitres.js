// Données de démonstration à remplacer par les données communes du groupe.
export { campagnesProvisoires as campagnes } from './campagnes.js';
export const modelesQuetes = [
  { id: 'demo-explorer', nom: 'Explorer les ruines' },
  { id: 'demo-gardien', nom: 'Rencontrer le gardien' },
  { id: 'demo-coffre', nom: 'Retrouver le coffre' },
];
export function libelle(catalogue, id) {
  return catalogue.find(element => element.id === id)?.nom ?? `Référence indisponible (${id})`;
}
