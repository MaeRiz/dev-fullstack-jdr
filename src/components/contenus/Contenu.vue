<script setup>
defineProps({ contenu: { type: Object, required: true } });
const emit = defineEmits(['modifier', 'dupliquer', 'supprimer']);
</script>

<template>
  <li>
  <h2>{{ contenu.nom }}</h2>
  <p class="description">{{ (contenu.type === 'indice' ? contenu.texte : contenu.description) || 'Aucun détail renseigné.' }}</p>
  <details v-if="contenu.commentaire">
    <summary>Commentaire MJ</summary>
    <p class="description">{{ contenu.commentaire }}</p>
  </details>
  <div class="actions">
    <button type="button" class="btn secondary" :aria-label="`Modifier ${contenu.nom}`" @click="emit('modifier', contenu.id)">Modifier</button>
    <button type="button" class="btn secondary" :aria-label="`Dupliquer ${contenu.nom}`" @click="emit('dupliquer', contenu.id)">Dupliquer</button>
    <button type="button" class="btn supprimer" :aria-label="`Supprimer ${contenu.nom}`" @click="emit('supprimer', contenu.id)">Supprimer</button>
  </div>
  </li>
</template>

<style scoped>
li {
	margin-bottom: 1rem;
	padding: 1rem;
	border: 1px solid var(--bordure);
	border-radius: 6px;
	overflow-wrap: anywhere;
}
h2 {
	margin-top: 0;
	font-size: 1.2rem;
}
.description {
	white-space: pre-wrap;
}
summary {
	cursor: pointer;
}
.actions {
	margin-top: 1rem;
}
</style>
