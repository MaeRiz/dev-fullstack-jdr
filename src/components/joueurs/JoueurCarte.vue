<script setup>
import InventaireJoueur from "@/components/InventaireJoueur.vue";

defineProps({
  joueur: { type: Object, required: true },
  nomCampagne: { type: Function, required: true },
  objets: { type: Array, required: true },
  contenus: { type: Array, required: true },
  desactive: { type: Boolean, default: false },
  suppression: { type: Boolean, default: false },
});
const emit = defineEmits(["modifier", "dupliquer", "supprimer", "confirmer-suppression", "annuler-suppression", "modifier-inventaire"]);
</script>

<template>
  <article class="panel panneau">
    <div class="titre-joueur">
      <h2>{{ joueur.nom }}</h2>
      <span class="etat" :class="{ mort: joueur.etat === 'mort' }">{{ joueur.etat === 'vivant' ? 'Vivant' : 'Mort' }}</span>
    </div>
    <p class="aide-campagnes">Campagne : {{ nomCampagne(joueur.campagneId) }}</p>
    <p class="text-content texte">{{ joueur.description || 'Aucune description.' }}</p>
    <details v-if="joueur.commentaireMj"><summary>Commentaire MJ</summary><p class="texte">{{ joueur.commentaireMj }}</p></details>
    <InventaireJoueur :joueur="joueur" :objets="objets" :contenus="contenus" :desactive="desactive" @modifier="(...valeurs) => emit('modifier-inventaire', joueur, ...valeurs)" />
    <div class="actions">
      <button type="button" class="btn secondary" :disabled="desactive" @click="emit('modifier', joueur)">Modifier</button>
      <button type="button" class="btn secondary" :disabled="desactive" @click="emit('dupliquer', joueur)">Dupliquer</button>
      <button type="button" class="btn danger" :disabled="desactive" @click="emit('supprimer')">Supprimer</button>
    </div>
    <div v-if="suppression" class="suppression" role="group" :aria-label="`Confirmer la suppression de ${joueur.nom}`">
      <p>Supprimer définitivement « {{ joueur.nom }} » et son inventaire ?</p>
      <div class="actions"><button type="button" class="btn danger" @click="emit('confirmer-suppression', joueur)">Confirmer la suppression</button><button type="button" class="btn secondary" @click="emit('annuler-suppression')">Annuler</button></div>
    </div>
  </article>
</template>

<style scoped>
.titre-joueur {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	flex-wrap: wrap;
}
h2 {
	margin: 0 0 1rem;
	font-size: 1.15rem;
	overflow-wrap: anywhere;
}
.aide-campagnes {
	color: var(--texte-secondaire);
	font-size: .85rem;
	overflow-wrap: anywhere;
}
.etat {
	border-radius: 20px;
	padding: .3rem .7rem;
	background: #203e36;
	color: #8ee0ad;
	font-size: .8rem;
}
.etat.mort {
	background: var(--fond-surface);
	color: var(--texte-secondaire);
}
.actions {
	margin-top: 1rem;
}
</style>
