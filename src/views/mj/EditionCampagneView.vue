<script setup>
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import useCampagnesStore from "@/stores/campagnes.js";
import useChapitresStore from "@/stores/chapitres.js";
import useQuetesStore from "@/stores/quetes.js";
import useJoueursStore from "@/stores/joueurs.js";
import CampagneFormulaire from "@/components/campagnes/CampagneFormulaire.vue";
import ChapitreCarte from "@/components/chapitres/ChapitreCarte.vue";
import JoueurResume from "@/components/joueurs/JoueurResume.vue";

const route = useRoute();
const router = useRouter();
const campagnesStore = useCampagnesStore();
const chapitresStore = useChapitresStore();
const quetesStore = useQuetesStore();
const joueursStore = useJoueursStore();
const { lectureImpossible } = storeToRefs(campagnesStore);
const campagneId = computed(() => route.params.campagneId ?? null);
const campagne = computed(() => campagneId.value ? campagnesStore.parId(campagneId.value) : null);
const chapitres = computed(() => campagneId.value ? chapitresStore.parCampagne(campagneId.value) : []);
const joueurs = computed(() => campagneId.value ? joueursStore.parCampagne(campagneId.value) : []);
const message = ref(lectureImpossible.value ? "La campagne ne peut pas être chargée." : "");

function sauvegarder(donnees) {
  try {
    let id;
    if (campagne.value) {
      id = campagne.value.id;
      campagnesStore.modifier(id, donnees);
    } else {
      id = campagnesStore.ajouter(donnees);
    }
    if (!campagnesStore.enregistrer()) throw new Error("Erreur de sauvegarde.");
    if (!campagne.value) router.push({ name: "mj-gestion-campagne", params: { campagneId: id } });
    else message.value = "Campagne enregistrée.";
  } catch (erreur) {
    message.value = erreur.message;
  }
}

function ouvrirChapitre(id) {
  router.push({ name: "mj-edition-chapitre", query: { campagneId: campagneId.value, chapitreId: id } });
}

function nouveauChapitre() {
  router.push({ name: "mj-edition-chapitre", query: { campagneId: campagneId.value } });
}

function compterQuetes(chapitreId) {
  return quetesStore.parChapitre(chapitreId).length;
}

function deplacerChapitre(chapitreId, direction) {
  try {
    chapitresStore.deplacer(campagneId.value, chapitreId, direction);
    if (!chapitresStore.enregistrer()) message.value = "Erreur de sauvegarde.";
  } catch (erreur) {
    message.value = erreur.message;
  }
}

function positionChapitre(chapitreId) {
  return chapitres.value.findIndex((chapitre) => chapitre.id === chapitreId);
}

function dupliquerChapitre(id) {
  try {
    const quetesOriginales = quetesStore.parChapitre(id);
    const copieId = chapitresStore.dupliquer(id);
    const copie = chapitresStore.parId(copieId);
    quetesOriginales.forEach((quete, index) => {
      const nouvelleQueteId = quetesStore.ajouter({
        ...JSON.parse(JSON.stringify(quete)),
        chapitreId: copieId,
        recompensesDistribuees: false,
      });
      if (copie.quetes?.[index]) copie.quetes[index].id = nouvelleQueteId;
    });
    chapitresStore.enregistrer();
    quetesStore.enregistrer();
  } catch (erreur) {
    message.value = erreur.message;
  }
}

function supprimerChapitre(chapitre) {
  if (!confirm(`Supprimer « ${chapitre.nom} » et ses quêtes ?`)) return;
  try {
    quetesStore.supprimerParChapitre(chapitre.id);
    chapitresStore.supprimer(chapitre.id);
    chapitresStore.enregistrer();
    quetesStore.enregistrer();
  } catch (erreur) {
    message.value = erreur.message;
  }
}

function quetesTerminees(chapitreId) {
  return quetesStore.parChapitre(chapitreId).filter((quete) => quete.etat === "terminee").length;
}

const progression = computed(() => {
  const total = chapitres.value.length;
  const termines = chapitres.value.filter((chapitre) => chapitre.etat === "termine").length;
  return { termines, total, pourcentage: total ? Math.round(termines / total * 100) : 0 };
});
</script>

<template>
  <main class="gestion-campagne">
    <p><RouterLink :to="{ name: 'mj-liste-campagnes' }">← Retour aux campagnes</RouterLink></p>
    <div v-if="campagneId && !campagne">
      <h1>Campagne introuvable</h1>
      <p>Cette campagne n'existe plus.</p>
    </div>
    <div v-else>
      <h1>{{ campagne ? `Gérer ${campagne.nom}` : "Nouvelle campagne" }}</h1>
      <p v-if="message" role="alert">{{ message }}</p>
      <CampagneFormulaire :campagne="campagne" @sauvegarde="sauvegarder" @annuler="router.push({ name: 'mj-liste-campagnes' })" />
      <section v-if="campagne" class="chapitres">
        <header class="entete">
          <div><h2>Progression de l'aventure</h2><p>{{ progression.termines }} / {{ progression.total }} chapitre(s) terminé(s)</p></div>
          <button type="button" @click="nouveauChapitre">Nouveau chapitre</button>
        </header>
        <div class="barre"><span :style="{ width: `${progression.pourcentage}%` }"></span></div>
        <p v-if="!chapitres.length">Aucun chapitre pour le moment.</p>
        <ChapitreCarte v-for="(chapitre, index) in chapitres" :key="chapitre.id" :chapitre="chapitre" :position="index" :total="chapitres.length" :quetes="quetesStore.parChapitre(chapitre.id)" :quetes-terminees="quetesTerminees(chapitre.id)" @ouvrir="ouvrirChapitre" @dupliquer="dupliquerChapitre" @supprimer="supprimerChapitre" @deplacer="deplacerChapitre(chapitre.id, $event)" />
      </section>
      <section v-if="campagne" class="joueurs">
        <header class="entete">
          <div><h2>Joueurs de la campagne</h2><p>{{ joueurs.length }} joueur(s) rattaché(s) à cette aventure.</p></div>
          <RouterLink class="bouton" :to="{ name: 'mj-liste-joueurs', query: { campagneId: campagne.id } }">Gérer les joueurs</RouterLink>
        </header>
        <p v-if="!joueurs.length">Aucun joueur n'est encore rattaché à cette campagne.</p>
        <div v-else class="liste-joueurs">
          <JoueurResume v-for="joueur in joueurs" :key="joueur.id" :joueur="joueur" />
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.gestion-campagne {
	max-width: 1050px;
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
	margin-bottom: 1.5rem;
	color: #fff;
	letter-spacing: -.02em;
}
.gestion-campagne > p a {
	color: var(--texte);
}
.chapitres {
	margin-top: 2rem;
}
.joueurs {
	margin-top: 2rem;
}
.liste-joueurs {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: .75rem;
}
.barre {
	height: .6rem;
	margin: 1rem 0 1.5rem;
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
h2, h3 {
	margin-top: 0;
}
.compteur {
	color: var(--texte-secondaire);
}
.bouton {
	padding: .65rem 1rem;
	border: 1px solid var(--violet);
	border-radius: 7px;
	background: var(--violet);
	color: white;
	text-decoration: none;
}
</style>
