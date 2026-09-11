import { ref } from 'vue';
import { chargerEtatJeu } from '../services/lectureJoueur.js';

// Les formulaires MJ existants écrivent encore directement dans localStorage.
// Relire à leur ouverture évite de conserver une ancienne liste entre deux vues.
export default function useReferencesJeu() {
  const references = ref({ campagnes: [], chapitres: [], quetes: [], contenus: [] });
  const erreurReferences = ref('');
  try { references.value = chargerEtatJeu(); }
  catch { erreurReferences.value = 'Impossible de charger les références de la partie. Recharge la page après vérification des données.'; }
  return { references, erreurReferences };
}
