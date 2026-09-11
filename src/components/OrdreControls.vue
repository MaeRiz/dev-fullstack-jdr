<script setup>
defineProps({
  hautDesactive: { type: Boolean, default: false },
  basDesactive: { type: Boolean, default: false },
  nom: { type: String, default: 'élément' },
});
const emit = defineEmits(['deplacer']);
</script>

<template>
  <div class="ordre-actions">
    <button type="button" class="deplacer" :disabled="hautDesactive" :aria-label="`Monter ${nom}`" @click="emit('deplacer', -1)">
      <span class="chevron haut"></span>
    </button>
    <button type="button" class="deplacer" :disabled="basDesactive" :aria-label="`Descendre ${nom}`" @click="emit('deplacer', 1)">
      <span class="chevron bas"></span>
    </button>
  </div>
</template>

<style scoped>
.ordre-actions {
	display: flex;
	flex-direction: column;
	gap: .4rem;
}
.deplacer {
	display: grid;
	width: 2.2rem;
	height: 2.2rem;
	padding: 0;
	place-items: center;
	border: 1px solid var(--bordure);
	border-radius: 6px;
	background: var(--fond-surface);
	color: var(--violet-clair);
	font: inherit;
	font-size: 1.4rem;
	line-height: 1;
	cursor: pointer;
}
.deplacer:disabled {
	border-color: #514b60;
	background: #393543;
	color: #817b8f;
	opacity: 1;
	cursor: not-allowed;
}
.chevron {
	display: block;
	width: .65rem;
	height: .65rem;
	border-right: .15rem solid currentColor;
	border-bottom: .15rem solid currentColor;
}
.chevron.haut {
	transform: rotate(225deg) translate(-.08rem, -.08rem);
}
.chevron.bas {
	transform: rotate(45deg) translate(-.08rem, -.08rem);
}
</style>
