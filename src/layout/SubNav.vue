<script setup>
defineProps({
	links: {
		type: Array,
		required: true,
	},
});
</script>

<template>
  <nav class="sub-nav">
    <RouterLink v-for="link in links" :key="link.name" :to="{ name: link.name }">
      {{ link.label }}
    </RouterLink>
  </nav>
</template>

<style scoped>
.sub-nav {
	display: flex;
	flex-wrap: wrap;
	gap: 0.4rem;
	padding: 0.6rem 1rem;
	background: #211b30;
	border-bottom: 1px solid #3b3153;
}
.sub-nav a {
	padding: 0.3rem 0.7rem;
	border-radius: 999px;
	text-decoration: none;
	color: #d8d0ed;
	font-size: 0.85rem;
	transition: background-color 0.15s ease, color 0.15s ease;
}
.sub-nav a:hover {
	background: #35294f;
}
.sub-nav a.router-link-exact-active {
	background: var(--violet);
	color: white;
	font-weight: 600;
}
</style>
