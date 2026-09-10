<script setup>
import { ref, watch } from "vue";
import QueteFormulaire from "@/components/quetes/QueteFormulaire.vue";
import QueteListe from "@/components/quetes/QueteListe.vue";

const etatsValides = ["inactive", "active", "terminee", "abandonnee"];

// pas encore de lien vers un chapitre/une campagne, ce sera à faire quand ces vues existeront
const quetes = ref([]);
const queteEnEdition = ref(null);
const messageStockage = ref("");
const cleStockage = "jdr-quetes";

try {
	const sauvegarde = JSON.parse(localStorage.getItem(cleStockage) || "[]");
	const valide =
		Array.isArray(sauvegarde) &&
		sauvegarde.every(
			(quete) =>
				quete &&
				typeof quete.id === "string" &&
				typeof quete.nom === "string" &&
				etatsValides.includes(quete.etat) &&
				typeof quete.description === "string" &&
				typeof quete.lieu === "string" &&
				typeof quete.commentaire === "string" &&
				typeof quete.motDePasseActivation === "string" &&
				typeof quete.motDePasseResolution === "string" &&
				typeof quete.recompense === "string",
		);
	if (!valide) throw new Error("Sauvegarde invalide");
	quetes.value = sauvegarde;
} catch {
	messageStockage.value =
		"Impossible de récupérer les quêtes déjà sauvegardées, la sauvegarde a peut-être un format trop ancien.";
}

function sauvegarder(quete) {
	if (queteEnEdition.value) {
		const index = quetes.value.findIndex((q) => q.id === queteEnEdition.value.id);
		if (index === -1) return;
		quetes.value.splice(index, 1, { ...quete, id: queteEnEdition.value.id });
	} else {
		quetes.value.push({ ...quete, id: crypto.randomUUID() });
	}
	queteEnEdition.value = null;
}

function modifier(id) {
	queteEnEdition.value = quetes.value.find((quete) => quete.id === id);
}

function dupliquer(id) {
	const original = quetes.value.find((quete) => quete.id === id);
	if (!original) return;
	quetes.value.push({ ...original, id: crypto.randomUUID(), nom: `${original.nom} (copie)` });
}

function supprimer(id) {
	const index = quetes.value.findIndex((quete) => quete.id === id);
	if (index === -1) return;

	const confirmation = confirm(`Supprimer « ${quetes.value[index].nom} » ?`);
	if (!confirmation) return;

	quetes.value.splice(index, 1);
	if (queteEnEdition.value?.id === id) queteEnEdition.value = null;
}

watch(
	quetes,
	(nouvelleValeur) => {
		try {
			localStorage.setItem(cleStockage, JSON.stringify(nouvelleValeur));
			messageStockage.value = "";
		} catch {
			messageStockage.value =
				"Le navigateur refuse d'enregistrer, tes changements resteront visibles mais seulement pour cette session.";
		}
	},
	{ deep: true },
);
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
					@modifier="modifier"
					@dupliquer="dupliquer"
					@supprimer="supprimer"
				/>
			</section>

			<QueteFormulaire
				:key="queteEnEdition ? queteEnEdition.id : 'nouvelle'"
				:quete="queteEnEdition"
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
