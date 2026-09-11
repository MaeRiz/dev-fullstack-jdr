<script setup>
import OrdreControls from "@/components/OrdreControls.vue";

defineProps({
  chapitre: { type: Object, required: true },
  quetes: { type: Array, default: () => [] },
  position: { type: Number, required: true },
  total: { type: Number, required: true },
  quetesTerminees: { type: Number, default: 0 },
});
const emit = defineEmits(["ouvrir", "dupliquer", "supprimer", "deplacer"]);
</script>

<template>
  <article class="carte">
    <OrdreControls :haut-desactive="position === 0" :bas-desactive="position === total - 1" :nom="chapitre.nom" @deplacer="emit('deplacer', $event)" />
    <div>
      <div class="entete"><h3><span class="ordre">{{ position + 1 }}</span><span class="icone">{{ chapitre.etat === 'termine' ? '✓' : chapitre.etat === 'actif' ? '▶' : '○' }}</span> {{ chapitre.nom }}</h3><span class="badge" :class="chapitre.etat">{{ chapitre.etat }}</span></div>
      <p>{{ chapitre.description || "Aucune description." }}</p>
      <p class="compteur">{{ quetesTerminees }} / {{ quetes.length }} quête(s) terminée(s)</p>
      <ul v-if="quetes.length"><li v-for="quete in quetes" :key="quete.id">{{ quete.nom }} — {{ quete.etat }}</li></ul>
      <div class="actions">
        <button type="button" class="btn secondary" @click="emit('ouvrir', chapitre.id)">Gérer le chapitre</button>
        <button type="button" class="btn secondary" @click="emit('dupliquer', chapitre.id)">Dupliquer</button>
        <button type="button" class="btn danger" @click="emit('supprimer', chapitre)">Supprimer</button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.carte {
	display: grid;
	grid-template-columns: 2.5rem minmax(0, 1fr);
	gap: 1rem;
	margin: 1rem 0;
	padding: 1.25rem;
	border: 1px solid var(--bordure);
	border-radius: 10px;
	background: var(--fond-carte);
	box-shadow: 0 10px 28px #0c0914aa;
}
.entete {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	flex-wrap: wrap;
}
h3 {
	margin-top: 0;
}
.ordre {
	display: inline-grid;
	width: 1.8rem;
	height: 1.8rem;
	margin-right: .45rem;
	place-items: center;
	border-radius: 50%;
	background: #19152a;
	color: var(--or);
	font-size: .85rem;
}
.icone {
	color: var(--or);
}
.compteur {
	color: var(--texte-secondaire);
}
.actions {
	margin-top: 1rem;
}
</style>
