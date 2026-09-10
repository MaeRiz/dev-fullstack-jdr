<script setup>
defineProps({
	quetes: { type: Array, required: true },
	libelleChapitre: { type: Function, default: () => "" },
});
const emit = defineEmits(["modifier", "dupliquer", "supprimer"]);
</script>

<template>
	<ul>
		<li v-for="quete in quetes" :key="quete.id">
			<h2>{{ quete.nom }}</h2>
			<p>Chapitre : {{ libelleChapitre(quete.chapitreId) }}</p>
			<p>État : {{ quete.etat }}</p>
			<p v-if="quete.lieu">Lieu : {{ quete.lieu }}</p>
			<p class="description">{{ quete.description || "Aucune description." }}</p>
			<details v-if="quete.commentaire">
				<summary>Commentaire MJ</summary>
				<p class="description">{{ quete.commentaire }}</p>
			</details>
			<div class="actions">
				<button type="button" :aria-label="`Modifier ${quete.nom}`" @click="emit('modifier', quete.id)">
					Modifier
				</button>
				<button type="button" :aria-label="`Dupliquer ${quete.nom}`" @click="emit('dupliquer', quete.id)">
					Dupliquer
				</button>
				<button
					type="button"
					class="supprimer"
					:aria-label="`Supprimer ${quete.nom}`"
					@click="emit('supprimer', quete.id)"
				>
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
