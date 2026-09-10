<script setup>
import { computed, ref } from "vue";
import { randomObjet, randomLieu } from "@/services/generateurAleatoire.js";

const props = defineProps({
  type: { type: String, required: true },
  contenu: { type: Object, default: null },
  desactive: { type: Boolean, default: false },
});
const emit = defineEmits(["sauvegarde", "annuler"]);

const formulaire = ref({
  nom: props.contenu?.nom || "",
  description: props.contenu?.description || "",
  texte: props.contenu?.texte || "",
  commentaire: props.contenu?.commentaire || "",
});
const erreur = ref("");
const libelleType = computed(
  () => ({ lieu: "lieu", objet: "objet", indice: "indice" })[props.type],
);

const preFill = () => {
  const data = props.type === "objet" ? randomObjet() : randomLieu();
  formulaire.value.nom = data.nom;
  formulaire.value.description = data.description;
  formulaire.value.commentaire = data.commentaire;
};

function gererSubmit() {
  if (!formulaire.value.nom.trim()) {
    erreur.value = "Le nom ne peut pas être vide.";
    return;
  }
  const contenu = {
    type: props.type,
    nom: formulaire.value.nom.trim(),
    commentaire: formulaire.value.commentaire.trim(),
  };
  if (props.type === "indice") contenu.texte = formulaire.value.texte.trim();
  else contenu.description = formulaire.value.description.trim();
  emit("sauvegarde", contenu, () => {
    formulaire.value = { nom: "", description: "", texte: "", commentaire: "" };
    erreur.value = "";
  });
}
</script>

<template>
  <section class="formulaire">
    <h2>{{ contenu ? "Modifier" : "Ajouter" }} un {{ libelleType }}</h2>
    <form @submit.prevent="gererSubmit">
      <div>
        <label for="contenu-nom">Nom (obligatoire)</label>
        <input id="contenu-nom" type="text" v-model="formulaire.nom" required />
      </div>
      <div v-if="type === 'indice'">
        <label for="contenu-texte">Texte de l’indice</label>
        <textarea
          id="contenu-texte"
          v-model="formulaire.texte"
          rows="4"
        ></textarea>
      </div>
      <div v-else>
        <label for="contenu-description">Description</label>
        <textarea
          id="contenu-description"
          v-model="formulaire.description"
          rows="4"
        ></textarea>
      </div>
      <div>
        <label for="contenu-commentaire">Commentaire réservé au MJ</label>
        <textarea
          id="contenu-commentaire"
          v-model="formulaire.commentaire"
          rows="3"
        ></textarea>
      </div>
      <p v-if="erreur" role="alert">{{ erreur }}</p>
      <div class="actions">
        <button type="submit" :disabled="desactive">
          {{ contenu ? "Enregistrer" : "Ajouter" }}
        </button>
        <button
          v-if="['lieu', 'objet'].includes(type) && !contenu"
          type="button"
          class="secondaire"
          @click="preFill"
        >
          Générer aléatoirement
        </button>
        <button
          v-if="contenu"
          type="button"
          class="secondaire"
          @click="emit('annuler')"
        >
          Annuler
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.formulaire {
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
