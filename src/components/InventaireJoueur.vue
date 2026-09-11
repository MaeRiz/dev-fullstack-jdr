<script setup>
import { ref, watch } from 'vue';
import { nomObjet as libelleObjet } from '@/services/inventaire';

const props = defineProps({
  joueur: { type: Object, required: true },
  desactive: { type: Boolean, default: false },
  objets: { type: Array, required: true },
  contenus: { type: Array, required: true },
});
const nomObjet = id => libelleObjet(id, props.contenus);
const emit = defineEmits(['modifier']);
const objetId = ref('');
watch(() => props.objets, liste => {
  if (!liste.some(objet => objet.id === objetId.value)) objetId.value = liste[0]?.id ?? '';
}, { immediate: true });
const quantite = ref(1);
const quantitesRetrait = ref({});
</script>

<template>
  <section class="inventaire" :aria-labelledby="`inventaire-${joueur.id}`">
    <h3 :id="`inventaire-${joueur.id}`">Inventaire</h3>
    <p v-if="!joueur.inventaire.length">Ce joueur ne possède aucun objet.</p>
    <ul v-else>
      <li v-for="entree in joueur.inventaire" :key="entree.objetId">
        <span class="objet">{{ nomObjet(entree.objetId) }} <strong>× {{ entree.quantite }}</strong></span>
        <form @submit.prevent="emit('modifier', entree.objetId, quantitesRetrait[entree.objetId] ?? 1, 'retirer')">
          <label :for="`retrait-${joueur.id}-${entree.objetId}`">Quantité à retirer
            <input class="control" :id="`retrait-${joueur.id}-${entree.objetId}`" type="number" min="1" :max="entree.quantite" step="1" required
              :value="quantitesRetrait[entree.objetId] ?? 1" :disabled="desactive"
              @input="quantitesRetrait[entree.objetId] = Number($event.target.value)" />
          </label>
          <button type="submit" class="btn retirer" :disabled="desactive" :aria-label="`Retirer ${nomObjet(entree.objetId)} à ${joueur.nom}`">Retirer</button>
        </form>
      </li>
    </ul>
    <p v-if="!objets.length" class="aide">Aucun objet disponible. Ajoute un objet dans <RouterLink to="/mj/contenus">la bibliothèque</RouterLink>.</p>
    <form v-else class="don" @submit.prevent="emit('modifier', objetId, quantite, 'donner')">
      <label :for="`objet-${joueur.id}`">Objet à donner
        <select class="control" :id="`objet-${joueur.id}`" v-model="objetId" :disabled="desactive">
          <option v-for="objet in objets" :key="objet.id" :value="objet.id">{{ objet.nom }}</option>
        </select>
      </label>
      <label :for="`quantite-${joueur.id}`">Quantité
        <input class="control" :id="`quantite-${joueur.id}`" v-model.number="quantite" type="number" min="1" :max="Number.MAX_SAFE_INTEGER" step="1" required :disabled="desactive" />
      </label>
      <button type="submit" class="btn" :disabled="desactive" :aria-label="`Donner un objet à ${joueur.nom}`">Donner</button>
    </form>
    <p class="aide">{{ objets.find(objet => objet.id === objetId)?.description }}</p>
  </section>
</template>

<style scoped>
.inventaire {
	margin: 1.25rem 0;
	padding: 1rem;
	background: var(--fond-surface);
	border: 1px solid var(--bordure);
	border-radius: 6px;
}
h3 {
	margin: 0 0 .75rem;
	font-size: 1rem;
}
ul {
	list-style: none;
	padding: 0;
	margin: 0 0 1rem;
}
li {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
	flex-wrap: wrap;
	padding: .75rem 0;
	border-bottom: 1px solid var(--bordure);
}
.objet {
	overflow-wrap: anywhere;
}
strong {
	margin-left: .5rem;
}
form {
	display: flex;
	gap: .75rem;
	align-items: end;
	flex-wrap: wrap;
}
label {
	display: block;
	font-size: .85rem;
	font-weight: 600;
}
.retirer {
	border-color: #d77991;
	color: #ffb4c5;
	background: var(--fond-surface);
}
input {
	width: 8rem;
}
.control {
	margin-top: .4rem;
	max-width: 100%;
}
.retirer {
	border-color: #d77991;
	color: #ffb4c5;
	background: var(--fond-surface);
}
:is(button, input, select):focus-visible {
	outline: 3px solid var(--violet-clair);
	outline-offset: 3px;
}
.aide {
	margin-bottom: 0;
	color: var(--texte-secondaire);
	font-size: .85rem;
}
</style>
