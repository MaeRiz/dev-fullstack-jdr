import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import useLocaleStorage from '../composables/useLocaleStorage.js';

// Constante de stockage
export const CLE_STOCKAGE = 'jdr.partie.v1';

const usePartieStore = defineStore('partie', () => {
  // States
  const partie = ref({ joueurSelectionneId: null, indicesParCampagne: {} });
  // Persistance : lectureImpossible est un state.
  // enregistrer est une action de sauvegarde.
  const { lectureImpossible, enregistrer } = useLocaleStorage(CLE_STOCKAGE, partie);

  // Getters
  const joueurSelectionneId = computed(() => partie.value.joueurSelectionneId);
  const indicesDeCampagne = computed(() => campagneId => Object.hasOwn(partie.value.indicesParCampagne, campagneId)
    ? [...partie.value.indicesParCampagne[campagneId]] : []);

  // Actions (setters)
  function update(nouvellePartie) {
    if (lectureImpossible.value) throw new Error('Chargement impossible : les données sont conservées.');
    partie.value = JSON.parse(JSON.stringify(nouvellePartie));
  }

  function selectionnerJoueur(id) {
    update({ ...partie.value, joueurSelectionneId: id });
  }

  function definirIndicesCampagne(campagneId, indices) {
    update({
      ...partie.value,
      indicesParCampagne: { ...partie.value.indicesParCampagne, [campagneId]: indices },
    });
  }

  return {
    partie, joueurSelectionneId, indicesDeCampagne,
    update, selectionnerJoueur, definirIndicesCampagne,
    lectureImpossible, enregistrer,
  };
});

export default usePartieStore;
