<script setup>
import { ref } from "vue";

const props = defineProps({
	quete: { type: Object, default: null },
});
const emit = defineEmits(["sauvegarde", "annuler"]);

const formulaire = ref({
	nom: props.quete?.nom || "",
	etat: props.quete?.etat || "inactive",
	description: props.quete?.description || "",
	lieu: props.quete?.lieu || "",
	commentaire: props.quete?.commentaire || "",
	motDePasseActivation: props.quete?.motDePasseActivation || "", // facultatif selon le sujet
	motDePasseResolution: props.quete?.motDePasseResolution || "",
	recompense: props.quete?.recompense || "",
});
const erreur = ref("");

function reinitialiser() {
	formulaire.value = {
		nom: "",
		etat: "inactive",
		description: "",
		lieu: "",
		commentaire: "",
		motDePasseActivation: "",
		motDePasseResolution: "",
		recompense: "",
	};
}

function gererSubmit() {
	if (!formulaire.value.nom.trim()) {
		erreur.value = "Le nom ne peut pas être vide.";
		return;
	}
	emit("sauvegarde", {
		nom: formulaire.value.nom.trim(),
		etat: formulaire.value.etat,
		description: formulaire.value.description.trim(),
		lieu: formulaire.value.lieu.trim(),
		commentaire: formulaire.value.commentaire.trim(),
		motDePasseActivation: formulaire.value.motDePasseActivation.trim(),
		motDePasseResolution: formulaire.value.motDePasseResolution.trim(),
		recompense: formulaire.value.recompense.trim(),
	});
	reinitialiser();
	erreur.value = "";
}
</script>

<template>
	<section>
		<h2>{{ quete ? "Modifier" : "Ajouter" }} une quête</h2>
		<form @submit.prevent="gererSubmit">
			<div>
				<label for="quete-nom">Nom (obligatoire)</label>
				<input id="quete-nom" type="text" v-model="formulaire.nom" required />
			</div>

			<div>
				<label for="quete-etat">État</label>
				<select id="quete-etat" v-model="formulaire.etat">
					<option value="inactive">Inactive</option>
					<option value="active">Active</option>
					<option value="terminee">Terminée</option>
					<option value="abandonnee">Abandonnée</option>
				</select>
			</div>

			<div>
				<label for="quete-description">Description</label>
				<textarea id="quete-description" v-model="formulaire.description"></textarea>
			</div>

			<div>
				<label for="quete-lieu">Lieu</label>
				<input id="quete-lieu" type="text" v-model="formulaire.lieu" />
			</div>

			<div>
				<label for="quete-commentaire">Commentaire réservé au MJ</label>
				<textarea id="quete-commentaire" v-model="formulaire.commentaire"></textarea>
			</div>

			<div>
				<label for="quete-mdp-activation">Mot de passe d'activation</label>
				<input id="quete-mdp-activation" type="text" v-model="formulaire.motDePasseActivation" />
			</div>

			<div>
				<label for="quete-mdp-resolution">Mot de passe de résolution</label>
				<input id="quete-mdp-resolution" type="text" v-model="formulaire.motDePasseResolution" />
			</div>

			<div>
				<label for="quete-recompense">Récompense(s)</label>
				<input id="quete-recompense" type="text" v-model="formulaire.recompense" />
			</div>

			<p v-if="erreur" role="alert">{{ erreur }}</p>

			<div class="actions">
				<button type="submit">{{ quete ? "Enregistrer" : "Ajouter" }}</button>
				<button v-if="quete" type="button" class="secondaire" @click="emit('annuler')">
					Annuler
				</button>
			</div>
		</form>
	</section>
</template>

<style scoped>
section {
	padding: 1rem;
	border: 1px solid #ddd;
	border-radius: 6px;
	background: #f3f4f6;
}

h2 {
	margin-top: 0;
	font-size: 1.2rem;
}

form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}

label {
	display: block;
	margin-bottom: 0.4rem;
}

input,
select,
textarea {
	box-sizing: border-box;
	width: 100%;
	padding: 0.6rem;
	border: 1px solid #999;
	border-radius: 4px;
	font: inherit;
}

textarea {
	resize: vertical;
}

.actions {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
}

button {
	padding: 0.6rem 1rem;
	border: 1px solid #215ad3;
	border-radius: 4px;
	background: #215ad3;
	color: white;
	font: inherit;
	cursor: pointer;
}

button.secondaire {
	border-color: #999;
	background: white;
	color: #263238;
}

[role="alert"] {
	margin: 0;
	color: #a02020;
}
</style>
