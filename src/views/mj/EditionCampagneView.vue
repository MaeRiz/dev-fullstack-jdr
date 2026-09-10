<script setup>
import { ref, watch } from "vue";
import CampagneFormulaire from "@/components/campagnes/CampagneFormulaire.vue";
import CampagneListe from "@/components/campagnes/CampagneListe.vue";

const campagnes = ref([]);
const campagneEnEdition = ref(null);
const messageStockage = ref("");
const cleStockage = "jdr-campagnes";

// on ne fait pas confiance direct au localStorage, un vieux format planterait tout le reste
try {
	const sauvegarde = JSON.parse(localStorage.getItem(cleStockage) || "[]");
	const valide =
		Array.isArray(sauvegarde) &&
		sauvegarde.every(
			(campagne) =>
				campagne &&
				typeof campagne.id === "string" &&
				typeof campagne.nom === "string" &&
				["brouillon", "disponible", "active"].includes(campagne.etat) &&
				typeof campagne.description === "string" &&
				typeof campagne.commentaire === "string",
		);
	if (!valide) throw new Error("Sauvegarde invalide");
	campagnes.value = sauvegarde;
} catch {
	messageStockage.value =
		"La liste de campagnes sauvegardée ne peut pas être chargée. Les prochains changements remplaceront cette sauvegarde.";
}

function sauvegarder(campagne) {
	if (campagneEnEdition.value) {
		const index = campagnes.value.findIndex(({ id }) => id === campagneEnEdition.value.id);
		if (index === -1) return;
		campagnes.value.splice(index, 1, { ...campagne, id: campagneEnEdition.value.id });
	} else {
		campagnes.value.push({ ...campagne, id: crypto.randomUUID() });
	}
	campagneEnEdition.value = null;
}

function modifier(id) {
	campagneEnEdition.value = campagnes.value.find((campagne) => campagne.id === id);
}

function dupliquer(id) {
	const campagne = campagnes.value.find((element) => element.id === id);
	if (!campagne) return;
	campagnes.value.push({ ...campagne, id: crypto.randomUUID(), nom: `${campagne.nom} (copie)` });
}

function supprimer(id) {
	const index = campagnes.value.findIndex((campagne) => campagne.id === id);
	if (index === -1 || !confirm(`Supprimer « ${campagnes.value[index].nom} » ?`)) return;
	campagnes.value.splice(index, 1);
	if (campagneEnEdition.value?.id === id) campagneEnEdition.value = null;
}

watch(
	campagnes,
	(nouvelleValeur) => {
		try {
			localStorage.setItem(cleStockage, JSON.stringify(nouvelleValeur));
			messageStockage.value = "";
		} catch {
			messageStockage.value =
				"Sauvegarde impossible dans ce navigateur. Les changements restent disponibles uniquement pendant cette session.";
		}
	},
	{ deep: true },
);
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
