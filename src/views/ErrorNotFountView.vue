<script setup>
import { useRouter } from "vue-router";

const router = useRouter();
console.log(router);

function retourMj() {
	router.push({ name: "mj-liste-campagnes" });
}

function retourJoueur() {
	router.push({ name: "joueur-progression" });
}
</script>

<template>
	<h1>Page introuvable</h1>
	<button type="button" @click="retourMj">Retour MJ</button>
	<button type="button" @click="retourJoueur">Retour Joueur</button>
</template>
