<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import useCampagnesStore from "@/stores/campagnes.js";
import useChapitresStore from "@/stores/chapitres.js";
import useQuetesStore from "@/stores/quetes.js";
import CampagneFormulaire from "@/components/campagnes/CampagneFormulaire.vue";
import CampagneListe from "@/components/campagnes/CampagneListe.vue";

const campagnesStore = useCampagnesStore();
const chapitresStore = useChapitresStore();
const quetesStore = useQuetesStore();
const { liste: campagnes, lectureImpossible } = storeToRefs(campagnesStore);

const campagneEnEdition = ref(null);
const messageStockage = ref(
	lectureImpossible.value
		? "La liste de campagnes sauvegardée ne peut pas être chargée. Les prochains changements remplaceront cette sauvegarde."
		: "",
);

function compterChapitres(campagneId) {
	return chapitresStore.parCampagne(campagneId).length;
}

function sauvegarder(campagne) {
	if (campagneEnEdition.value) {
		campagnesStore.modifier(campagneEnEdition.value.id, campagne);
	} else {
		campagnesStore.ajouter(campagne);
	}
	if (!campagnesStore.enregistrer()) {
		messageStockage.value = "Erreur de sauvegarde.";
	}
	campagneEnEdition.value = null;
}

function modifier(id) {
	campagneEnEdition.value = campagnesStore.parId(id);
}

function dupliquer(id) {
	campagnesStore.dupliquer(id);
	campagnesStore.enregistrer();
}

function supprimer(id) {
	const campagne = campagnesStore.parId(id);
	if (!campagne || !confirm(`Supprimer « ${campagne.nom} » et tous ses chapitres & quêtes ?`)) return;

	// suppression en cascade : les chapitres de la campagne, puis les quêtes de ces chapitres
	for (const chapitre of chapitresStore.parCampagne(id)) {
		quetesStore.supprimerParChapitre(chapitre.id);
	}
	chapitresStore.supprimerParCampagne(id);
	campagnesStore.supprimer(id);

	campagnesStore.enregistrer();
	chapitresStore.enregistrer();
	quetesStore.enregistrer();

	if (campagneEnEdition.value?.id === id) campagneEnEdition.value = null;
}
</script>

<template>
	<main class="campagnes-page">
		<h1>Fiche campagne</h1>
		<p v-if="messageStockage" role="alert">{{ messageStockage }}</p>

		<div class="colonnes">
			<section aria-label="Liste des campagnes">
				<p v-if="campagnes.length === 0">
					Aucune campagne pour le moment. Utilisez le formulaire pour en ajouter une.
				</p>
				<CampagneListe
					v-else
					:campagnes="campagnes"
					:compter-chapitres="compterChapitres"
					@modifier="modifier"
					@dupliquer="dupliquer"
					@supprimer="supprimer"
				/>
			</section>

			<CampagneFormulaire
				:key="campagneEnEdition ? campagneEnEdition.id : 'nouvelle'"
				:campagne="campagneEnEdition"
				@sauvegarde="sauvegarder"
				@annuler="campagneEnEdition = null"
			/>
		</div>
	</main>
</template>

<style scoped>
.campagnes-page {
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
