<script setup>
import { computed, ref } from 'vue';
import useLectureStore from '@/stores/lecture';
const lecture = useLectureStore();
const recherche = ref('');
const statut = ref('');
const etats = { actif: 'Actif', termine: 'Terminé', active: 'Active', terminee: 'Terminée', abandonnee: 'Abandonnée' };
const progression = computed(() => {
  const texte = recherche.value.trim().toLocaleLowerCase('fr');
  return lecture.progression.map(chapitre => {
    const correspond = chapitre.nom.toLocaleLowerCase('fr').includes(texte);
    const quetes = chapitre.quetes.filter(quete => (!statut.value || quete.etat === statut.value) && (correspond || quete.nom.toLocaleLowerCase('fr').includes(texte)));
    return { ...chapitre, quetes, visible: (correspond && !statut.value) || quetes.length > 0 };
  }).filter(chapitre => chapitre.visible);
});
</script>

<template>
  <section aria-labelledby="titre-progression">
    <h2 id="titre-progression">Suivi de partie</h2>
    <p>Retrouve les chapitres en cours ou terminés et l’avancement de leurs quêtes.</p>
    <div class="grille-joueur">
      <label for="recherche-progression"
        >Rechercher par titre<input id="recherche-progression" v-model="recherche" type="search" placeholder="Titre d’un chapitre ou d’une quête"
      /></label>
      <label for="statut-quetes"
        >Statut des quêtes<select id="statut-quetes" v-model="statut">
          <option value="">Tous les statuts visibles</option>
          <option value="active">Actives</option>
          <option value="terminee">Terminées</option>
          <option value="abandonnee">Abandonnées</option>
        </select></label
      >
    </div>
    <p v-if="!lecture.progression.length" class="vide-joueur">Aucun chapitre commencé. Ouvre les actions pour activer un chapitre avec son code.</p>
    <p v-else-if="!progression.length" class="vide-joueur">Aucun résultat pour ces filtres.</p>
    <div class="grille-joueur">
      <article v-for="chapitre in progression" :key="chapitre.id" class="carte-joueur">
        <span class="etat-joueur">{{ etats[chapitre.etat] }}</span>
        <h3>{{ chapitre.nom }}</h3>
        <details>
          <summary>Détails du chapitre</summary>
          <p class="texte-joueur">{{ chapitre.description || "Aucune description." }}</p>
          <div v-if="chapitre.recompenses.length">
            <p>Récompenses distribuées :</p>
            <ul>
              <li v-for="(recompense, index) in chapitre.recompenses" :key="index">
                {{ recompense }}
              </li>
            </ul>
          </div>
        </details>
        <h4>Quêtes</h4>
        <p v-if="!chapitre.quetes.length">Aucune quête visible pour ces filtres.</p>
        <ol v-else>
          <li v-for="quete in chapitre.quetes" :key="quete.id">
            <details>
              <summary>{{ quete.nom }} — {{ etats[quete.etat] }}</summary>
              <p class="texte-joueur">{{ quete.description || "Aucune description." }}</p>
              <p>Lieu : {{ quete.lieu }}</p>
              <div v-if="quete.recompenses.length">
                <p>Récompenses distribuées :</p>
                <ul>
                  <li v-for="(recompense, index) in quete.recompenses" :key="index">
                    {{ recompense }}
                  </li>
                </ul>
              </div>
            </details>
          </li>
        </ol>
      </article>
    </div>
  </section>
</template>
