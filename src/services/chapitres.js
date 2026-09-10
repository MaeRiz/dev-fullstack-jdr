export const CHAPITRES_STORAGE_KEY = 'jdr.chapitres.v1';
export const etatsChapitres = ['inactif', 'actif', 'termine'];
const copier = valeur => JSON.parse(JSON.stringify(valeur));
const identifiant = valeur => typeof valeur === 'string' && valeur.trim().length > 0;
const references = liste => Array.isArray(liste) && liste.every(identifiant)
  && new Set(liste).size === liste.length;

export function formulaireVide(campagneId = null) {
  return {
    campagneId, nom: '', etat: 'inactif', description: '', commentaireMj: '',
    motDePasseActivation: '', motDePasseResolution: '', objetsRequis: [],
    recompensesObjets: [], recompensesIndices: [], quetes: [],
  };
}

function valider(chapitre) {
  if (!identifiant(chapitre.nom)) throw new Error('Le nom du chapitre est obligatoire.');
  if (!etatsChapitres.includes(chapitre.etat)) throw new Error('État du chapitre invalide.');
  if (chapitre.campagneId !== null && !identifiant(chapitre.campagneId)) throw new Error('Campagne invalide.');
  for (const champ of ['description', 'commentaireMj', 'motDePasseActivation', 'motDePasseResolution']) {
    if (typeof chapitre[champ] !== 'string') throw new Error('Fiche chapitre invalide.');
  }
  if (!references(chapitre.objetsRequis) || !references(chapitre.recompensesIndices)) throw new Error('Références invalides.');
  if (!Array.isArray(chapitre.recompensesObjets)
    || !chapitre.recompensesObjets.every(objet => objet && identifiant(objet.objetId) && Number.isSafeInteger(objet.quantite) && objet.quantite > 0)
    || !references(chapitre.recompensesObjets.map(objet => objet.objetId))) throw new Error('Quantités des récompenses invalides.');
  if (!Array.isArray(chapitre.quetes)
    || !chapitre.quetes.every(quete => quete && identifiant(quete.id) && identifiant(quete.modeleId) && identifiant(quete.nom))
    || !references(chapitre.quetes.map(quete => quete.id))) throw new Error('Quêtes invalides.');
}

export function creerChapitre(champs) {
  valider(champs);
  return { ...copier(champs), nom: champs.nom.trim(), id: crypto.randomUUID(), recompensesDistribuees: false };
}

export function modifierChapitre(chapitre, champs) {
  valider(champs);
  return { ...copier(champs), nom: champs.nom.trim(), id: chapitre.id, recompensesDistribuees: chapitre.recompensesDistribuees };
}

export function dupliquerChapitre(chapitre) {
  const copie = creerChapitre({ ...chapitre, nom: `${chapitre.nom} (copie)` });
  copie.quetes = copie.quetes.map(quete => ({ ...quete, id: crypto.randomUUID() }));
  return copie;
}

export function deplacerQuete(quetes, id, direction) {
  const index = quetes.findIndex(quete => quete.id === id);
  const cible = index + direction;
  if (![-1, 1].includes(direction) || index < 0 || cible < 0 || cible >= quetes.length) return copier(quetes);
  const resultat = copier(quetes);
  [resultat[index], resultat[cible]] = [resultat[cible], resultat[index]];
  return resultat;
}

export function chargerChapitres(stockage = window.localStorage) {
  const contenu = stockage.getItem(CHAPITRES_STORAGE_KEY);
  if (contenu === null) return [];
  const chapitres = JSON.parse(contenu);
  if (!Array.isArray(chapitres)) throw new Error('Sauvegarde invalide.');
  for (const chapitre of chapitres) {
    if (!chapitre || !identifiant(chapitre.id) || typeof chapitre.recompensesDistribuees !== 'boolean') throw new Error('Sauvegarde invalide.');
    valider(chapitre);
  }
  if (!references(chapitres.map(chapitre => chapitre.id))) throw new Error('Identifiants dupliqués.');
  return chapitres;
}

export function sauvegarderChapitres(chapitres, stockage = window.localStorage) {
  stockage.setItem(CHAPITRES_STORAGE_KEY, JSON.stringify(chapitres));
}

function verifierCampagne(chapitre, joueur) {
  if (!chapitre.campagneId || chapitre.campagneId !== joueur.campagneId) {
    throw new Error('Le joueur doit appartenir à la campagne du chapitre.');
  }
}

export function activerChapitre(chapitre, joueur, motDePasse) {
  verifierCampagne(chapitre, joueur);
  if (chapitre.etat !== 'inactif') throw new Error('Seul un chapitre inactif peut être activé.');
  if (!chapitre.motDePasseActivation || chapitre.motDePasseActivation !== motDePasse) throw new Error('Mot de passe d’activation incorrect ou non configuré.');
  if (!chapitre.objetsRequis.every(id => joueur.inventaire.some(objet => objet.objetId === id && objet.quantite > 0))) {
    throw new Error('Le joueur ne possède pas tous les objets nécessaires.');
  }
  return { ...copier(chapitre), etat: 'actif' };
}

// Résultat à enregistrer ensemble par la future page de jeu : chapitre, joueur
// bénéficiaire et liste des indices partagés de SA campagne. Aucune écriture ici.
export function terminerChapitre(chapitre, joueur, motDePasse, indicesCampagne = []) {
  verifierCampagne(chapitre, joueur);
  if (chapitre.etat !== 'actif') throw new Error('Seul un chapitre actif peut être terminé.');
  if (!chapitre.motDePasseResolution || chapitre.motDePasseResolution !== motDePasse) throw new Error('Mot de passe de résolution incorrect ou non configuré.');
  const beneficiaire = copier(joueur);
  let indicesPartages = [...indicesCampagne];
  if (!chapitre.recompensesDistribuees) {
    for (const recompense of chapitre.recompensesObjets) {
      const objet = beneficiaire.inventaire.find(element => element.objetId === recompense.objetId);
      const quantite = (objet?.quantite ?? 0) + recompense.quantite;
      if (!Number.isSafeInteger(quantite) || quantite <= 0) throw new Error('Quantité de récompense invalide.');
      if (objet) objet.quantite = quantite;
      else beneficiaire.inventaire.push({ ...recompense });
    }
    indicesPartages = [...new Set([...indicesPartages, ...chapitre.recompensesIndices])];
  }
  return {
    chapitre: { ...copier(chapitre), etat: 'termine', recompensesDistribuees: true },
    joueur: beneficiaire,
    indicesCampagne: indicesPartages,
  };
}
