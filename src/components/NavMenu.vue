<script setup></script>

<template>
	<nav>
		<RouterLink :to="{ name: 'mj-liste-campagnes' }">MJ</RouterLink>
		<RouterLink :to="{ name: 'joueur-progression' }">Joueur</RouterLink>
	</nav>
</template>

<style scoped>
nav {
	display: flex;
	gap: 1rem;
	padding: 0.75rem 1rem;
	border-bottom: 1px solid #ddd;
}

nav a {
	text-decoration: none;
	color: inherit;
	font-weight: 600;
}

nav a.router-link-active {
	color: #2a64e1;
}
</style>
