<script setup>
import OrdreControls from "@/components/OrdreControls.vue";
defineProps({
	quetes: { type: Array, required: true },
	libelleChapitre: { type: Function, default: () => "" },
	ordre: { type: Array, default: null },
});
const emit = defineEmits(["modifier", "dupliquer", "supprimer", "deplacer"]);
</script>

<template>
	<ul>
		<li v-for="quete in quetes" :key="quete.id" :class="{ 'avec-ordre': ordre }">
			<OrdreControls v-if="ordre" :haut-desactive="ordre.findIndex((element) => element.id === quete.id) === 0" :bas-desactive="ordre.findIndex((element) => element.id === quete.id) === ordre.length - 1" :nom="quete.nom" @deplacer="emit('deplacer', quete.id, $event)" />
			<div class="contenu-quete">
				<h2>{{ quete.nom }}</h2>
				<p>Chapitre : {{ libelleChapitre(quete.chapitreId) }}</p>
				<p><span class="badge" :class="quete.etat">{{ quete.etat }}</span></p>
				<p v-if="quete.lieu">Lieu : {{ quete.lieu }}</p>
				<p class="description">{{ quete.description || "Aucune description." }}</p>
				<details v-if="quete.commentaire"><summary>Commentaire MJ</summary><p class="description">{{ quete.commentaire }}</p></details>
				<div class="actions">
					<button type="button" class="btn secondary" :aria-label="`Modifier ${quete.nom}`" @click="emit('modifier', quete.id)">Modifier</button>
					<button type="button" class="btn secondary" :aria-label="`Dupliquer ${quete.nom}`" @click="emit('dupliquer', quete.id)">Dupliquer</button>
					<button type="button" class="btn supprimer" :aria-label="`Supprimer ${quete.nom}`" @click="emit('supprimer', quete.id)">Supprimer</button>
				</div>
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
	border: 1px solid var(--bordure);
	border-radius: 6px;
	overflow-wrap: anywhere;
}
li.avec-ordre {
	display: grid;
	grid-template-columns: 2.5rem minmax(0, 1fr);
	gap: 1rem;
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
