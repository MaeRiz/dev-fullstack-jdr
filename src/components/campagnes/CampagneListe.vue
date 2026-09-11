<script setup>
defineProps({
	campagnes: { type: Array, required: true },
	compterChapitres: { type: Function, default: () => 0 },
	compterJoueurs: { type: Function, default: () => 0 },
	progression: { type: Function, default: () => ({ termines: 0, total: 0 }) },
	compterQuetesTerminees: { type: Function, default: () => 0 },
});
const emit = defineEmits(["modifier", "dupliquer", "supprimer", "exporter"]);
</script>

<template>
  <ul>
    <li v-for="campagne in campagnes" :key="campagne.id">
      <h2>{{ campagne.nom }}</h2>
      <p>
        <span class="badge" :class="campagne.etat">{{ campagne.etat }}</span>
      </p>
      <p>{{ compterChapitres(campagne.id) }} chapitre(s)</p>
      <p>{{ compterJoueurs(campagne.id) }} joueur(s)</p>
      <div class="progression">
        <div class="progression-entete">
          <span>Progression</span><strong>{{ progression(campagne.id).termines }} / {{ progression(campagne.id).total }}</strong>
        </div>
        <div class="barre">
          <span
            :style="{
              width: `${progression(campagne.id).total ? (progression(campagne.id).termines / progression(campagne.id).total) * 100 : 0}%`,
            }"
          ></span>
        </div>
        <small>{{ compterQuetesTerminees(campagne.id) }} quête(s) terminée(s)</small>
      </div>
      <p class="description">{{ campagne.description || "Aucune description." }}</p>
      <details v-if="campagne.commentaire">
        <summary>Commentaire MJ</summary>
        <p class="description">{{ campagne.commentaire }}</p>
      </details>
      <div class="actions">
        <button type="button" class="btn secondary" :aria-label="`Modifier ${campagne.nom}`" @click="emit('modifier', campagne.id)">Modifier</button>
        <button type="button" class="btn secondary" :aria-label="`Dupliquer ${campagne.nom}`" @click="emit('dupliquer', campagne.id)">Dupliquer</button>
        <button type="button" class="btn secondary" :aria-label="`Exporter ${campagne.nom}`" @click="emit('exporter', campagne.id)">Exporter</button>
        <button type="button" class="btn supprimer" :aria-label="`Supprimer ${campagne.nom}`" @click="emit('supprimer', campagne.id)">Supprimer</button>
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
	background: var(--fond-carte);
	overflow-wrap: anywhere;
}
h2 {
	margin-top: 0;
	font-size: 1.2rem;
}
.description {
	white-space: pre-wrap;
}
.progression {
	margin: 1rem 0;
	color: var(--texte-secondaire);
}
.progression-entete {
	display: flex;
	justify-content: space-between;
	margin-bottom: .35rem;
	font-size: .85rem;
}
.progression strong {
	color: var(--or);
}
.barre {
	height: .5rem;
	overflow: hidden;
	border-radius: 999px;
	background: #19152a;
}
.barre span {
	display: block;
	height: 100%;
	border-radius: inherit;
	background: linear-gradient(90deg, var(--violet), var(--or));
	transition: width .25s ease;
}
summary {
	cursor: pointer;
}
.actions {
	margin-top: 1rem;
}
</style>
