<script setup>
import { ref, watch } from 'vue';
import useLectureStore from '@/stores/lecture';
import ActionJoueur from '@/components/ActionJoueur.vue';
const lecture = useLectureStore();
const destination = ref('');
watch(() => lecture.lieuActuel?.id, id => { destination.value = lecture.lieux.some(lieu => lieu.id === id) ? id : ''; }, { immediate: true });
</script>

<template>
  <section aria-labelledby="titre-actions">
    <h2 id="titre-actions">Mes actions</h2>
    <p v-if="!lecture.personnage" class="vide-joueur">Choisis ton personnage pour agir dans la campagne.</p>
    <div v-else>
      <article class="carte-joueur">
        <h3>Se déplacer</h3>
        <p>Lieu actuel : {{ lecture.lieuActuel?.nom ?? "Aucun" }}</p>
        <p v-if="lecture.lieuActuel?.description" class="texte-joueur">{{ lecture.lieuActuel.description }}</p>
        <p v-if="!lecture.lieux.length">Aucun lieu disponible. Le MJ doit préparer les lieux de l’aventure.</p>
        <form v-else @submit.prevent="lecture.executer({ type: 'deplacer', id: destination })">
          <label for="destination-joueur"
            >Destination<select id="destination-joueur" v-model="destination" required>
              <option value="" disabled>Choisir un lieu</option>
              <option v-for="lieu in lecture.lieux" :key="lieu.id" :value="lieu.id">
                {{ lieu.nom }}
              </option>
            </select></label
          >
          <button type="submit" :disabled="!destination || destination === lecture.lieuActuel?.id">Se déplacer</button>
        </form>
      </article>
      <h2>Chapitres</h2>
      <p>Utilise le code donné par le MJ ou découvert pendant l’aventure.</p>
      <p v-if="!lecture.actionsChapitres.length">Aucun chapitre à activer ou à terminer pour le moment.</p>
      <div class="grille-joueur">
        <ActionJoueur v-for="action in lecture.actionsChapitres" :key="`${action.type}-${action.id}`" :action="action" />
      </div>
      <h2>Quêtes dans mon lieu</h2>
      <p v-if="!lecture.actionsQuetes.length">Aucune quête disponible ici dans un chapitre actif.</p>
      <div class="grille-joueur">
        <ActionJoueur v-for="action in lecture.actionsQuetes" :key="`${action.type}-${action.id}`" :action="action" />
      </div>
    </div>
  </section>
</template>
