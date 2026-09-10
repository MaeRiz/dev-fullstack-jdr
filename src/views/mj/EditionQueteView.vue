<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import useQuetesStore from "@/stores/quetes.js";
import useChapitresStore from "@/stores/chapitres.js";
import QueteFormulaire from "@/components/quetes/QueteFormulaire.vue";
import QueteListe from "@/components/quetes/QueteListe.vue";

const quetesStore = useQuetesStore();
const chapitresStore = useChapitresStore();
const { liste: quetes, lectureImpossible } = storeToRefs(quetesStore);
const { liste: chapitres } = storeToRefs(chapitresStore);

const queteEnEdition = ref(null);
const messageStockage = ref(
	lectureImpossible.value
		? "Impossible de récupérer les quêtes déjà sauvegardées, la sauvegarde a peut-être un format trop ancien."
		: "",
);

function libelleChapitre(chapitreId) {
	return chapitresStore.parId(chapitreId)?.nom ?? "Chapitre supprimé";
}

function sauvegarder(quete) {
	if (queteEnEdition.value) {
		quetesStore.modifier(queteEnEdition.value.id, quete);
	} else {
		quetesStore.ajouter(quete);
	}
	if (!quetesStore.enregistrer()) {
		messageStockage.value = "Erreur de sauvegarde.";
	}
	queteEnEdition.value = null;
}

function modifier(id) {
	queteEnEdition.value = quetesStore.parId(id);
}

function dupliquer(id) {
	quetesStore.dupliquer(id);
	quetesStore.enregistrer();
}

function supprimer(id) {
	const quete = quetesStore.parId(id);
	if (!quete) return;

	const confirmation = confirm(`Supprimer « ${quete.nom} » ?`);
	if (!confirmation) return;

	quetesStore.supprimer(id);
	quetesStore.enregistrer();
	if (queteEnEdition.value?.id === id) queteEnEdition.value = null;
}
</script>

<template>
	<main class="quetes-page">
		<h1>Quêtes</h1>
		<p v-if="messageStockage" role="alert">{{ messageStockage }}</p>

		<div class="colonnes">
			<section aria-label="Liste des quêtes">
				<p v-if="quetes.length === 0">
					Pas encore de quête enregistrée, le formulaire ci-dessous permet d'en créer une.
				</p>
				<QueteListe
					v-else
					:quetes="quetes"
					:libelle-chapitre="libelleChapitre"
					@modifier="modifier"
					@dupliquer="dupliquer"
					@supprimer="supprimer"
				/>
			</section>

			<QueteFormulaire
				:key="queteEnEdition ? queteEnEdition.id : 'nouvelle'"
				:quete="queteEnEdition"
				:chapitres="chapitres"
				@sauvegarde="sauvegarder"
				@annuler="queteEnEdition = null"
			/>
		</div>
	</main>
</template>

<style scoped>
.quetes-page {
	max-width: 1100px;
	margin: auto;
	padding: 1.5rem;
}

.colonnes {
	display: grid;
	grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
	align-items: start;
	gap: 1.5rem;
}

@media (max-width: 700px) {
	.colonnes {
		grid-template-columns: 1fr;
	}
}
</style>
