<script setup>
import { ref } from "vue";

const props = defineProps({
	campagne: { type: Object, default: null },
});
const emit = defineEmits(["sauvegarde", "annuler"]);

const formulaire = ref({
	nom: props.campagne?.nom || "",
	etat: props.campagne?.etat || "brouillon",
	description: props.campagne?.description || "",
	commentaire: props.campagne?.commentaire || "",
});
const erreur = ref("");

function gererSubmit() {
	// seul le nom est vraiment requis, le reste peut se compléter plus tard
	if (!formulaire.value.nom.trim()) {
		erreur.value = "Le nom ne peut pas être vide.";
		return;
	}
	emit("sauvegarde", {
		nom: formulaire.value.nom.trim(),
		etat: formulaire.value.etat,
		description: formulaire.value.description.trim(),
		commentaire: formulaire.value.commentaire.trim(),
	});
	formulaire.value = { nom: "", etat: "brouillon", description: "", commentaire: "" };
	erreur.value = "";
}
</script>

<template>
	<section>
		<h2>{{ campagne ? "Modifier" : "Ajouter" }} une campagne</h2>
		<form @submit.prevent="gererSubmit">
			<div>
				<label for="campagne-nom">Nom (obligatoire)</label>
				<input id="campagne-nom" type="text" v-model="formulaire.nom" required />
			</div>

			<div>
				<label for="campagne-etat">État</label>
				<select id="campagne-etat" v-model="formulaire.etat">
					<option value="brouillon">Brouillon</option>
					<option value="disponible">Disponible</option>
					<option value="active">Active</option>
				</select>
			</div>

			<div>
				<label for="campagne-description">Description</label>
				<textarea id="campagne-description" v-model="formulaire.description"></textarea>
			</div>

			<div>
				<label for="campagne-commentaire">Commentaire réservé au MJ</label>
				<textarea id="campagne-commentaire" v-model="formulaire.commentaire"></textarea>
			</div>

			<p v-if="erreur" role="alert">{{ erreur }}</p>

			<div class="actions">
				<button type="submit">{{ campagne ? "Enregistrer" : "Ajouter" }}</button>
				<button v-if="campagne" type="button" @click="emit('annuler')">Annuler</button>
			</div>
		</form>
	</section>
</template>

<style scoped>
form {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	max-width: 24rem;
}

label {
	display: block;
	margin-bottom: 0.25rem;
}

input,
select,
textarea {
	width: 100%;
	box-sizing: border-box;
}

.actions {
	display: flex;
	gap: 0.5rem;
}

[role="alert"] {
	color: #a02020;
}
</style>
