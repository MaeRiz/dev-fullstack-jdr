<script setup>
import Contenu from './Contenu.vue';

defineProps({ contenus: { type: Array, required: true } });
const emit = defineEmits(['modifier', 'dupliquer', 'supprimer']);
</script>

<template>
  <ul class="contenus">
    <Contenu v-for="contenu in contenus" :key="contenu.id"
      :contenu="contenu"
      @modifier="emit('modifier', $event)"
      @dupliquer="emit('dupliquer', $event)"
      @supprimer="emit('supprimer', $event)" />
  </ul>
</template>

<style scoped>
.contenus {
	padding: 0;
	list-style: none;
}
</style>
