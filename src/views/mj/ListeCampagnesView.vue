<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import useCampagnesStore from "@/stores/campagnes.js";
import useChapitresStore from "@/stores/chapitres.js";
import useQuetesStore from "@/stores/quetes.js";
import useJoueursStore from "@/stores/joueurs.js";
import CampagneListe from "@/components/campagnes/CampagneListe.vue";
import { convertirExport, importerCampagne, lireImport } from "@/services/importExport.js";

const router = useRouter();
const campagnesStore = useCampagnesStore();
const chapitresStore = useChapitresStore();
const quetesStore = useQuetesStore();
const joueursStore = useJoueursStore();
const { liste: campagnes, lectureImpossible } = storeToRefs(campagnesStore);
const fichierImport = ref(null);
const message = ref(lectureImpossible.value ? "La liste de campagnes ne peut pas être chargée." : "");

function compterChapitres(campagneId) {
  return chapitresStore.parCampagne(campagneId).length;
}

function progression(campagneId) {
  const liste = chapitresStore.parCampagne(campagneId);
  return { termines: liste.filter((chapitre) => chapitre.etat === "termine").length, total: liste.length };
}

function compterQuetesTerminees(campagneId) {
  const ids = new Set(chapitresStore.parCampagne(campagneId).map((chapitre) => chapitre.id));
  return quetesStore.liste.filter((quete) => ids.has(quete.chapitreId) && quete.etat === "terminee").length;
}

function compterJoueurs(campagneId) {
  return joueursStore.parCampagne(campagneId).length;
}

function creer() {
  router.push({ name: "mj-edition-campagne" });
}

function modifier(id) {
  router.push({ name: "mj-gestion-campagne", params: { campagneId: id } });
}

function dupliquer(id) {
  try {
    campagnesStore.dupliquer(id);
    campagnesStore.enregistrer();
  } catch (erreur) {
    message.value = erreur.message;
  }
}

function supprimer(id) {
  const campagne = campagnesStore.parId(id);
  if (!campagne || !confirm(`Supprimer « ${campagne.nom} » et tous ses chapitres et quêtes ?`)) return;
  for (const chapitre of chapitresStore.parCampagne(id)) {
    quetesStore.supprimerParChapitre(chapitre.id);
  }
  chapitresStore.supprimerParCampagne(id);
  campagnesStore.supprimer(id);
  campagnesStore.enregistrer();
  chapitresStore.enregistrer();
  quetesStore.enregistrer();
}

function exporter(id) {
  try {
    const campagne = campagnesStore.parId(id);
    const lien = document.createElement("a");
    lien.href = URL.createObjectURL(new Blob([convertirExport(id)], { type: "application/json" }));
    lien.download = `${campagne.nom}.cplc.json`;
    lien.click();
    URL.revokeObjectURL(lien.href);
  } catch (erreur) {
    message.value = erreur.message;
  }
}

function ouvrirImport() {
  fichierImport.value?.click();
}

async function importer({ target }) {
  const fichier = target.files[0];
  if (!fichier) return;
  try {
    const id = importerCampagne(lireImport(await fichier.text()));
    message.value = `Campagne importée : ${campagnesStore.parId(id).nom}.`;
  } catch (erreur) {
    message.value = erreur.message;
  } finally {
    target.value = "";
  }
}
</script>

<template>
  <main class="campagnes-page">
    <header class="entete">
      <div>
        <h1>Mes campagnes</h1>
        <p>Choisis une campagne pour gérer ses chapitres et ses quêtes.</p>
      </div>
      <button type="button" class="btn" @click="creer">Nouvelle campagne</button>
    </header>
    <p v-if="message" role="alert">{{ message }}</p>
    <div class="import">
      <input ref="fichierImport" hidden type="file" accept=".cplc.json,application/json" @change="importer" />
      <button type="button" class="btn secondary" @click="ouvrirImport">Importer une campagne</button>
    </div>
    <p v-if="!campagnes.length">Aucune campagne pour le moment.</p>
    <CampagneListe
      v-else
      :campagnes="campagnes"
      :compter-chapitres="compterChapitres"
      :compter-joueurs="compterJoueurs"
      :progression="progression"
      :compter-quetes-terminees="compterQuetesTerminees"
      @modifier="modifier"
      @dupliquer="dupliquer"
      @exporter="exporter"
      @supprimer="supprimer"
    />
  </main>
</template>

<style scoped>
.campagnes-page {
	max-width: 1100px;
	margin: auto;
	padding: 2.5rem 1.5rem;
}
.entete {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	flex-wrap: wrap;
}
h1 {
	margin: 0 0 .4rem;
	color: #fff;
	letter-spacing: -.02em;
}
.campagnes-page > p {
	color: var(--texte-secondaire);
}
.import {
	margin: 1rem 0;
}
</style>
