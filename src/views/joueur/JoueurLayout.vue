<script setup>
import SubNav from "@/components/SubNav.vue";

const links = [
	{ name: "joueur-progression", label: "Suivi de partie" },
	{ name: "joueur-inventaire", label: "Mon inventaire" },
	{ name: "joueur-actions", label: "Actions" },
];
</script>

<template>
	<SubNav :links="links" />

	<router-view />
</template>
