import { ref, watch } from 'vue';

export default function useLocaleStorage(cle, donnees) {
  const lectureImpossible = ref(false);

  try {
    const texte = globalThis.localStorage.getItem(cle);
    if (texte !== null) {
      const sauvegarde = JSON.parse(texte);
      donnees.value = sauvegarde;
    }
  } catch {
    lectureImpossible.value = true;
  }

  function enregistrer() {
    if (lectureImpossible.value) return false;
    try {
      globalThis.localStorage.setItem(cle, JSON.stringify(donnees.value));
      return true;
    } catch {
      return false;
    }
  }

  watch(donnees, enregistrer, { deep: true });

  return { lectureImpossible, enregistrer };
}
