<script setup>
defineProps({ campagnes: { type: Array, required: true } });
const emit = defineEmits(["modifier", "dupliquer", "supprimer"]);
</script>

<template>
	<ul>
		<li v-for="campagne in campagnes" :key="campagne.id">
			<h2>{{ campagne.nom }}</h2>
			<p>État : {{ campagne.etat }}</p>
			<p>{{ campagne.description || "Aucune description." }}</p>
			<details v-if="campagne.commentaire">
				<summary>Commentaire MJ</summary>
				<p>{{ campagne.commentaire }}</p>
			</details>
			<div class="actions">
				<button type="button" :aria-label="`Modifier ${campagne.nom}`" @click="emit('modifier', campagne.id)">
					Modifier
				</button>
				<button type="button" :aria-label="`Dupliquer ${campagne.nom}`" @click="emit('dupliquer', campagne.id)">
					Dupliquer
				</button>
				<button type="button" :aria-label="`Supprimer ${campagne.nom}`" @click="emit('supprimer', campagne.id)">
					Supprimer
				</button>
			</div>
		</li>
	</ul>
</template>

<style scoped>
ul {
	list-style: none;
	padding: 0;
}

li {
	margin-bottom: 1rem;
	padding: 0.75rem;
	border: 1px solid #ddd;
	border-radius: 4px;
}

h2 {
	margin: 0 0 0.25rem;
	font-size: 1.1rem;
}

.actions {
	display: flex;
	gap: 0.5rem;
	margin-top: 0.5rem;
}
</style>
