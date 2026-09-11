<script setup>
defineProps({
  chapitre: { type: Object, required: true },
  quetes: { type: Array, default: () => [] },
  etats: { type: Object, required: true },
  campagnes: { type: Array, required: true },
  objets: { type: Array, required: true },
  indices: { type: Array, required: true },
  libelle: { type: Function, required: true },
  formulaireOuvert: { type: Boolean, default: false },
  suppression: { type: Boolean, default: false },
});
const emit = defineEmits(['modifier', 'dupliquer', 'supprimer', 'confirmer-suppression', 'annuler-suppression']);
</script>

<template>
  <article class="panel panneau">
    <div class="entete"><h2>{{ chapitre.nom }}</h2><span class="etat" :class="chapitre.etat">{{ etats[chapitre.etat] }}</span></div>
    <p class="aide">{{ chapitre.campagneId === null ? 'Sans campagne' : libelle(campagnes, chapitre.campagneId) }}</p>
    <p class="text-content texte">{{ chapitre.description || 'Aucune description.' }}</p>
    <details><summary>Détails du chapitre et informations MJ</summary>
      <p class="text-content texte"><strong>Commentaire MJ :</strong> {{ chapitre.commentaireMj || 'Aucun.' }}</p>
      <p class="texte"><strong>Mot de passe d’activation :</strong> {{ chapitre.motDePasseActivation || 'Non configuré' }}</p>
      <p><strong>Objets requis :</strong> {{ chapitre.objetsRequis.map((id) => libelle(objets, id)).join(', ') || 'Aucun' }}</p>
      <p class="texte"><strong>Mot de passe de résolution :</strong> {{ chapitre.motDePasseResolution || 'Non configuré' }}</p>
      <p><strong>Objets récompenses :</strong> {{ chapitre.recompensesObjets.map((objet) => `${libelle(objets, objet.objetId)} × ${objet.quantite}`).join(', ') || 'Aucun' }}</p>
      <p><strong>Indices récompenses :</strong> {{ chapitre.recompensesIndices.map((id) => libelle(indices, id)).join(', ') || 'Aucun' }}</p>
    </details>
    <h3>Quêtes associées ({{ quetes.length }})</h3>
    <p><RouterLink :to="{ name: 'mj-edition-quete', query: { campagneId: chapitre.campagneId, chapitreId: chapitre.id } }">Gérer les quêtes de ce chapitre</RouterLink></p>
    <ol v-if="quetes.length"><li v-for="quete in quetes" :key="quete.id"><RouterLink :to="{ name: 'mj-edition-quete', query: { chapitreId: chapitre.id, queteId: quete.id } }">{{ quete.nom }}</RouterLink> — {{ quete.etat }}</li></ol>
    <p v-else>Aucune quête associée.</p>
    <div class="actions">
      <button class="btn secondary" :disabled="formulaireOuvert" @click="emit('modifier', chapitre)">Modifier</button>
      <button class="btn secondary" :disabled="formulaireOuvert" @click="emit('dupliquer', chapitre)">Dupliquer</button>
      <button class="btn danger" :disabled="formulaireOuvert" @click="emit('supprimer', chapitre.id)">Supprimer</button>
    </div>
    <div v-if="suppression" class="suppression" role="group" :aria-label="`Confirmer la suppression de ${chapitre.nom}`">
      <p>Supprimer définitivement « {{ chapitre.nom }} » et ses {{ quetes.length }} quête(s) ?</p>
      <div class="actions"><button class="btn danger" @click="emit('confirmer-suppression', chapitre)">Confirmer la suppression</button><button class="btn secondary" @click="emit('annuler-suppression')">Annuler</button></div>
    </div>
  </article>
</template>

<style scoped>
.entete {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	flex-wrap: wrap;
}
h2 {
	font-size: 1.2rem;
	margin: 0 0 1rem;
}
h3 {
	font-size: 1rem;
}
.aide {
	color: var(--texte-secondaire);
	font-size: .85rem;
}
.etat {
	border-radius: 20px;
	padding: .3rem .7rem;
	background: var(--fond-surface);
	font-size: .85rem;
}
.etat.actif {
	background: #33275c;
	color: var(--violet-clair);
}
.etat.termine {
	background: #203e36;
	color: #8ee0ad;
}
.actions {
	margin-top: 1rem;
}
</style>
