import test from 'node:test';
import assert from 'node:assert/strict';
import { modifierInventaire } from '../src/services/inventaire.js';
import { chargerJoueurs, creerJoueur, modifierJoueur, filtrerJoueurs, dupliquerJoueur, sauvegarderJoueurs, JOUEURS_STORAGE_KEY } from '../src/services/joueurs.js';

function stockageMemoire(contenu = null) {
  const donnees = new Map(contenu === null ? [] : [[JOUEURS_STORAGE_KEY, contenu]]);
  return {
    getItem: cle => donnees.get(cle) ?? null,
    setItem: (cle, valeur) => donnees.set(cle, valeur),
  };
}

const champs = { nom: '  Aria  ', etat: 'vivant', description: 'Rôdeuse', commentaireMj: 'Un secret' };

test('rattacher, transférer et détacher un joueur persiste sans perdre sa fiche ni son inventaire', () => {
  const stockage = stockageMemoire();
  const original = modifierInventaire(creerJoueur(champs), 'cle', 2, 'donner');
  assert.equal(original.campagneId, null);
  let joueur = modifierJoueur(original, { ...champs, campagneId: 'demo-foret' });
  joueur.lieuId = 'lieu-foret';
  assert.equal(modifierJoueur(joueur, { ...champs, campagneId: 'demo-foret' }).lieuId, 'lieu-foret');
  for (const campagneId of ['demo-citadelle', null]) {
    joueur = modifierJoueur(joueur, { ...champs, campagneId });
    sauvegarderJoueurs([joueur], stockage);
    [joueur] = chargerJoueurs(stockage);
    assert.equal(joueur.campagneId, campagneId);
    assert.equal(joueur.lieuId, null);
    assert.equal(joueur.id, original.id);
    assert.equal(joueur.commentaireMj, original.commentaireMj);
    assert.deepEqual(joueur.inventaire, original.inventaire);
  }
  assert.equal(original.campagneId, null);
});

test('le filtre combine campagne et recherche, et distingue Sans campagne de Toutes', () => {
  const foret = creerJoueur({ ...champs, campagneId: 'demo-foret' });
  const citadelle = creerJoueur({ ...champs, nom: 'Borin', campagneId: 'demo-citadelle' });
  const sansCampagne = creerJoueur(champs);
  const joueurs = [foret, citadelle, sansCampagne];
  assert.deepEqual(filtrerJoueurs(joueurs, undefined), joueurs);
  assert.deepEqual(filtrerJoueurs(joueurs, null), [sansCampagne]);
  assert.deepEqual(filtrerJoueurs(joueurs, 'demo-foret', ' RÔDEUSE '), [foret]);
  assert.deepEqual(filtrerJoueurs(joueurs, 'demo-foret', 'Borin'), []);
  assert.deepEqual(filtrerJoueurs(joueurs, 'absente'), []);
  assert.equal(dupliquerJoueur(foret).campagneId, foret.campagneId);
});

test('une référence de campagne hors catalogue reste lisible et est préservée à la modification', () => {
  const joueur = creerJoueur({ ...champs, campagneId: 'campagne-du-groupe' });
  const stockage = stockageMemoire();
  sauvegarderJoueurs([joueur], stockage);
  const [recharge] = chargerJoueurs(stockage);
  assert.equal(modifierJoueur(recharge, { ...recharge, nom: 'Nouveau nom' }).campagneId, joueur.campagneId);
  for (const campagneId of ['', '  ', 12, {}]) {
    assert.throws(() => creerJoueur({ ...champs, campagneId }));
  }
});

test('les dons se cumulent, les retraits persistent et le dernier retrait supprime la ligne', () => {
  const stockage = stockageMemoire();
  const original = creerJoueur(champs);
  let joueur = modifierInventaire(original, 'potion', 3, 'donner');
  joueur = modifierInventaire(joueur, 'potion', 2, 'donner');
  joueur = modifierInventaire(joueur, 'cle', 1, 'donner');
  joueur = modifierInventaire(joueur, 'potion', 4, 'retirer');
  sauvegarderJoueurs([joueur], stockage);
  const [recharge] = chargerJoueurs(stockage);
  assert.deepEqual(recharge.inventaire, [{ objetId: 'potion', quantite: 1 }, { objetId: 'cle', quantite: 1 }]);
  joueur = modifierInventaire(recharge, 'potion', 1, 'retirer');
  sauvegarderJoueurs([joueur], stockage);
  assert.deepEqual(chargerJoueurs(stockage)[0].inventaire, [{ objetId: 'cle', quantite: 1 }]);
  assert.deepEqual(original.inventaire, []);
});

test('les opérations impossibles ne changent pas les objets du joueur', () => {
  const joueur = modifierInventaire(creerJoueur(champs), 'cle', 2, 'donner');
  for (const quantite of [0, -1, 1.5, NaN, Infinity, '', '2']) {
    assert.throws(() => modifierInventaire(joueur, 'cle', quantite, 'donner'));
    assert.throws(() => modifierInventaire(joueur, 'cle', quantite, 'retirer'));
  }
  assert.throws(() => modifierInventaire(joueur, 'cle', 3, 'retirer'));
  assert.throws(() => modifierInventaire(joueur, 'potion', 1, 'retirer'));
  assert.throws(() => modifierInventaire(joueur, 'inconnu', 1, 'donner'));
  assert.throws(() => modifierInventaire(joueur, 'cle', Number.MAX_SAFE_INTEGER, 'donner'));
  assert.deepEqual(joueur.inventaire, [{ objetId: 'cle', quantite: 2 }]);
});

test('modifier et sauvegarder la copie ne change pas l’inventaire original', () => {
  const stockage = stockageMemoire();
  const original = modifierInventaire(creerJoueur(champs), 'corde', 2, 'donner');
  const copie = modifierInventaire(dupliquerJoueur(original), 'corde', 1, 'retirer');
  sauvegarderJoueurs([original, copie], stockage);
  const joueurs = chargerJoueurs(stockage);
  assert.equal(joueurs[0].inventaire[0].quantite, 2);
  assert.equal(joueurs[1].inventaire[0].quantite, 1);
});

test('un inventaire corrompu est refusé sans écraser les données', () => {
  for (const inventaire of [[null], [{ objetId: 'cle', quantite: -1 }], [{ objetId: 'cle', quantite: 1 }, { objetId: 'cle', quantite: 2 }]]) {
    const contenu = JSON.stringify([{ ...creerJoueur(champs), inventaire }]);
    const stockage = stockageMemoire(contenu);
    assert.throws(() => chargerJoueurs(stockage));
    assert.equal(stockage.getItem(JOUEURS_STORAGE_KEY), contenu);
  }
});

test('la sauvegarde restitue les joueurs, leurs changements et leur suppression', () => {
  const stockage = stockageMemoire();
  assert.deepEqual(chargerJoueurs(stockage), []);
  const joueur = creerJoueur(champs);
  assert.equal(joueur.nom, 'Aria');
  assert.deepEqual(joueur.inventaire, []);
  sauvegarderJoueurs([joueur], stockage);
  assert.deepEqual(chargerJoueurs(stockage), [joueur]);
  const modifies = chargerJoueurs(stockage);
  modifies[0].etat = 'mort';
  sauvegarderJoueurs(modifies, stockage);
  assert.equal(chargerJoueurs(stockage)[0].etat, 'mort');
  sauvegarderJoueurs([], stockage);
  assert.deepEqual(chargerJoueurs(stockage), []);
});

test('une duplication conserve les données mais possède un identifiant et un inventaire indépendants', () => {
  const joueur = creerJoueur(champs);
  joueur.campagneId = 'campagne-1';
  joueur.inventaire = [{ objetId: 'cle', quantite: 1 }];
  const copie = dupliquerJoueur(joueur);
  assert.notEqual(copie.id, joueur.id);
  assert.equal(copie.nom, 'Aria (copie)');
  assert.equal(copie.campagneId, joueur.campagneId);
  copie.inventaire[0].quantite = 2;
  assert.equal(joueur.inventaire[0].quantite, 1);
});

test('les noms vides et états inconnus sont refusés', () => {
  assert.throws(() => creerJoueur({ ...champs, nom: '  ' }));
  assert.throws(() => creerJoueur({ ...champs, etat: 'inconnu' }));
});

test('des données illisibles ne sont pas remplacées par une liste vide', () => {
  const joueur = creerJoueur(champs);
  for (const contenu of ['{', 'null', '{}', '[{}]', JSON.stringify([joueur, joueur])]) {
    const stockage = stockageMemoire(contenu);
    assert.throws(() => chargerJoueurs(stockage));
    assert.equal(stockage.getItem(JOUEURS_STORAGE_KEY), contenu);
  }
});

test('les erreurs de stockage remontent pour que la vue puisse prévenir le MJ', () => {
  const stockage = {
    getItem() { throw new Error('Lecture interdite'); },
    setItem() { throw new Error('Quota dépassé'); },
  };
  assert.throws(() => chargerJoueurs(stockage), /Lecture interdite/);
  assert.throws(() => sauvegarderJoueurs([creerJoueur(champs)], stockage), /Quota dépassé/);
});
