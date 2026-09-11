<script setup>
import SubNav from "@/layout/SubNav.vue";
import { onMounted, onUnmounted } from 'vue';
import useLectureStore from '@/stores/lecture';

const lecture = useLectureStore();
lecture.rafraichir();
function actualiser() { lecture.rafraichir(); }
onMounted(() => {
  window.addEventListener('storage', actualiser);
  window.addEventListener('focus', actualiser);
});
onUnmounted(() => {
  window.removeEventListener('storage', actualiser);
  window.removeEventListener('focus', actualiser);
});

const links = [
	{ name: "joueur-progression", label: "Suivi de partie" },
	{ name: "joueur-inventaire", label: "Mon inventaire" },
	{ name: "joueur-actions", label: "Actions" },
];
</script>

<template>
  <SubNav :links="links" />

  <div class="espace-joueur">
    <header class="entete-joueur">
      <div>
        <p class="surtitre-joueur">Espace joueur</p>
        <h1>{{ lecture.campagne?.nom ?? "Ta prochaine aventure" }}</h1>
      </div>
      <button type="button" class="secondaire-joueur" @click="actualiser">Actualiser la partie</button>
    </header>
    <p v-if="lecture.erreur" class="alerte-joueur" role="alert">{{ lecture.erreur }}</p>
    <p class="succes-joueur" role="status">{{ lecture.message }}</p>
    <p v-if="lecture.problemeCampagne" class="vide-joueur">{{ lecture.problemeCampagne }}</p>
    <div v-if="lecture.pret && lecture.campagne">
      <div class="carte-joueur choix-personnage">
        <label for="personnage-joueur"
          >Ton personnage
          <select
            id="personnage-joueur"
            :value="lecture.personnage?.id ?? ''"
            @change="
              lecture.executer({
                type: 'selectionner',
                id: $event.target.value || null,
              })
            "
          >
            <option value="">Choisir un joueur</option>
            <option v-for="joueur in lecture.personnages" :key="joueur.id" :value="joueur.id">
              {{ joueur.nom }} —
              {{ joueur.etat === "mort" ? "Mort" : "Vivant" }}
            </option>
          </select>
        </label>
        <div v-if="lecture.personnage">
          <p>
            <strong>{{ lecture.personnage.nom }}</strong> · {{ lecture.personnage.etat === "mort" ? "Mort" : "Vivant" }} ·
            {{ lecture.lieuActuel?.nom ?? "Aucun lieu actuel" }}
          </p>
          <p class="texte-joueur">{{ lecture.personnage.description }}</p>
        </div>
        <p v-else-if="!lecture.personnages.length">Aucun joueur n’est rattaché à cette campagne. Le MJ doit en ajouter un.</p>
        <p v-else>Sélectionne ton personnage pour consulter son inventaire et effectuer ses actions.</p>
      </div>
      <router-view :key="`${lecture.campagne.id}-${lecture.personnage?.id ?? 'aucun'}`" />
    </div>
  </div>
</template>

<style>
.espace-joueur {
	max-width: 1100px;
	margin: auto;
	padding: 1.5rem;
	color: var(--texte);
}
.espace-joueur h1 {
	margin: 0;
	font-size: 1.8rem;
	overflow-wrap: anywhere;
}
.espace-joueur h2 {
	font-size: 1.3rem;
	margin-top: 1.8rem;
}
.espace-joueur h3 {
	font-size: 1.05rem;
	margin: 0 0 .8rem;
	overflow-wrap: anywhere;
}
.entete-joueur {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	flex-wrap: wrap;
}
.surtitre-joueur {
	margin: 0 0 .5rem;
	font-size: .85rem;
	color: var(--texte-secondaire);
}
.carte-joueur {
	padding: 1.1rem;
	border: 1px solid var(--bordure);
	border-radius: 8px;
	background: var(--fond-carte);
	min-width: 0;
}
.choix-personnage {
	background: var(--fond-surface);
}
.grille-joueur {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
	gap: 1rem;
	margin: 1rem 0;
}
.espace-joueur label {
	display: block;
	font-size: .9rem;
	font-weight: 600;
	margin: 0 0 1rem;
}
.espace-joueur input, .espace-joueur select {
	display: block;
	box-sizing: border-box;
	width: 100%;
	margin-top: .5rem;
	padding: .65rem;
	border: 1px solid var(--bordure);
	border-radius: 5px;
	background: var(--fond-surface);
	color: var(--texte);
	font: inherit;
}
.espace-joueur button {
	padding: .65rem .9rem;
	border: 1px solid var(--violet);
	border-radius: 5px;
	background: var(--violet);
	color: white;
	cursor: pointer;
	font: inherit;
}
.espace-joueur button.secondaire-joueur {
	color: var(--texte);
	border-color: var(--bordure);
	background: var(--fond-surface);
}
.espace-joueur button:disabled {
	opacity: .5;
	cursor: not-allowed;
}
.espace-joueur :is(input, select, button, summary):focus-visible {
	outline: 3px solid var(--violet-clair);
	outline-offset: 3px;
}
.espace-joueur p, .espace-joueur li {
	line-height: 1.6;
	overflow-wrap: anywhere;
}
.espace-joueur summary {
	cursor: pointer;
	font-weight: 600;
}
.texte-joueur {
	white-space: pre-wrap;
}
.alerte-joueur {
	padding: 1rem;
	background: #422238;
	color: #ffb4c5;
	border-radius: 6px;
}
.succes-joueur {
	color: #8ee0ad;
	min-height: 1.3rem;
}
.vide-joueur {
	padding: 1rem;
	background: var(--fond-surface);
	border-radius: 6px;
}
.etat-joueur {
	display: inline-block;
	font-size: .8rem;
	padding: .25rem .6rem;
	background: #33275c;
	color: var(--violet-clair);
	border-radius: 20px;
	margin-bottom: .75rem;
}
@media (max-width: 600px) {
	.espace-joueur {
		padding: 1rem .7rem;
	}
}
</style>
