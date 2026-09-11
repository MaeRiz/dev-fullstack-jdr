<script setup>
defineProps({
	campagnes: { type: Array, required: true },
	compterChapitres: { type: Function, default: () => 0 },
});
const emit = defineEmits(["modifier", "dupliquer", "supprimer", "exporter"]);
</script>

<template>
	<ul>
		<li v-for="campagne in campagnes" :key="campagne.id">
			<h2>{{ campagne.nom }}</h2>
			<p>État : {{ campagne.etat }}</p>
			<p>{{ compterChapitres(campagne.id) }} chapitre(s)</p>
			<p class="description">{{ campagne.description || "Aucune description." }}</p>
			<details v-if="campagne.commentaire">
				<summary>Commentaire MJ</summary>
				<p class="description">{{ campagne.commentaire }}</p>
			</details>
			<div class="actions">
				<button type="button" :aria-label="`Modifier ${campagne.nom}`" @click="emit('modifier', campagne.id)">
					Modifier
				</button>
				<button type="button" :aria-label="`Dupliquer ${campagne.nom}`" @click="emit('dupliquer', campagne.id)">
					Dupliquer
				</button>
				<button type="button" :aria-label="`Exporter ${campagne.nom}`" @click="emit('exporter', campagne.id)">
					Exporter
				</button>
				<button
					type="button"
					class="supprimer"
					:aria-label="`Supprimer ${campagne.nom}`"
					@click="emit('supprimer', campagne.id)"
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
