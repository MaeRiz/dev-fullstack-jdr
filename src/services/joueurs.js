import { estInventaireValide } from './inventaire.js';

export const JOUEURS_STORAGE_KEY = 'jdr.joueurs.v1';

function estJoueurValide(joueur) {
  return joueur && typeof joueur.id === 'string'
    && typeof joueur.nom === 'string' && joueur.nom.trim().length > 0
    && ['vivant', 'mort'].includes(joueur.etat)
    && typeof joueur.description === 'string'
    && typeof joueur.commentaireMj === 'string'
    && (joueur.campagneId === null || typeof joueur.campagneId === 'string')
    && (joueur.lieuId === null || typeof joueur.lieuId === 'string')
    && estInventaireValide(joueur.inventaire);
}

export function chargerJoueurs(stockage = window.localStorage) {
  const contenu = stockage.getItem(JOUEURS_STORAGE_KEY);
  if (contenu === null) return [];
  const joueurs = JSON.parse(contenu);
  if (!Array.isArray(joueurs) || !joueurs.every(estJoueurValide)
    || new Set(joueurs.map(joueur => joueur.id)).size !== joueurs.length) {
    throw new Error('Les données des joueurs sont invalides.');
  }
  return joueurs;
}

export function sauvegarderJoueurs(joueurs, stockage = window.localStorage) {
  stockage.setItem(JOUEURS_STORAGE_KEY, JSON.stringify(joueurs));
}

export function creerJoueur(champs) {
  const nom = champs.nom.trim();
  if (!nom) throw new Error('Le nom du joueur est obligatoire.');
  if (!['vivant', 'mort'].includes(champs.etat)) throw new Error('État invalide.');
  const campagneId = champs.campagneId ?? null;
  if (campagneId !== null && (typeof campagneId !== 'string' || !campagneId.trim())) {
    throw new Error('Campagne invalide.');
  }
  return {
    id: crypto.randomUUID(),
    campagneId,
    nom,
    etat: champs.etat,
    description: champs.description.trim(),
    commentaireMj: champs.commentaireMj.trim(),
    inventaire: [],
    lieuId: null,
  };
}

export function modifierJoueur(joueur, champs) {
  const fiche = creerJoueur(champs);
  return {
    ...joueur,
    nom: fiche.nom,
    etat: fiche.etat,
    description: fiche.description,
    commentaireMj: fiche.commentaireMj,
    campagneId: fiche.campagneId,
    // Le lieu de l'ancienne campagne n'est plus pertinent après un transfert.
    lieuId: joueur.campagneId === fiche.campagneId ? joueur.lieuId : null,
  };
}

// undefined = toutes les campagnes ; null = joueurs sans campagne.
export function filtrerJoueurs(joueurs, campagneId, recherche = '') {
  const texte = recherche.trim().toLocaleLowerCase('fr');
  return joueurs.filter(joueur =>
    (campagneId === undefined || joueur.campagneId === campagneId)
    && `${joueur.nom} ${joueur.description}`.toLocaleLowerCase('fr').includes(texte));
}

export function dupliquerJoueur(joueur) {
  // Une copie profonde évite de partager l'inventaire avec le joueur original.
  return {
    ...JSON.parse(JSON.stringify(joueur)),
    id: crypto.randomUUID(),
    nom: `${joueur.nom} (copie)`,
  };
}
