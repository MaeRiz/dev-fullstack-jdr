import useCampagnesStore from '../stores/campagnes.js';
import useChapitresStore from '../stores/chapitres.js';
import useContenusStore from '../stores/contenus.js';
import useJoueursStore from '../stores/joueurs.js';
import usePartieStore from '../stores/partie.js';
import useQuetesStore from '../stores/quetes.js';

function copier(valeur) {
  return JSON.parse(JSON.stringify(valeur));
}

function sansId(element) {
  const { id, ...champs } = element;
  return champs;
}

function idContenus(chapitres, joueurs, indices) {
  const ids = new Set(indices);

  chapitres.forEach((chapitre) => {
    chapitre.objetsRequis?.forEach(id => ids.add(id));
    chapitre.recompensesObjets?.forEach(({ objetId }) => ids.add(objetId));
    chapitre.recompensesIndices?.forEach(id => ids.add(id));
  });

  joueurs.forEach((joueur) => {
    if (joueur.lieuId) ids.add(joueur.lieuId);
    joueur.inventaire?.forEach(({ objetId }) => ids.add(objetId));
  });

  return ids;
}

function remplacerId(id, correspondances) {
  return correspondances.get(id) ?? id;
}

function stores() {
  return {
    campagnes: useCampagnesStore(),
    chapitres: useChapitresStore(),
    quetes: useQuetesStore(),
    joueurs: useJoueursStore(),
    contenus: useContenusStore(),
    partie: usePartieStore(),
  };
}

export function exporterCampagne(campagneId) {
  const { campagnes, chapitres, quetes, joueurs, contenus, partie } = stores();
  const campagne = campagnes.parId(campagneId);

  if (!campagne) throw new Error('Campagne introuvable.');

  const chapitresCampagne = chapitres.parCampagne(campagneId);
  const joueursCampagne = joueurs.parCampagne(campagneId);
  const idsChapitres = new Set(chapitresCampagne.map(chapitre => chapitre.id));
  const quetesCampagne = quetes.liste.filter(quete => idsChapitres.has(quete.chapitreId));
  const indices = partie.indicesDeCampagne(campagneId);
  const ids = idContenus(chapitresCampagne, joueursCampagne, indices);
  const contenusCampagne = contenus.liste.filter(contenu => ids.has(contenu.id));

  return copier({
    format: 'cplc',
    version: 1,
    campagne,
    chapitres: chapitresCampagne,
    quetes: quetesCampagne,
    joueurs: joueursCampagne,
    contenus: contenusCampagne,
    indices,
  });
}

export function convertirExport(campagneId) {
  return JSON.stringify(exporterCampagne(campagneId), null, 2);
}

export function lireImport(texte) {
  const donnees = JSON.parse(texte);

  if (donnees?.format !== 'cplc' || donnees.version !== 1 || !donnees.campagne) {
    throw new Error('Le fichier importé n’est pas une campagne valide.');
  }

  return donnees;
}

export function importerCampagne(donnees) {
  if (donnees?.format !== 'cplc' || donnees.version !== 1 || !donnees.campagne) {
    throw new Error('Les données importées ne sont pas une campagne valide.');
  }

  const { campagnes, chapitres, quetes, joueurs, contenus, partie } = stores();
  const idCampagne = campagnes.ajouter(sansId(donnees.campagne));
  const correspondancesContenus = new Map();
  const correspondancesChapitres = new Map();

  (donnees.contenus ?? []).forEach((contenu) => {
    const nouvelId = contenus.ajouter(sansId(contenu));
    correspondancesContenus.set(contenu.id, nouvelId);
  });

  (donnees.chapitres ?? []).forEach((chapitre) => {
    const quetesChapitre = (chapitre.quetes ?? []).map(quete => ({
      ...quete,
      id: crypto.randomUUID(),
    }));
    const nouvelId = chapitres.ajouter({
      ...sansId(chapitre),
      campagneId: idCampagne,
      objetsRequis: (chapitre.objetsRequis ?? []).map(id => remplacerId(id, correspondancesContenus)),
      recompensesObjets: (chapitre.recompensesObjets ?? []).map(({ objetId, quantite }) => ({
        objetId: remplacerId(objetId, correspondancesContenus),
        quantite,
      })),
      recompensesIndices: (chapitre.recompensesIndices ?? []).map(id => remplacerId(id, correspondancesContenus)),
      quetes: quetesChapitre,
    });
    correspondancesChapitres.set(chapitre.id, nouvelId);
  });

  (donnees.quetes ?? []).forEach((quete) => {
    quetes.ajouter({
      ...sansId(quete),
      chapitreId: remplacerId(quete.chapitreId, correspondancesChapitres),
    });
  });

  (donnees.joueurs ?? []).forEach((joueur) => {
    joueurs.ajouter({
      ...sansId(joueur),
      campagneId: idCampagne,
      lieuId: remplacerId(joueur.lieuId, correspondancesContenus),
      inventaire: (joueur.inventaire ?? []).map(({ objetId, quantite }) => ({
        objetId: remplacerId(objetId, correspondancesContenus),
        quantite,
      })),
    });
  });

  partie.definirIndicesCampagne(
    idCampagne,
    (donnees.indices ?? []).map(id => remplacerId(id, correspondancesContenus)),
  );

  return idCampagne;
}
