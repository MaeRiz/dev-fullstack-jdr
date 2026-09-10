<script setup>
defineProps({ quetes: { type: Array, required: true } });
const emit = defineEmits(["modifier", "dupliquer", "supprimer"]);
</script>

<template>
	<ul>
		<li v-for="quete in quetes" :key="quete.id">
			<h2>{{ quete.nom }}</h2>
			<p>État : {{ quete.etat }}</p>
			<p v-if="quete.lieu">Lieu : {{ quete.lieu }}</p>
			<p>{{ quete.description || "Aucune description." }}</p>
			<details v-if="quete.commentaire">
				<summary>Commentaire MJ</summary>
				<p>{{ quete.commentaire }}</p>
			</details>
			<div class="actions">
				<button type="button" :aria-label="`Modifier ${quete.nom}`" @click="emit('modifier', quete.id)">
					Modifier
				</button>
				<button type="button" :aria-label="`Dupliquer ${quete.nom}`" @click="emit('dupliquer', quete.id)">
					Dupliquer
				</button>
				<button type="button" :aria-label="`Supprimer ${quete.nom}`" @click="emit('supprimer', quete.id)">
					Supprimer
				</button>
			</div>
		</li>
	</ul>
</template>

<style scoped>
ul {
	padding: 0;
	list-style: none;
}

li {
	margin-bottom: 0.9rem;
	padding: 0.75rem;
	border: 1px solid #ddd;
	border-radius: 6px;
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
