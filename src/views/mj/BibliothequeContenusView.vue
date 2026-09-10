<script setup>
import { computed, ref } from 'vue';
import useContenusStore from '@/stores/contenus';
import ContenuFormulaire from '@/components/contenus/ContenuFormulaire.vue';
import ContenuListe from '@/components/contenus/ContenuListe.vue';

const types = [
  { valeur: 'lieu', libelle: 'Lieux' },
  { valeur: 'objet', libelle: 'Objets' },
  { valeur: 'indice', libelle: 'Indices' },
];
const store = useContenusStore();
const messageErreur = ref(store.lectureImpossible ? 'Impossible de charger la bibliothèque. La sauvegarde est conservée.' : '');
const typeSelectionne = ref('lieu');
const recherche = ref('');
const contenuSelectionne = ref(null);

const contenusFiltres = computed(() => (
  typeSelectionne.value === 'lieu' ? store.lieux : typeSelectionne.value === 'objet' ? store.objets : store.indices
));
const resultats = computed(() => {
  const texte = recherche.value.trim().toLowerCase();
  return contenusFiltres.value.filter((contenu) => (
    contenu.nom.toLowerCase().includes(texte)
    || (contenu.description || contenu.texte || '').toLowerCase().includes(texte)
  ));
});

function changerType(type) {
  typeSelectionne.value = type;
  recherche.value = '';
  contenuSelectionne.value = null;
}

function enregistrer() {
  const succes = store.enregistrer();
  messageErreur.value = succes ? '' : 'Sauvegarde impossible. Les changements sont en mémoire mais ne sont pas enregistrés dans le navigateur.';
  return succes;
}

function sauvegarderContenu(contenu, terminer) {
  try {
    let id = contenuSelectionne.value?.id;
    if (id) {
      store.modifier(id, contenu);
    } else {
      id = store.ajouter(contenu);
    }
    if (enregistrer()) {
      contenuSelectionne.value = null;
      terminer();
    } else {
      contenuSelectionne.value = store.parId(id);
    }
  } catch (erreur) {
    messageErreur.value = erreur.message;
  }
}

function modifierContenu(id) {
  contenuSelectionne.value = store.parId(id);
}

function dupliquerContenu(id) {
  const contenu = store.parId(id);
  if (!contenu) return;
  try {
    store.ajouter({ ...contenu, nom: `${contenu.nom} (copie)` });
    enregistrer();
  } catch (erreur) {
    messageErreur.value = erreur.message;
  }
}

function supprimerContenu(id) {
  const contenu = store.parId(id);
  if (!contenu || !confirm(`Retirer « ${contenu.nom} » de la bibliothèque ? Les joueurs et chapitres qui l’utilisent le conserveront.`)) return;
  try {
    store.modifier(id, { archive: true });
    enregistrer();
    if (contenuSelectionne.value?.id === id) contenuSelectionne.value = null;
  } catch (erreur) {
    messageErreur.value = erreur.message;
  }
}
</script>

<template>
  <main class="bibliotheque">
    <h1>Lieux, objets et indices</h1>
    <p>Préparez les contenus réutilisables de vos campagnes.</p>
    <p v-if="messageErreur" role="alert">{{ messageErreur }}</p>
    <div class="categories" aria-label="Types de contenus">
      <button v-for="type in types" :key="type.valeur" type="button"
        :aria-pressed="typeSelectionne === type.valeur" :class="{ actif: typeSelectionne === type.valeur }"
        @click="changerType(type.valeur)">{{ type.libelle }}</button>
    </div>
    <div class="colonnes">
      <section aria-label="Liste des contenus">
        <label for="recherche-contenu">Rechercher par nom, description ou texte</label>
        <input id="recherche-contenu" type="search" v-model="recherche">
        <p>{{ resultats.length }} résultat(s)</p>
        <p v-if="contenusFiltres.length === 0">Aucun contenu dans cette catégorie. Utilisez le formulaire pour en ajouter un.</p>
        <p v-else-if="resultats.length === 0">Aucun contenu ne correspond à votre recherche.</p>
        <ContenuListe v-else :contenus="resultats"
          @modifier="modifierContenu" @dupliquer="dupliquerContenu" @supprimer="supprimerContenu" />
      </section>
      <ContenuFormulaire :key="contenuSelectionne ? contenuSelectionne.id : typeSelectionne"
        :type="typeSelectionne" :contenu="contenuSelectionne" :desactive="store.lectureImpossible"
        @sauvegarde="sauvegarderContenu" @annuler="contenuSelectionne = null" />
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
