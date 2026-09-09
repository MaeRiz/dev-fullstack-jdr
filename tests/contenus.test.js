import test from 'node:test';
import assert from 'node:assert/strict';
import { chargerContenus, sauvegarderContenus, archiverContenu, contenusDisponibles, choixContenus, CONTENUS_STORAGE_KEY } from '../src/services/contenus.js';
import { creerJoueur, sauvegarderJoueurs, chargerJoueurs } from '../src/services/joueurs.js';
import { modifierInventaire, nomObjet } from '../src/services/inventaire.js';
import { creerChapitre, formulaireVide, activerChapitre, terminerChapitre, sauvegarderChapitres, chargerChapitres } from '../src/services/chapitres.js';

const objet = { id: 'uuid-objet', type: 'objet', nom: 'Clé dorée', description: 'Ouvre la porte', commentaire: '' };
const indice = { id: 'uuid-indice', type: 'indice', nom: 'Secret', texte: 'Le passage est au nord', commentaire: '' };
const lieu = { id: 'uuid-lieu', type: 'lieu', nom: 'Taverne', description: '', commentaire: '' };
function stockageMemoire() {
  const donnees = new Map();
  return { getItem: cle => donnees.get(cle) ?? null, setItem: (cle, valeur) => donnees.set(cle, valeur) };
}
function joueurVide() {
  return creerJoueur({ nom: 'Aria', etat: 'vivant', description: '', commentaireMj: '', campagneId: 'demo-foret' });
}

test('un objet réel relie bibliothèque, inventaire et activation du chapitre après relecture', () => {
  const stockage = stockageMemoire();
  sauvegarderContenus([objet, indice, lieu], stockage);
  const catalogue = chargerContenus(stockage);
  const joueur = modifierInventaire(joueurVide(), objet.id, 1, 'donner', catalogue);
  const chapitre = creerChapitre({ ...formulaireVide('demo-foret'), nom: 'La porte', motDePasseActivation: 'ouvrir', motDePasseResolution: 'fin', objetsRequis: [objet.id], recompensesObjets: [{ objetId: objet.id, quantite: 2 }], recompensesIndices: [indice.id] });
  sauvegarderJoueurs([joueur], stockage);
  sauvegarderChapitres([chapitre], stockage);
  const [joueurLu] = chargerJoueurs(stockage);
  const actif = activerChapitre(chargerChapitres(stockage)[0], joueurLu, 'ouvrir');
  const resultat = terminerChapitre(actif, joueurLu, 'fin');
  assert.deepEqual(resultat.joueur.inventaire, [{ objetId: objet.id, quantite: 3 }]);
  assert.deepEqual(resultat.indicesCampagne, [indice.id]);
  assert.deepEqual(contenusDisponibles(catalogue, 'objet'), [objet]);
  assert.deepEqual(contenusDisponibles(catalogue, 'indice'), [indice]);
  assert.throws(() => modifierInventaire(joueur, indice.id, 1, 'donner', catalogue));
  assert.throws(() => modifierInventaire(joueur, lieu.id, 1, 'donner', catalogue));
});

test('renommer puis retirer un objet conserve son nom et les anciennes références', () => {
  const stockage = stockageMemoire();
  const joueur = modifierInventaire(joueurVide(), objet.id, 2, 'donner', [objet]);
  sauvegarderContenus([{ ...objet, nom: 'Clé du château' }], stockage);
  assert.equal(nomObjet(objet.id, chargerContenus(stockage)), 'Clé du château');
  sauvegarderContenus(archiverContenu(chargerContenus(stockage), objet.id), stockage);
  const catalogue = chargerContenus(stockage);
  assert.deepEqual(contenusDisponibles(catalogue, 'objet'), []);
  assert.match(nomObjet(objet.id, catalogue), /Clé du château/);
  assert.equal(choixContenus(catalogue, 'objet', [objet.id])[0].id, objet.id);
  assert.deepEqual(choixContenus(catalogue, 'objet'), []);
  assert.throws(() => modifierInventaire(joueur, objet.id, 1, 'donner', catalogue));
  assert.deepEqual(modifierInventaire(joueur, objet.id, 2, 'retirer', catalogue).inventaire, []);
  assert.equal(joueur.inventaire[0].quantite, 2);
});

test('une bibliothèque vide ne propose aucun exemple et les anciennes références restent retirables', () => {
  const stockage = stockageMemoire();
  assert.deepEqual(chargerContenus(stockage), []);
  assert.throws(() => modifierInventaire(joueurVide(), 'cle', 1, 'donner'));
  const joueur = { ...joueurVide(), inventaire: [{ objetId: 'cle', quantite: 1 }] };
  assert.deepEqual(modifierInventaire(joueur, 'cle', 1, 'retirer').inventaire, []);
  assert.match(nomObjet('cle'), /indisponible/);
  assert.deepEqual(choixContenus([], 'objet', ['cle']).map(element => element.id), ['cle']);
});

test('une sauvegarde corrompue est signalée sans être remplacée', () => {
  for (const texte of ['null', '{', '[{}]', JSON.stringify([objet, objet])]) {
    const stockage = stockageMemoire();
    stockage.setItem(CONTENUS_STORAGE_KEY, texte);
    assert.throws(() => chargerContenus(stockage));
    assert.equal(stockage.getItem(CONTENUS_STORAGE_KEY), texte);
  }
});
