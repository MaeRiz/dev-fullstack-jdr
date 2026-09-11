<script setup>
import { ref } from 'vue';
import useLectureStore from '@/stores/lecture';
const props = defineProps({ action: { type: Object, required: true } });
const lecture = useLectureStore();
const motDePasse = ref('');
function envoyer() {
  if (lecture.executer({ type: props.action.type, id: props.action.id, motDePasse: motDePasse.value })) motDePasse.value = '';
}
</script>

<template>
  <article class="carte-joueur">
    <h3>{{ action.nom }}</h3>
    <form @submit.prevent="envoyer">
      <label v-if="action.motDePasseRequis" :for="`code-${action.type}-${action.id}`">Mot de passe
        <input :id="`code-${action.type}-${action.id}`" v-model="motDePasse" type="password" autocomplete="off" required />
      </label>
      <p v-else>Cette quête peut être activée sans mot de passe.</p>
      <button type="submit">{{ action.type.startsWith('activer') ? 'Activer' : 'Terminer' }} {{ action.type.endsWith('chapitre') ? 'le chapitre' : 'la quête' }}</button>
    </form>
  </article>
</template>
