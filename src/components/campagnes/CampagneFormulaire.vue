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
	<section class="panel formulaire">
		<h2>{{ campagne ? "Modifier" : "Ajouter" }} une campagne</h2>
		<form @submit.prevent="gererSubmit">
			<div>
				<label for="campagne-nom">Nom (obligatoire)</label>
				<input id="campagne-nom" class="control" type="text" v-model="formulaire.nom" required />
			</div>

			<div>
				<label for="campagne-etat">État</label>
					<select id="campagne-etat" class="control" v-model="formulaire.etat">
					<option value="brouillon">Brouillon</option>
					<option value="disponible">Disponible</option>
					<option value="active">Active</option>
				</select>
			</div>

			<div>
				<label for="campagne-description">Description</label>
				<textarea id="campagne-description" class="control" v-model="formulaire.description"></textarea>
			</div>

			<div>
				<label for="campagne-commentaire">Commentaire réservé au MJ</label>
				<textarea id="campagne-commentaire" class="control" v-model="formulaire.commentaire"></textarea>
			</div>

			<p v-if="erreur" role="alert">{{ erreur }}</p>

			<div class="actions">
				<button type="submit" class="btn">{{ campagne ? "Enregistrer" : "Ajouter" }}</button>
				<button v-if="campagne" type="button" class="btn secondary" @click="emit('annuler')">
					Annuler
				</button>
			</div>
		</form>
	</section>
</template>

<style scoped>
h2 {
	margin-top: 0;
	font-size: 1.2rem;
}
form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
[role="alert"] {
	margin: 0;
	color: #ffb4c5;
}
</style>
