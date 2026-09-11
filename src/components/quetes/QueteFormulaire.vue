<script setup>
import { ref } from "vue";
import useReferencesJeu from '@/composables/useReferencesJeu';
const { references, erreurReferences } = useReferencesJeu();

const props = defineProps({
	quete: { type: Object, default: null },
	chapitres: { type: Array, required: true },
});
const emit = defineEmits(["sauvegarde", "annuler"]);

const formulaire = ref({
	nom: props.quete?.nom || "",
	etat: props.quete?.etat || "active",
	lieuId: props.quete?.lieuId ?? null,
	recompensesObjets: JSON.parse(JSON.stringify(props.quete?.recompensesObjets ?? [])),
	recompensesIndices: [...(props.quete?.recompensesIndices ?? [])],
	description: props.quete?.description || "",
	lieu: props.quete?.lieu || "",
	commentaire: props.quete?.commentaire || "",
	motDePasseActivation: props.quete?.motDePasseActivation || "", // facultatif selon le sujet
	motDePasseResolution: props.quete?.motDePasseResolution || "",
	recompense: props.quete?.recompense || "",
	chapitreId: props.quete?.chapitreId || props.chapitres[0]?.id || "",
});
const erreur = ref("");

function reinitialiser() {
	formulaire.value = {
		nom: "",
		etat: "active",
		lieuId: null,
		recompensesObjets: [],
		recompensesIndices: [],
		description: "",
		lieu: "",
		commentaire: "",
		motDePasseActivation: "",
		motDePasseResolution: "",
		recompense: "",
		chapitreId: props.chapitres[0]?.id || "",
	};
}

function gererSubmit() {
	if (erreurReferences.value) return;
	if (formulaire.value.recompense.trim()) {
		erreur.value = 'Convertis l’ancienne récompense en objets ou indices, puis efface sa note pour confirmer.';
		return;
	}
	if (!formulaire.value.nom.trim()) {
		erreur.value = "Le nom ne peut pas être vide.";
		return;
	}
	if (!formulaire.value.chapitreId) {
		erreur.value = "Une quête doit appartenir à un chapitre.";
		return;
	}
	emit("sauvegarde", {
		lieuId: formulaire.value.lieuId,
		recompensesObjets: formulaire.value.recompensesObjets,
		recompensesIndices: formulaire.value.recompensesIndices,
		nom: formulaire.value.nom.trim(),
		etat: formulaire.value.etat,
		description: formulaire.value.description.trim(),
		lieu: references.value.contenus.find(contenu => contenu.id === formulaire.value.lieuId)?.nom ?? formulaire.value.lieu.trim(),
		commentaire: formulaire.value.commentaire.trim(),
		motDePasseActivation: formulaire.value.motDePasseActivation.trim(),
		motDePasseResolution: formulaire.value.motDePasseResolution.trim(),
		recompense: formulaire.value.recompense.trim(),
		chapitreId: formulaire.value.chapitreId,
	});
	reinitialiser();
	erreur.value = "";
}

function choisirObjet(id, choisi) {
  if (choisi) formulaire.value.recompensesObjets.push({ objetId: id, quantite: 1 });
  else formulaire.value.recompensesObjets = formulaire.value.recompensesObjets.filter(objet => objet.objetId !== id);
}
</script>

<template>
	<section>
		<h2>{{ quete ? "Modifier" : "Ajouter" }} une quête</h2>
		<form @submit.prevent="gererSubmit">
			<p v-if="erreurReferences" role="alert">{{ erreurReferences }}</p>
			<p v-if="chapitres.length === 0" role="alert">
				Créez d'abord un chapitre : une quête doit lui être rattachée.
			</p>

			<div>
				<label for="quete-nom">Nom (obligatoire)</label>
				<input id="quete-nom" type="text" v-model="formulaire.nom" required />
			</div>

			<div>
				<label for="quete-chapitre">Chapitre (obligatoire)</label>
				<select id="quete-chapitre" v-model="formulaire.chapitreId" :disabled="chapitres.length === 0">
					<option v-for="chapitre in chapitres" :key="chapitre.id" :value="chapitre.id">
						{{ chapitre.nom }}
					</option>
				</select>
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
				<select id="quete-lieu" v-model="formulaire.lieuId">
					<option :value="null">Choisir un lieu de la bibliothèque</option>
					<option v-for="lieu in references.contenus.filter(contenu => contenu.type === 'lieu' && !contenu.archive)" :key="lieu.id" :value="lieu.id">{{ lieu.nom }}</option>
				</select>
				<p v-if="formulaire.lieu && !formulaire.lieuId">Ancien lieu : {{ formulaire.lieu }}. Sélectionne le lieu correspondant.</p>
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
				<p>Objets récompenses</p>
				<label v-for="objet in references.contenus.filter(contenu => contenu.type === 'objet' && !contenu.archive)" :key="objet.id" class="case-recompense">
					<input type="checkbox" :checked="formulaire.recompensesObjets.some(entree => entree.objetId === objet.id)" @change="choisirObjet(objet.id, $event.target.checked)" />{{ objet.nom }}
				</label>
				<label v-for="objet in formulaire.recompensesObjets" :key="objet.objetId">Quantité : {{ references.contenus.find(contenu => contenu.id === objet.objetId)?.nom ?? 'Objet indisponible' }}
					<input v-model.number="objet.quantite" type="number" min="1" :max="Number.MAX_SAFE_INTEGER" step="1" required />
				</label>
				<p>Indices partagés</p>
				<label v-for="indice in references.contenus.filter(contenu => contenu.type === 'indice' && !contenu.archive)" :key="indice.id" class="case-recompense">
					<input v-model="formulaire.recompensesIndices" type="checkbox" :value="indice.id" />{{ indice.nom }}
				</label>
				<label v-if="formulaire.recompense" for="quete-recompense">Ancienne récompense (note à convertir en sélections ci-dessus)<input id="quete-recompense" v-model="formulaire.recompense" type="text" /></label>
			</div>

			<p v-if="erreur" role="alert">{{ erreur }}</p>

			<div class="actions">
				<button type="submit" :disabled="chapitres.length === 0 || !!erreurReferences">
					{{ quete ? "Enregistrer" : "Ajouter" }}
				</button>
				<button v-if="quete" type="button" class="secondaire" @click="emit('annuler')">Annuler</button>
			</div>
		</form>
	</section>
</template>

<style scoped>
.case-recompense { display: flex; align-items: center; gap: .5rem; }
.case-recompense input { width: auto; }
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
