import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import useCampagnesStore from './campagnes.js';
import useChapitresStore from './chapitres.js';
import useJoueursStore from './joueurs.js';
import useQuetesStore from './quetes.js';
import useContenusStore from './contenus.js';
import usePartieStore from './partie.js';
import { sansPersistance } from '../composables/useLocaleStorage.js';
import { chargerEtatJeu, enregistrerEtatJeu, appliquerActionJoueur, campagneActive, joueurActuel, chapitreDeQuete, lieuDeQuete, fichePublique } from '../services/lectureJoueur.js';

export default defineStore('lecture-joueur', () => {
  const campagnes = useCampagnesStore();
  const chapitres = useChapitresStore();
  const joueurs = useJoueursStore();
  const quetes = useQuetesStore();
  const contenus = useContenusStore();
  const partie = usePartieStore();
  const erreur = ref('');
  const message = ref('');
  const pret = ref(false);
  const donnees = computed(() => ({ campagnes: campagnes.liste, chapitres: chapitres.liste, joueurs: joueurs.liste, quetes: quetes.liste, contenus: contenus.liste, partie: partie.partie }));

  function synchroniser(etat) {
    sansPersistance(() => {
      for (const [nom, store] of Object.entries({ campagnes, chapitres, joueurs, quetes, contenus })) {
        store.liste = etat[nom];
        store.lectureImpossible = false;
      }
      partie.partie = etat.partie;
      partie.lectureImpossible = false;
    });
    pret.value = true;
  }
  function rafraichir() {
    try {
      synchroniser(chargerEtatJeu());
      erreur.value = '';
    } catch {
      pret.value = false;
      erreur.value = 'Impossible de lire la partie. Les données sont conservées. Vérifie le stockage avec le MJ puis réessaie.';
    }
  }
  function executer(action) {
    const ancienJoueur = personnage.value?.id;
    try {
      const avant = chargerEtatJeu();
      if (action.type !== 'selectionner' && joueurActuel(avant)?.id !== ancienJoueur) {
        synchroniser(avant);
        throw new Error('La sélection du joueur a changé. Vérifie le personnage puis réessaie.');
      }
      const apres = appliquerActionJoueur(avant, action);
      enregistrerEtatJeu(avant, apres);
      synchroniser(apres);
      erreur.value = '';
      message.value = {
        selectionner: 'Personnage sélectionné.', deplacer: 'Déplacement enregistré.',
        'activer-chapitre': 'Chapitre activé.', 'terminer-chapitre': 'Chapitre terminé. Les récompenses ont été enregistrées.',
        'activer-quete': 'Quête activée.', 'terminer-quete': 'Quête terminée. Les récompenses ont été enregistrées.',
      }[action.type];
      return true;
    } catch (cause) { erreur.value = cause.message; message.value = ''; return false; }
  }

  const active = computed(() => pret.value ? campagneActive(donnees.value) : null);
  const campagne = computed(() => active.value ? fichePublique(active.value) : null);
  const problemeCampagne = computed(() => !pret.value ? '' : campagnes.liste.filter(element => element.etat === 'active').length > 1
    ? 'Plusieurs campagnes sont actives. Le MJ doit en conserver une seule active.'
    : !active.value ? 'Aucune campagne active. Le MJ doit en activer une pour commencer.' : '');
  const personnages = computed(() => active.value ? joueurs.liste.filter(joueur => joueur.campagneId === active.value.id).map(fichePublique) : []);
  const selection = computed(() => pret.value ? joueurActuel(donnees.value) : null);
  const personnage = computed(() => selection.value ? fichePublique(selection.value) : null);
  const lieux = computed(() => active.value ? contenus.lieux.filter(lieu => !lieu.campagneId || lieu.campagneId === active.value.id).map(fichePublique) : []);
  const lieuActuel = computed(() => {
    if (!selection.value?.lieuId) return null;
    const lieu = contenus.liste.find(element => element.id === selection.value.lieuId && element.type === 'lieu');
    return lieu ? fichePublique(lieu) : { id: selection.value.lieuId, nom: 'Lieu indisponible', description: '' };
  });
  const inventaire = computed(() => {
    if (!selection.value) return [];
    const objets = selection.value.inventaire.map(entree => {
      const objet = contenus.liste.find(element => element.id === entree.objetId && element.type === 'objet');
      return { ...(objet ? fichePublique(objet) : { id: entree.objetId, nom: 'Objet indisponible', description: 'La définition de cet objet est absente de la bibliothèque.' }), type: 'objet', quantite: entree.quantite };
    });
    const ids = Object.hasOwn(partie.partie.indicesParCampagne, active.value.id) ? partie.partie.indicesParCampagne[active.value.id] : [];
    const indices = [...new Set(ids)].map(id => {
      const indice = contenus.liste.find(element => element.id === id && element.type === 'indice');
      return { ...(indice ? fichePublique(indice) : { id, nom: 'Indice indisponible', description: 'La définition de cet indice est absente de la bibliothèque.' }), type: 'indice' };
    });
    return [...objets, ...indices];
  });
  const chapitresCampagne = computed(() => active.value ? chapitres.parCampagne(active.value.id) : []);
  function recompenses(element) {
    if (!element.recompensesDistribuees) return [];
    return [
      ...(element.recompensesObjets ?? []).map(objet => `${contenus.parId(objet.objetId)?.nom ?? 'Objet indisponible'} × ${objet.quantite}`),
      ...(element.recompensesIndices ?? []).map(id => contenus.parId(id)?.nom ?? 'Indice indisponible'),
    ];
  }
  const progression = computed(() => chapitresCampagne.value.filter(chapitre => ['actif', 'termine'].includes(chapitre.etat)).map(chapitre => {
    const liees = quetes.liste.filter(quete => chapitreDeQuete(donnees.value, quete)?.id === chapitre.id && ['active', 'terminee', 'abandonnee'].includes(quete.etat));
    const ordre = chapitre.quetes.map(quete => quete.id);
    liees.sort((a, b) => {
      const rang = id => ordre.includes(id) ? ordre.indexOf(id) : ordre.length;
      return rang(a.id) - rang(b.id);
    });
    return { ...fichePublique(chapitre), recompenses: recompenses(chapitre), quetes: liees.map(quete => ({ ...fichePublique(quete), lieu: lieuDeQuete(donnees.value, quete)?.nom ?? 'Lieu non précisé', recompenses: recompenses(quete) })) };
  }));
  const actionsChapitres = computed(() => selection.value ? chapitresCampagne.value.filter(chapitre => ['inactif', 'actif'].includes(chapitre.etat)).map(chapitre => ({
    id: chapitre.id, nom: chapitre.nom, type: chapitre.etat === 'inactif' ? 'activer-chapitre' : 'terminer-chapitre', motDePasseRequis: true,
  })) : []);
  const actionsQuetes = computed(() => selection.value ? quetes.liste.filter(quete => {
    const chapitre = chapitreDeQuete(donnees.value, quete);
    return chapitre?.campagneId === active.value.id && chapitre.etat === 'actif'
      && lieuDeQuete(donnees.value, quete)?.id === selection.value.lieuId && ['inactive', 'active'].includes(quete.etat);
  }).map(quete => ({ id: quete.id, nom: quete.nom, type: quete.etat === 'inactive' ? 'activer-quete' : 'terminer-quete', motDePasseRequis: quete.etat === 'active' || Boolean(quete.motDePasseActivation) })) : []);

  return { pret, erreur, message, campagne, problemeCampagne, personnages, personnage, lieux, lieuActuel, inventaire, progression, actionsChapitres, actionsQuetes, rafraichir, executer };
});
