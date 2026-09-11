<script setup>
import { computed, ref } from 'vue';
import useLectureStore from '@/stores/lecture';
const lecture = useLectureStore();
const recherche = ref('');
const resultats = computed(() => lecture.inventaire.filter(element => `${element.nom} ${element.description}`.toLocaleLowerCase('fr').includes(recherche.value.trim().toLocaleLowerCase('fr'))));
const objets = computed(() => resultats.value.filter(element => element.type === 'objet'));
const indices = computed(() => resultats.value.filter(element => element.type === 'indice'));
</script>

<template>
  <section aria-labelledby="titre-inventaire">
    <h2 id="titre-inventaire">Mon inventaire</h2>
    <p v-if="!lecture.personnage" class="vide-joueur">Choisis ton personnage pour ouvrir son inventaire.</p>
    <template v-else>
      <label for="recherche-inventaire">Rechercher un objet ou un indice<input id="recherche-inventaire" v-model="recherche" type="search" placeholder="Nom, description ou texte" /></label>
      <h3>Mes objets</h3>
      <p v-if="!objets.length">{{ recherche ? 'Aucun objet ne correspond à la recherche.' : 'Ton inventaire ne contient aucun objet.' }}</p>
      <div class="grille-joueur">
        <article v-for="objet in objets" :key="objet.id" class="carte-joueur">
          <h3>{{ objet.nom }} × {{ objet.quantite }}</h3>
          <details><summary>Description</summary><p class="texte-joueur">{{ objet.description || 'Aucune description.' }}</p></details>
        </article>
      </div>
      <h3>Indices de la campagne</h3>
      <p>Ces indices sont partagés avec tous les joueurs de la campagne.</p>
      <p v-if="!indices.length">{{ recherche ? 'Aucun indice ne correspond à la recherche.' : 'Aucun indice reçu pour le moment.' }}</p>
      <div class="grille-joueur">
        <article v-for="indice in indices" :key="indice.id" class="carte-joueur">
          <h3>{{ indice.nom }}</h3>
          <details><summary>Lire l’indice</summary><p class="texte-joueur">{{ indice.description || 'Aucun texte.' }}</p></details>
        </article>
      </div>
    </template>
  </section>
</template>
