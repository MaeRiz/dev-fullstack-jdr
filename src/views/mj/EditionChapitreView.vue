<script setup>
import { computed, nextTick, ref } from "vue";
import { storeToRefs } from "pinia";
import useCampagnesStore from "@/stores/campagnes.js";
import useChapitresStore from "@/stores/chapitres.js";
import useQuetesStore from "@/stores/quetes.js";
import { libelle } from "@/services/catalogueChapitres";
import { utiliserBibliotheque } from "@/services/bibliotheque";
import { choixContenus } from "@/services/contenus";
import { formulaireVide, creerChapitre, modifierChapitre, dupliquerChapitre, deplacerQuete } from "@/services/chapitres";
import { chargerEtatJeu, enregistrerEtatJeu } from "@/services/lectureJoueur";
import { sansPersistance } from "@/composables/useLocaleStorage";

const campagnesStore = useCampagnesStore();
const chapitresStore = useChapitresStore();
const quetesStore = useQuetesStore();
const { liste: campagnesListe } = storeToRefs(campagnesStore);
const { liste: chapitres, lectureImpossible: bloque } = storeToRefs(chapitresStore);

const formulaire = ref(null);
const { contenus, objetsBibliotheque, indicesBibliotheque, erreurBibliotheque, lectureImpossible } =
	utiliserBibliotheque();
const objets = computed(() => contenus.value.filter((contenu) => contenu.type === "objet"));
const indices = computed(() => contenus.value.filter((contenu) => contenu.type === "indice"));
const choixRequis = computed(() => choixContenus(contenus.value, "objet", formulaire.value?.objetsRequis));
const choixRecompenses = computed(() =>
	choixContenus(
		contenus.value,
		"objet",
		formulaire.value?.recompensesObjets.map((objet) => objet.objetId),
	),
);
const choixIndices = computed(() => choixContenus(contenus.value, "indice", formulaire.value?.recompensesIndices));
const editionId = ref(null);
const suppressionId = ref(null);
const erreur = ref("");
const message = ref("");
const recherche = ref("");
const campagneFiltre = ref(undefined);
const champNom = ref(null);
const boutonAjouter = ref(null);
const etats = { inactif: "Inactif", actif: "Actif", termine: "Terminé" };

const campagnesDisponibles = computed(() => {
	const liste = [...campagnesListe.value];
	for (const chapitre of chapitres.value) {
		if (chapitre.campagneId !== null && !liste.some((campagne) => campagne.id === chapitre.campagneId)) {
			liste.push({ id: chapitre.campagneId, nom: libelle(campagnesListe.value, chapitre.campagneId) });
		}
	}
	return liste;
});
const quetesDuChapitre = computed(() => (id) => {
	const ordre = chapitresStore.parId(id)?.quetes.map(quete => quete.id) ?? [];
	const rang = id => ordre.includes(id) ? ordre.indexOf(id) : ordre.length;
	return [...quetesStore.parChapitre(id)].sort((a, b) => rang(a.id) - rang(b.id));
});
const listeFiltree = computed(() =>
	chapitres.value.filter(
		(chapitre) =>
			(campagneFiltre.value === undefined || chapitre.campagneId === campagneFiltre.value) &&
			`${chapitre.nom} ${chapitre.description}`
				.toLocaleLowerCase("fr")
				.includes(recherche.value.trim().toLocaleLowerCase("fr")),
	),
);

async function ouvrir(chapitre = null) {
	editionId.value = chapitre?.id ?? null;
	formulaire.value = chapitre ? JSON.parse(JSON.stringify(chapitre)) : formulaireVide(campagneFiltre.value ?? null);
	if (chapitre) formulaire.value.quetes = quetesDuChapitre.value(chapitre.id).map(quete => ({ id: quete.id, modeleId: quete.id, nom: quete.nom }));
	suppressionId.value = null;
	message.value = "";
	await nextTick();
	champNom.value?.focus();
}
async function fermer() {
	formulaire.value = null;
	editionId.value = null;
	await nextTick();
	boutonAjouter.value?.focus();
}
function enregistrerListe(liste, confirmation) {
	if (bloque.value || lectureImpossible.value || quetesStore.lectureImpossible) return false;
	try {
		const avant = chargerEtatJeu();
		// Conserver la suppression en cascade introduite sur main.
		const supprimes = avant.chapitres.filter(chapitre => !liste.some(element => element.id === chapitre.id)).map(chapitre => chapitre.id);
		const apres = { ...avant, chapitres: liste, quetes: avant.quetes.filter(quete => !supprimes.includes(quete.chapitreId)) };
		for (const chapitre of liste.filter(element => !avant.chapitres.some(original => original.id === element.id))) {
			for (const reference of chapitre.quetes) {
				const originale = avant.quetes.find(quete => quete.id === reference.modeleId);
				if (originale && !apres.quetes.some(quete => quete.id === reference.id)) {
					apres.quetes.push({ ...JSON.parse(JSON.stringify(originale)), id: reference.id, chapitreId: chapitre.id, recompensesDistribuees: false });
				}
			}
		}
		enregistrerEtatJeu(avant, apres);
		sansPersistance(() => { chapitres.value = liste; quetesStore.liste = apres.quetes; });
	} catch {
		erreur.value =
			"Enregistrement impossible : le stockage du navigateur est indisponible ou plein. Les modifications ne sont pas sauvegardées. Tu peux réessayer.";
		message.value = "";
		return false;
	}
	erreur.value = "";
	message.value = confirmation;
	return true;
}
function enregistrer() {
	try {
		const original = chapitres.value.find((chapitre) => chapitre.id === editionId.value);
		const chapitre = original ? modifierChapitre(original, formulaire.value) : creerChapitre(formulaire.value);
		const liste = original
			? chapitres.value.map((element) => (element.id === chapitre.id ? chapitre : element))
			: [...chapitres.value, chapitre];
		if (enregistrerListe(liste, original ? "Chapitre modifié." : "Chapitre ajouté.")) {
			recherche.value = "";
			if (campagneFiltre.value !== undefined) campagneFiltre.value = chapitre.campagneId;
			fermer();
		}
	} catch (cause) {
		erreur.value = cause.message;
		message.value = "";
	}
}
function dupliquer(chapitre) {
	if (
		enregistrerListe(
			[...chapitres.value, dupliquerChapitre({ ...chapitre, quetes: quetesDuChapitre.value(chapitre.id).map(quete => ({ id: quete.id, modeleId: quete.id, nom: quete.nom })) })],
			"Chapitre dupliqué avec des quêtes indépendantes.",
		)
	)
		recherche.value = "";
}
function supprimer(chapitre) {
	if (
		enregistrerListe(
			chapitres.value.filter((element) => element.id !== chapitre.id),
			"Chapitre supprimé.",
		)
	) {
		suppressionId.value = null;
		boutonAjouter.value?.focus();
	}
}
function choisirRecompense(objetId, selectionne) {
	if (selectionne) formulaire.value.recompensesObjets.push({ objetId, quantite: 1 });
	else
		formulaire.value.recompensesObjets = formulaire.value.recompensesObjets.filter(
			(objet) => objet.objetId !== objetId,
		);
}
</script>

<template>
	<main class="chapitres-page">
		<header class="entete">
			<div>
				<h1>
					Chapitres <span class="compteur">{{ chapitres.length }}</span>
				</h1>
				<p>Prépare les étapes de tes campagnes et leurs quêtes.</p>
			</div>
			<button ref="boutonAjouter" :disabled="bloque || lectureImpossible || !!formulaire" @click="ouvrir()">
				Ajouter un chapitre
			</button>
		</header>
		<p v-if="erreur" class="erreur" role="alert">{{ erreur }}</p>
		<p v-if="erreurBibliotheque" class="erreur" role="alert">{{ erreurBibliotheque }}</p>
		<p class="confirmation" role="status">{{ message }}</p>

		<section v-if="formulaire" class="panneau" aria-labelledby="titre-formulaire">
			<h2 id="titre-formulaire">{{ editionId ? "Modifier le chapitre" : "Nouveau chapitre" }}</h2>
			<form @submit.prevent="enregistrer">
				<div class="champs">
					<label for="nom-chapitre"
						>Nom (obligatoire)<input
							id="nom-chapitre"
							ref="champNom"
							v-model="formulaire.nom"
							required
							maxlength="150"
					/></label>
					<label for="etat-chapitre"
						>État<select id="etat-chapitre" v-model="formulaire.etat">
							<option v-for="(nom, valeur) in etats" :key="valeur" :value="valeur">{{ nom }}</option>
						</select></label
					>
				</div>
				<label for="campagne-chapitre"
					>Campagne
					<select id="campagne-chapitre" v-model="formulaire.campagneId">
						<option :value="null">Sans campagne</option>
						<option v-for="campagne in campagnesDisponibles" :key="campagne.id" :value="campagne.id">
							{{ campagne.nom }}
						</option>
					</select>
				</label>
				<label for="description-chapitre"
					>Description<textarea
						id="description-chapitre"
						v-model="formulaire.description"
						rows="3"
						maxlength="10000"
					/>
				</label>
				<label for="commentaire-chapitre"
					>Commentaire MJ<textarea
						id="commentaire-chapitre"
						v-model="formulaire.commentaireMj"
						rows="3"
						maxlength="10000"
					/>
				</label>

				<fieldset>
					<legend>Activation</legend>
					<label for="activation-chapitre"
						>Mot de passe d’activation<input
							id="activation-chapitre"
							v-model="formulaire.motDePasseActivation"
							type="text"
							autocomplete="off"
							maxlength="200"
					/></label>
					<p class="aide">
						Le joueur devra saisir ce mot de passe exact et posséder tous les objets cochés. Ils ne seront
						pas consommés.
					</p>
					<p>Objets nécessaires (facultatifs)</p>
					<div class="choix">
						<label v-for="objet in choixRequis" :key="objet.id" class="case"
							><input v-model="formulaire.objetsRequis" type="checkbox" :value="objet.id" />{{
								objet.nom
							}}</label
						>
					</div>
					<p v-if="!objetsBibliotheque.length" class="aide">
						Aucun objet disponible. Crée les objets dans
						<RouterLink to="/mj/contenus">la bibliothèque</RouterLink>.
					</p>
				</fieldset>
				<fieldset>
					<legend>Résolution et récompenses</legend>
					<label for="resolution-chapitre"
						>Mot de passe de résolution<input
							id="resolution-chapitre"
							v-model="formulaire.motDePasseResolution"
							type="text"
							autocomplete="off"
							maxlength="200"
					/></label>
					<p class="aide">
						Les mots de passe peuvent rester vides pendant la préparation. Ils doivent être renseignés pour
						les actions des joueurs.
					</p>
					<p>Objets à donner au joueur qui termine le chapitre (facultatifs)</p>
					<div class="choix">
						<label v-for="objet in choixRecompenses" :key="objet.id" class="case"
							><input
								type="checkbox"
								:checked="formulaire.recompensesObjets.some((entree) => entree.objetId === objet.id)"
								@change="choisirRecompense(objet.id, $event.target.checked)"
							/>{{ objet.nom }}</label
						>
					</div>
					<div class="champs">
						<label
							v-for="recompense in formulaire.recompensesObjets"
							:key="recompense.objetId"
							:for="`quantite-${recompense.objetId}`"
							>Quantité : {{ libelle(objets, recompense.objetId) }}
							<input
								:id="`quantite-${recompense.objetId}`"
								v-model.number="recompense.quantite"
								type="number"
								min="1"
								:max="Number.MAX_SAFE_INTEGER"
								step="1"
								required
							/>
						</label>
					</div>
					<p>Indices partagés avec la campagne (facultatifs)</p>
					<div class="choix">
						<label v-for="indice in choixIndices" :key="indice.id" class="case"
							><input v-model="formulaire.recompensesIndices" type="checkbox" :value="indice.id" />{{
								indice.nom
							}}</label
						>
					</div>
					<p v-if="!indicesBibliotheque.length" class="aide">
						Aucun indice disponible. Crée les indices dans
						<RouterLink to="/mj/contenus">la bibliothèque</RouterLink>.
					</p>
				</fieldset>
				<fieldset v-if="editionId">
					<legend>Quêtes du chapitre</legend>
					<p class="aide">
						Les quêtes se créent et se rattachent à ce chapitre depuis la page
						<RouterLink :to="{ name: 'mj-edition-quete' }">Quêtes</RouterLink>.
					</p>
					<p v-if="!formulaire.quetes.length">Aucune quête associée.</p>
					<ol v-else class="quetes">
						<li v-for="(quete, index) in formulaire.quetes" :key="quete.id">
							<span>{{ quete.nom }}</span>
							<div class="actions">
								<button type="button" class="secondaire" :disabled="index === 0" :aria-label="`Monter ${quete.nom}`" @click="formulaire.quetes = deplacerQuete(formulaire.quetes, quete.id, -1)">Monter</button>
								<button type="button" class="secondaire" :disabled="index === formulaire.quetes.length - 1" :aria-label="`Descendre ${quete.nom}`" @click="formulaire.quetes = deplacerQuete(formulaire.quetes, quete.id, 1)">Descendre</button>
							</div>
						</li>
					</ol>
				</fieldset>
				<div class="actions">
					<button type="submit">Enregistrer</button
					><button type="button" class="secondaire" @click="fermer">Annuler</button>
				</div>
			</form>
		</section>

		<div class="champs filtres">
			<label for="filtre-campagne"
				>Filtrer par campagne<select
					id="filtre-campagne"
					v-model="campagneFiltre"
					:disabled="!!formulaire"
					@change="suppressionId = null"
				>
					<option :value="undefined">Toutes les campagnes</option>
					<option :value="null">Sans campagne</option>
					<option v-for="campagne in campagnesDisponibles" :key="campagne.id" :value="campagne.id">
						{{ campagne.nom }}
					</option>
				</select></label
			>
			<label for="recherche-chapitre"
				>Rechercher<input
					id="recherche-chapitre"
					v-model="recherche"
					type="search"
					placeholder="Nom ou description"
			/></label>
		</div>
		<div v-if="!bloque && !chapitres.length" class="vide">
			<h2>Aucun chapitre pour le moment</h2>
			<p>Ajoute ton premier chapitre pour préparer ta campagne.</p>
		</div>
		<p v-else-if="!bloque && !listeFiltree.length">Aucun chapitre ne correspond à ces filtres.</p>
		<p v-if="chapitres.length">{{ listeFiltree.length }} chapitre(s) affiché(s) sur {{ chapitres.length }}.</p>
		<div class="liste">
			<article v-for="chapitre in listeFiltree" :key="chapitre.id" class="panneau">
				<div class="entete">
					<h2>{{ chapitre.nom }}</h2>
					<span class="etat" :class="chapitre.etat">{{ etats[chapitre.etat] }}</span>
				</div>
				<p class="aide">
					{{ chapitre.campagneId === null ? "Sans campagne" : libelle(campagnesListe, chapitre.campagneId) }}
				</p>
				<p class="texte">{{ chapitre.description || "Aucune description." }}</p>
				<details>
					<summary>Détails du chapitre et informations MJ</summary>
					<p class="texte"><strong>Commentaire MJ :</strong> {{ chapitre.commentaireMj || "Aucun." }}</p>
					<p class="texte">
						<strong>Mot de passe d’activation :</strong>
						{{ chapitre.motDePasseActivation || "Non configuré" }}
					</p>
					<p>
						<strong>Objets requis :</strong>
						{{ chapitre.objetsRequis.map((id) => libelle(objets, id)).join(", ") || "Aucun" }}
					</p>
					<p class="texte">
						<strong>Mot de passe de résolution :</strong>
						{{ chapitre.motDePasseResolution || "Non configuré" }}
					</p>
					<p>
						<strong>Objets récompenses :</strong>
						{{
							chapitre.recompensesObjets
								.map((objet) => `${libelle(objets, objet.objetId)} × ${objet.quantite}`)
								.join(", ") || "Aucun"
						}}
					</p>
					<p>
						<strong>Indices récompenses :</strong>
						{{ chapitre.recompensesIndices.map((id) => libelle(indices, id)).join(", ") || "Aucun" }}
					</p>
				</details>
				<h3>Quêtes associées ({{ quetesDuChapitre(chapitre.id).length }})</h3>
				<ol v-if="quetesDuChapitre(chapitre.id).length">
					<li v-for="quete in quetesDuChapitre(chapitre.id)" :key="quete.id">
						{{ quete.nom }} — {{ quete.etat }}
					</li>
				</ol>
				<p v-else>Aucune quête associée.</p>
				<div class="actions">
					<button
						class="secondaire"
						:disabled="!!formulaire"
						:aria-label="`Modifier ${chapitre.nom}`"
						@click="ouvrir(chapitre)"
					>
						Modifier
					</button>
					<button
						class="secondaire"
						:disabled="!!formulaire"
						:aria-label="`Dupliquer ${chapitre.nom}`"
						@click="dupliquer(chapitre)"
					>
						Dupliquer
					</button>
					<button
						class="danger"
						:disabled="!!formulaire"
						:aria-label="`Supprimer ${chapitre.nom}`"
						@click="suppressionId = chapitre.id"
					>
						Supprimer
					</button>
				</div>
				<div
					v-if="suppressionId === chapitre.id"
					class="suppression"
					role="group"
					:aria-label="`Confirmer la suppression de ${chapitre.nom}`"
				>
					<p>
						Supprimer définitivement « {{ chapitre.nom }} » et ses
						{{ quetesDuChapitre(chapitre.id).length }} quête(s) ?
					</p>
					<div class="actions">
						<button class="danger" @click="supprimer(chapitre)">Confirmer la suppression</button
						><button class="secondaire" @click="suppressionId = null">Annuler</button>
					</div>
				</div>
			</article>
		</div>
	</main>
</template>

<style scoped>
.chapitres-page {
	max-width: 1050px;
	margin: auto;
	padding: 2rem 1rem;
	font-family: system-ui, sans-serif;
	color: #1f2937;
}
.entete {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	flex-wrap: wrap;
}
h1 {
	font-size: 2rem;
	margin: 0;
}
h2 {
	font-size: 1.2rem;
	margin: 0 0 1rem;
	overflow-wrap: anywhere;
}
h3 {
	font-size: 1rem;
}
.compteur,
.aide {
	color: #536176;
	font-size: 0.85rem;
	overflow-wrap: anywhere;
}
.panneau {
	padding: 1.25rem;
	border: 1px solid #d1d5db;
	border-radius: 8px;
	min-width: 0;
	background: white;
}
.liste {
	display: grid;
	gap: 1rem;
}
.champs {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 1rem;
}
.filtres {
	margin-top: 1.5rem;
}
label {
	display: block;
	font-size: 0.9rem;
	font-weight: 600;
	margin-bottom: 1rem;
}
input,
select,
textarea {
	display: block;
	width: 100%;
	box-sizing: border-box;
	margin-top: 0.5rem;
	padding: 0.7rem;
	border: 1px solid #9ca3af;
	border-radius: 5px;
	font: inherit;
	color: inherit;
	background: white;
}
textarea {
	resize: vertical;
}
fieldset {
	min-width: 0;
	margin: 1.25rem 0;
	padding: 1rem;
	border: 1px solid #d1d5db;
	border-radius: 6px;
}
legend {
	font-weight: 600;
}
.choix,
.actions {
	display: flex;
	gap: 0.75rem;
	flex-wrap: wrap;
}
.case {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-weight: 400;
}
.case input {
	width: auto;
	margin: 0;
}
button {
	padding: 0.65rem 1rem;
	background: #215ad3;
	color: white;
	border: 1px solid transparent;
	border-radius: 5px;
	font: inherit;
	font-size: 0.9rem;
	cursor: pointer;
}
.secondaire {
	background: white;
	color: #1f2937;
	border-color: #9ca3af;
}
.danger {
	background: white;
	color: #be123c;
	border-color: #be123c;
}
button:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}
button:hover:not(:disabled) {
	filter: brightness(0.92);
}
:is(input, select, textarea, button, summary):focus-visible {
	outline: 3px solid #215ad3;
	outline-offset: 3px;
}
.confirmation {
	color: #166534;
	min-height: 1.5rem;
}
.erreur,
.suppression {
	background: #fff1f2;
	color: #9f1239;
	padding: 1rem;
	border-radius: 6px;
}
.suppression {
	margin-top: 1rem;
}
.etat {
	border-radius: 20px;
	padding: 0.3rem 0.7rem;
	background: #f3f4f6;
	font-size: 0.85rem;
}
.actif {
	background: #dbeafe;
	color: #1e40af;
}
.termine {
	background: #dcfce7;
	color: #166534;
}
.texte {
	white-space: pre-wrap;
	overflow-wrap: anywhere;
}
p,
li {
	line-height: 1.6;
	overflow-wrap: anywhere;
}
summary {
	cursor: pointer;
}
.quetes li {
	margin: 1rem 0;
}
.quetes .actions {
	margin-top: 0.5rem;
}
.vide {
	background: #f3f4f6;
	padding: 1rem;
	border-radius: 8px;
}
@media (max-width: 560px) {
	.champs {
		grid-template-columns: 1fr;
		gap: 0;
	}
	.chapitres-page {
		padding: 1rem 0.5rem;
	}
}
</style>
