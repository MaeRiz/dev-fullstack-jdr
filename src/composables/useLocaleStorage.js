import { ref, watch } from 'vue';

let suspension = 0;
// Les actions de jeu enregistrent plusieurs listes ensemble avant de mettre à
// jour les stores : ne pas déclencher d'écritures intermédiaires à ce moment-là.
export function sansPersistance(action) {
  suspension++;
  try { return action(); } finally { suspension--; }
}

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
    if (suspension) return true;
    if (lectureImpossible.value) return false;
    try {
      globalThis.localStorage.setItem(cle, JSON.stringify(donnees.value));
      return true;
    } catch {
      return false;
    }
  }

  watch(donnees, enregistrer, { deep: true, flush: 'sync' });

  return { lectureImpossible, enregistrer };
}
