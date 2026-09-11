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
	gap: 0.5rem;
	padding: 0.75rem 1rem;
	background: #110e1a;
	border-bottom: 1px solid #352c4c;
}
nav a {
	padding: 0.4rem 0.9rem;
	border-radius: 999px;
	text-decoration: none;
	color: #d8d0ed;
	font-weight: 600;
	transition: background-color 0.15s ease, color 0.15s ease;
}
nav a:hover {
	background: #2d2542;
}
nav a.router-link-active {
	background: var(--violet);
	color: white;
}
</style>
