<script setup>
import { computed, ref, watch } from 'vue';
import ContenuFormulaire from '@/components/contenus/ContenuFormulaire.vue';
import ContenuListe from '@/components/contenus/ContenuListe.vue';

const types = [
  { valeur: 'lieu', libelle: 'Lieux' },
  { valeur: 'objet', libelle: 'Objets' },
  { valeur: 'indice', libelle: 'Indices' },
];
const contenus = ref([]);
const typeActif = ref('lieu');
const recherche = ref('');
const contenuEnEdition = ref(null);
const messageStockage = ref('');
const cleStockage = 'jdr-contenus';

try {
  const sauvegarde = JSON.parse(localStorage.getItem(cleStockage) || '[]');
  const valide = Array.isArray(sauvegarde) && sauvegarde.every((contenu) => (
    contenu && typeof contenu.id === 'string'
    && types.some((type) => type.valeur === contenu.type)
    && typeof contenu.nom === 'string'
    && typeof contenu.commentaire === 'string'
    && (contenu.type === 'indice'
      ? typeof contenu.texte === 'string'
      : typeof contenu.description === 'string')
  ));
  if (!valide) throw new Error('Sauvegarde invalide');
  contenus.value = sauvegarde;
} catch {
  messageStockage.value = 'La bibliothèque sauvegardée ne peut pas être chargée. Les prochains changements remplaceront cette sauvegarde.';
}

const contenusDuType = computed(() => (
  contenus.value.filter((contenu) => contenu.type === typeActif.value)
));
const contenusVisibles = computed(() => {
  const texte = recherche.value.trim().toLowerCase();
  return contenusDuType.value.filter((contenu) => (
    contenu.nom.toLowerCase().includes(texte)
    || (contenu.description || contenu.texte || '').toLowerCase().includes(texte)
  ));
});

function changerType(type) {
  typeActif.value = type;
  recherche.value = '';
  contenuEnEdition.value = null;
}

function sauvegarder(contenu) {
  if (contenuEnEdition.value) {
    const index = contenus.value.findIndex(({ id }) => id === contenuEnEdition.value.id);
    if (index === -1) return;
    contenus.value.splice(index, 1, { ...contenu, id: contenuEnEdition.value.id });
  } else {
    contenus.value.push({ ...contenu, id: crypto.randomUUID() });
  }
  contenuEnEdition.value = null;
}

function modifier(id) {
  contenuEnEdition.value = contenus.value.find((contenu) => contenu.id === id);
}

function dupliquer(id) {
  const contenu = contenus.value.find((element) => element.id === id);
  if (!contenu) return;
  contenus.value.push({ ...contenu, id: crypto.randomUUID(), nom: `${contenu.nom} (copie)` });
}

function supprimer(id) {
  const index = contenus.value.findIndex((contenu) => contenu.id === id);
  if (index === -1 || !confirm(`Supprimer « ${contenus.value[index].nom} » ?`)) return;
  contenus.value.splice(index, 1);
  if (contenuEnEdition.value?.id === id) contenuEnEdition.value = null;
}

watch(contenus, (nouvelleValeur) => {
  try {
    localStorage.setItem(cleStockage, JSON.stringify(nouvelleValeur));
    messageStockage.value = '';
  } catch {
    messageStockage.value = 'Sauvegarde impossible dans ce navigateur. Les changements restent disponibles uniquement pendant cette session.';
  }
}, { deep: true });
</script>

<template>
  <main class="bibliotheque">
    <h1>Lieux, objets et indices</h1>
    <p>Préparez les contenus réutilisables de vos campagnes.</p>
    <p v-if="messageStockage" role="alert">{{ messageStockage }}</p>
    <div class="categories" aria-label="Types de contenus">
      <button v-for="type in types" :key="type.valeur" type="button"
        :aria-pressed="typeActif === type.valeur" :class="{ actif: typeActif === type.valeur }"
        @click="changerType(type.valeur)">{{ type.libelle }}</button>
    </div>
    <div class="colonnes">
      <section aria-label="Liste des contenus">
        <label for="recherche-contenu">Rechercher par nom, description ou texte</label>
        <input id="recherche-contenu" type="search" v-model="recherche">
        <p>{{ contenusVisibles.length }} résultat(s)</p>
        <p v-if="contenusDuType.length === 0">Aucun contenu dans cette catégorie. Utilisez le formulaire pour en ajouter un.</p>
        <p v-else-if="contenusVisibles.length === 0">Aucun contenu ne correspond à votre recherche.</p>
        <ContenuListe v-else :contenus="contenusVisibles"
          @modifier="modifier" @dupliquer="dupliquer" @supprimer="supprimer" />
      </section>
      <ContenuFormulaire :key="contenuEnEdition ? contenuEnEdition.id : typeActif"
        :type="typeActif" :contenu="contenuEnEdition"
        @sauvegarde="sauvegarder" @annuler="contenuEnEdition = null" />
    </div>
  </main>
</template>

<style scoped>
.bibliotheque {
  max-width: 1100px;
  margin: auto;
  padding: 1.5rem;
  font-family: Arial, sans-serif;
  color: #263238;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1.5rem 0;
}

.categories button {
  padding: 0.6rem 1rem;
  border: 1px solid #bbb;
  border-radius: 4px;
  background: white;
  font: inherit;
  cursor: pointer;
}

.categories button.actif {
  background: #215ad3;
  border-color: #215ad3;
  color: white;
}

.colonnes {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: start;
  gap: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
}

input {
  box-sizing: border-box;
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #999;
  border-radius: 4px;
  font: inherit;
}

[role="alert"] {
  padding: 1rem;
  background: #fff3d4;
}

@media (max-width: 700px) {
  .colonnes {
    grid-template-columns: 1fr;
  }
}
</style>
