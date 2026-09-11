<script setup>
import NavMenu from "@/layout/NavMenu.vue";
</script>

<template>
  <NavMenu />
  <router-view />
</template>

<style scoped>

</style>

<style>
:root {
	--fond-principal: #171521;
	--fond-surface: #242032;
	--fond-carte: #2d2740;
	--bordure: #4a4164;
	--texte: #f5f3ff;
	--texte-secondaire: #b9b1d0;
	--violet: #8b5cf6;
	--violet-clair: #a78bfa;
	--or: #f2b84b;
}
* {
	box-sizing: border-box;
}
body {
	margin: 0;
	font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
	color: var(--texte);
	background: var(--fond-principal);
}
a {
	color: var(--texte);
}
a:hover {
	color: var(--violet-clair);
}
button {
	transition: transform 0.15s ease, filter 0.15s ease;
}
button:hover:not(:disabled) {
	filter: brightness(1.12);
	transform: translateY(-1px);
}
.panel {
	padding: 1.25rem;
	border: 1px solid var(--bordure);
	border-radius: 8px;
	background: var(--fond-carte);
}
.actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.65rem;
}
.btn {
	padding: 0.65rem 1rem;
	border: 1px solid var(--violet);
	border-radius: 5px;
	background: var(--violet);
	color: white;
	font: inherit;
	cursor: pointer;
}
.btn.secondary {
	border-color: var(--bordure);
	background: var(--fond-surface);
	color: var(--texte);
}
.btn.danger, .btn.supprimer {
	border-color: #d77991;
	background: var(--fond-surface);
	color: #ffb4c5;
}
button:disabled, .btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
.control {
	box-sizing: border-box;
	display: block;
	width: 100%;
	padding: 0.6rem;
	border: 1px solid var(--bordure);
	border-radius: 4px;
	background: var(--fond-surface);
	color: var(--texte);
	font: inherit;
}
textarea.control {
	resize: vertical;
}
label {
	display: block;
	margin-bottom: 0.4rem;
}
.badge {
	display: inline-block;
	padding: 0.3rem 0.65rem;
	border-radius: 999px;
	background: #33275c;
	color: var(--violet-clair);
	font-size: 0.78rem;
	text-transform: capitalize;
}
.badge.active, .badge.actif {
	background: #4b3920;
	color: var(--or);
}
.badge.terminee, .badge.termine, .badge.vivant {
	background: #203e36;
	color: #8ee0ad;
}
.badge.abandonnee, .badge.mort {
	background: #422238;
	color: #ffb4c5;
}
.text-content {
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	line-height: 1.6;
}
.text-muted {
	color: var(--texte-secondaire);
}
.alert {
	margin: 0;
	color: #ffb4c5;
}
.suppression {
	margin-top: 1rem;
	padding: 1rem;
	border-radius: 6px;
	background: #422238;
	color: #ffb4c5;
}
</style>
