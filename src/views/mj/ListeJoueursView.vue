<script setup>
import { computed, nextTick, ref } from 'vue';
import InventaireJoueur from '@/components/InventaireJoueur.vue';
import { modifierInventaire, nomObjet } from '@/services/inventaire';
import { chargerJoueurs, creerJoueur, modifierJoueur, filtrerJoueurs, dupliquerJoueur, sauvegarderJoueurs } from '@/services/joueurs';
import { campagnesProvisoires, nomCampagne } from '@/services/campagnes';

const joueurs = ref([]);
const erreur = ref('');
const message = ref('');
const chargementImpossible = ref(false);
const recherche = ref('');
const campagneFiltre = ref(undefined);
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
  const campagnes = [...campagnesProvisoires];
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
    const modifie = modifierInventaire(joueur, objetId, quantite, action);
    enregistrerListe(
      joueurs.value.map(element => element.id === joueur.id ? modifie : element),
      `${nomObjet(objetId)} : ${quantite} ${action === 'donner' ? 'ajouté(s)' : 'retiré(s)'} pour ${joueur.nom}.`,
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
      <button ref="boutonAjouter" type="button" :disabled="chargementImpossible || !!formulaire" @click="ouvrirFormulaire()">Ajouter un joueur</button>
    </header>

    <p v-if="erreur" class="erreur" role="alert">{{ erreur }}</p>
    <p class="confirmation" role="status">{{ message }}</p>

    <section v-if="formulaire" class="panneau" aria-labelledby="titre-formulaire">
      <h2 id="titre-formulaire">{{ formulaire.id ? 'Modifier le joueur' : 'Nouveau joueur' }}</h2>
      <form @submit.prevent="enregistrerFormulaire">
        <div class="champs">
          <label for="nom">Nom du joueur <span>(obligatoire)</span>
            <input id="nom" ref="champNom" v-model="formulaire.nom" required maxlength="100" @input="champNom.setCustomValidity('')" />
          </label>
          <label for="etat">État
            <select id="etat" v-model="formulaire.etat">
              <option value="vivant">Vivant</option>
              <option value="mort">Mort</option>
            </select>
          </label>
        </div>
        <label for="campagne-joueur">Campagne
          <select id="campagne-joueur" v-model="formulaire.campagneId" aria-describedby="aide-campagnes">
            <option :value="null">Sans campagne</option>
            <option v-for="campagne in campagnesDisponibles" :key="campagne.id" :value="campagne.id">{{ campagne.nom }}</option>
          </select>
        </label>
        <p id="aide-campagnes" class="aide-campagnes">Campagnes provisoires en attendant la liste du groupe. Un transfert conserve l’inventaire et remet le lieu actuel à zéro.</p>
        <label for="description">Description
          <textarea id="description" v-model="formulaire.description" rows="3" maxlength="5000" />
        </label>
        <label for="commentaire">Commentaire MJ <span>— réservé à cette interface</span>
          <textarea id="commentaire" v-model="formulaire.commentaireMj" rows="3" maxlength="5000" />
        </label>
        <div class="actions">
          <button type="submit">Enregistrer</button>
          <button type="button" class="secondaire" @click="fermerFormulaire">Annuler</button>
        </div>
      </form>
    </section>

    <label for="filtre-campagne" class="recherche">Filtrer par campagne
      <select id="filtre-campagne" v-model="campagneFiltre" :disabled="!!formulaire" @change="suppressionId = null">
        <option :value="undefined">Toutes les campagnes</option>
        <option :value="null">Sans campagne</option>
        <option v-for="campagne in campagnesDisponibles" :key="campagne.id" :value="campagne.id">{{ campagne.nom }}</option>
      </select>
    </label>
    <label v-if="joueurs.length" for="recherche" class="recherche">Rechercher un joueur
      <input id="recherche" v-model="recherche" type="search" placeholder="Nom ou description" />
    </label>

    <div v-if="!chargementImpossible && !joueurs.length" class="vide">
      <h2>Aucun joueur pour le moment</h2>
      <p>Ajoute ton premier joueur pour préparer ta partie.</p>
    </div>
    <p v-else-if="!chargementImpossible && !joueursFiltres.length">Aucun joueur ne correspond à cette campagne et à ta recherche.</p>
    <p v-if="joueurs.length">{{ joueursFiltres.length }} joueur(s) affiché(s) sur {{ joueurs.length }}.</p>

    <div class="liste">
      <article v-for="joueur in joueursFiltres" :key="joueur.id" class="panneau">
        <div class="titre-joueur">
          <h2>{{ joueur.nom }}</h2>
          <span class="etat" :class="{ mort: joueur.etat === 'mort' }">{{ joueur.etat === 'vivant' ? 'Vivant' : 'Mort' }}</span>
        </div>
        <p class="aide-campagnes">Campagne : {{ nomCampagne(joueur.campagneId) }}</p>
        <p class="texte">{{ joueur.description || 'Aucune description.' }}</p>
        <details v-if="joueur.commentaireMj">
          <summary>Commentaire MJ</summary>
          <p class="texte">{{ joueur.commentaireMj }}</p>
        </details>
        <InventaireJoueur :joueur="joueur" :desactive="!!formulaire || suppressionId === joueur.id"
          @modifier="(objetId, quantite, action) => changerInventaire(joueur, objetId, quantite, action)" />
        <div class="actions">
          <button type="button" class="secondaire" :disabled="!!formulaire" :aria-label="`Modifier ${joueur.nom}`" @click="ouvrirFormulaire(joueur)">Modifier</button>
          <button type="button" class="secondaire" :disabled="!!formulaire" :aria-label="`Dupliquer ${joueur.nom}`" @click="dupliquer(joueur)">Dupliquer</button>
          <button type="button" class="danger" :disabled="!!formulaire" :aria-label="`Supprimer ${joueur.nom}`" @click="suppressionId = joueur.id">Supprimer</button>
        </div>
        <div v-if="suppressionId === joueur.id" class="suppression" role="group" :aria-label="`Confirmer la suppression de ${joueur.nom}`">
          <p>Supprimer définitivement « {{ joueur.nom }} » et son inventaire ?</p>
          <div class="actions">
            <button type="button" class="danger" @click="supprimer(joueur)">Confirmer la suppression</button>
            <button type="button" class="secondaire" @click="suppressionId = null">Annuler</button>
          </div>
        </div>
      </article>
    </div>
  </main>
</template>

<style scoped>
.joueurs-page { max-width: 1050px; margin: 0 auto; padding: 2rem 1rem; color: #1f2937; font-family: system-ui, sans-serif; }
.entete, .titre-joueur { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
h1 { margin: 0; font-size: 2rem; }
h2 { margin: 0 0 1rem; font-size: 1.15rem; overflow-wrap: anywhere; }
.surtitre { color: #536176; font-size: .8rem; margin-top: 0; }
.compteur { font-size: 1rem; color: #536176; }
.information, .vide { background: #f3f4f6; padding: 1rem; border-radius: 8px; line-height: 1.6; }
.confirmation { color: #166534; min-height: 1.5rem; }
.erreur, .suppression { padding: 1rem; background: #fff1f2; border-radius: 6px; color: #9f1239; }
.panneau { border: 1px solid #d1d5db; border-radius: 8px; padding: 1.25rem; background: white; min-width: 0; }
.liste { display: grid; gap: 1rem; margin-top: 1.5rem; }
.champs { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
label { display: block; margin-bottom: 1rem; font-size: .9rem; font-weight: 600; }
label span, .inventaire { color: #536176; font-size: .85rem; font-weight: 400; }
input, select, textarea { display: block; box-sizing: border-box; width: 100%; margin-top: .5rem; padding: .7rem; border: 1px solid #9ca3af; border-radius: 5px; font: inherit; color: inherit; background: white; }
textarea { resize: vertical; }
.recherche { margin-top: 1.5rem; max-width: 440px; }
.aide-campagnes { color: #536176; font-size: .85rem; overflow-wrap: anywhere; }
.actions { display: flex; gap: .65rem; flex-wrap: wrap; }
button { border: 1px solid transparent; border-radius: 5px; padding: .65rem 1rem; background: #215ad3; color: white; font: inherit; font-size: .9rem; cursor: pointer; }
button.secondaire { background: white; border-color: #9ca3af; color: #1f2937; }
button.danger { background: white; border-color: #be123c; color: #be123c; }
button:hover:not(:disabled) { filter: brightness(.92); }
button:disabled { opacity: .5; cursor: not-allowed; }
:is(button, input, textarea, select, summary):focus-visible { outline: 3px solid #215ad3; outline-offset: 3px; }
.etat { border-radius: 20px; padding: .3rem .7rem; background: #dcfce7; color: #166534; font-size: .8rem; }
.etat.mort { background: #f3f4f6; color: #4b5563; }
.titre-joueur h2 { margin: 0; }
.texte { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.6; }
summary { cursor: pointer; font-size: .9rem; }
.suppression { margin-top: 1rem; }
@media (max-width: 540px) { .champs { grid-template-columns: 1fr; gap: 0; } .joueurs-page { padding: 1rem .5rem; } }
</style>
