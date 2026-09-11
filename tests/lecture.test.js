import test from 'node:test';
import assert from 'node:assert/strict';
import { createPinia, setActivePinia } from 'pinia';
import useLectureStore from '../src/stores/lecture.js';
import { creerJoueur } from '../src/services/joueurs.js';
import { creerChapitre, formulaireVide } from '../src/services/chapitres.js';
import { appliquerActionJoueur, chargerEtatJeu, enregistrerEtatJeu, clesJeu, chapitreDeQuete, lieuDeQuete, fichePublique } from '../src/services/lectureJoueur.js';

function exemple() {
  const chapitre = creerChapitre({ ...formulaireVide('campagne'), nom: 'Le château', commentaireMj: 'SECRET-MJ', motDePasseActivation: 'ouvrir-SECRET', motDePasseResolution: 'fin-SECRET', objetsRequis: ['cle'], recompensesObjets: [{ objetId: 'potion', quantite: 2 }], recompensesIndices: ['carte'] });
  const joueur = creerJoueur({ nom: 'Aria', etat: 'vivant', description: 'Rôdeuse', commentaireMj: 'SECRET-MJ', campagneId: 'campagne' });
  joueur.inventaire = [{ objetId: 'cle', quantite: 1 }];
  const autre = { ...joueur, id: 'autre-joueur', nom: 'Borin', inventaire: [] };
  return {
    campagnes: [{ id: 'campagne', nom: 'Aventure', etat: 'active', description: '', commentaire: 'SECRET-MJ' }],
    joueurs: [joueur, autre], chapitres: [chapitre],
    quetes: [{ id: 'quete', chapitreId: chapitre.id, nom: 'La porte', description: 'Trouver la porte', etat: 'inactive', lieuId: 'tour', lieu: 'Tour', commentaire: 'SECRET-MJ', motDePasseActivation: 'quete-SECRET', motDePasseResolution: 'resolu-SECRET', recompensesObjets: [{ objetId: 'potion', quantite: 3 }], recompensesIndices: ['carte'], recompense: '' }],
    contenus: [
      { id: 'cle', type: 'objet', nom: 'Clé', description: '', commentaire: 'SECRET-MJ' },
      { id: 'potion', type: 'objet', nom: 'Potion', description: 'Une fiole', commentaire: 'SECRET-MJ' },
      { id: 'tour', type: 'lieu', nom: 'Tour', description: 'Une tour', commentaire: 'SECRET-MJ' },
      { id: 'foret', type: 'lieu', nom: 'Forêt', description: '', commentaire: 'SECRET-MJ' },
      { id: 'carte', type: 'indice', nom: 'Carte', texte: 'Passage au nord', commentaire: 'SECRET-MJ' },
    ],
    partie: { joueurSelectionneId: joueur.id, indicesParCampagne: {} },
  };
}
function memoire(etat = exemple()) {
  const donnees = new Map(Object.entries(clesJeu).map(([nom, cle]) => [cle, JSON.stringify(etat[nom])]));
  return { getItem: cle => donnees.get(cle) ?? null, setItem: (cle, valeur) => donnees.set(cle, valeur), removeItem: cle => donnees.delete(cle) };
}
const activer = etat => appliquerActionJoueur(etat, { type: 'activer-chapitre', id: etat.chapitres[0].id, motDePasse: 'ouvrir-SECRET' });

test('parcours complet : déplacement, chapitre, quête, récompenses et relecture', () => {
  const initial = exemple();
  const stockage = memoire(initial);
  let etat = activer(initial);
  etat = appliquerActionJoueur(etat, { type: 'deplacer', id: 'tour' });
  etat = appliquerActionJoueur(etat, { type: 'activer-quete', id: 'quete', motDePasse: 'quete-SECRET' });
  etat = appliquerActionJoueur(etat, { type: 'terminer-quete', id: 'quete', motDePasse: 'resolu-SECRET' });
  etat = appliquerActionJoueur(etat, { type: 'terminer-chapitre', id: etat.chapitres[0].id, motDePasse: 'fin-SECRET' });
  enregistrerEtatJeu(initial, etat, stockage);
  const relu = chargerEtatJeu(stockage);
  assert.equal(relu.chapitres[0].etat, 'termine');
  assert.equal(relu.quetes[0].etat, 'terminee');
  assert.equal(relu.joueurs[0].lieuId, 'tour');
  assert.deepEqual(relu.joueurs[0].inventaire, [{ objetId: 'cle', quantite: 1 }, { objetId: 'potion', quantite: 5 }]);
  assert.deepEqual(relu.joueurs[1].inventaire, []);
  assert.deepEqual(relu.partie.indicesParCampagne.campagne, ['carte']);
  assert.equal(initial.chapitres[0].etat, 'inactif');
  assert.throws(() => appliquerActionJoueur(relu, { type: 'terminer-chapitre', id: relu.chapitres[0].id, motDePasse: 'fin-SECRET' }));
});

test('les campagnes et joueurs étrangers sont refusés, y compris une ancienne sélection', () => {
  const etat = exemple();
  assert.throws(() => appliquerActionJoueur(etat, { type: 'selectionner', id: 'inconnu' }));
  etat.joueurs[0].campagneId = 'autre-campagne';
  assert.throws(() => activer(etat));
  etat.campagnes.push({ id: 'seconde', nom: 'Autre', etat: 'active' });
  assert.throws(() => appliquerActionJoueur(etat, { type: 'selectionner', id: 'autre-joueur' }));
  etat.campagnes = [];
  assert.throws(() => appliquerActionJoueur(etat, { type: 'deplacer', id: 'tour' }));
});

test('activation : mot de passe exact, objets requis et chapitre de la bonne campagne', () => {
  const etat = exemple();
  assert.throws(() => appliquerActionJoueur(etat, { type: 'activer-chapitre', id: etat.chapitres[0].id, motDePasse: 'FAUX' }));
  etat.joueurs[0].inventaire = [];
  assert.throws(() => activer(etat));
  etat.joueurs[0].inventaire = [{ objetId: 'cle', quantite: 1 }];
  etat.chapitres[0].campagneId = 'autre';
  assert.throws(() => activer(etat));
});

test('les deux actions sur une quête exigent le bon lieu et un chapitre actif', () => {
  let etat = exemple();
  etat.joueurs[0].lieuId = 'tour';
  const action = { type: 'activer-quete', id: 'quete', motDePasse: 'quete-SECRET' };
  assert.throws(() => appliquerActionJoueur(etat, action));
  etat = activer(etat);
  etat.joueurs[0].lieuId = 'foret';
  assert.throws(() => appliquerActionJoueur(etat, action));
  etat.joueurs[0].lieuId = 'tour';
  etat = appliquerActionJoueur(etat, action);
  assert.throws(() => appliquerActionJoueur(etat, { type: 'terminer-quete', id: 'quete', motDePasse: 'faux' }));
  etat.joueurs[0].lieuId = 'foret';
  assert.throws(() => appliquerActionJoueur(etat, { type: 'terminer-quete', id: 'quete', motDePasse: 'resolu-SECRET' }));
});

test('une quête sans code d’activation peut être activée mais un code de résolution reste requis', () => {
  let etat = activer(exemple());
  etat.joueurs[0].lieuId = 'tour';
  etat.quetes[0].motDePasseActivation = '';
  etat = appliquerActionJoueur(etat, { type: 'activer-quete', id: 'quete', motDePasse: '' });
  assert.equal(etat.quetes[0].etat, 'active');
  etat.quetes[0].motDePasseResolution = '';
  assert.throws(() => appliquerActionJoueur(etat, { type: 'terminer-quete', id: 'quete', motDePasse: '' }));
});

test('les lieux archivés ou ambigus et les quêtes non rattachées ne sont pas utilisables', () => {
  const etat = activer(exemple());
  const quete = etat.quetes[0];
  etat.contenus.find(contenu => contenu.id === 'foret').archive = true;
  assert.throws(() => appliquerActionJoueur(etat, { type: 'deplacer', id: 'foret' }));
  delete quete.lieuId;
  assert.equal(lieuDeQuete(etat, quete).id, 'tour');
  etat.contenus.push({ ...etat.contenus.find(contenu => contenu.id === 'tour'), id: 'autre-tour' });
  assert.equal(lieuDeQuete(etat, quete), null);
  delete quete.chapitreId;
  assert.equal(chapitreDeQuete(etat, quete), null);
});

test('une erreur d’écriture restaure les autres listes et ne distribue aucune récompense', () => {
  const avant = activer(exemple());
  const apres = appliquerActionJoueur(avant, { type: 'terminer-chapitre', id: avant.chapitres[0].id, motDePasse: 'fin-SECRET' });
  const stockage = memoire(avant);
  const setItem = stockage.setItem;
  stockage.setItem = (cle, valeur) => {
    if (cle === clesJeu.partie) throw Error('Quota');
    setItem(cle, valeur);
  };
  assert.throws(() => enregistrerEtatJeu(avant, apres, stockage), /Aucune action conservée/);
  assert.deepEqual(chargerEtatJeu(stockage), avant);
});

test('détacher une quête prime sur ses anciennes références et une récompense texte ne peut pas être devinée', () => {
  const etat = activer(exemple());
  const quete = etat.quetes[0];
  etat.chapitres[0].quetes = [{ id: quete.id, modeleId: quete.id, nom: quete.nom }];
  quete.chapitreId = null;
  assert.equal(chapitreDeQuete(etat, quete), null);
  quete.chapitreId = etat.chapitres[0].id;
  quete.etat = 'active';
  quete.recompense = 'Deux objets à choisir';
  etat.joueurs[0].lieuId = 'tour';
  assert.throws(() => appliquerActionJoueur(etat, { type: 'terminer-quete', id: quete.id, motDePasse: 'resolu-SECRET' }), /MJ doit préciser/);
});

test('la lecture refuse des structures invalides sans écraser le stockage', () => {
  for (const [nom, valeur] of [['joueurs', 'null'], ['campagnes', '{}'], ['partie', '{'], ['partie', '{"joueurSelectionneId":null,"indicesParCampagne":[]}']]) {
    const stockage = memoire();
    stockage.setItem(clesJeu[nom], valeur);
    assert.throws(() => chargerEtatJeu(stockage));
    assert.equal(stockage.getItem(clesJeu[nom]), valeur);
  }
});

test('les données publiques du store excluent codes, commentaires et inventaires des autres joueurs', () => {
  const etat = activer(exemple());
  etat.quetes[0].etat = 'active';
  etat.joueurs[0].lieuId = 'tour';
  etat.partie.indicesParCampagne = { campagne: ['carte'] };
  globalThis.localStorage = memoire(etat);
  setActivePinia(createPinia());
  const store = useLectureStore();
  store.rafraichir();
  const publicJson = JSON.stringify([store.campagne, store.personnages, store.personnage, store.lieux, store.lieuActuel, store.inventaire, store.progression, store.actionsChapitres, store.actionsQuetes]);
  assert.ok(!publicJson.includes('SECRET'));
  assert.ok(!publicJson.includes('commentaire'));
  assert.equal(store.actionsQuetes.length, 1);
  assert.equal(store.inventaire.find(element => element.type === 'indice').description, 'Passage au nord');
  assert.deepEqual(Object.keys(fichePublique(etat.chapitres[0])), ['id', 'nom', 'description', 'etat']);
  assert.equal(store.executer({ type: 'selectionner', id: 'autre-joueur' }), true);
  assert.equal(store.inventaire.filter(element => element.type === 'objet').length, 0);
  assert.equal(store.inventaire.filter(element => element.type === 'indice').length, 1);
});

test('le store relit les modifications du MJ et ne déclare pas un succès après échec de sauvegarde', () => {
  const etat = exemple();
  const stockage = memoire(etat);
  globalThis.localStorage = stockage;
  setActivePinia(createPinia());
  const store = useLectureStore();
  store.rafraichir();
  etat.joueurs[0].nom = 'Aria renommée par le MJ';
  stockage.setItem(clesJeu.joueurs, JSON.stringify(etat.joueurs));
  store.rafraichir();
  assert.equal(store.personnage.nom, 'Aria renommée par le MJ');
  stockage.setItem = () => { throw Error('Interdit'); };
  assert.equal(store.executer({ type: 'deplacer', id: 'tour' }), false);
  assert.equal(store.lieuActuel, null);
  assert.equal(store.message, '');
  assert.match(store.erreur, /Enregistrement impossible/);
});
