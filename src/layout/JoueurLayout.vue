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
      <div><p class="surtitre-joueur">Espace joueur</p><h1>{{ lecture.campagne?.nom ?? 'Ta prochaine aventure' }}</h1></div>
      <button type="button" class="secondaire-joueur" @click="actualiser">Actualiser la partie</button>
    </header>
    <p v-if="lecture.erreur" class="alerte-joueur" role="alert">{{ lecture.erreur }}</p>
    <p class="succes-joueur" role="status">{{ lecture.message }}</p>
    <p v-if="lecture.problemeCampagne" class="vide-joueur">{{ lecture.problemeCampagne }}</p>
    <div v-if="lecture.pret && lecture.campagne">
      <div class="carte-joueur choix-personnage">
        <label for="personnage-joueur">Ton personnage
          <select id="personnage-joueur" :value="lecture.personnage?.id ?? ''" @change="lecture.executer({ type: 'selectionner', id: $event.target.value || null })">
            <option value="">Choisir un joueur</option>
            <option v-for="joueur in lecture.personnages" :key="joueur.id" :value="joueur.id">{{ joueur.nom }} — {{ joueur.etat === 'mort' ? 'Mort' : 'Vivant' }}</option>
          </select>
        </label>
        <div v-if="lecture.personnage">
          <p><strong>{{ lecture.personnage.nom }}</strong> · {{ lecture.personnage.etat === 'mort' ? 'Mort' : 'Vivant' }} · {{ lecture.lieuActuel?.nom ?? 'Aucun lieu actuel' }}</p>
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
	color: #263238;
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
	color: #536176;
}
.carte-joueur {
	padding: 1.1rem;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	background: white;
	min-width: 0;
}
.choix-personnage {
	background: #f8fafc;
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
	border: 1px solid #9ca3af;
	border-radius: 5px;
	background: white;
	color: inherit;
	font: inherit;
}
.espace-joueur button {
	padding: .65rem .9rem;
	border: 1px solid #215ad3;
	border-radius: 5px;
	background: #215ad3;
	color: white;
	cursor: pointer;
	font: inherit;
}
.espace-joueur button.secondaire-joueur {
	color: #215ad3;
	background: white;
}
.espace-joueur button:disabled {
	opacity: .5;
	cursor: not-allowed;
}
.espace-joueur :is(input, select, button, summary):focus-visible {
	outline: 3px solid #215ad3;
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
	background: #fff1f2;
	color: #9f1239;
	border-radius: 6px;
}
.succes-joueur {
	color: #166534;
	min-height: 1.3rem;
}
.vide-joueur {
	padding: 1rem;
	background: #f3f4f6;
	border-radius: 6px;
}
.etat-joueur {
	display: inline-block;
	font-size: .8rem;
	padding: .25rem .6rem;
	background: #eef2ff;
	border-radius: 20px;
	margin-bottom: .75rem;
}
@media (max-width: 600px) {
	.espace-joueur {
		padding: 1rem .7rem;
	}
}
</style>
