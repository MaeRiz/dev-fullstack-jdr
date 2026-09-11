import { chargerJoueurs } from './joueurs.js';
import { chargerChapitres, activerChapitre, terminerChapitre } from './chapitres.js';
import { chargerContenus } from './contenus.js';

export const clesJeu = {
  campagnes: 'jdr-campagnes', chapitres: 'jdr.chapitres.v1', joueurs: 'jdr.joueurs.v1',
  quetes: 'jdr-quetes', contenus: 'jdr-contenus', partie: 'jdr.partie.v1',
};
export const copier = valeur => JSON.parse(JSON.stringify(valeur));
const estId = valeur => typeof valeur === 'string' && valeur.length > 0;

export function chargerEtatJeu(stockage = globalThis.localStorage) {
  const lire = (cle, defaut) => JSON.parse(stockage.getItem(cle) ?? JSON.stringify(defaut));
  const campagnes = lire(clesJeu.campagnes, []);
  const quetes = lire(clesJeu.quetes, []);
  for (const liste of [campagnes, quetes]) {
    if (!Array.isArray(liste) || !liste.every(element => element && estId(element.id) && typeof element.nom === 'string')
      || new Set(liste.map(element => element.id)).size !== liste.length) throw new Error('Données de campagne ou de quête invalides.');
  }
  if (!campagnes.every(campagne => ['brouillon', 'disponible', 'active'].includes(campagne.etat))) throw new Error('État de campagne invalide.');
  if (!quetes.every(quete => ['inactive', 'active', 'terminee', 'abandonnee'].includes(quete.etat))) throw new Error('État de quête invalide.');
  const partie = lire(clesJeu.partie, { joueurSelectionneId: null, indicesParCampagne: {} });
  if (!partie || (partie.joueurSelectionneId !== null && !estId(partie.joueurSelectionneId))
    || !partie.indicesParCampagne || typeof partie.indicesParCampagne !== 'object' || Array.isArray(partie.indicesParCampagne)
    || !Object.values(partie.indicesParCampagne).every(ids => Array.isArray(ids) && ids.every(estId))) throw new Error('Données de partie invalides.');
  return { campagnes, quetes, partie, joueurs: chargerJoueurs(stockage), chapitres: chargerChapitres(stockage), contenus: chargerContenus(stockage) };
}

// Enregistrer uniquement les listes modifiées. En cas d'échec, restaurer les
// valeurs précédentes pour ne pas terminer une quête sans donner sa récompense.
export function enregistrerEtatJeu(avant, apres, stockage = globalThis.localStorage) {
  const changements = Object.keys(clesJeu).filter(nom => JSON.stringify(avant[nom]) !== JSON.stringify(apres[nom]));
  const valeurs = changements.map(nom => [clesJeu[nom], stockage.getItem(clesJeu[nom])]);
  let ecrites = 0;
  try {
    for (const nom of changements) {
      stockage.setItem(clesJeu[nom], JSON.stringify(apres[nom]));
      ecrites++;
    }
  } catch {
    try {
      for (const [cle, valeur] of valeurs.slice(0, ecrites).reverse()) {
        if (valeur === null) stockage.removeItem(cle);
        else stockage.setItem(cle, valeur);
      }
    } catch { throw new Error('Sauvegarde interrompue. Recharge la page et fais vérifier la partie par le MJ avant de poursuivre.'); }
    throw new Error('Enregistrement impossible. Aucune action conservée : libère de l’espace puis réessaie.');
  }
}

export function campagneActive(etat) {
  const actives = etat.campagnes.filter(campagne => campagne.etat === 'active');
  return actives.length === 1 ? actives[0] : null;
}
export function chapitreDeQuete(etat, quete) {
  // Le rattachement canonique est chapitreId. Les anciennes références par id
  // sont acceptées uniquement si elles désignent un seul chapitre.
  if (Object.hasOwn(quete, 'chapitreId')) return etat.chapitres.find(chapitre => chapitre.id === quete.chapitreId) ?? null;
  const candidats = etat.chapitres.filter(chapitre => chapitre.quetes.some(reference => reference.id === quete.id));
  return candidats.length === 1 ? candidats[0] : null;
}
export function lieuDeQuete(etat, quete) {
  const lieux = etat.contenus.filter(contenu => contenu.type === 'lieu' && !contenu.archive);
  if (quete.lieuId) return lieux.find(lieu => lieu.id === quete.lieuId) ?? null;
  // Compatibilité avec le formulaire du groupe qui stockait le nom en texte.
  const correspondances = lieux.filter(lieu => lieu.id === quete.lieu || lieu.nom === quete.lieu);
  return correspondances.length === 1 ? correspondances[0] : null;
}
export function joueurActuel(etat) {
  const campagne = campagneActive(etat);
  return campagne ? etat.joueurs.find(joueur => joueur.id === etat.partie.joueurSelectionneId && joueur.campagneId === campagne.id) ?? null : null;
}

export function appliquerActionJoueur(etat, action) {
  const campagne = campagneActive(etat);
  if (!campagne) throw new Error('Le MJ doit activer une seule campagne.');
  const resultat = copier(etat);
  if (action.type === 'selectionner') {
    if (action.id !== null && !etat.joueurs.some(joueur => joueur.id === action.id && joueur.campagneId === campagne.id)) throw new Error('Ce joueur ne fait pas partie de la campagne.');
    resultat.partie.joueurSelectionneId = action.id;
    return resultat;
  }
  const joueur = joueurActuel(etat);
  if (!joueur) throw new Error('Sélectionne un joueur de la campagne.');
  const indexJoueur = resultat.joueurs.findIndex(element => element.id === joueur.id);
  if (action.type === 'deplacer') {
    const lieu = etat.contenus.find(element => element.id === action.id && element.type === 'lieu' && !element.archive);
    if (!lieu || (lieu.campagneId && lieu.campagneId !== campagne.id)) throw new Error('Ce lieu n’est pas accessible dans cette campagne.');
    resultat.joueurs[indexJoueur].lieuId = lieu.id;
    return resultat;
  }
  const partages = Object.hasOwn(etat.partie.indicesParCampagne, campagne.id) ? etat.partie.indicesParCampagne[campagne.id] : [];
  if (['activer-chapitre', 'terminer-chapitre'].includes(action.type)) {
    const index = resultat.chapitres.findIndex(chapitre => chapitre.id === action.id && chapitre.campagneId === campagne.id);
    if (index < 0) throw new Error('Chapitre introuvable dans cette campagne.');
    const chapitre = resultat.chapitres[index];
    if (action.type === 'activer-chapitre') resultat.chapitres[index] = activerChapitre(chapitre, joueur, action.motDePasse);
    else {
      const fin = terminerChapitre(chapitre, joueur, action.motDePasse, partages);
      resultat.chapitres[index] = fin.chapitre;
      resultat.joueurs[indexJoueur] = fin.joueur;
      resultat.partie.indicesParCampagne = { ...resultat.partie.indicesParCampagne, [campagne.id]: fin.indicesCampagne };
    }
    return resultat;
  }
  if (!['activer-quete', 'terminer-quete'].includes(action.type)) throw new Error('Action inconnue.');
  const index = resultat.quetes.findIndex(quete => quete.id === action.id);
  if (index < 0) throw new Error('Quête introuvable.');
  const quete = resultat.quetes[index];
  const chapitre = chapitreDeQuete(etat, quete);
  if (!chapitre || chapitre.campagneId !== campagne.id || chapitre.etat !== 'actif') throw new Error('Cette quête doit appartenir à un chapitre actif de la campagne.');
  const lieu = lieuDeQuete(etat, quete);
  if (!lieu || lieu.id !== joueur.lieuId) throw new Error('Tu dois te trouver dans le lieu de la quête.');
  if (action.type === 'activer-quete') {
    if (quete.etat !== 'inactive') throw new Error('Cette quête ne peut pas être activée.');
    if (quete.motDePasseActivation && quete.motDePasseActivation !== action.motDePasse) throw new Error('Mot de passe incorrect.');
    quete.etat = 'active';
    return resultat;
  }
  if (quete.etat !== 'active') throw new Error('Seule une quête active peut être terminée.');
  if (!quete.motDePasseResolution || quete.motDePasseResolution !== action.motDePasse) throw new Error('Mot de passe de résolution incorrect ou non configuré.');
  // Un texte libre ne permet pas d'inventer une quantité ou un objet : demander
  // au MJ de sélectionner les vraies récompenses avant la résolution.
  if (quete.recompense?.trim()) {
    throw new Error('Le MJ doit préciser les objets ou indices de la récompense avant de terminer cette quête.');
  }
  const objets = quete.recompensesObjets ?? [];
  const indices = quete.recompensesIndices ?? [];
  if (!Array.isArray(objets) || !objets.every(objet => objet && estId(objet.objetId) && Number.isSafeInteger(objet.quantite) && objet.quantite > 0)
    || !Array.isArray(indices) || !indices.every(estId)) throw new Error('Récompenses de la quête invalides.');
  const fin = terminerChapitre({ ...quete, campagneId: campagne.id, etat: 'actif', recompensesObjets: objets, recompensesIndices: indices }, joueur, action.motDePasse, partages);
  quete.etat = 'terminee';
  quete.recompensesDistribuees = true;
  resultat.joueurs[indexJoueur] = fin.joueur;
  resultat.partie.indicesParCampagne = { ...resultat.partie.indicesParCampagne, [campagne.id]: fin.indicesCampagne };
  return resultat;
}

// Projection explicite : aucun mot de passe ni commentaire MJ dans les fiches.
export function fichePublique(element) {
  return { id: element.id, nom: element.nom, description: element.description ?? element.texte ?? '', etat: element.etat };
}
