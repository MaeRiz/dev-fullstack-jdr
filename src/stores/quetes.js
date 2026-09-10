import { defineStore } from "pinia";
import { computed, ref } from "vue";
import useLocaleStorage from "../composables/useLocaleStorage.js";

// Constante de stockage
export const CLE_STOCKAGE = "jdr-quetes";

const useQuetesStore = defineStore("quetes", () => {
	// States
	const liste = ref([]);
	// Persistance : lectureImpossible est un state.
	// enregistrer est une action de sauvegarde.
	const { lectureImpossible, enregistrer } = useLocaleStorage(CLE_STOCKAGE, liste);

	// Getters
	const parId = computed(() => (id) => liste.value.find((element) => element.id === id) ?? null);
	const parChapitre = computed(() => (chapitreId) => liste.value.filter((quete) => quete.chapitreId === chapitreId));

	// Actions (setters)
	function ajouter(element) {
		if (lectureImpossible.value) throw new Error("Chargement impossible : les données sont conservées.");
		const nouveau = { ...JSON.parse(JSON.stringify(element)), id: crypto.randomUUID() };
		liste.value.push(nouveau);
		return nouveau.id;
	}

	function modifier(id, changements) {
		if (lectureImpossible.value) throw new Error("Chargement impossible : les données sont conservées.");
		const index = liste.value.findIndex((element) => element.id === id);
		if (index === -1) throw new Error("Élément introuvable.");
		liste.value.splice(index, 1, { ...liste.value[index], ...JSON.parse(JSON.stringify(changements)), id });
	}

	function supprimer(id) {
		if (lectureImpossible.value) throw new Error("Chargement impossible : les données sont conservées.");
		const index = liste.value.findIndex((element) => element.id === id);
		if (index === -1) throw new Error("Élément introuvable.");
		liste.value.splice(index, 1);
	}

	function supprimerParChapitre(chapitreId) {
		liste.value = liste.value.filter((quete) => quete.chapitreId !== chapitreId);
	}

	function dupliquer(id) {
		if (lectureImpossible.value) throw new Error("Chargement impossible : les données sont conservées.");
		const original = liste.value.find((element) => element.id === id);
		if (!original) throw new Error("Élément introuvable.");
		const copie = {
			...JSON.parse(JSON.stringify(original)),
			id: crypto.randomUUID(),
			nom: `${original.nom} (copie)`,
		};
		liste.value.push(copie);
		return copie.id;
	}

	return {
		liste,
		parId,
		parChapitre,
		ajouter,
		modifier,
		supprimer,
		supprimerParChapitre,
		dupliquer,
		lectureImpossible,
		enregistrer,
	};
});

export default useQuetesStore;
