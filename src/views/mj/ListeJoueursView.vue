<script setup>
import { computed, nextTick, ref } from 'vue';
import { useRoute } from 'vue-router';
import JoueurCarte from '@/components/joueurs/JoueurCarte.vue';
import { modifierInventaire, nomObjet } from '@/services/inventaire';
import { chargerJoueurs, creerJoueur, modifierJoueur, filtrerJoueurs, dupliquerJoueur, sauvegarderJoueurs } from '@/services/joueurs';
import useReferencesJeu from '@/composables/useReferencesJeu';
import { utiliserBibliotheque } from '@/services/bibliotheque';

const { contenus, objetsBibliotheque, erreurBibliotheque, lectureImpossible } = utiliserBibliotheque();
const { references, erreurReferences } = useReferencesJeu();
const route = useRoute();
const nomCampagne = id => id === null ? 'Sans campagne' : references.value.campagnes.find(campagne => campagne.id === id)?.nom ?? 'Campagne indisponible';

const joueurs = ref([]);
const erreur = ref('');
const message = ref('');
const chargementImpossible = ref(false);
const recherche = ref('');
const campagneFiltre = ref(route.query.campagneId ?? undefined);
const formulaire = ref(null);
const champNom = ref(null);
const boutonAjouter = ref(null);
const suppressionId = ref(null);

try {
  joueurs.value = chargerJoueurs();
} catch {
  chargementImpossible.value = true;
  erreur.value = 'Impossible de lire les joueurs enregistrés. Vérifie que le stockage du navigateur est accessible, puis recharge la page. Les données existantes sont conservées.';
}

const joueursFiltres = computed(() => filtrerJoueurs(joueurs.value, campagneFiltre.value, recherche.value));

// Conserver l'accès aux rattachements déjà enregistrés, même hors du catalogue.
const campagnesDisponibles = computed(() => {
  const campagnes = [...references.value.campagnes];
  for (const joueur of joueurs.value) {
    if (joueur.campagneId !== null && !campagnes.some(campagne => campagne.id === joueur.campagneId)) {
      campagnes.push({ id: joueur.campagneId, nom: nomCampagne(joueur.campagneId) });
    }
  }
  return campagnes;
});

async function ouvrirFormulaire(joueur = null) {
  suppressionId.value = null;
  message.value = '';
  formulaire.value = joueur
    ? { id: joueur.id, nom: joueur.nom, etat: joueur.etat, description: joueur.description, commentaireMj: joueur.commentaireMj, campagneId: joueur.campagneId }
    : { id: null, nom: '', etat: 'vivant', description: '', commentaireMj: '', campagneId: campagneFiltre.value ?? null };
  await nextTick();
  champNom.value?.focus();
}

async function fermerFormulaire() {
  formulaire.value = null;
  await nextTick();
  boutonAjouter.value?.focus();
}

function enregistrerListe(liste, confirmation) {
  if (chargementImpossible.value) return false;
  try {
    sauvegarderJoueurs(liste);
    joueurs.value = liste;
    erreur.value = '';
    message.value = confirmation;
    return true;
  } catch {
    erreur.value = 'Enregistrement impossible : le stockage du navigateur est indisponible ou plein. Tes modifications ne sont pas sauvegardées. Réessaie après avoir libéré de l’espace.';
    message.value = '';
    return false;
  }
}

function enregistrerFormulaire() {
  if (!formulaire.value.nom.trim()) {
    champNom.value?.setCustomValidity('Saisis un nom contenant au moins un caractère.');
    champNom.value?.reportValidity();
    return;
  }
  const nouveau = creerJoueur(formulaire.value);
  const id = formulaire.value.id;
  const liste = id
    ? joueurs.value.map(joueur => joueur.id === id
      ? modifierJoueur(joueur, formulaire.value)
      : joueur)
    : [...joueurs.value, nouveau];
  if (enregistrerListe(liste, id ? 'Joueur modifié.' : 'Joueur ajouté.')) {
    recherche.value = '';
    // Après un transfert, garder le joueur visible dans sa nouvelle campagne.
    if (campagneFiltre.value !== undefined) campagneFiltre.value = nouveau.campagneId;
    fermerFormulaire();
  }
}

function dupliquer(joueur) {
  if (enregistrerListe([...joueurs.value, dupliquerJoueur(joueur)], 'Joueur dupliqué.')) {
    recherche.value = '';
    suppressionId.value = null;
  }
}

function changerInventaire(joueur, objetId, quantite, action) {
  try {
    const modifie = modifierInventaire(joueur, objetId, quantite, action, contenus.value);
    enregistrerListe(
      joueurs.value.map(element => element.id === joueur.id ? modifie : element),
      `${nomObjet(objetId, contenus.value)} : ${quantite} ${action === 'donner' ? 'ajouté(s)' : 'retiré(s)'} pour ${joueur.nom}.`,
    );
  } catch (cause) {
    erreur.value = cause.message;
    message.value = '';
  }
}

function supprimer(joueur) {
  if (enregistrerListe(joueurs.value.filter(element => element.id !== joueur.id), 'Joueur supprimé.')) {
    suppressionId.value = null;
    boutonAjouter.value?.focus();
  }
}
</script>

<template>
  <main class="joueurs-page">
    <header class="entete">
      <div>
        <h1>Joueurs <span class="compteur">{{ joueurs.length }}</span></h1>
        <p>Crée et gère les personnages de tes parties.</p>
      </div>
      <button ref="boutonAjouter" class="btn" type="button" :disabled="chargementImpossible || !!formulaire" @click="ouvrirFormulaire()">Ajouter un joueur</button>
    </header>

    <p v-if="erreur" class="erreur" role="alert">{{ erreur }}</p>
    <p v-if="erreurBibliotheque" class="erreur" role="alert">{{ erreurBibliotheque }}</p>
    <p v-if="erreurReferences" class="erreur" role="alert">{{ erreurReferences }}</p>
    <p class="confirmation" role="status">{{ message }}</p>

    <section v-if="formulaire" class="panel panneau" aria-labelledby="titre-formulaire">
      <h2 id="titre-formulaire">{{ formulaire.id ? 'Modifier le joueur' : 'Nouveau joueur' }}</h2>
      <form @submit.prevent="enregistrerFormulaire">
        <div class="champs">
          <label for="nom">Nom du joueur <span>(obligatoire)</span>
            <input id="nom" ref="champNom" class="control" v-model="formulaire.nom" required maxlength="100" @input="champNom.setCustomValidity('')" />
          </label>
          <label for="etat">État
            <select id="etat" class="control" v-model="formulaire.etat">
              <option value="vivant">Vivant</option>
              <option value="mort">Mort</option>
            </select>
          </label>
        </div>
        <label for="campagne-joueur">Campagne
          <select id="campagne-joueur" class="control" v-model="formulaire.campagneId" aria-describedby="aide-campagnes">
            <option :value="null">Sans campagne</option>
            <option v-for="campagne in campagnesDisponibles" :key="campagne.id" :value="campagne.id">{{ campagne.nom }}</option>
          </select>
        </label>
        <p id="aide-campagnes" class="aide-campagnes">Un transfert conserve l’inventaire et remet le lieu actuel à zéro.</p>
        <label for="description">Description
          <textarea id="description" class="control" v-model="formulaire.description" rows="3" maxlength="5000" />
        </label>
        <label for="commentaire">Commentaire MJ <span>— réservé à cette interface</span>
          <textarea id="commentaire" class="control" v-model="formulaire.commentaireMj" rows="3" maxlength="5000" />
        </label>
        <div class="actions">
          <button type="submit" class="btn">Enregistrer</button>
          <button type="button" class="btn secondary" @click="fermerFormulaire">Annuler</button>
        </div>
      </form>
    </section>

    <label for="filtre-campagne" class="recherche">Filtrer par campagne
      <select id="filtre-campagne" class="control" v-model="campagneFiltre" :disabled="!!formulaire" @change="suppressionId = null">
        <option :value="undefined">Toutes les campagnes</option>
        <option :value="null">Sans campagne</option>
        <option v-for="campagne in campagnesDisponibles" :key="campagne.id" :value="campagne.id">{{ campagne.nom }}</option>
      </select>
    </label>
    <label v-if="joueurs.length" for="recherche" class="recherche">Rechercher un joueur
      <input id="recherche" class="control" v-model="recherche" type="search" placeholder="Nom ou description" />
    </label>

    <div v-if="!chargementImpossible && !joueurs.length" class="vide">
      <h2>Aucun joueur pour le moment</h2>
      <p>Ajoute ton premier joueur pour préparer ta partie.</p>
    </div>
    <p v-else-if="!chargementImpossible && !joueursFiltres.length">Aucun joueur ne correspond à cette campagne et à ta recherche.</p>
    <p v-if="joueurs.length">{{ joueursFiltres.length }} joueur(s) affiché(s) sur {{ joueurs.length }}.</p>

    <div class="liste">
      <JoueurCarte v-for="joueur in joueursFiltres" :key="joueur.id" :joueur="joueur" :nom-campagne="nomCampagne" :objets="objetsBibliotheque" :contenus="contenus" :desactive="lectureImpossible || !!formulaire || suppressionId === joueur.id" :suppression="suppressionId === joueur.id" @modifier="ouvrirFormulaire" @dupliquer="dupliquer" @supprimer="suppressionId = joueur.id" @confirmer-suppression="supprimer" @annuler-suppression="suppressionId = null" @modifier-inventaire="changerInventaire" />
    </div>
  </main>
</template>

<style scoped>
.joueurs-page {
	max-width: 1050px;
	margin: 0 auto;
	padding: 2rem 1rem;
	color: var(--texte);
	font-family: system-ui, sans-serif;
}
.entete, .titre-joueur {
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 1rem;
	flex-wrap: wrap;
}
h1 {
	margin: 0;
	font-size: 2rem;
}
h2 {
	margin: 0 0 1rem;
	font-size: 1.15rem;
	overflow-wrap: anywhere;
}
.surtitre {
	color: var(--texte-secondaire);
	font-size: .8rem;
	margin-top: 0;
}
.compteur {
	font-size: 1rem;
	color: var(--texte-secondaire);
}
.information, .vide {
	background: var(--fond-surface);
	padding: 1rem;
	border-radius: 8px;
	line-height: 1.6;
}
.confirmation {
	color: #8ee0ad;
	min-height: 1.5rem;
}
.erreur {
	padding: 1rem;
	background: #422238;
	border-radius: 6px;
	color: #ffb4c5;
}
.liste {
	display: grid;
	gap: 1rem;
	margin-top: 1.5rem;
}
.champs {
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 1rem;
}
label {
	display: block;
	margin-bottom: 1rem;
	font-size: .9rem;
	font-weight: 600;
}
label span, .inventaire {
	color: var(--texte-secondaire);
	font-size: .85rem;
	font-weight: 400;
}
.recherche {
	margin-top: 1.5rem;
	max-width: 440px;
}
.aide-campagnes {
	color: var(--texte-secondaire);
	font-size: .85rem;
	overflow-wrap: anywhere;
}
button:disabled {
	opacity: .5;
	cursor: not-allowed;
}
button:disabled {
	opacity: .5;
	cursor: not-allowed;
}
:is(button, input, textarea, select, summary):focus-visible {
	outline: 3px solid var(--violet-clair);
	outline-offset: 3px;
}
.etat {
	border-radius: 20px;
	padding: .3rem .7rem;
	background: #203e36;
	color: #8ee0ad;
	font-size: .8rem;
}
.etat.mort {
	background: var(--fond-surface);
	color: var(--texte-secondaire);
}
.titre-joueur h2 {
	margin: 0;
}
.texte {
	white-space: pre-wrap;
	overflow-wrap: anywhere;
	line-height: 1.6;
}
summary {
	cursor: pointer;
	font-size: .9rem;
}
.suppression {
	margin-top: 1rem;
}
@media (max-width: 540px) {
	.champs {
		grid-template-columns: 1fr;
		gap: 0;
	}
	.joueurs-page {
		padding: 1rem .5rem;
	}
}
</style>
