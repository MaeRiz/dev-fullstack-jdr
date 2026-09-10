export function nomObjet(objetId, catalogue = []) {
  const objet = catalogue.find(objet => objet.id === objetId && objet.type === 'objet');
  if (objet) return `${objet.nom}${objet.archive ? ' (retiré de la bibliothèque)' : ''}`;
  return `Objet indisponible (${objetId})`;
}

export function estInventaireValide(inventaire) {
  return Array.isArray(inventaire)
    && inventaire.every(entree => entree && typeof entree.objetId === 'string'
      && entree.objetId.trim().length > 0
      && Number.isSafeInteger(entree.quantite) && entree.quantite > 0)
    && new Set(inventaire.map(entree => entree.objetId)).size === inventaire.length;
}

export function modifierInventaire(joueur, objetId, quantite, action, catalogue = []) {
  if (!estInventaireValide(joueur.inventaire)) throw new Error('Inventaire invalide.');
  if (!Number.isSafeInteger(quantite) || quantite <= 0) {
    throw new Error('Saisis une quantité entière supérieure à zéro.');
  }
  if (!['donner', 'retirer'].includes(action)) throw new Error('Action inconnue.');
  const entree = joueur.inventaire.find(objet => objet.objetId === objetId);
  if (action === 'donner' && !catalogue.some(objet => objet.id === objetId && objet.type === 'objet' && !objet.archive)) {
    throw new Error('Sélectionne un objet du catalogue.');
  }
  if (action === 'retirer' && (!entree || quantite > entree.quantite)) {
    throw new Error('Le joueur ne possède pas cette quantité.');
  }
  const total = (entree?.quantite ?? 0) + (action === 'donner' ? quantite : -quantite);
  if (!Number.isSafeInteger(total)) throw new Error('La quantité totale est trop élevée.');
  const inventaire = joueur.inventaire.map(objet => ({ ...objet }));
  const index = inventaire.findIndex(objet => objet.objetId === objetId);
  if (index === -1) inventaire.push({ objetId, quantite: total });
  else if (total === 0) inventaire.splice(index, 1);
  else inventaire[index].quantite = total;
  return { ...joueur, inventaire };
}
