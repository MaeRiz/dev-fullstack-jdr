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
	gap: 0.75rem;
	padding: 0.5rem 1rem;
	background: #f3f4f6;
	border-bottom: 1px solid #ddd;
}

.sub-nav a {
	text-decoration: none;
	color: inherit;
	font-size: 0.9rem;
}

.sub-nav a.router-link-exact-active {
	color: #215ad3;
	font-weight: 600;
}
</style>
