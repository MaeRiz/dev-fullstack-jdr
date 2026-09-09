<script setup>
defineProps({ contenus: { type: Array, required: true } });
const emit = defineEmits(['modifier', 'dupliquer', 'supprimer']);
</script>

<template>
  <ul class="contenus">
    <li v-for="contenu in contenus" :key="contenu.id">
      <h2>{{ contenu.nom }}</h2>
      <p class="description">{{ (contenu.type === 'indice' ? contenu.texte : contenu.description) || 'Aucun détail renseigné.' }}</p>
      <details v-if="contenu.commentaire">
        <summary>Commentaire MJ</summary>
        <p class="description">{{ contenu.commentaire }}</p>
      </details>
      <div class="actions">
        <button type="button" :aria-label="`Modifier ${contenu.nom}`" @click="emit('modifier', contenu.id)">Modifier</button>
        <button type="button" :aria-label="`Dupliquer ${contenu.nom}`" @click="emit('dupliquer', contenu.id)">Dupliquer</button>
        <button type="button" class="supprimer" :aria-label="`Supprimer ${contenu.nom}`" @click="emit('supprimer', contenu.id)">Supprimer</button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.contenus {
  padding: 0;
  list-style: none;
}

li {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #ddd;
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
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 0.75rem;
  border: 1px solid #999;
  border-radius: 4px;
  background: white;
  color: #263238;
  font: inherit;
  cursor: pointer;
}

button.supprimer {
  border-color: #c99393;
  color: #a02020;
}
</style>
