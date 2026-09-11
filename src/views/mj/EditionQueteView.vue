<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import useQuetesStore from "@/stores/quetes.js";
import useChapitresStore from "@/stores/chapitres.js";
import QueteFormulaire from "@/components/quetes/QueteFormulaire.vue";
import QueteListe from "@/components/quetes/QueteListe.vue";

const quetesStore = useQuetesStore();
const chapitresStore = useChapitresStore();
const route = useRoute();
const router = useRouter();
const { liste: quetes, lectureImpossible } = storeToRefs(quetesStore);
const { liste: chapitres } = storeToRefs(chapitresStore);

const chapitresFormulaire = computed(() => {
	const chapitreId = route.query.chapitreId;
	if (!chapitreId) return chapitres.value;
	return [...chapitres.value].sort((a, b) => (a.id === chapitreId ? -1 : b.id === chapitreId ? 1 : 0));
});
const quetesAffichees = computed(() => route.query.chapitreId
	? quetes.value.filter((quete) => quete.chapitreId === route.query.chapitreId)
	: quetes.value);

const queteEnEdition = ref(null);
const messageStockage = ref(
	lectureImpossible.value
		? "Impossible de récupérer les quêtes déjà sauvegardées, la sauvegarde a peut-être un format trop ancien."
		: "",
);

onMounted(() => {
	if (route.query.queteId) queteEnEdition.value = quetesStore.parId(route.query.queteId);
});

function libelleChapitre(chapitreId) {
	return chapitresStore.parId(chapitreId)?.nom ?? "Chapitre supprimé";
}

function sauvegarder(quete) {
	if (queteEnEdition.value) {
		quetesStore.modifier(queteEnEdition.value.id, quete);
	} else {
		quetesStore.ajouter(quete);
	}
	const succes = quetesStore.enregistrer();
	if (!succes) {
		messageStockage.value = "Erreur de sauvegarde.";
		return;
	}
	if (route.query.chapitreId) router.push({ name: "mj-edition-chapitre", query: { campagneId: chapitresStore.parId(route.query.chapitreId)?.campagneId, chapitreId: route.query.chapitreId } });
	else queteEnEdition.value = null;
}

function modifier(id) {
	queteEnEdition.value = quetesStore.parId(id);
}

function dupliquer(id) {
	const copieId = quetesStore.dupliquer(id);
	quetesStore.modifier(copieId, { recompensesDistribuees: false });
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
    <p v-if="route.query.chapitreId">
      <RouterLink
        :to="{
          name: 'mj-edition-chapitre',
          query: {
            campagneId: route.query.campagneId,
            chapitreId: route.query.chapitreId,
          },
        }"
        >← Retour au chapitre</RouterLink
      >
    </p>
    <h1>
      {{ route.query.chapitreId ? `Quêtes du chapitre ${libelleChapitre(route.query.chapitreId)}` : "Quêtes" }}
    </h1>
    <p v-if="messageStockage" role="alert">{{ messageStockage }}</p>
    <div v-if="route.query.chapitreId" class="progression">
      <span
        >Quêtes terminées :
        {{ quetesAffichees.filter((quete) => quete.etat === "terminee").length }}
        / {{ quetesAffichees.length }}</span
      >
      <div class="barre">
        <span
          :style="{
            width: `${quetesAffichees.length ? (quetesAffichees.filter((quete) => quete.etat === 'terminee').length / quetesAffichees.length) * 100 : 0}%`,
          }"
        ></span>
      </div>
    </div>

    <div class="colonnes">
      <section aria-label="Liste des quêtes">
        <p v-if="quetesAffichees.length === 0">Pas encore de quête enregistrée, le formulaire ci-dessous permet d'en créer une.</p>
        <QueteListe v-else :quetes="quetesAffichees" :libelle-chapitre="libelleChapitre" @modifier="modifier" @dupliquer="dupliquer" @supprimer="supprimer" />
      </section>

      <QueteFormulaire
        :key="queteEnEdition ? queteEnEdition.id : 'nouvelle'"
        :quete="queteEnEdition"
        :chapitres="chapitresFormulaire"
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
.quetes-page > p a {
	color: var(--texte);
}
.progression {
	margin: 1rem 0;
	color: var(--texte-secondaire);
}
.barre {
	height: .6rem;
	margin-top: .5rem;
	overflow: hidden;
	border-radius: 999px;
	background: #19152a;
}
.barre span {
	display: block;
	height: 100%;
	border-radius: inherit;
	background: linear-gradient(90deg, var(--violet), var(--or));
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
