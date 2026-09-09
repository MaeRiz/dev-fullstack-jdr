import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPITRES_STORAGE_KEY, formulaireVide, creerChapitre, modifierChapitre, dupliquerChapitre, deplacerQuete, chargerChapitres, sauvegarderChapitres, activerChapitre, terminerChapitre } from '../src/services/chapitres.js';

function stockageMemoire(contenu = null) {
  const donnees = new Map(contenu === null ? [] : [[CHAPITRES_STORAGE_KEY, contenu]]);
  return { getItem: cle => donnees.get(cle) ?? null, setItem: (cle, valeur) => donnees.set(cle, valeur) };
}
const quetes = [
  { id: 'q1', modeleId: 'exploration', nom: 'Explorer' },
  { id: 'q2', modeleId: 'gardien', nom: 'Parler au gardien' },
];
function exemple() {
  return creerChapitre({ ...formulaireVide('demo-foret'), nom: ' Les ruines ', motDePasseActivation: 'ouvrir', motDePasseResolution: 'résolu', objetsRequis: ['cle'], recompensesObjets: [{ objetId: 'potion', quantite: 2 }], recompensesIndices: ['carte'], quetes });
}
const joueur = () => ({ id: 'j1', campagneId: 'demo-foret', inventaire: [{ objetId: 'cle', quantite: 1 }, { objetId: 'potion', quantite: 1 }] });

test('création, modification, relecture et suppression conservent les données attendues', () => {
  const stockage = stockageMemoire();
  assert.deepEqual(chargerChapitres(stockage), []);
  const chapitre = exemple();
  assert.equal(chapitre.nom, 'Les ruines');
  assert.equal(chapitre.etat, 'inactif');
  sauvegarderChapitres([chapitre], stockage);
  assert.deepEqual(chargerChapitres(stockage), [chapitre]);
  const modifie = modifierChapitre(chapitre, { ...chapitre, nom: 'Le château', campagneId: null });
  assert.equal(modifie.id, chapitre.id);
  assert.equal(chapitre.nom, 'Les ruines');
  sauvegarderChapitres([modifie], stockage);
  assert.equal(chargerChapitres(stockage)[0].campagneId, null);
  sauvegarderChapitres([], stockage);
  assert.deepEqual(chargerChapitres(stockage), []);
});

test('la duplication crée des identifiants distincts et des listes indépendantes', () => {
  const original = exemple();
  const copie = dupliquerChapitre(original);
  assert.notEqual(copie.id, original.id);
  assert.notEqual(copie.quetes[0].id, original.quetes[0].id);
  assert.equal(copie.campagneId, original.campagneId);
  copie.quetes[0].nom = 'Autre quête';
  copie.recompensesObjets[0].quantite = 10;
  assert.equal(original.quetes[0].nom, 'Explorer');
  assert.equal(original.recompensesObjets[0].quantite, 2);
});

test('réordonner les quêtes respecte les limites et persiste sans modifier la liste source', () => {
  const chapitre = exemple();
  const stockage = stockageMemoire();
  const ordre = deplacerQuete(chapitre.quetes, 'q2', -1);
  assert.deepEqual(ordre.map(quete => quete.id), ['q2', 'q1']);
  assert.deepEqual(chapitre.quetes.map(quete => quete.id), ['q1', 'q2']);
  assert.deepEqual(deplacerQuete(ordre, 'q2', -1), ordre);
  assert.deepEqual(deplacerQuete(ordre, 'q1', 1), ordre);
  sauvegarderChapitres([modifierChapitre(chapitre, { ...chapitre, quetes: ordre })], stockage);
  assert.deepEqual(chargerChapitres(stockage)[0].quetes, ordre);
});

test('les données corrompues et quantités invalides sont refusées sans écrasement', () => {
  for (const contenu of ['{', 'null', '{}', '[{}]', JSON.stringify([exemple(), { ...exemple(), etat: 'inconnu' }])]) {
    const stockage = stockageMemoire(contenu);
    assert.throws(() => chargerChapitres(stockage));
    assert.equal(stockage.getItem(CHAPITRES_STORAGE_KEY), contenu);
  }
  assert.throws(() => creerChapitre({ ...formulaireVide(), nom: '   ' }));
  for (const quantite of [0, -1, 1.5, '2', NaN]) {
    assert.throws(() => creerChapitre({ ...exemple(), recompensesObjets: [{ objetId: 'cle', quantite }] }));
  }
});

test('les erreurs de stockage remontent pour conserver le formulaire ouvert', () => {
  const stockage = { getItem() { throw Error('Accès refusé'); }, setItem() { throw Error('Quota'); } };
  assert.throws(() => chargerChapitres(stockage), /Accès refusé/);
  assert.throws(() => sauvegarderChapitres([exemple()], stockage), /Quota/);
});

test('activation : campagne, mot de passe et objets sont obligatoires, sans consommation', () => {
  const chapitre = exemple();
  const beneficiaire = joueur();
  assert.throws(() => activerChapitre(chapitre, beneficiaire, 'faux'));
  assert.throws(() => activerChapitre(chapitre, { ...beneficiaire, inventaire: [] }, 'ouvrir'));
  assert.throws(() => activerChapitre(chapitre, { ...beneficiaire, campagneId: 'autre' }, 'ouvrir'));
  assert.throws(() => activerChapitre({ ...chapitre, motDePasseActivation: '' }, beneficiaire, ''));
  const actif = activerChapitre(chapitre, beneficiaire, 'ouvrir');
  assert.equal(actif.etat, 'actif');
  assert.equal(chapitre.etat, 'inactif');
  assert.deepEqual(beneficiaire, joueur());
  assert.throws(() => activerChapitre(actif, beneficiaire, 'ouvrir'));
});

test('résolution : objets personnels, indices partagés uniques et absence de double récompense', () => {
  const chapitre = activerChapitre(exemple(), joueur(), 'ouvrir');
  const beneficiaire = joueur();
  assert.throws(() => terminerChapitre(chapitre, beneficiaire, 'faux'));
  assert.throws(() => terminerChapitre(chapitre, { ...beneficiaire, campagneId: null }, 'résolu'));
  const resultat = terminerChapitre(chapitre, beneficiaire, 'résolu', ['carte', 'message']);
  assert.equal(resultat.chapitre.etat, 'termine');
  assert.equal(resultat.joueur.inventaire.find(objet => objet.objetId === 'potion').quantite, 3);
  assert.deepEqual(resultat.indicesCampagne, ['carte', 'message']);
  assert.deepEqual(beneficiaire, joueur());
  assert.equal(chapitre.etat, 'actif');
  assert.throws(() => terminerChapitre(resultat.chapitre, resultat.joueur, 'résolu'));
  const reactive = modifierChapitre(resultat.chapitre, { ...resultat.chapitre, etat: 'actif' });
  const secondeResolution = terminerChapitre(reactive, resultat.joueur, 'résolu', resultat.indicesCampagne);
  assert.deepEqual(secondeResolution.joueur, resultat.joueur);
});
