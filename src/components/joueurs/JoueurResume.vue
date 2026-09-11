<script setup>
defineProps({ joueur: { type: Object, required: true } });
</script>

<template>
  <article class="joueur">
    <div>
      <strong>{{ joueur.nom }}</strong
      ><span class="badge" :class="joueur.etat">{{ joueur.etat }}</span>
    </div>
    <small>{{ joueur.description || "Aucune description." }}</small>
  </article>
</template>

<style scoped>
.joueur {
	padding: 1rem;
	border: 1px solid var(--bordure);
	border-radius: 8px;
	background: var(--fond-carte);
}
.joueur strong {
	display: block;
	margin-bottom: .5rem;
}
.joueur small {
	color: var(--texte-secondaire);
}
</style>
