// Remplacer cette liste par les données communes lorsque les campagnes seront prêtes.
export const campagnesProvisoires = [
  { id: 'demo-foret', nom: 'La forêt oubliée' },
  { id: 'demo-citadelle', nom: 'Les secrets de la citadelle' },
];

export function nomCampagne(campagneId) {
  if (campagneId === null) return 'Sans campagne';
  return campagnesProvisoires.find(campagne => campagne.id === campagneId)?.nom
    ?? `Campagne indisponible (${campagneId})`;
}
