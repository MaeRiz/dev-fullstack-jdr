<script setup>
import SubNav from "@/layout/SubNav.vue";

const links = [
	{ name: "mj-liste-campagnes", label: "Campagnes" },
	{ name: "mj-liste-joueurs", label: "Joueurs" },
	{ name: "mj-bibliotheque-contenus", label: "Lieux / objets / indices" },
	{ name: "mj-campagne-active", label: "Partie en cours" },
];
</script>

<template>
	<SubNav :links="links" />

	<router-view />
</template>
