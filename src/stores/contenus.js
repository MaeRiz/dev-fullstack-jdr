import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import useLocaleStorage from '../composables/useLocaleStorage.js';

// Constante de stockage
export const CLE_STOCKAGE = 'jdr-contenus';

const useContenusStore = defineStore('contenus', () => {
  // States
  const liste = ref([]);
  // Persistance : lectureImpossible est un state.
  // enregistrer est une action de sauvegarde.
  const { lectureImpossible, enregistrer } = useLocaleStorage(CLE_STOCKAGE, liste);

  // Getters
  const parId = computed(() => id => liste.value.find(element => element.id === id) ?? null);
  const lieux = computed(() => liste.value.filter(contenu => contenu.type === 'lieu' && !contenu.archive));
  const objets = computed(() => liste.value.filter(contenu => contenu.type === 'objet' && !contenu.archive));
  const indices = computed(() => liste.value.filter(contenu => contenu.type === 'indice' && !contenu.archive));

  // Actions (setters)
  function ajouter(element) {
    if (lectureImpossible.value) throw new Error('Chargement impossible : les données sont conservées.');
    const nouveau = { ...JSON.parse(JSON.stringify(element)), id: crypto.randomUUID() };
    liste.value.push(nouveau);
    return nouveau.id;
  }

  function modifier(id, changements) {
    if (lectureImpossible.value) throw new Error('Chargement impossible : les données sont conservées.');
    const index = liste.value.findIndex(element => element.id === id);
    if (index === -1) throw new Error('Élément introuvable.');
    liste.value.splice(index, 1, { ...liste.value[index], ...JSON.parse(JSON.stringify(changements)), id });
  }

  function supprimer(id) {
    if (lectureImpossible.value) throw new Error('Chargement impossible : les données sont conservées.');
    const index = liste.value.findIndex(element => element.id === id);
    if (index === -1) throw new Error('Élément introuvable.');
    liste.value.splice(index, 1);
  }

  return {
    liste, parId, lieux, objets, indices,
    ajouter, modifier, supprimer,
    lectureImpossible, enregistrer,
  };
});

export default useContenusStore;
