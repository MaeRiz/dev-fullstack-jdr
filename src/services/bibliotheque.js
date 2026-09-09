import { computed, ref } from 'vue';
import { chargerContenus, sauvegarderContenus, contenusDisponibles } from './contenus.js';

const contenus = ref([]);
const erreurBibliotheque = ref('');
const lectureImpossible = ref(false);
const objetsBibliotheque = computed(() => contenusDisponibles(contenus.value, 'objet'));
const indicesBibliotheque = computed(() => contenusDisponibles(contenus.value, 'indice'));

export function utiliserBibliotheque() {
  try {
    contenus.value = chargerContenus();
    lectureImpossible.value = false;
    erreurBibliotheque.value = '';
  } catch {
    lectureImpossible.value = true;
    erreurBibliotheque.value = 'Impossible de lire la bibliothèque. Les données sont conservées ; vérifie le stockage puis recharge la page.';
  }
  return { contenus, objetsBibliotheque, indicesBibliotheque, erreurBibliotheque, lectureImpossible, enregistrerContenus };
}

function enregistrerContenus(liste) {
  if (lectureImpossible.value) return false;
  try {
    sauvegarderContenus(liste);
    contenus.value = liste;
    erreurBibliotheque.value = '';
    return true;
  } catch {
    erreurBibliotheque.value = 'Sauvegarde impossible. Les changements ne sont pas enregistrés ; tu peux réessayer.';
    return false;
  }
}
